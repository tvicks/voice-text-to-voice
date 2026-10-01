import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client with required User-Agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey && apiKey.length > 5),
  });
});

// Text-to-Speech generation endpoint using Gemini TTS
app.post('/api/tts/generate', async (req, res) => {
  try {
    const { text, voiceName = 'Kore', style, language = 'en' } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text prompt is required.' });
    }

    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. You can still use the Browser Speech Engine for instant speech synthesis.',
      });
    }

    // Supported prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    const allowedVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const selectedVoice = allowedVoices.includes(voiceName) ? voiceName : 'Kore';

    const speechPart: { text: string; speechMetadata?: { style?: string } } = {
      text: text.trim(),
    };

    if (style && typeof style === 'string' && style.trim().length > 0) {
      speechPart.speechMetadata = {
        style: style.trim(),
      };
    }

    // Select gemini-3.8-flash-lite-tts for standard speech or gemini-3.8-flash-tts if specialized styling
    const modelName = style ? 'gemini-3.8-flash-tts' : 'gemini-3.8-flash-lite-tts';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [speechPart],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find((p) => p.inlineData && p.inlineData.data);

    if (!audioPart || !audioPart.inlineData?.data) {
      return res.status(500).json({
        error: 'No audio data was returned by the voice synthesis model.',
      });
    }

    const base64Audio = audioPart.inlineData.data;
    const mimeType = audioPart.inlineData.mimeType || 'audio/wav';

    return res.json({
      audioBase64: base64Audio,
      mimeType,
      voice: selectedVoice,
      characters: text.length,
    });
  } catch (error: any) {
    console.error('Error generating speech:', error);
    const message = error?.message || 'Failed to synthesize speech via Gemini';
    return res.status(500).json({ error: message });
  }
});

// Translation endpoint to assist multi-language voice speaking
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and targetLanguage are required.' });
    }

    if (!apiKey) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const prompt = `Translate the following text into ${targetLanguage} naturally, preserving conversational rhythm and tone suitable for text-to-speech reading. Do not add markdown commentary, explanation, or quotes. Output ONLY the translated text.

Source text:
"""
${text}
"""`;

    let translatedText = text;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
          temperature: 0.3,
        },
      });
      if (response.text) {
        translatedText = response.text.trim();
      }
    } catch (modelErr: any) {
      // Retry once with gemini-3.8-flash
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.3,
        },
      });
      if (fallbackResponse.text) {
        translatedText = fallbackResponse.text.trim();
      }
    }

    res.json({ translatedText, targetLanguage });
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error?.message || 'Translation failed' });
  }
});

// Voice text enhancement endpoint (format for spoken audio, add punctuation/pauses)
app.post('/api/enhance-text', async (req, res) => {
  try {
    const { text, tone = 'natural' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required.' });
    }

    if (!apiKey) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const prompt = `Rewrite and optimize the following text to sound exceptional when spoken aloud by a text-to-speech voice speaker. 
Tone goal: ${tone}.
Ensure proper pacing with natural punctuation (commas, periods, em-dashes), clear phonetic phrasing for numbers or abbreviations, and smooth flow.
Do not add commentary, quotation marks or explanations. Return ONLY the rewritten text.

Text:
"""
${text}
"""`;

    let enhancedText = text;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
          temperature: 0.5,
        },
      });
      if (response.text) {
        enhancedText = response.text.trim();
      }
    } catch (modelErr: any) {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.5,
        },
      });
      if (fallbackResponse.text) {
        enhancedText = fallbackResponse.text.trim();
      }
    }

    res.json({ enhancedText });
  } catch (error: any) {
    console.error('Enhancement error:', error);
    res.status(500).json({ error: error?.message || 'Enhancement failed' });
  }
});

// Serve frontend in dev or prod
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Vocalis server running on http://localhost:${PORT}`);
});
