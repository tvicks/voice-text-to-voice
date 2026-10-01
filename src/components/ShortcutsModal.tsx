import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + Enter / Cmd + Enter', desc: 'Speak / Synthesize current script' },
    { key: 'Space', desc: 'Pause / Resume audio playback' },
    { key: 'Esc', desc: 'Stop playback and reset' },
    { key: 'Ctrl + L / Cmd + L', desc: 'Toggle repeat / loop' },
    { key: 'Ctrl + K / Cmd + K', desc: 'Toggle Karaōke teleprompter view' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-stone-950 border border-stone-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2 text-stone-100">
            <Keyboard className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm">Keyboard Shortcuts</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-lg bg-stone-900/60 border border-stone-800/80"
            >
              <span className="text-stone-300">{sc.desc}</span>
              <kbd className="px-2 py-0.5 bg-stone-800 text-amber-400 rounded text-[11px] font-mono border border-stone-700">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-200 rounded-xl text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
