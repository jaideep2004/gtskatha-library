'use client';

import { useRouter } from 'next/navigation';
import { usePlayerContext } from '@/context/PlayerContext';
import { IKatha } from '@/types';

interface Props {
  kathas: IKatha[];
}

export default function PlaySeriesButton({ kathas }: Props) {
  const router = useRouter();
  const { playFromPlaylist } = usePlayerContext();

  if (kathas.length === 0) return null;

  const handlePlay = () => {
    const first = kathas[0];
    playFromPlaylist(kathas, 0);
    router.push(`/${first.type}/${first.slug}`);
  };

  return (
    <button className="btn btn-primary" onClick={handlePlay}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      ਸ਼ੁਰੂ ਤੋਂ ਚਲਾਓ
    </button>
  );
}
