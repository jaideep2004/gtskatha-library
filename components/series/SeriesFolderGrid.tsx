import Link from 'next/link';
import { IKatha, IFolder } from '@/types';

interface Props {
  slug: string;
  folders: IFolder[];
  folderMap: Record<string, IKatha[]>;
  uncategorized: IKatha[];
}

export default function SeriesFolderGrid({ slug, folders, folderMap, uncategorized }: Props) {
  const allEntries = [
    ...folders
      .filter((f) => (folderMap[f._id]?.length ?? 0) > 0)
      .map((f) => ({ id: f._id, title: f.title, kathas: folderMap[f._id] ?? [], isUncat: false })),
    ...(uncategorized.length > 0
      ? [{ id: '__uncat__', title: 'ਹੋਰ', kathas: uncategorized, isUncat: true }]
      : []),
  ];

  return (
    <div>
      <div className="folder-w11-grid">
        {allEntries.map((entry) => (
          <Link
            key={entry.id}
            href={entry.isUncat ? `/series/${slug}` : `/series/${slug}/folder/${entry.id}`}
            className={`folder-w11-card${entry.isUncat ? ' folder-w11-uncat' : ''}`}
          >
            <div className="folder-w11-icon-wrap">
              <svg className="folder-w11-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12a4 4 0 0 1 4-4h11.5l4 4H38a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V12z" fill={entry.isUncat ? 'var(--color-text-muted)' : '#FFB900'} />
                <path d="M6 14a4 4 0 0 1 4-4h11.5l4 4H38a4 4 0 0 1 4 4v2H6v-6z" fill={entry.isUncat ? 'var(--color-text-muted)' : '#FFD144'} opacity="0.7" />
              </svg>
              <span className="folder-w11-badge">{entry.kathas.length}</span>
            </div>
            <span className="folder-w11-label">{entry.title}</span>
          </Link>
        ))}
      </div>

      <style>{`
        .folder-w11-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .folder-w11-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-5) var(--space-3);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
          box-shadow: var(--shadow-sm);
          text-align: center;
          text-decoration: none;
          color: inherit;
          min-width: 0;
        }

        .folder-w11-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: #FFB900;
        }

        .folder-w11-card:active {
          transform: translateY(-1px);
        }

        .folder-w11-uncat {
          opacity: 0.6;
          pointer-events: none;
        }

        .folder-w11-uncat:hover {
          opacity: 1;
        }

        .folder-w11-icon-wrap {
          position: relative;
          width: 72px;
          height: 64px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .folder-w11-icon {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
          transition: transform 0.2s ease;
        }

        .folder-w11-card:hover .folder-w11-icon {
          transform: scale(1.08);
        }

        .folder-w11-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 22px;
          height: 22px;
          display: grid;
          place-items: center;
          padding: 0 6px;
          font-size: 11px;
          font-weight: 700;
          background: var(--color-primary);
          color: #fff;
          border-radius: var(--radius-full);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .folder-w11-label {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--color-text-primary);
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        @media (max-width: 1024px) {
          .folder-w11-grid { grid-template-columns: repeat(4, 1fr); }
        }

        @media (max-width: 768px) {
          .folder-w11-grid { grid-template-columns: repeat(3, 1fr); }
          .folder-w11-icon-wrap { width: 60px; height: 54px; }
        }

        @media (max-width: 480px) {
          .folder-w11-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
          .folder-w11-card { padding: var(--space-3); }
        }
      `}</style>
    </div>
  );
}
