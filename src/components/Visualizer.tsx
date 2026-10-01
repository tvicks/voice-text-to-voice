import React, { useEffect, useRef } from 'react';
import { getAnalyser } from '../utils/audio';

interface VisualizerProps {
  isSpeaking: boolean;
  isPaused: boolean;
  engine: 'gemini' | 'browser';
  voiceLabel: string;
}

export const Visualizer: React.FC<VisualizerProps> = ({
  isSpeaking,
  isPaused,
  engine,
  voiceLabel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let analyser: AnalyserNode | null = null;
    try {
      analyser = getAnalyser();
    } catch (e) {
      analyser = null;
    }

    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background subtle gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, 'rgba(28, 25, 23, 0.4)');
      bgGrad.addColorStop(1, 'rgba(12, 10, 9, 0.9)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle center line
      ctx.strokeStyle = 'rgba(120, 113, 108, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const numBars = 48;
      const barWidth = Math.max(3, (width - (numBars - 1) * 3) / numBars);
      const centerY = height / 2;

      phaseRef.current += 0.08;

      let hasRealAudioData = false;
      if (analyser && dataArray && isSpeaking && !isPaused) {
        analyser.getByteFrequencyData(dataArray);
        // check if there's non-zero signal
        let sum = 0;
        for (let i = 0; i < 32; i++) {
          sum += dataArray[i];
        }
        if (sum > 50) {
          hasRealAudioData = true;
        }
      }

      for (let i = 0; i < numBars; i++) {
        let barHeight = 4; // idle floor

        if (isSpeaking && !isPaused) {
          if (hasRealAudioData && dataArray) {
            // Map frequencies with logarithmic spread
            const dataIndex = Math.min(
              dataArray.length - 1,
              Math.floor(Math.pow(i / numBars, 1.4) * (dataArray.length * 0.6))
            );
            const rawVal = dataArray[dataIndex] / 255;
            barHeight = Math.max(4, rawVal * (height * 0.85));
          } else {
            // Human speech envelope simulation when WebSpeech or direct audio is active
            const p = phaseRef.current;
            const norm = i / numBars;
            const formant1 = Math.sin(p * 2.2 + norm * 8) * 0.5 + 0.5;
            const formant2 = Math.cos(p * 1.5 - norm * 6) * 0.5 + 0.5;
            const envelope = Math.sin(norm * Math.PI); // arch in middle
            const jitter = Math.sin(p * 5 + i * 1.2) * 0.15;
            const factor = Math.max(0.05, (formant1 * 0.6 + formant2 * 0.4 + jitter) * envelope);
            barHeight = Math.max(5, factor * (height * 0.8));
          }
        }

        const x = i * (barWidth + 3);
        const yTop = centerY - barHeight / 2;

        // Dynamic warm amber / gold gradient for studio presence
        const barGrad = ctx.createLinearGradient(0, yTop, 0, yTop + barHeight);
        if (isSpeaking && !isPaused) {
          barGrad.addColorStop(0, '#f59e0b'); // amber-500
          barGrad.addColorStop(0.5, '#fbbf24'); // amber-400
          barGrad.addColorStop(1, '#d97706'); // amber-600
        } else {
          barGrad.addColorStop(0, 'rgba(120, 113, 108, 0.4)');
          barGrad.addColorStop(1, 'rgba(87, 83, 78, 0.2)');
        }

        ctx.fillStyle = barGrad;
        ctx.beginPath();
        // Rounded bar cap
        const radius = Math.min(2, barWidth / 2);
        ctx.roundRect(x, yTop, barWidth, barHeight, radius);
        ctx.fill();

        // Optional peak dot
        if (isSpeaking && !isPaused && barHeight > 18) {
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(x + (barWidth - 2) / 2, yTop - 3, 2, 2);
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSpeaking, isPaused]);

  // Handle high-DPI canvas resolution
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  return (
    <div className="relative w-full h-24 bg-stone-950 border border-stone-800/80 rounded-xl overflow-hidden shadow-inner flex flex-col justify-between p-3">
      {/* Visualizer canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Top overlay metadata (unboxed, typography discipline) */}
      <div className="relative z-10 flex items-center justify-between pointer-events-none text-[11px]">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isSpeaking
                ? isPaused
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-emerald-400 shadow-sm shadow-emerald-400'
                : 'bg-stone-600'
            }`}
          />
          <span className="font-medium tracking-wide text-stone-300">
            {isSpeaking
              ? isPaused
                ? 'OUTPUT PAUSED'
                : 'ACOUSTIC SYNTHESIS STREAMING'
              : 'MONITOR STANDBY'}
          </span>
          <span className="text-stone-600">·</span>
          <span className="text-stone-400 font-mono">
            {engine === 'gemini' ? '24kHz RIFF PCM' : 'WebSpeech AudioNode'}
          </span>
        </div>

        <div className="text-stone-400 font-mono tracking-tight">
          Active Voice: <span className="text-amber-300 font-semibold">{voiceLabel}</span>
        </div>
      </div>

      {/* Bottom overlay status */}
      <div className="relative z-10 flex items-center justify-between pointer-events-none text-[10px] text-stone-500">
        <div className="flex items-center gap-3 font-mono">
          <span>L: -{isSpeaking && !isPaused ? '14.2' : 'INF'} dB</span>
          <span>R: -{isSpeaking && !isPaused ? '14.5' : 'INF'} dB</span>
        </div>
        <div className="font-mono">STEREO MASTER BUS</div>
      </div>
    </div>
  );
};
