'use client';
import Link from 'next/link';
import { IKatha } from '@/types';
import { formatDuration, formatDate } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media';

interface KathaCardProps {
  katha: Partial<IKatha> & { _id: string; title: string; slug: string; type: 'audio' | 'video' };
  layout?: 'grid' | 'list';
}

export default function KathaCard({ katha, layout = 'grid' }: KathaCardProps) {
  if (layout === 'list') {
    return (
      <Link href={`/${katha.type}/${katha.slug}`} className="kc-list-card">
        <div className="kc-list-thumb">
          {katha.thumbnail ? (
            <img src={getMediaUrl('thumbnails', katha.thumbnail)} alt={katha.title} loading="lazy" />
          ) : (
            <div className="kc-thumb-placeholder">☬</div>
          )}
          {katha.duration && <span className="duration-badge">{formatDuration(katha.duration)}</span>}
        </div>

        <div className="kc-list-info">
          <div className="kc-badges">
            <span className={`badge badge-${katha.type}`}>{katha.type}</span>
            {katha.featured && <span className="badge badge-primary">Featured</span>}
          </div>
          <h3 className="kc-list-title">{katha.title}</h3>
          {katha.description && <p className="kc-list-desc">{katha.description}</p>}
          <div className="kc-list-meta">
            {katha.views !== undefined && <span>{katha.views.toLocaleString()} plays</span>}
            {katha.createdAt && <span>{formatDate(katha.createdAt)}</span>}
          </div>
        </div>

        <button
          className="kc-list-play"
          aria-label={`Play ${katha.title}`}
          onClick={(e) => e.preventDefault()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </button>

        <style>{`
          .kc-list-card {
            display: flex;
            align-items: center;
            gap: var(--space-4);
            padding: var(--space-4);
            border-radius: var(--radius-lg);
            border: 1px solid var(--color-border);
            text-decoration: none;
            background: var(--color-surface);
            transition: all var(--transition-base);
          }
          .kc-list-card:hover {
            border-color: var(--color-primary);
            box-shadow: var(--shadow-sm);
            transform: translateX(4px);
          }
          .kc-list-thumb {
            width: 60px;
            height: 60px;
            border-radius: var(--radius-md);
            overflow: hidden;
            flex-shrink: 0;
            position: relative;
            background: var(--color-bg-secondary);
          }
          .kc-list-thumb img { width: 100%; height: 100%; object-fit: cover; }
          .kc-thumb-placeholder {
            width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            font-size: 24px; color: var(--color-primary);
            background: linear-gradient(135deg, #1e1a10, #2d2510);
          }
          .kc-list-info { flex: 1; min-width: 0; }
          .kc-badges { display: flex; gap: 6px; margin-bottom: 4px; }
          .kc-list-title {
            font-size: var(--font-size-sm);
            font-weight: 600;
            color: var(--color-text-primary);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            margin-bottom: 3px;
          }
          .kc-list-desc {
            font-size: var(--font-size-xs);
            color: var(--color-text-muted);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            margin-bottom: 4px;
          }
          .kc-list-meta {
            display: flex; gap: var(--space-3);
            font-size: 11px; color: var(--color-text-muted);
          }
          .kc-list-play {
            width: 40px; height: 40px;
            border-radius: 50%;
            background: var(--color-primary);
            border: none;
            color: #fff;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
            opacity: 0;
            transition: all var(--transition-fast);
          }
          .kc-list-card:hover .kc-list-play { opacity: 1; }
        `}</style>
      </Link>
    );
  }

  return (
    <Link href={`/${katha.type}/${katha.slug}`} className="kc-grid-card">
      <div className="kc-grid-thumb thumbnail-wrap" style={{ height: 156 }}>
        {katha.thumbnail ? (
          <img src={getMediaUrl('thumbnails', katha.thumbnail)} alt={katha.title} loading="lazy" />
        ) : (
          <div className="kc-grid-thumb-placeholder">
            <span>☬</span>
            <div className="kc-grid-play-overlay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
          </div>
        )}
        <div className="thumbnail-overlay" />
        <span className={`badge badge-${katha.type} kc-type-badge`}>{katha.type}</span>
        {katha.duration && <span className="duration-badge">{formatDuration(katha.duration)}</span>}
        {katha.featured && (
          <span className="kc-featured-badge">Featured</span>
        )}
      </div>

      <div className="kc-grid-info">
        <h3 className="kc-grid-title">{katha.title}</h3>
        {katha.description && (
          <p className="kc-grid-desc">{katha.description}</p>
        )}
        <div className="kc-grid-meta">
          {katha.views !== undefined && (
            <span className="kc-views">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {katha.views.toLocaleString()}
            </span>
          )}
          {katha.createdAt && (
            <span className="kc-date">{formatDate(katha.createdAt)}</span>
          )}
        </div>
      </div>

      <style>{`
        .kc-grid-card {
          display: block;
          text-decoration: none;
          border-radius: var(--radius-xl);
          overflow: hidden;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          transition: all 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: var(--shadow-sm);
        }
        .kc-grid-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(217, 140, 41, 0.08);
          border-color: var(--color-primary);
        }
        .kc-grid-thumb-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 48px;
          background: linear-gradient(135deg, #1e1a10, #2d2510);
          position: relative;
        }
        .kc-grid-play-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          opacity: 0; color: #fff;
          transition: opacity 280ms ease;
        }
        .kc-grid-card:hover .kc-grid-play-overlay { opacity: 1; }
        .kc-type-badge {
          position: absolute; top: var(--space-3); left: var(--space-3);
          font-size: 11px;
          padding: 4px 10px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        .kc-featured-badge {
          position: absolute; top: var(--space-3); right: var(--space-3);
          background: linear-gradient(135deg, #D98C29 0%, #C8972A 100%);
          color: #fff;
          font-size: 10px; font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.6px;
          box-shadow: 0 2px 10px rgba(217, 140, 41, 0.35);
        }
        .kc-grid-info { padding: var(--space-5); }
        .kc-grid-title {
          font-size: var(--font-size-md);
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
          letter-spacing: -0.01em;
        }
        .kc-grid-desc {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 8px;
          line-height: 1.5;
        }
        .kc-grid-meta {
          display: flex; justify-content: space-between;
          font-size: 12px; 
          color: var(--color-text-muted);
          font-weight: 600;
        }
        .kc-views {
          display: flex; align-items: center; gap: 5px;
        }
        .kc-date { color: var(--color-text-muted); }
      `}</style>
    </Link>
  );
}
