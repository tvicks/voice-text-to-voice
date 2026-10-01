import React from 'react';
import { Volume2, History, Keyboard, Sparkles, Cpu } from 'lucide-react';
import { SpeechEngine } from '../types';

interface HeaderProps {
  engine: SpeechEngine;
  onEngineChange: (engine: SpeechEngine) => void;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenShortcuts: () => void;
  isSpeaking: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  engine,
  onEngineChange,
  historyCount,
  onOpenHistory,
  onOpenShortcuts,
  isSpeaking,
}) => {
  return (
    <header className="border-b border-stone-800 bg-stone-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-950/40 text-stone-950">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-stone-100">VOCALIS</span>
              <span className="text-[11px] font-medium tracking-wider uppercase text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded">
                Voice Studio
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block">
              Text to Voice Synthesis & Multilingual Acoustic Lab
            </p>
          </div>
        </div>

        {/* Center / Engine Toggle */}
        <div className="flex items-center bg-stone-900 border border-stone-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onEngineChange('gemini')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              engine === 'gemini'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Neural Studio</span>
          </button>
          <button
            type="button"
            onClick={() => onEngineChange('browser')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              engine === 'browser'
                ? 'bg-stone-800 text-stone-100 border border-stone-700 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-stone-400" />
            <span>Device WebSpeech</span>
          </button>
        </div>

        {/* Right utility actions */}
        <div className="flex items-center gap-2">
          {/* Keyboard shortcut guide */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts"
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-900 rounded-lg transition-colors border border-transparent hover:border-stone-800"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* History drawer trigger */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-all"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Takes Library</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] font-semibold rounded-full border border-amber-500/30">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
