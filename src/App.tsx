import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Visualizer } from './components/Visualizer';
import { VoiceCustomizer } from './components/VoiceCustomizer';
import { TextEditor } from './components/TextEditor';
import { KaraokeReader } from './components/KaraokeReader';
import { AudioControls } from './components/AudioControls';
import { HistoryDrawer } from './components/HistoryDrawer';
import { CustomPersonaModal } from './components/CustomPersonaModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import {
  SpeechEngine,
  VoiceSettings,
  VoicePreset,
  LanguageInfo,
  HistoryItem,
} from './types';
import { SUPPORTED_LANGUAGES } from './constants/languages';
import { CURATED_VOICE_PRESETS } from './constants/presets';
import {
  base64ToBlob,
  downloadAudioFile,
  connectAudioElementToAnalyser,
  getAudioContext,
} from './utils/audio';

const STORAGE_KEYS = {
  PRESETS: 'vocalis_custom_presets_v1',
  HISTORY: 'vocalis_history_v1',
  SETTINGS: 'vocalis_settings_v1',
};

const DEFAULT_SETTINGS: VoiceSettings = {
  engine: 'gemini',
  geminiVoice: 'Kore',
  geminiStyle: 'Warm, engaging, gentle cadence, rich storytelling intonation',
  browserVoiceURI: '',
  language: 'en-US',
  speed: 1.0,
  pitch: 1.0,
  volume: 1.0,
  loop: false,
};

