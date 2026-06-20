'use client';

import { usePlayerContext } from '@/context/PlayerContext';
import { formatDuration } from '@/lib/utils';
import { Chapter } from '@/types';

interface ChaptersListProps {
  chapters: Chapter[];
  mediaType?: 'audio' | 'video';
}

export default function ChaptersList({ chapters, mediaType = 'audio' }: ChaptersListProps) {
  const { currentTime, seek } = usePlayerContext();

  if (!chapters || chapters.length === 0) return null;

  function handleSeek(time: number) {
    if (mediaType === 'video') {
      window.dispatchEvent(new CustomEvent('katha-video-seek', { detail: time }));
      return;
    }
    seek(time);
  }

  // Active = largest startTime <= currentTime
  let activeIdx = 0;
  for (let i = 0; i < chapters.length; i++) {
    if (chapters[i].startTime <= currentTime) {
      activeIdx = i;
    }
  }

  return (
    <>
      <ul className="chapters-list">
        {chapters.map((ch, idx) => (
          <li
            key={ch.id || idx}
            className={`chapter-item${idx === activeIdx ? ' active' : ''}`}
            onClick={() => handleSeek(ch.startTime)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSeek(ch.startTime)}
            aria-label={`Jump to chapter: ${ch.title}`}
            aria-current={idx === activeIdx ? 'true' : undefined}
          >
            <span className="chapter-num">{idx + 1}</span>
            <div className="chapter-info">
              <span className="chapter-title">{ch.title}</span>
              <span className="chapter-time">{formatDuration(ch.startTime)}</span>
            </div>
            <span className="chapter-dur">{formatDuration(ch.duration)}</span>
          </li>
        ))}
      </ul>

      <style>{`
        .chapters-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
          max-height: 340px;
          overflow-y: auto;
          list-style: none;
          padding: 10px 0px;
          margin: 0;
        }

        .chapter-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .chapter-item:hover {
          background: var(--color-bg-secondary);
        }

        .chapter-item.active {
          background: var(--color-primary-alpha);
          border-left: 3px solid var(--color-primary);
        }

        .chapter-num {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--color-bg-secondary);
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--color-text-muted);
        }

        .chapter-item.active .chapter-num {
          background: var(--color-primary);
          color: #fff;
        }

        .chapter-info {
          flex: 1;
          min-width: 0;
        }

        .chapter-title {
          display: block;
          font-size: var(--font-size-xs);
          font-weight: 500;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chapter-time {
          font-size: 10px;
          color: var(--color-text-muted);
        }

        .chapter-item.active .chapter-title {
          color: var(--color-primary-dark);
          font-weight: 600;
        }

        .chapter-dur {
          font-size: 10px;
          color: var(--color-text-muted);
          flex-shrink: 0;
        }
      `}</style>
    </>
  );
}
