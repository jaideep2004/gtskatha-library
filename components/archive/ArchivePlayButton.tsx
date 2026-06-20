'use client';

import Link from 'next/link';
import { usePlayerContext } from '@/context/PlayerContext';
import type { IKatha } from '@/types';

export default function ArchivePlayButton({ katha }: { katha: IKatha }) {
  const { play, pause, resume, isPlaying, katha: currentKatha } = usePlayerContext();
  const active = currentKatha?._id === katha._id;

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (katha.type !== 'audio') return;
    if (!active) play(katha);
    else if (isPlaying) pause();
    else resume();
  }

  if (katha.type !== 'audio') {
    return (
      <Link
        className="archive-play"
        href={`/video/${katha.slug}`}
        aria-label={`Open ${katha.title}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="m8 5 11 7-11 7V5Z" /></svg>
      </Link>
    );
  }

  return (
    <button className="archive-play" type="button" onClick={handleClick} aria-label={`${active && isPlaying ? 'Pause' : 'Play'} ${katha.title}`}>
      {active && isPlaying ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="3.5" height="14" rx="1"/><rect x="13.5" y="5" width="3.5" height="14" rx="1"/></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="m8 5 11 7-11 7V5Z" /></svg>
      )}
    </button>
  );
}