export default function App() {
  // Speech & Voice State
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageInfo>(
    SUPPORTED_LANGUAGES[0]
  );
  const [text, setText] = useState<string>(SUPPORTED_LANGUAGES[0].defaultSample);
  const [viewMode, setViewMode] = useState<'editor' | 'karaoke'>('editor');

  // Playback runtime states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Ready for speech synthesis');

  // Multi-language & AI processing
  const [isTranslating, setIsTranslating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Karaōke index tracking
  const [currentWordCharIndex, setCurrentWordCharIndex] = useState(-1);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  // Audio element reference for Gemini audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);

  // Active Web Speech Utterance
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const webSpeechTimerRef = useRef<number | null>(null);

  // Detected browser voices
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  // History & Presets
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [customPresets, setCustomPresets] = useState<VoicePreset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRESETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSavePresetOpen, setIsSavePresetOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3500);
  };

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 30)));
    } catch (e) {}
  }, [history]);

  // Sync custom presets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(customPresets));
    } catch (e) {}
  }, [customPresets]);

  // Load browser speech synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setBrowserVoices(voices);
        // Default to first match if empty
        if (!settings.browserVoiceURI) {
          const defaultVoice =
            voices.find((v) => v.default) ||
            voices.find((v) => v.lang.startsWith('en')) ||
            voices[0];
          if (defaultVoice) {
            setSettings((prev) => ({ ...prev, browserVoiceURI: defaultVoice.voiceURI }));
          }
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Update language selection handler
  const handleSelectLanguage = (lang: LanguageInfo) => {
    setSelectedLanguage(lang);
    setSettings((prev) => ({ ...prev, language: lang.code }));

    // If text is still default sample from prior language, update to new language's sample
    const isPriorDefault = SUPPORTED_LANGUAGES.some((l) => l.defaultSample === text);
    if (isPriorDefault || !text.trim()) {
      setText(lang.defaultSample);
    }

    // Auto-match browser voice if using browser engine
    if (settings.engine === 'browser' && browserVoices.length > 0) {
      const langPrefix = lang.code.split('-')[0].toLowerCase();
      const matched = browserVoices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
      if (matched) {
        setSettings((prev) => ({ ...prev, browserVoiceURI: matched.voiceURI }));
      }
    }
  };

  // Stop all active playback
  const handleStop = useCallback(() => {
    // Stop HTML Audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Stop WebSpeech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (webSpeechTimerRef.current) {
      clearInterval(webSpeechTimerRef.current);
      webSpeechTimerRef.current = null;
    }

    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentTime(0);
    setCurrentWordCharIndex(-1);
    setCurrentSentenceIndex(0);
    setStatusMessage('Playback stopped');
  }, []);

  // Speak via Gemini AI Neural Studio
  const speakWithGemini = async (scriptText: string) => {
    setIsLoading(true);
    setStatusMessage(`Synthesizing studio 24kHz audio via Gemini 3.8 (${settings.geminiVoice})...`);

    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scriptText,
          voiceName: settings.geminiVoice,
          style: settings.geminiStyle,
          language: selectedLanguage.code,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to synthesize speech');
      }

      if (!data.audioBase64) {
        throw new Error('No audio was received from speech synthesis service');
      }

      const audioBlob = base64ToBlob(data.audioBase64, data.mimeType || 'audio/wav');
      const audioUrl = URL.createObjectURL(audioBlob);

      // Clean up previous blob URL
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
      }
      currentAudioUrlRef.current = audioUrl;

      // Initialize or reuse Audio element
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      audio.src = audioUrl;
      audio.playbackRate = settings.speed;
      audio.volume = settings.volume;
      audio.loop = settings.loop;

      // Connect to visualizer analyser
      try {
        connectAudioElementToAnalyser(audio);
      } catch (e) {}

      // Audio Event listeners
      audio.onloadedmetadata = () => {
        setDuration(audio.duration || 0);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
        // Estimate rough word position for teleprompter during audio file playback
        if (audio.duration > 0 && scriptText.length > 0) {
          const pct = audio.currentTime / audio.duration;
          setCurrentWordCharIndex(Math.floor(pct * scriptText.length));
        }
      };

      audio.onended = () => {
        if (!settings.loop) {
          setIsSpeaking(false);
          setIsPaused(false);
          setCurrentTime(0);
          setCurrentWordCharIndex(-1);
          setStatusMessage('Finished playing take');
        }
      };

      audio.onerror = (e) => {
        console.error('Audio playback error', e);
        setIsSpeaking(false);
        setIsPaused(false);
        setStatusMessage('Error playing synthesized audio');
      };

      await audio.play();
      setIsSpeaking(true);
      setIsPaused(false);
      setStatusMessage(`Speaking with ${settings.geminiVoice}`);

      // Add to takes history
      const newTake: HistoryItem = {
        id: `take_${Date.now()}`,
        timestamp: Date.now(),
        text: scriptText,
        engine: 'gemini',
        voiceName: settings.geminiVoice,
        language: selectedLanguage.name,
        audioUrl,
        audioBase64: data.audioBase64,
        duration: audio.duration || 0,
        characters: scriptText.length,
      };

      setHistory((prev) => [newTake, ...prev.slice(0, 25)]);
    } catch (err: any) {
      console.warn('Gemini TTS error:', err);
      const errMsg = err?.message || 'Gemini TTS generation error';
      setStatusMessage(errMsg);

      // Graceful fallback prompt: switch to browser engine
      showToast(`${errMsg}. Switching to Device WebSpeech engine.`);
      setSettings((prev) => ({ ...prev, engine: 'browser' }));
      speakWithBrowser(scriptText);
    } finally {
      setIsLoading(false);
    }
  };

  // Speak via Device WebSpeech Engine
  const speakWithBrowser = (scriptText: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Web Speech API is not supported in this browser.');
      return;
    }

    handleStop();

    const utterance = new SpeechSynthesisUtterance(scriptText);
    utteranceRef.current = utterance;

    // Apply Voice
    if (settings.browserVoiceURI) {
      const selected = browserVoices.find((v) => v.voiceURI === settings.browserVoiceURI);
      if (selected) {
        utterance.voice = selected;
      }
    }

    utterance.lang = selectedLanguage.code;
    utterance.rate = settings.speed;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    // Word boundary tracking for Karaōke
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCurrentWordCharIndex(event.charIndex);
      } else if (event.name === 'sentence') {
        setCurrentSentenceIndex((prev) => prev + 1);
      }
    };

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setStatusMessage(`Speaking via Device Voice (${utterance.voice?.name || 'Default'})`);

      // Estimated duration ticker for WebSpeech
      const estTotal = (scriptText.split(/\s+/).length / (140 * settings.speed)) * 60;
      setDuration(estTotal);

      const startTime = Date.now();
      if (webSpeechTimerRef.current) clearInterval(webSpeechTimerRef.current);
      webSpeechTimerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setCurrentTime(Math.min(estTotal, elapsed));
      }, 100);
    };

    utterance.onend = () => {
      if (webSpeechTimerRef.current) {
        clearInterval(webSpeechTimerRef.current);
        webSpeechTimerRef.current = null;
      }

      if (settings.loop) {
        speakWithBrowser(scriptText);
      } else {
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentTime(0);
        setCurrentWordCharIndex(-1);
        setStatusMessage('Finished speaking');
      }
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error', e);
      if (webSpeechTimerRef.current) clearInterval(webSpeechTimerRef.current);
      setIsSpeaking(false);
      setIsPaused(false);
      setStatusMessage('Speech synthesis interrupted or ended');
    };

    // Add to history
    const newTake: HistoryItem = {
      id: `take_${Date.now()}`,
      timestamp: Date.now(),
      text: scriptText,
      engine: 'browser',
      voiceName: utterance.voice?.name || 'Device Native',
      language: selectedLanguage.name,
      characters: scriptText.length,
    };
    setHistory((prev) => [newTake, ...prev.slice(0, 25)]);

    window.speechSynthesis.speak(utterance);
  };

  // Master Play / Toggle trigger
  const handleTogglePlay = async () => {
    const scriptToSpeak = text.trim();
    if (!scriptToSpeak) {
      showToast('Please enter some text to speak first.');
      return;
    }

    // Resume AudioContext if suspended
    try {
      getAudioContext().resume();
    } catch (e) {}

    // If currently speaking and not paused -> Pause
    if (isSpeaking && !isPaused) {
      if (settings.engine === 'gemini' && audioRef.current) {
        audioRef.current.pause();
        setIsPaused(true);
        setStatusMessage('Paused');
      } else if (settings.engine === 'browser' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
        setIsPaused(true);
        setStatusMessage('Paused');
      }
      return;
    }

    // If paused -> Resume
    if (isSpeaking && isPaused) {
      if (settings.engine === 'gemini' && audioRef.current) {
        await audioRef.current.play();
        setIsPaused(false);
        setStatusMessage(`Resumed ${settings.geminiVoice}`);
      } else if (settings.engine === 'browser' && 'speechSynthesis' in window) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setStatusMessage('Resumed');
      }
      return;
    }

    // Start fresh synthesis
    if (settings.engine === 'gemini') {
      await speakWithGemini(scriptToSpeak);
    } else {
      speakWithBrowser(scriptToSpeak);
    }
  };

  // Play a specific line from Karaōke view
  const handleSpeakSentence = (sentenceText: string, sentenceIdx: number) => {
    setCurrentSentenceIndex(sentenceIdx);
    if (settings.engine === 'gemini') {
      speakWithGemini(sentenceText);
    } else {
      speakWithBrowser(sentenceText);
    }
  };

  // Seek audio
  const handleSeek = (targetSeconds: number) => {
    if (settings.engine === 'gemini' && audioRef.current) {
      audioRef.current.currentTime = targetSeconds;
      setCurrentTime(targetSeconds);
    }
  };

  // Download currently synthesized audio take
  const handleDownloadAudio = () => {
    if (currentAudioUrlRef.current) {
      downloadAudioFile(currentAudioUrlRef.current, `vocalis_${settings.geminiVoice.toLowerCase()}_take.wav`);
      showToast('WAV file downloaded successfully.');
    } else {
      showToast('Synthesize an AI take first to download high-fidelity WAV.');
    }
  };

  // Play an item from the Takes Library
  const handlePlayHistoryItem = (item: HistoryItem) => {
    if (item.audioUrl) {
      handleStop();
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const audio = audioRef.current;
      audio.src = item.audioUrl;
      audio.playbackRate = settings.speed;
      audio.volume = settings.volume;
      audio.play().then(() => {
        setIsSpeaking(true);
        setIsPaused(false);
        setStatusMessage(`Replaying take (${item.voiceName})`);
      });
    } else {
      // Re-synthesize text
      setText(item.text);
      if (item.engine === 'gemini') {
        speakWithGemini(item.text);
      } else {
        speakWithBrowser(item.text);
      }
    }
  };

  // AI Translation
  const handleTranslate = async (targetLangName: string) => {
    if (!text.trim()) return;
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLanguage: targetLangName,
        }),
      });
      const data = await res.json();
      if (data.translatedText) {
        setText(data.translatedText);
        showToast(`Script translated to ${targetLangName}!`);
      } else {
        throw new Error(data.error || 'Translation failed');
      }
    } catch (e: any) {
      showToast(`Translation error: ${e.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // AI Text Enhancement for Speech
  const handleEnhanceText = async () => {
    if (!text.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          tone: settings.geminiStyle || 'natural and expressive spoken narration',
        }),
      });
      const data = await res.json();
      if (data.enhancedText) {
        setText(data.enhancedText);
        showToast('Text optimized for acoustic cadence & pronunciation!');
      } else {
        throw new Error(data.error || 'Enhancement failed');
      }
    } catch (e: any) {
      showToast(`Enhancement error: ${e.message}`);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter -> Speak
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleTogglePlay();
        return;
      }

      // Esc -> Stop
      if (e.key === 'Escape') {
        handleStop();
        return;
      }

      // Ctrl/Cmd + L -> Toggle Loop
      if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        setSettings((prev) => ({ ...prev, loop: !prev.loop }));
        return;
      }

      // Space -> Pause/Resume (only if not focused on text input)
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (e.key === ' ' && !isInput && isSpeaking) {
        e.preventDefault();
        handleTogglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpeaking, isPaused, text, settings]);

  const activeVoiceLabel =
    settings.engine === 'gemini'
      ? `${settings.geminiVoice} (Gemini AI)`
      : browserVoices.find((v) => v.voiceURI === settings.browserVoiceURI)?.name ||
        'Device Voice';

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Studio Header */}
      <Header
        engine={settings.engine}
        onEngineChange={(engine) => {
          handleStop();
          setSettings((prev) => ({ ...prev, engine }));
        }}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isSpeaking={isSpeaking}
      />

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Real-time Acoustic Waveform & Level Monitor */}
        <Visualizer
          isSpeaking={isSpeaking}
          isPaused={isPaused}
          engine={settings.engine}
          voiceLabel={activeVoiceLabel}
        />

        {/* Studio Grid: Left = Text/Karaoke, Right = Voice Customizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Script & Reading Teleprompter (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {viewMode === 'editor' ? (
              <TextEditor
                text={text}
                onChangeText={setText}
                selectedLanguage={selectedLanguage}
                onSelectLanguage={handleSelectLanguage}
                speed={settings.speed}
                onTranslate={handleTranslate}
                onEnhanceText={handleEnhanceText}
                isTranslating={isTranslating}
                isEnhancing={isEnhancing}
                viewMode={viewMode}
                onToggleViewMode={setViewMode}
              />
            ) : (
              <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 space-y-4 flex flex-col h-full">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{selectedLanguage.flag}</span>
                    <span className="text-xs font-semibold text-stone-200">
                      Teleprompter ({selectedLanguage.name})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewMode('editor')}
                    className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-lg transition-colors"
                  >
                    Back to Editor
                  </button>
                </div>
                <KaraokeReader
                  text={text}
                  currentWordCharIndex={currentWordCharIndex}
                  currentSentenceIndex={currentSentenceIndex}
                  isSpeaking={isSpeaking}
                  onSpeakSentence={handleSpeakSentence}
                />
              </div>
            )}
          </div>

          {/* Voice Personality & Tuning Control Center (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <VoiceCustomizer
              settings={settings}
              onUpdateSettings={(updates) => setSettings((prev) => ({ ...prev, ...updates }))}
              browserVoices={browserVoices}
              customPresets={customPresets}
              onOpenSavePreset={() => setIsSavePresetOpen(true)}
              onSelectPreset={(preset) => {
                setSettings((prev) => ({
                  ...prev,
                  ...preset.settings,
                }));
                showToast(`Loaded "${preset.title}" voice persona.`);
              }}
              onResetDefaults={() => {
                setSettings(DEFAULT_SETTINGS);
                showToast('Reset acoustic parameters to defaults.');
              }}
              currentLanguage={selectedLanguage.code}
            />
          </div>
        </div>

        {/* Master Playback Transport Bar (Pinned on desktop or prominent at bottom) */}
        <AudioControls
          isSpeaking={isSpeaking}
          isPaused={isPaused}
          isLoading={isLoading}
          currentTime={currentTime}
          duration={duration}
          loop={settings.loop}
          onTogglePlay={handleTogglePlay}
          onStop={handleStop}
          onToggleLoop={() => setSettings((prev) => ({ ...prev, loop: !prev.loop }))}
          onSeek={handleSeek}
          onDownloadAudio={handleDownloadAudio}
          hasAudioReady={Boolean(currentAudioUrlRef.current)}
          statusMessage={statusMessage}
          pitchMultiplier={settings.pitch}
        />
      </main>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 border border-stone-700 text-stone-100 text-xs px-4 py-2.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Takes & History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onPlayItem={handlePlayHistoryItem}
        onClearHistory={() => setHistory([])}
        onDeleteItem={(id) => setHistory((prev) => prev.filter((item) => item.id !== id))}
        onLoadTextToEditor={(newText) => {
          setText(newText);
          showToast('Loaded text into editor.');
        }}
      />

      {/* Save Custom Voice Persona Modal */}
      <CustomPersonaModal
        isOpen={isSavePresetOpen}
        onClose={() => setIsSavePresetOpen(false)}
        currentSettings={settings}
        onSavePreset={(preset) => {
          setCustomPresets((prev) => [preset, ...prev]);
          showToast(`Saved "${preset.title}" persona.`);
        }}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
}
