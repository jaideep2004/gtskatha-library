'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePlayerContext } from '@/context/PlayerContext';
import { formatDuration, getThumbnailUrl } from '@/lib/utils';
import TimelineRail from '@/components/timeline/TimelineRail';
import { useTimelineInteractions } from '@/hooks/useTimelineInteractions';

export default function MiniPlayer() {
  const pathname = usePathname();
  const {
    katha,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isVisible,
    resume,
    pause,
    seek,
    setVolume,
    toggleMute,
    skip,
    close,
  } = usePlayerContext();
  const { data: interactions } = useTimelineInteractions(katha?._id, Boolean(katha));

  if (!isVisible || !katha || pathname.startsWith('/video/')) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const thumbSrc = getThumbnailUrl(katha.thumbnail);

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    seek(parseFloat(e.target.value));
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    setVolume(parseFloat(e.target.value));
  }

  return (
    <div className="mini-player" role="region" aria-label="Now playing">
      <div className="mini-player-timeline">
        <TimelineRail
          variant="mini"
          duration={duration || katha.duration || 0}
          currentTime={currentTime}
          comments={interactions.comments}
          isPlaying={isPlaying}
          onSeek={seek}
          label="Now playing timeline"
        />
      </div>
      <div className="mini-player-content">
        <div className="mini-player-info">
          <div className="mini-player-thumb">
            {/* THUMB SLOT: dynamic from katha.thumbnail */}
            <img
              src={thumbSrc}
              alt={katha.title}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style');
              }}
            />
            <div className="mini-player-thumb-placeholder" style={{ display: 'none' }}>
              <span>☬</span>
            </div>
          </div>

          <div className="mini-player-meta">
            <Link href={`/${katha.type}/${katha.slug}`} className="mini-player-title">
              {katha.title}
            </Link>
            <span className="mini-player-artist">{katha.authorName ?? 'Sikh Katha Library'}</span>
          </div>
        </div>

        <div className="mini-player-controls">
          <button className="mp-ctrl" aria-label="Shuffle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
              <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
              <line x1="4" y1="4" x2="9" y2="9"/>
            </svg>
          </button>

          <button className="mp-ctrl" aria-label="Previous" onClick={() => skip(-15)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19 20 9 12 19 4 19 20"/>
              <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>

          <button
            className="mp-play"
            onClick={isPlaying ? pause : resume}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            )}
          </button>

          <button className="mp-ctrl" aria-label="Next" onClick={() => skip(15)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 4 15 12 5 20 5 4"/>
              <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>

          <button className="mp-ctrl" aria-label="Repeat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
          </button>
        </div>

        <div className="mini-player-right">
          <span className="mini-player-time">{formatDuration(currentTime)}</span>

          <div className="mini-player-progress-wrap">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={handleSeek}
              className="mini-player-seek"
              aria-label="Seek"
            />
            <div className="mini-player-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <span className="mini-player-time">{formatDuration(duration)}</span>

          <button className="mp-ctrl" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted || volume === 0 ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
            className="volume-slider"
            aria-label="Volume"
          />

          <button className="mp-ctrl close-btn" onClick={close} aria-label="Close player">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="8" y2="18"/><line x1="12" y1="6" x2="12" y2="18"/>
              <line x1="16" y1="6" x2="16" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        .mini-player {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: var(--z-player);
          background: #0b0f13;
          border-top: 1px solid rgba(215, 154, 47, 0.35);
          box-shadow: 0 -8px 32px rgba(0,0,0,0.24);
          user-select: none;
        }

        .mini-player-timeline {
          position: absolute;
          inset: 0 0 auto;
          z-index: 3;
        }

        .mini-player-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 24px;
          gap: 20px;
          height: var(--player-height);
          max-width: var(--max-width);
          margin: 0 auto;
        }

        .mini-player-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 0 0 240px;
        }

        .mini-player-thumb {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--color-bg-secondary);
        }

        .mini-player-thumb img {
          width: 100%; height: 100%; object-fit: cover;
        }

        .mini-player-thumb-placeholder {
          width: 100%; height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #2a2210, #3d3218);
          font-size: 20px;
          color: var(--color-primary);
        }

        .mini-player-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .mini-player-title {
          font-size: 13px;
          font-weight: 600;
          color: #f8f5ed;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mini-player-title:hover { color: var(--color-primary); }

        .mini-player-artist {
          font-size: 11px;
          color: rgba(255,255,255,0.58);
        }

        .mini-player-controls {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          justify-content: center;
        }

        .mp-ctrl {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: color var(--transition-fast), background-color var(--transition-fast);
        }

        .mp-ctrl:hover {
          color: #fff;
          background: rgba(255,255,255,0.08);
        }

        .mp-play {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--color-primary);
          border: none;
          color: #fff;
          cursor: pointer;
          transition: background-color var(--transition-fast), transform var(--transition-fast);
          flex-shrink: 0;
          margin: 0 4px;
        }

        .mp-play:hover {
          background: var(--color-primary-dark);
          transform: scale(1.04);
        }

        .mini-player-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 0 0 auto;
          min-width: 0;
        }

        .mini-player-time {
          font-size: 11px;
          color: rgba(255,255,255,0.55);
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }

        .mini-player-progress-wrap {
          position: relative;
          width: 140px;
          height: 4px;
          background: rgba(255,255,255,0.2);
          border-radius: 9999px;
          overflow: hidden;
        }

        .mini-player-seek {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 2;
          margin: 0;
        }

        .mini-player-progress-fill {
          position: absolute;
          top: 0; left: 0;
          height: 100%;
          background: var(--color-primary);
          border-radius: 9999px;
          pointer-events: none;
        }

        .volume-slider {
          width: 72px;
          accent-color: var(--color-primary);
          cursor: pointer;
        }

        .close-btn { opacity: 0.5; }
        .close-btn:hover { opacity: 1; color: var(--color-error); }

        @media (max-width: 1024px) {
          .volume-slider { display: none; }
          .mini-player-info { flex: 0 0 180px; }
        }

        @media (max-width: 768px) {
          .mini-player {
            bottom: var(--mobile-nav-height, 64px);
          }
          .mini-player-right { display: none; }
          .mini-player-info { flex: 0 0 140px; }
          .mini-player-content { padding: 8px 16px; }
        }
      `}</style>
    </div>
  );
}
