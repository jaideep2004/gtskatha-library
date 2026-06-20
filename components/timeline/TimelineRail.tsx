'use client';

import type { ITimelineComment } from '@/types';
import { formatDuration } from '@/lib/utils';

interface TimelineRailProps {
  duration: number;
  currentTime: number;
  comments?: ITimelineComment[];
  onSeek: (time: number) => void;
  isPlaying?: boolean;
  variant?: 'full' | 'compact' | 'mini';
  label?: string;
}

const bars = Array.from({ length: 64 }, (_, index) => {
  const wave = Math.abs(Math.sin(index * 1.71) * 0.52 + Math.cos(index * 0.43) * 0.3);
  return Math.round(24 + wave * 76);
});

export default function TimelineRail({
  duration,
  currentTime,
  comments = [],
  onSeek,
  isPlaying = false,
  variant = 'full',
  label = 'Media timeline',
}: TimelineRailProps) {
  const safeDuration = duration > 0 ? duration : 1;
  const progress = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));

  function seekFromPointer(event: React.PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    onSeek(ratio * safeDuration);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    onSeek(
      Math.min(
        safeDuration,
        Math.max(0, currentTime + (event.key === 'ArrowRight' ? 5 : -5))
      )
    );
  }

  return (
    <div
      className={`timeline-rail timeline-rail--${variant} ${isPlaying ? 'is-playing' : ''}`}
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(safeDuration)}
      aria-valuenow={Math.round(currentTime)}
      tabIndex={0}
      onPointerDown={seekFromPointer}
      onKeyDown={handleKeyDown}
    >
      <div className="timeline-bars" aria-hidden>
        {bars.map((height, index) => (
          <i
            key={index}
            style={
              {
                '--bar-height': `${height}%`,
                '--bar-delay': `${(index % 9) * -70}ms`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="timeline-played" style={{ width: `${progress}%` }} aria-hidden />
      <div className="timeline-head" style={{ left: `${progress}%` }} aria-hidden />
      {comments.map((comment, index) => {
        const left = Math.min(
          100,
          Math.max(0, (comment.timestampSeconds / safeDuration) * 100)
        );
        return (
          <button
            type="button"
            className="timeline-marker"
            style={
              {
                left: `${left}%`,
                '--marker-index': index,
              } as React.CSSProperties
            }
            key={comment._id}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onSeek(comment.timestampSeconds);
            }}
            title={`${comment.author.name} · ${formatDuration(comment.timestampSeconds)} — ${comment.content}`}
            aria-label={`Seek to comment by ${comment.author.name} at ${formatDuration(comment.timestampSeconds)}`}
          >
            <span>{comment.author.name.charAt(0).toUpperCase()}</span>
          </button>
        );
      })}

      <style>{`
        .timeline-rail{--rail-accent:#e69424;position:relative;width:100%;height:72px;border-radius:11px;overflow:visible;cursor:pointer;isolation:isolate;outline:none;background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.015))}
        .timeline-rail:focus-visible{box-shadow:0 0 0 3px rgba(230,148,36,.3)}
        .timeline-bars{position:absolute;inset:8px 0;display:grid;grid-template-columns:repeat(64,1fr);align-items:center;gap:2px;overflow:hidden;border-radius:8px}
        .timeline-bars i{display:block;height:var(--bar-height);min-height:4px;border-radius:999px;background:rgba(255,255,255,.2);transition:background .2s ease,opacity .2s ease,filter .2s ease}
        .timeline-rail.is-playing .timeline-bars i{animation:timeline-glow 1.4s ease-in-out var(--bar-delay) infinite}
        .timeline-played{position:absolute;inset:8px auto 8px 0;border-radius:8px 0 0 8px;background:linear-gradient(90deg,rgba(230,148,36,.16),rgba(244,178,73,.28));border-right:1px solid rgba(255,210,126,.8);pointer-events:none;transition:width .12s linear;mix-blend-mode:screen}
        .timeline-head{position:absolute;top:5px;bottom:5px;width:2px;background:#ffd083;box-shadow:0 0 13px rgba(255,184,72,.75);transform:translateX(-1px);pointer-events:none;transition:left .12s linear}
        .timeline-marker{position:absolute;top:-5px;width:22px;height:22px;display:grid;place-items:center;transform:translateX(-50%);border:2px solid rgba(255,255,255,.9);border-radius:50%;background:#df8a1b;color:#fff;font-size:9px;font-weight:800;box-shadow:0 4px 13px rgba(0,0,0,.28);z-index:4;transition:transform .15s ease}
        .timeline-marker:hover,.timeline-marker:focus-visible{transform:translateX(-50%) scale(1.18);outline:none}
        .timeline-rail--compact{height:40px;border-radius:7px;background:transparent}
        .timeline-rail--compact .timeline-bars{inset:6px 0;gap:1px}
        .timeline-rail--compact .timeline-bars i{background:#9ca8b8}
        .timeline-rail--compact .timeline-played{inset:6px auto 6px 0;background:linear-gradient(90deg,rgba(217,133,25,.3),rgba(242,172,59,.48));border-right-color:#c66f0b;mix-blend-mode:multiply}
        .timeline-rail--compact .timeline-head{top:4px;bottom:4px;background:#b85f00;box-shadow:0 0 9px rgba(217,133,25,.5)}
        .timeline-rail--compact .timeline-marker{width:16px;height:16px;top:-5px;font-size:7px;border-width:1px;background:#c76f0c;border-color:#fff7e9}
        .timeline-rail--mini{height:5px;border-radius:0;background:rgba(255,255,255,.13);overflow:visible}
        .timeline-rail--mini .timeline-bars{display:none}.timeline-rail--mini .timeline-played{inset:0 auto 0 0;border-radius:0;background:linear-gradient(90deg,#b96e12,#f1ad3d);border:0}.timeline-rail--mini .timeline-head{top:-2px;bottom:-2px;width:1px}.timeline-rail--mini .timeline-marker{width:9px;height:9px;top:-2px;border-width:1px;font-size:0;box-shadow:0 0 8px rgba(230,148,36,.8)}
        @keyframes timeline-glow{0%,100%{opacity:.62;filter:brightness(.9)}50%{opacity:1;filter:brightness(1.35)}}
        @media(prefers-reduced-motion:reduce){.timeline-rail.is-playing .timeline-bars i{animation:none}.timeline-head,.timeline-played{transition:none}}
      `}</style>
    </div>
  );
}
