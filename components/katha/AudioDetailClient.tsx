'use client';

import { useEffect } from 'react';
import { usePlayerContext } from '@/context/PlayerContext';
import { IKatha } from '@/types';
import { getMediaUrl } from '@/lib/media';
import KathaActions from '@/components/katha/KathaActions';

export default function AudioDetailClient({
  katha,
  isAuthenticated,
}: {
  katha: IKatha;
  isAuthenticated: boolean;
}) {
  const { play, pause, resume, isPlaying, katha: currentKatha, audioRef } = usePlayerContext();

  const isThisKatha = currentKatha?._id === katha._id;

  // Pre-load the katha audio src into the player on mount (without auto-playing)
  useEffect(() => {
    if (!katha.audioUrl) return;
    const audio = audioRef.current;
    if (!audio) return;
    // Only pre-load if this katha isn't already loaded
    if (currentKatha?._id !== katha._id) {
      const src = getMediaUrl('audio', katha.audioUrl);
      audio.src = src;
      audio.load();
      // Don't call audio.play() — just preload
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [katha._id]);

  function handlePlay() {
    if (isThisKatha) {
      if (isPlaying) { pause(); } else { resume(); }
    } else {
      play(katha);
    }
  }

  const isLoaded = isThisKatha;

  return (
    <div className="audio-actions">
      <button className="btn btn-primary" onClick={handlePlay}>
        {isLoaded && isPlaying ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
            Pause
          </>
        ) : isLoaded && !isPlaying ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Resume
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Play
          </>
        )}
      </button>

      <KathaActions katha={katha} isAuthenticated={isAuthenticated} />

      <style>{`
        .audio-actions {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
          margin-bottom: var(--space-2);
        }
      `}</style>
    </div>
  );
}
