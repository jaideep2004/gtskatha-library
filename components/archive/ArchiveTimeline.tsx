'use client';

import type { IKatha } from '@/types';
import { usePlayerContext } from '@/context/PlayerContext';
import TimelineCommunity from '@/components/timeline/TimelineCommunity';

export default function ArchiveTimeline({ katha }: { katha: IKatha }) {
  const {
    katha: currentKatha,
    currentTime,
    duration,
    isPlaying,
    seek,
  } = usePlayerContext();

  if (katha.type !== 'audio' || currentKatha?._id !== katha._id) return null;

  return (
    <TimelineCommunity
      compact
      kathaId={katha._id}
      currentTime={currentTime}
      duration={duration || katha.duration || 0}
      isPlaying={isPlaying}
      onSeek={seek}
    />
  );
}
