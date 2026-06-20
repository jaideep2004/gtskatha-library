'use client';

import { usePlayerContext } from '@/context/PlayerContext';
import { formatDuration } from '@/lib/utils';
import type { IKatha } from '@/types';
import TimelineCommunity from '@/components/timeline/TimelineCommunity';

interface AudioPlayerProps {
  className?: string;
  katha?: IKatha;
}

export default function AudioPlayer({ className, katha }: AudioPlayerProps) {
  const {
    katha: currentKatha,
    play,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    resume,
    pause,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    skip,
  } = usePlayerContext();

  function cycleSpeed() {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(next);
  }

  function handlePlayToggle() {
    if (katha && currentKatha?._id !== katha._id) {
      play(katha);
      return;
    }
    if (isPlaying) pause();
    else if (katha) play(katha);
    else resume();
  }

  function handleTimelineSeek(time: number) {
    if (katha && currentKatha?._id !== katha._id) {
      play(katha, { startAt: time });
      return;
    }
    seek(time);
  }

  return (
    <div className={`audio-player-wrap${className ? ` ${className}` : ''}`}>
      {/* Time row */}
      <div className="ap-time-row">
        <span>{formatDuration(currentTime)}</span>
        <span>{formatDuration(duration)}</span>
      </div>

      {/* Controls */}
      <div className="ap-controls">
        <button className="ap-ctrl-btn" onClick={cycleSpeed} aria-label={`Playback speed ${playbackRate}x`}>
          <span className="ap-speed-label">{playbackRate}×</span>
        </button>

        <button className="ap-ctrl-btn ap-skip-btn" onClick={() => skip(-15)} aria-label="Rewind 15 seconds">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          <span className="ap-skip-label">15</span>
        </button>

        <button
          className="ap-play-btn"
          onClick={handlePlayToggle}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          style={{ position: 'relative' }}
        >
          {isBuffering ? (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-spin"
              style={{ position: 'absolute' }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : isPlaying ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
        </button>

        <button className="ap-ctrl-btn ap-skip-btn" onClick={() => skip(15)} aria-label="Forward 15 seconds">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
          </svg>
          <span className="ap-skip-label">15</span>
        </button>

        <div className="ap-volume-wrap">
          <button className="ap-ctrl-btn" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted || volume === 0 ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="ap-volume-slider"
            aria-label="Volume"
          />
        </div>
      </div>

      {katha && (
        <TimelineCommunity
          kathaId={katha._id}
          currentTime={currentKatha?._id === katha._id ? currentTime : 0}
          duration={
            currentKatha?._id === katha._id
              ? duration || katha.duration || 0
              : katha.duration || 0
          }
          isPlaying={currentKatha?._id === katha._id && isPlaying}
          onSeek={handleTimelineSeek}
        />
      )}

      <style>{`
        .audio-player-wrap {
          background: var(--color-player-surface);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          margin: var(--space-6) 0;
        }

        .ap-time-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          margin-bottom: var(--space-5);
          font-variant-numeric: tabular-nums;
        }

        .ap-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-5);
        }

        .ap-ctrl-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px; height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: none;
          color: rgba(255,255,255,0.8);
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
        }

        .ap-ctrl-btn:hover {
          background: rgba(255,255,255,0.15);
          color: #fff;
        }

        .ap-skip-btn { position: relative; }

        .ap-skip-label {
          position: absolute;
          font-size: 8px;
          font-weight: 700;
          bottom: 7px;
          left: 50%;
          transform: translateX(-50%);
          color: inherit;
          pointer-events: none;
        }

        .ap-speed-label {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-primary-light);
          font-family: var(--font-body);
        }

        .ap-play-btn {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: var(--color-primary);
          border: none;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .ap-play-btn:hover {
          background: var(--color-primary-light);
          transform: scale(1.05);
          box-shadow: 0 4px 20px rgba(200, 151, 42, 0.5);
        }

        .ap-volume-wrap {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .ap-volume-slider {
          width: 80px;
          accent-color: var(--color-primary);
          cursor: pointer;
        }

        @media (max-width: 640px) {
          .ap-volume-wrap { display: none; }
          .ap-controls { gap: var(--space-3); }
        }
      `}</style>
    </div>
  );
}
