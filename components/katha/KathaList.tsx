'use client';
import { IKatha } from '@/types';
import KathaCard from './KathaCard';
import { useInteractionSummaries } from '@/hooks/useInteractionSummaries';
import { usePlayerContext } from '@/context/PlayerContext';

export type ListKatha = Partial<IKatha> & {
  _id: string;
  title: string;
  slug: string;
  type: 'audio' | 'video';
};

interface KathaListProps {
  kathas: ListKatha[];
  /** Full playlist for "Play all" (defaults to kathas). Pass the whole folder/series when paginated. */
  playAllKathas?: ListKatha[];
  showPlayAll?: boolean;
}

export default function KathaList({ kathas, playAllKathas, showPlayAll = true }: KathaListProps) {
  const { summaries, loading, toggleLike } = useInteractionSummaries(kathas.map((k) => k._id));
  const { playFromPlaylist } = usePlayerContext();

  const playlist = playAllKathas ?? kathas;

  function handlePlayAll() {
    const playable = playlist.filter((k) => k.type === 'audio' && k.audioUrl);
    if (playable.length === 0) return;
    playFromPlaylist(playable as IKatha[], 0);
  }

  return (
    <div>
      {showPlayAll && playlist.length > 1 && (
        <div className="kl-playall-row">
          <button type="button" className="kl-playall" onClick={handlePlayAll}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            ਸਾਰੇ ਚਲਾਓ ({playlist.length})
          </button>
        </div>
      )}

      <div className="katha-list">
        {kathas.map((katha, index) => (
          <KathaCard
            key={katha._id}
            katha={katha}
            layout="list"
            playlist={playlist}
            index={index}
            summary={summaries[katha._id]}
            interactionsLoading={loading}
            onToggleLike={toggleLike}
          />
        ))}
      </div>

      <style>{`
        .kl-playall-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: var(--space-3);
        }
        .kl-playall {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 36px;
          padding: 0 16px;
          border: 1px solid var(--color-primary-light);
          border-radius: var(--radius-full);
          background: var(--color-primary-alpha);
          color: var(--color-primary-dark);
          font-size: var(--font-size-sm);
          font-weight: 700;
          cursor: pointer;
          transition: background-color var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .kl-playall:hover {
          background: var(--color-primary);
          color: #fff;
          transform: translateY(-1px);
        }
        .kl-playall:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
        .katha-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
      `}</style>
    </div>
  );
}
