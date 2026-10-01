/**
 * Audio processing, visualizer nodes, and file export utilities
 */

let sharedAudioContext: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let mediaElementSource: MediaElementAudioSourceNode | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    sharedAudioContext = new AudioContextClass();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

export function getAnalyser(): AnalyserNode {
  const ctx = getAudioContext();
  if (!sharedAnalyser) {
    sharedAnalyser = ctx.createAnalyser();
    sharedAnalyser.fftSize = 256;
    sharedAnalyser.smoothingTimeConstant = 0.8;
  }
  return sharedAnalyser;
}

/**
 * Connects an HTMLAudioElement to the Web Audio AnalyserNode for visualizer rendering
 */
export function connectAudioElementToAnalyser(audioEl: HTMLAudioElement): AnalyserNode {
  const ctx = getAudioContext();
  const analyser = getAnalyser();

  try {
    if (!mediaElementSource) {
      mediaElementSource = ctx.createMediaElementSource(audioEl);
      mediaElementSource.connect(analyser);
      analyser.connect(ctx.destination);
    }
  } catch (err) {
    // If already connected, ignore
    console.debug('MediaElementSource already attached or restricted:', err);
  }

  return analyser;
}

/**
 * Base64 string to Blob
 */
export function base64ToBlob(base64Data: string, mimeType = 'audio/wav'): Blob {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Trigger file download for an audio blob or URL
 */
export function downloadAudioFile(source: Blob | string, filename = 'speech.wav') {
  let url = '';
  let shouldRevoke = false;

  if (typeof source === 'string') {
    url = source;
  } else {
    url = URL.createObjectURL(source);
    shouldRevoke = true;
  }

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  if (shouldRevoke) {
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}

/**
 * Format seconds to mm:ss
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Splits text into sentences and words for Karaōke tracking
 */
export interface TextToken {
  word: string;
  charIndex: number;
  length: number;
}

export interface SentenceBlock {
  sentence: string;
  startIndex: number;
  endIndex: number;
  tokens: TextToken[];
}

export function parseTextIntoSentences(text: string): SentenceBlock[] {
  if (!text.trim()) return [];

  // Split by sentence terminators while preserving indices
  const sentenceRegex = /[^.!?\n]+[.!?\n]*/g;
  const blocks: SentenceBlock[] = [];
  let match: RegExpExecArray | null;

  while ((match = sentenceRegex.exec(text)) !== null) {
    const rawSentence = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + rawSentence.length;

    // Tokenize words inside the sentence
    const wordRegex = /\S+/g;
    const tokens: TextToken[] = [];
    let wordMatch: RegExpExecArray | null;

    while ((wordMatch = wordRegex.exec(rawSentence)) !== null) {
      tokens.push({
        word: wordMatch[0],
        charIndex: startIndex + wordMatch.index,
        length: wordMatch[0].length,
      });
    }

    blocks.push({
      sentence: rawSentence,
      startIndex,
      endIndex,
      tokens,
    });
  }

  return blocks;
}

/**
 * Estimates reading time in seconds based on words and speed multiplier
 */
export function estimateReadingTime(text: string, speedMultiplier = 1.0): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;
  // Standard speech rate ~140 words per minute at 1.0x speed
  const baseWordsPerMinute = 140;
  const effectiveWpm = baseWordsPerMinute * Math.max(0.5, speedMultiplier);
  return Math.ceil((words / effectiveWpm) * 60);
}
