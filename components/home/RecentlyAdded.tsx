import Link from 'next/link';
import { IKatha } from '@/types';
import { formatDuration, formatDate } from '@/lib/utils';
import Skeleton from '@/components/ui/Skeleton';
import { getMediaUrl } from '@/lib/media';

interface RecentlyAddedProps {
  kathas?: IKatha[];
  isLoading?: boolean;
}

export default function RecentlyAdded({ kathas, isLoading }: RecentlyAddedProps) {
  const displayKathas = kathas ?? [];

  if (isLoading) {
    return (
      <section className="page-section-sm">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Recently Added</h2>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', overflow: 'hidden' }}>
            {[0,1,2,3,4].map((i) => (
              <Skeleton key={i} width={200} height={180} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section-sm">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Recently Added</h2>
          <Link href="/search?sort=newest" className="section-link">
            View All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {displayKathas.length === 0 ? (
          <div className="ra-empty">
            <p>Nothing added recently — check back soon.</p>
          </div>
        ) : (
          <div className="ra-scroll scroll-x">
            <div className="ra-track stagger-children">
              {displayKathas.map((katha, idx) => (
                <Link
                  key={katha._id}
                  href={`/${katha.type}/${katha.slug}`}
                  className="ra-card"
                  style={{ '--stagger-index': idx } as React.CSSProperties}
                >
                  <div className="ra-thumb">
                    {katha.thumbnail ? (
                      <img src={getMediaUrl('thumbnails', katha.thumbnail)} alt={katha.title} loading="lazy" />
                    ) : (
                      <div className="ra-thumb-placeholder">
                        <span>☬</span>
                        <div className="ra-play-icon" aria-hidden>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className="thumbnail-overlay" />

                    {/* Type badge */}
                    <span className={`badge badge-${katha.type} ra-type-badge`}>
                      {katha.type === 'audio' ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                        </svg>
                      )}
                      {katha.type}
                    </span>

                    {/* Duration */}
                    {katha.duration && (
                      <span className="duration-badge">{formatDuration(katha.duration)}</span>
                    )}

                    <span className="ra-play-btn" aria-hidden>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </span>
                  </div>

                  <div className="ra-info">
                    <h3 className="ra-title">{katha.title}</h3>
                    <p className="ra-date">{formatDate(katha.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ra-scroll {
          overflow-x: auto;
          padding-bottom: var(--space-2);
          margin: 0 calc(-1 * var(--space-6));
          padding-left: var(--space-6);
          padding-right: var(--space-6);
        }

        .ra-track {
          display: flex;
          gap: var(--space-4);
          width: max-content;
          padding-bottom: var(--space-2);
        }

        .ra-card {
          width: 224px;
          flex-shrink: 0;
          text-decoration: none;
          border-radius: 18px;
          overflow: hidden;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          box-shadow: 0 10px 26px rgba(26, 32, 44, .06);
          transition: all var(--transition-base);
        }

        .ra-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 38px rgba(26, 32, 44, .13);
          border-color: var(--color-primary);
        }

        .ra-thumb {
          height: 154px;
          position: relative;
          background: var(--color-bg-secondary);
          overflow: hidden;
        }

        .ra-thumb::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,.08) 0%, rgba(0,0,0,0) 42%, rgba(0,0,0,.38) 100%);
          pointer-events: none;
        }

        .ra-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .ra-card:hover .ra-thumb img {
          transform: scale(1.06);
        }

        .ra-thumb-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          background: linear-gradient(135deg, #1a1608, #2d2510);
          position: relative;
        }

        .ra-play-icon {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          background: rgba(0,0,0,0.3);
          color: #fff;
          transition: opacity var(--transition-fast);
        }

        .ra-card:hover .ra-play-icon {
          opacity: 1;
        }

        .ra-type-badge {
          position: absolute;
          top: var(--space-2);
          left: var(--space-2);
          z-index: 2;
          box-shadow: 0 6px 18px rgba(0,0,0,.16);
        }

        .ra-info {
          min-height: 82px;
          padding: 14px 16px 16px;
        }

        .ra-play-btn {
          position: absolute;
          right: 14px;
          bottom: 14px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--color-primary);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
          box-shadow: 0 12px 26px rgba(217, 140, 27, .36);
          transition: transform var(--transition-fast), background var(--transition-fast);
        }

        .ra-card:hover .ra-play-btn {
          transform: scale(1.06);
          background: var(--color-primary-dark);
        }

        .ra-title {
          font-family: var(--font-heading);
          font-size: 17px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.22;
        }

        .ra-date {
          font-size: 11px;
          color: var(--color-text-muted);
        }

        .ra-empty {
          padding: var(--space-8) 0;
          text-align: center;
          color: var(--color-text-muted);
          font-size: var(--font-size-sm);
        }
      `}</style>
    </section>
  );
}
