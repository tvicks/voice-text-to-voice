import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Cpu,
  User,
  Volume2,
  Gauge,
  Music,
  Bookmark,
  ChevronDown,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { SpeechEngine, VoiceSettings, VoicePreset } from '../types';
import { GEMINI_VOICES_INFO, STYLE_SUGGESTIONS, CURATED_VOICE_PRESETS } from '../constants/presets';

interface VoiceCustomizerProps {
  settings: VoiceSettings;
  onUpdateSettings: (updates: Partial<VoiceSettings>) => void;
  browserVoices: SpeechSynthesisVoice[];
  customPresets: VoicePreset[];
  onOpenSavePreset: () => void;
  onSelectPreset: (preset: VoicePreset) => void;
  onResetDefaults: () => void;
  currentLanguage: string;
}

export const VoiceCustomizer: React.FC<VoiceCustomizerProps> = ({
  settings,
  onUpdateSettings,
  browserVoices,
  customPresets,
  onOpenSavePreset,
  onSelectPreset,
  onResetDefaults,
  currentLanguage,
}) => {
  const [filterVoiceLang, setFilterVoiceLang] = useState<string>('all');
  const [showStyleSuggestions, setShowStyleSuggestions] = useState(false);

  // Filter browser voices by selected language if requested
  const filteredBrowserVoices = browserVoices.filter((v) => {
    if (filterVoiceLang === 'all') return true;
    return v.lang.toLowerCase().startsWith(filterVoiceLang.toLowerCase().slice(0, 2));
  });

  return (
    <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 space-y-6">
      {/* Header with Title and Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-100">Acoustic Personality</h2>
            <p className="text-xs text-stone-400">Custom voice parameters, style & tuning</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetDefaults}
            title="Reset audio parameters to default"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            type="button"
            onClick={onOpenSavePreset}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-md text-xs font-medium transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      {/* Preset Personas Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span className="font-medium text-stone-300">Curated Voice Presets</span>
          <span className="text-[11px] text-stone-500">1-click acoustic profiles</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CURATED_VOICE_PRESETS.map((preset) => {
            const isSelected =
              settings.engine === preset.settings.engine &&
              (preset.settings.engine === 'browser' ||
                settings.geminiVoice === preset.settings.geminiVoice);

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`p-2.5 text-left rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/40 text-stone-100 shadow-sm'
                    : 'bg-stone-950/40 border-stone-800 hover:border-stone-700 text-stone-300 hover:bg-stone-850'
                }`}
              >
                <div className="font-medium text-stone-200 truncate">{preset.title}</div>
                <div className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* User Saved Presets if any */}
        {customPresets.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] text-stone-400 font-medium">My Saved Personas:</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {customPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-750 border border-stone-700 rounded-lg text-xs text-stone-200 transition-colors"
                >
                  ⭐ {preset.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Primary Voice Selection */}
      {settings.engine === 'gemini' ? (
        /* Gemini AI Studio Voices */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              AI Studio Neural Voices (Gemini 3.8)
            </span>
            <span className="text-stone-500 text-[11px]">Studio-grade 24kHz WAV</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {GEMINI_VOICES_INFO.map((voice) => {
              const isSelected = settings.geminiVoice === voice.id;
              return (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => onUpdateSettings({ geminiVoice: voice.id as any })}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-stone-100 shadow-md shadow-amber-950/30'
                      : 'bg-stone-950/40 border-stone-800 hover:border-stone-700 text-stone-400 hover:bg-stone-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-100">{voice.name}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-800/80 text-stone-400">
                      {voice.gender}
                    </span>
                  </div>
                  <div className="text-xs text-amber-400/90 font-medium mt-1 truncate">
                    {voice.persona}
                  </div>
                  <div className="text-[11px] text-stone-400 line-clamp-2 mt-1 leading-snug">
                    {voice.description}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Voice Persona / Emotional Styling Input */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="style-prompt" className="font-medium text-stone-300 flex items-center gap-1.5">
                <span>Vocal Style & Emotional Cadence</span>
                <span className="text-[11px] text-stone-500 font-normal">
                  (e.g., news anchor, whisper, dramatic)
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowStyleSuggestions(!showStyleSuggestions)}
                className="text-amber-400 hover:text-amber-300 text-[11px] underline flex items-center gap-1"
              >
                <span>Browse Suggestions</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${showStyleSuggestions ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            <div className="relative">
              <input
                id="style-prompt"
                type="text"
                value={settings.geminiStyle}
                onChange={(e) => onUpdateSettings({ geminiStyle: e.target.value })}
                placeholder="e.g., Warm, enthusiastic podcast host with engaging intonation"
                className="w-full bg-stone-950/70 border border-stone-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2 text-xs text-stone-200 placeholder-stone-600 transition-colors"
              />
              {settings.geminiStyle && (
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ geminiStyle: '' })}
                  className="absolute right-2.5 top-2.5 text-stone-500 hover:text-stone-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Expandable Style Suggestions */}
            {showStyleSuggestions && (
              <div className="p-2.5 bg-stone-950 border border-stone-800 rounded-xl flex flex-wrap gap-1.5">
                {STYLE_SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ geminiStyle: suggestion });
                      setShowStyleSuggestions(false);
                    }}
                    className="px-2.5 py-1 bg-stone-900 hover:bg-amber-500/10 hover:border-amber-500/30 border border-stone-800 text-stone-300 hover:text-amber-300 rounded-lg text-[11px] transition-colors"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Device Web Speech API Voices */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-stone-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-stone-400" />
              Device Native Voices ({browserVoices.length} detected)
            </span>
            <span className="text-stone-500 text-[11px]">Instant client-side synthesis</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Filter by language */}
            <div className="sm:col-span-1">
              <label className="block text-[11px] text-stone-400 mb-1">Filter Language</label>
              <select
                value={filterVoiceLang}
                onChange={(e) => setFilterVoiceLang(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:border-amber-500"
              >
                <option value="all">All Detected Languages</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ja">Japanese</option>
                <option value="zh">Chinese</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="ar">Arabic</option>
                <option value="ru">Russian</option>
                <option value="ko">Korean</option>
              </select>
            </div>

            {/* Voice Dropdown */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-stone-400 mb-1">Select Installed Voice</label>
              <select
                value={settings.browserVoiceURI}
                onChange={(e) => onUpdateSettings({ browserVoiceURI: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:border-amber-500"
              >
                {filteredBrowserVoices.length === 0 ? (
                  <option value="">No voices match filter (choose 'All Detected')</option>
                ) : (
                  filteredBrowserVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang}) {voice.default ? '★ Default' : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Sliders: Speed, Pitch, Volume */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-stone-800/80">
        {/* Speed / Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-300 font-medium flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              Cadence / Speed
            </span>
            <span className="text-amber-400 font-mono text-xs font-semibold">
              {settings.speed.toFixed(2)}x
            </span>
          </div>

          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={settings.speed}
            onChange={(e) => onUpdateSettings({ speed: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10px] text-stone-500">
            <button
              type="button"
              onClick={() => onUpdateSettings({ speed: 0.75 })}
              className={`hover:text-stone-300 ${settings.speed === 0.75 ? 'text-amber-400 font-bold' : ''}`}
            >
              0.75x
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ speed: 1.0 })}
              className={`hover:text-stone-300 ${settings.speed === 1.0 ? 'text-amber-400 font-bold' : ''}`}
            >
              1.0x (Norm)
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ speed: 1.25 })}
              className={`hover:text-stone-300 ${settings.speed === 1.25 ? 'text-amber-400 font-bold' : ''}`}
            >
              1.25x
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ speed: 1.5 })}
              className={`hover:text-stone-300 ${settings.speed === 1.5 ? 'text-amber-400 font-bold' : ''}`}
            >
              1.5x
            </button>
          </div>
        </div>

        {/* Pitch */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-300 font-medium flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-amber-400" />
              Pitch Tuning
            </span>
            <span className="text-amber-400 font-mono text-xs font-semibold">
              {settings.pitch < 0.9 ? 'Deep' : settings.pitch > 1.1 ? 'High' : 'Natural'} (
              {settings.pitch.toFixed(2)})
            </span>
          </div>

          <input
            type="range"
            min="0.5"
            max="1.8"
            step="0.05"
            value={settings.pitch}
            onChange={(e) => onUpdateSettings({ pitch: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10px] text-stone-500">
            <span>0.5x Baritone</span>
            <button
              type="button"
              onClick={() => onUpdateSettings({ pitch: 1.0 })}
              className="hover:text-stone-300"
            >
              1.0 (Reset)
            </button>
            <span>1.8x Soprano</span>
          </div>
        </div>

        {/* Volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-300 font-medium flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              Output Gain
            </span>
            <span className="text-amber-400 font-mono text-xs font-semibold">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={(e) => onUpdateSettings({ volume: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10px] text-stone-500">
            <button
              type="button"
              onClick={() => onUpdateSettings({ volume: 0 })}
              className="hover:text-stone-300"
            >
              Mute
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ volume: 0.5 })}
              className="hover:text-stone-300"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ volume: 1.0 })}
              className="hover:text-stone-300"
            >
              100%
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
