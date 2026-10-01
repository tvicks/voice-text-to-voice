import React, { useState } from 'react';
import { X, Bookmark, Sparkles, Check } from 'lucide-react';
import { VoiceSettings, VoicePreset } from '../types';

interface CustomPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: VoiceSettings;
  onSavePreset: (preset: VoicePreset) => void;
}

export const CustomPersonaModal: React.FC<CustomPersonaModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSavePreset,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'narrative' | 'commercial' | 'casual' | 'assistant' | 'creative'>('creative');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newPreset: VoicePreset = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Custom acoustic profile',
      icon: 'User',
      category,
      settings: {
        engine: currentSettings.engine,
        geminiVoice: currentSettings.geminiVoice,
        geminiStyle: currentSettings.geminiStyle,
        browserVoiceURI: currentSettings.browserVoiceURI,
        speed: currentSettings.speed,
        pitch: currentSettings.pitch,
        volume: currentSettings.volume,
      },
    };

    onSavePreset(newPreset);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2 text-stone-100">
            <Bookmark className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm">Save Custom Voice Persona</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-300 font-medium mb-1">Persona Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nightly Tech Briefing, Storybook Narrator"
              className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-stone-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-stone-300 font-medium mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short note describing timbre and pacing"
              className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-stone-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-stone-300 font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-stone-200 text-xs"
            >
              <option value="narrative">Narrative & Audiobooks</option>
              <option value="commercial">Commercial & Broadcasting</option>
              <option value="casual">Casual & Conversational</option>
              <option value="assistant">Digital Assistant & Tech</option>
              <option value="creative">Creative & Characters</option>
            </select>
          </div>

          <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800 text-[11px] text-stone-400 space-y-1">
            <div className="font-semibold text-stone-300">Saved Parameters:</div>
            <div>
              Engine: <span className="text-amber-400">{currentSettings.engine}</span> · Voice:{' '}
              <span className="text-stone-200">
                {currentSettings.engine === 'gemini'
                  ? currentSettings.geminiVoice
                  : 'Selected Web Voice'}
              </span>
            </div>
            <div>
              Speed: <span className="text-stone-200">{currentSettings.speed}x</span> · Pitch:{' '}
              <span className="text-stone-200">{currentSettings.pitch}x</span> · Gain:{' '}
              <span className="text-stone-200">{Math.round(currentSettings.volume * 100)}%</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-stone-400 hover:text-stone-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-semibold rounded-xl"
            >
              Save Persona
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
