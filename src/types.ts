export type SpeechEngine = 'gemini' | 'browser';

export interface VoiceOption {
  id: string;
  name: string;
  gender?: 'female' | 'male' | 'neutral';
  language: string;
  langCode: string;
  engine: SpeechEngine;
  description: string;
  accent?: string;
  nativeVoice?: SpeechSynthesisVoice;
}

export interface VoiceSettings {
  engine: SpeechEngine;
  geminiVoice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  geminiStyle: string;
  browserVoiceURI: string;
  language: string;
  speed: number; // 0.5 to 2.0
  pitch: number; // 0.5 to 2.0
  volume: number; // 0.0 to 1.0
  loop: boolean;
}

export interface VoicePreset {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'narrative' | 'commercial' | 'casual' | 'assistant' | 'creative';
  settings: Partial<VoiceSettings>;
}

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  defaultSample: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  text: string;
  engine: SpeechEngine;
  voiceName: string;
  language: string;
  audioUrl?: string; // blob or base64 data url
  audioBase64?: string;
  duration?: number;
  characters: number;
}
