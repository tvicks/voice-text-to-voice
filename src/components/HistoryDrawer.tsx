import React from 'react';
import { HistoryItem } from '../types';
import {
  X,
  Play,
  Download,
  Copy,
  Trash2,
  Sparkles,
  Cpu,
  Clock,
  Volume2,
} from 'lucide-react';
import { formatTime, downloadAudioFile } from '../utils/audio';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onPlayItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  onLoadTextToEditor: (text: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onPlayItem,
  onClearHistory,
  onDeleteItem,
  onLoadTextToEditor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-stone-950 border-l border-stone-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-semibold text-stone-100 text-sm">Takes & Audio Library</h2>
              <p className="text-[11px] text-stone-400">
                {items.length} recorded take{items.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-xs text-stone-400 hover:text-rose-400 px-2 py-1 rounded transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-900 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of takes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-stone-500 text-xs px-4">
              <p>No audio takes generated yet.</p>
              <p className="text-[11px] text-stone-600 mt-1">
                Type text and click "Speak Script" to synthesize audio clips.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="bg-stone-900/70 border border-stone-800/90 rounded-xl p-3.5 space-y-2.5 hover:border-stone-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      {item.engine === 'gemini' ? (
                        <span className="flex items-center gap-1 text-amber-400 font-medium">
                          <Sparkles className="w-3 h-3" />
                          <span>Gemini ({item.voiceName})</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-stone-400 font-medium">
                          <Cpu className="w-3 h-3" />
                          <span>{item.voiceName}</span>
                        </span>
                      )}
                      <span className="text-stone-600">·</span>
                      <span className="text-stone-500">{dateStr}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.duration && (
                        <span className="text-stone-400 font-mono text-[10px]">
                          {formatTime(item.duration)}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="text-stone-500 hover:text-rose-400 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Transcript quote */}
                  <p className="text-xs text-stone-300 line-clamp-2 italic leading-relaxed">
                    "{item.text}"
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-800/60 text-xs">
                    <div className="flex items-center gap-1.5">
                      {item.audioUrl && (
                        <button
                          type="button"
                          onClick={() => onPlayItem(item)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Play</span>
                        </button>
                      )}

                      {item.audioUrl && (
                        <button
                          type="button"
                          onClick={() => downloadAudioFile(item.audioUrl!, `take_${item.id.slice(0, 6)}.wav`)}
                          className="p-1.5 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-lg transition-colors"
                          title="Download take as WAV"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadTextToEditor(item.text);
                        onClose();
                      }}
                      className="text-stone-400 hover:text-stone-200 text-[11px] underline"
                    >
                      Use in Editor
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
