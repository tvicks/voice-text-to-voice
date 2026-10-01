import React, { useRef, useState } from 'react';
import {
  Globe,
  Wand2,
  Languages,
  FileText,
  Upload,
  Copy,
  Trash2,
  Clock,
  Sparkles,
  Check,
  ChevronDown,
} from 'lucide-react';
import { LanguageInfo } from '../types';
import { SUPPORTED_LANGUAGES, CATEGORIZED_SAMPLES } from '../constants/languages';
import { estimateReadingTime } from '../utils/audio';

interface TextEditorProps {
  text: string;
  onChangeText: (text: string) => void;
  selectedLanguage: LanguageInfo;
  onSelectLanguage: (lang: LanguageInfo) => void;
  speed: number;
  onTranslate: (targetLangName: string) => Promise<void>;
  onEnhanceText: () => Promise<void>;
  isTranslating: boolean;
  isEnhancing: boolean;
  viewMode: 'editor' | 'karaoke';
  onToggleViewMode: (mode: 'editor' | 'karaoke') => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  onChangeText,
  selectedLanguage,
  onSelectLanguage,
  speed,
  onTranslate,
  onEnhanceText,
  isTranslating,
  isEnhancing,
  viewMode,
  onToggleViewMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSamplesMenu, setShowSamplesMenu] = useState(false);
  const [showLanguagesMenu, setShowLanguagesMenu] = useState(false);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estSeconds = estimateReadingTime(text, speed);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy text', e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onChangeText(content);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  return (
    <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 space-y-4 flex flex-col h-full">
      {/* Action bar on top */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
        {/* Language selector & translation */}
        <div className="flex items-center gap-2">
          {/* Language dropdown button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLanguagesMenu(!showLanguagesMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-stone-700 text-stone-200 rounded-xl text-xs font-medium transition-colors"
            >
              <span className="text-base leading-none">{selectedLanguage.flag}</span>
              <span className="font-semibold">{selectedLanguage.name}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {/* Language popover */}
            {showLanguagesMenu && (
              <div className="absolute left-0 top-full mt-1.5 w-64 max-h-72 overflow-y-auto bg-stone-950 border border-stone-800 rounded-xl shadow-2xl p-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-400 border-b border-stone-800">
                  Select Target Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onSelectLanguage(lang);
                      setShowLanguagesMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      lang.code === selectedLanguage.code
                        ? 'bg-amber-500/15 text-amber-300 font-semibold'
                        : 'text-stone-300 hover:bg-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-mono">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick AI Translate to selected language */}
          <button
            type="button"
            disabled={isTranslating || !text.trim()}
            onClick={() => onTranslate(selectedLanguage.name)}
            title={`Translate current text into ${selectedLanguage.name}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-stone-700 disabled:opacity-40 text-stone-300 rounded-xl text-xs font-medium transition-colors"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span>{isTranslating ? 'Translating...' : 'Translate Script'}</span>
          </button>

          {/* AI Speech Polish / Cadence optimize */}
          <button
            type="button"
            disabled={isEnhancing || !text.trim()}
            onClick={onEnhanceText}
            title="Format text for speech rhythm, natural pauses, and pronunciation"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-stone-700 disabled:opacity-40 text-stone-300 rounded-xl text-xs font-medium transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEnhancing ? 'Polishing...' : 'Polish Cadence'}</span>
          </button>
        </div>

        {/* Right side script tools */}
        <div className="flex items-center gap-2">
          {/* Sample scripts picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSamplesMenu(!showSamplesMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-950 hover:bg-stone-850 border border-stone-800 text-stone-300 rounded-xl text-xs font-medium transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              <span>Sample Scripts</span>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </button>

            {showSamplesMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-72 max-h-72 overflow-y-auto bg-stone-950 border border-stone-800 rounded-xl shadow-2xl p-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-400 border-b border-stone-800">
                  Load Curated Sample Script
                </div>
                {CATEGORIZED_SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      onChangeText(sample.text);
                      setShowSamplesMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-stone-300 hover:bg-stone-900 transition-colors"
                  >
                    <div className="font-medium text-stone-200">{sample.label}</div>
                    <div className="text-[10px] text-stone-500">{sample.category}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Import file (.txt, .md) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload text or markdown file"
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors border border-stone-800"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.text"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy script"
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors border border-stone-800"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Clear */}
          <button
            type="button"
            onClick={() => onChangeText('')}
            title="Clear text"
            className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors border border-stone-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Mode Segmented Switcher */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
          <button
            type="button"
            onClick={() => onToggleViewMode('editor')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'editor'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Script Editor
          </button>
          <button
            type="button"
            onClick={() => onToggleViewMode('karaoke')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'karaoke'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Karaōke Teleprompter
          </button>
        </div>

        {/* Live reading time estimate */}
        <div className="flex items-center gap-1.5 text-stone-400 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Est. Duration: ~{estSeconds}s</span>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative flex-1 min-h-[220px]">
        <textarea
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={`Enter or paste script to be spoken in ${selectedLanguage.name}...`}
          className="w-full h-full min-h-[220px] bg-stone-950/80 border border-stone-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-4 text-sm text-stone-200 placeholder-stone-600 resize-none font-sans leading-relaxed tracking-normal focus:outline-none"
        />
      </div>

      {/* Bottom statistics bar (Zero-pill metadata discipline) */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-xs text-stone-500">
        <div className="flex items-center gap-2 font-mono">
          <span>{charCount} characters</span>
          <span aria-hidden="true">·</span>
          <span>{wordCount} words</span>
          <span aria-hidden="true">·</span>
          <span>Target: {selectedLanguage.code}</span>
        </div>

        <div className="text-[11px] text-stone-500">
          Tip: Press <kbd className="px-1.5 py-0.5 bg-stone-800 rounded text-stone-300 font-mono">Ctrl + Enter</kbd> to Speak
        </div>
      </div>
    </div>
  );
};
