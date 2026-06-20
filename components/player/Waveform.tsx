'use client';

import { useRef, useEffect, useLayoutEffect, useCallback } from 'react';

interface WaveformProps {
  isPlaying?: boolean;
  progress?: number;
  color?: string;
  height?: number;
}

export default function Waveform({
  isPlaying = false,
  progress = 0,
  color = '#C8972A',
  height = 60,
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const drawRef = useRef<() => void>(() => {});

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const barCount = Math.floor(W / 6);
    const barW = 3;
    const gap = 3;
    const now = Date.now();

    for (let i = 0; i < barCount; i++) {
      const x = i * (barW + gap);
      const barProgress = i / barCount;
      const isPast = barProgress <= progress / 100;

      let h: number;
      if (isPlaying && isPast) {
        h = H * 0.2 + H * 0.7 * Math.abs(
          Math.sin(i * 0.4 + now * 0.004) * 0.5 +
          Math.cos(i * 0.7 + now * 0.003) * 0.3 +
          0.2
        );
      } else {
        h = H * 0.15 + H * 0.6 * Math.abs(Math.sin(i * 0.4) * 0.6 + Math.cos(i * 0.7) * 0.2 + 0.2);
      }

      const alpha = isPast ? 0.95 : 0.2;
      ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
      const y = (H - h) / 2;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, h, 1.5);
      ctx.fill();
    }

    if (isPlaying) {
      animRef.current = requestAnimationFrame(drawRef.current);
    }
  }, [isPlaying, progress, color]);

  useLayoutEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={height}
      style={{ width: '100%', height: `${height}px`, display: 'block' }}
      aria-hidden
    />
  );
}
