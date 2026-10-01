import React, { useEffect, useRef } from 'react';
import { parseTextIntoSentences } from '../utils/audio';
import { Play, Sparkles } from 'lucide-react';

interface KaraokeReaderProps {
  text: string;
  currentWordCharIndex: number;
  currentSentenceIndex: number;
  isSpeaking: boolean;
  onSpeakSentence: (sentence: string, index: number) => void;
}

export const KaraokeReader: React.FC<KaraokeReaderProps> = ({
  text,
  currentWordCharIndex,
  currentSentenceIndex,
  isSpeaking,
  onSpeakSentence,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeSentenceRef = useRef<HTMLDivElement | null>(null);

  const sentenceBlocks = parseTextIntoSentences(text);

  // Auto scroll to active sentence
  useEffect(() => {
    if (activeSentenceRef.current && isSpeaking) {
      activeSentenceRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentSentenceIndex, isSpeaking]);

  if (!text.trim()) {
    return (
      <div className="flex-1 min-h-[220px] bg-stone-950/60 border border-stone-800 rounded-xl flex items-center justify-center text-stone-500 text-xs">
        No script loaded. Switch back to Editor to write or paste text.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-[220px] max-h-[340px] overflow-y-auto bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-3"
    >
      <div className="text-[11px] font-mono text-stone-500 pb-1 border-b border-stone-800/80 flex items-center justify-between">
        <span>ACOUSTIC TELEPROMPTER VIEW</span>
        <span>Click any line to synthesize</span>
      </div>

      <div className="space-y-2.5">
        {sentenceBlocks.map((block, sIndex) => {
          const isCurrentSentence = isSpeaking && sIndex === currentSentenceIndex;

          return (
            <div
              key={sIndex}
              ref={isCurrentSentence ? activeSentenceRef : null}
              className={`p-2.5 rounded-lg border transition-all text-sm leading-relaxed flex items-start gap-2.5 ${
                isCurrentSentence
                  ? 'bg-amber-500/10 border-amber-500/40 text-stone-100 shadow-sm'
                  : 'bg-stone-900/30 border-transparent hover:border-stone-800 text-stone-300'
              }`}
            >
              <button
                type="button"
                onClick={() => onSpeakSentence(block.sentence, sIndex)}
                title="Speak this line"
                className={`mt-0.5 p-1 rounded transition-colors ${
                  isCurrentSentence
                    ? 'text-amber-400 bg-amber-500/20'
                    : 'text-stone-500 hover:text-amber-300 hover:bg-stone-800'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>

              <div className="flex-1 flex flex-wrap gap-x-1 gap-y-0.5">
                {block.tokens.map((token, tIndex) => {
                  const isCurrentWord =
                    isSpeaking &&
                    currentWordCharIndex >= token.charIndex &&
                    currentWordCharIndex < token.charIndex + token.length;

                  return (
                    <span
                      key={tIndex}
                      className={`transition-all rounded px-0.5 ${
                        isCurrentWord
                          ? 'bg-amber-400 text-stone-950 font-bold shadow-sm shadow-amber-400/50 scale-105 inline-block'
                          : isCurrentSentence
                            ? 'text-stone-100 font-medium'
                            : 'text-stone-300'
                      }`}
                    >
                      {token.word}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
