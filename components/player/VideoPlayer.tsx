'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { formatDuration } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media';
import { trackQualifiedView } from '@/lib/viewTracking';
import { usePlayerContext } from '@/context/PlayerContext';
import TimelineCommunity from '@/components/timeline/TimelineCommunity';

interface VideoPlayerProps {
  videoUrl?: string;
  thumbnail?: string;
  title?: string;
  kathaId?: string;
}

export default function VideoPlayer({ videoUrl, thumbnail, title, kathaId }: VideoPlayerProps) {
  const { close: closeAudioPlayer } = usePlayerContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastSavedAt = useRef(0);
  const viewTracked = useRef(false);

  const saveProgress = useCallback((time = videoRef.current?.currentTime ?? 0) => {
    const video = videoRef.current;
    if (!kathaId || !video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    void fetch('/api/continue-listening', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kathaId, currentTime: time, duration: video.duration }),
      keepalive: true,
    }).catch(() => {});
    lastSavedAt.current = Date.now();
  }, [kathaId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      setCurrentTime(video.currentTime);
      if (!viewTracked.current && kathaId && video.currentTime >= 30) {
        viewTracked.current = true;
        void trackQualifiedView(kathaId, video.currentTime).catch(() => {
          viewTracked.current = false;
        });
      }
      if (Date.now() - lastSavedAt.current >= 10_000) saveProgress(video.currentTime);
    };
    const onDur = async () => {
      setDuration(video.duration);
      if (!kathaId) return;
      try {
        const response = await fetch(`/api/continue-listening?kathaId=${encodeURIComponent(kathaId)}`);
        if (response.ok) {
          const payload = await response.json();
          if (!payload.data?.completed && payload.data?.currentTime > 0) {
            video.currentTime = Math.min(payload.data.currentTime, video.duration);
          }
        }
      } catch {}
    };
    const onEnded = () => {
      setIsPlaying(false);
      saveProgress(video.duration);
    };
    const onPause = () => saveProgress();
    const onChapterSeek = (event: Event) => {
      const time = (event as CustomEvent<number>).detail;
      if (Number.isFinite(time)) {
        video.currentTime = time;
        setCurrentTime(time);
      }
    };
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('loadedmetadata', onDur);
    video.addEventListener('ended', onEnded);
    video.addEventListener('pause', onPause);
    window.addEventListener('katha-video-seek', onChapterSeek);
    return () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('loadedmetadata', onDur);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('pause', onPause);
      window.removeEventListener('katha-video-seek', onChapterSeek);
    };
  }, [kathaId, saveProgress]);

  useEffect(() => {
    viewTracked.current = false;
  }, [kathaId]);

  function resetControlsTimeout() {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }

  async function togglePlay() {
    const video = videoRef.current;
    if (!video) { setIsPlaying(p => !p); return; }
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      setShowControls(true);
    } else {
      try {
        closeAudioPlayer();
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(true);
      }
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = val;
    setCurrentTime(val);
  }

  function toggleMute() {
    const video = videoRef.current;
    if (video) video.muted = !isMuted;
    setIsMuted(m => !m);
  }

  function handleFullscreen() {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!isFullscreen) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(f => !f);
  }

  const progress = duration ? (currentTime / duration) * 100 : 0;

  function seekTo(time: number) {
    if (videoRef.current) videoRef.current.currentTime = time;
    setCurrentTime(time);
  }

  return (
    <div className="video-player-shell">
    <div
      className={`video-player-container ${isPlaying ? 'playing' : ''}`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Khanda watermark */}
      <div className="video-watermark" aria-hidden>☬</div>

      {!videoUrl ? (
        <div className="video-placeholder">
          {thumbnail && (
            <img src={getMediaUrl('thumbnails', thumbnail)} alt={title} className="video-thumb-bg" />
          )}
          <div className="video-placeholder-overlay">
            <button className="video-play-large" onClick={togglePlay} aria-label="Play video">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </button>
            <p>Video preview unavailable</p>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={thumbnail ? getMediaUrl('thumbnails', thumbnail) : undefined}
          className="video-element"
          onClick={togglePlay}
          preload="metadata"
          aria-label={title}
        />
      )}

      {/* Controls overlay */}
      <div className={`video-controls-overlay ${showControls ? 'visible' : ''}`}>
        {/* Top: title */}
        <div className="video-ctrl-top">
          <span className="video-title-overlay">{title}</span>
        </div>

        {/* Center: play/pause */}
        <div className="video-ctrl-center">
          <button className="video-big-play" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            )}
          </button>
        </div>

        {/* Bottom controls */}
        <div className="video-ctrl-bottom">
          {/* Progress */}
          <div className="video-progress-wrap">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="video-seek-input"
              aria-label="Video seek"
            />
            <div className="video-progress-track">
              <div className="video-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="video-ctrl-row">
            <div className="video-ctrl-left">
              <button className="vid-ctrl-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                )}
              </button>

              <button className="vid-ctrl-btn" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  if (videoRef.current) videoRef.current.volume = v;
                }}
                className="vid-volume-slider"
                aria-label="Volume"
              />

              <span className="vid-time">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </span>
            </div>

            <div className="video-ctrl-right">
              <button className="vid-ctrl-btn" onClick={handleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                {isFullscreen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      </div>

      {kathaId && (
        <TimelineCommunity
          kathaId={kathaId}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onSeek={seekTo}
          dense
        />
      )}

      <style>{`
        .video-player-shell {
          overflow: hidden;
          border-radius: var(--radius-lg);
          background: linear-gradient(155deg, #0b1016, #151c24);
          box-shadow: 0 18px 44px rgba(12,18,26,.2);
        }

        .video-player-shell > .timeline-community {
          margin: 0 18px;
          padding-bottom: 12px;
        }

        .video-player-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background: #000;
          border-radius: var(--radius-lg);
          overflow: hidden;
          cursor: pointer;
        }

        .video-element {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .video-placeholder {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111;
        }

        .video-thumb-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.4;
        }

        .video-placeholder-overlay {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          color: rgba(255,255,255,0.7);
          font-size: var(--font-size-sm);
        }

        .video-play-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--color-primary);
          border: none;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color var(--transition-base), transform var(--transition-base);
        }

        .video-play-large:hover {
          background: var(--color-primary-light);
          transform: scale(1.08);
        }

        .video-watermark {
          position: absolute;
          top: 12px;
          left: 16px;
          font-size: 28px;
          color: rgba(255,255,255,0.15);
          z-index: 2;
          pointer-events: none;
          user-select: none;
        }

        .video-controls-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          opacity: 0;
          transition: opacity var(--transition-base);
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.4) 0%,
            transparent 30%,
            transparent 65%,
            rgba(0,0,0,0.7) 100%
          );
          pointer-events: none;
        }

        .video-controls-overlay.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .video-player-container:not(.playing) .video-controls-overlay {
          opacity: 1;
          pointer-events: auto;
        }

        .video-ctrl-top {
          padding: 16px;
        }

        .video-title-overlay {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
        }

        .video-ctrl-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .video-big-play {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(4px);
          border: 2px solid rgba(255,255,255,0.3);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast);
        }

        .video-big-play:hover {
          background: var(--color-primary);
          border-color: var(--color-primary);
          transform: scale(1.08);
        }

        .video-ctrl-bottom {
          padding: 8px 16px 16px;
        }

        .video-progress-wrap {
          position: relative;
          width: 100%;
          height: 20px;
          display: flex;
          align-items: center;
          cursor: pointer;
          margin-bottom: 8px;
        }

        .video-seek-input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 2;
          margin: 0;
        }

        .video-progress-track {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.25);
          border-radius: var(--radius-full);
          overflow: hidden;
          pointer-events: none;
        }

        .video-progress-fill {
          height: 100%;
          background: var(--color-primary);
          border-radius: var(--radius-full);
        }

        .video-ctrl-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .video-ctrl-left, .video-ctrl-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .vid-ctrl-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.85);
          cursor: pointer;
          transition: background-color var(--transition-fast), color var(--transition-fast);
        }

        .vid-ctrl-btn:hover {
          background: rgba(255,255,255,0.15);
          color: #fff;
        }

        .vid-volume-slider {
          width: 70px;
          accent-color: var(--color-primary);
          cursor: pointer;
        }

        .vid-time {
          font-size: 12px;
          color: rgba(255,255,255,0.7);
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
}
