'use client';

import Link from 'next/link';
import { ISeries } from '@/types';
import Skeleton from '@/components/ui/Skeleton';
import { getMediaUrl } from '@/lib/media';

interface PopularSeriesProps {
  series?: Array<ISeries & { episodeCount?: number; progress?: number }>;
  isLoading?: boolean;
}

export default function PopularSeries({ series, isLoading }: PopularSeriesProps) {
  const displaySeries = series ?? [];

  if (isLoading) {
    return (
      <section className="page-section-sm">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">ਪ੍ਰਸਿੱਧ ਲੜੀਆਂ</h2>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-5)', overflow: 'hidden' }}>
            {[0,1,2,3].map((i) => (
              <Skeleton key={i} width={210} height={220} borderRadius={14} />
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
          <h2 className="section-title">ਪ੍ਰਸਿੱਧ ਲੜੀਆਂ</h2>
          <Link href="/series" className="section-link">
            ਸਭ ਵੇਖੋ
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {displaySeries.length === 0 ? (
          <div className="ps-empty">
            <p>ਹਾਲੇ ਕੋਈ ਲੜੀ ਉਪਲਬਧ ਨਹੀਂ। ਜਲਦੀ ਮੁੜ ਵੇਖੋ।</p>
          </div>
        ) : (
          <div className="ps-scroll scroll-x">
            <div className="ps-track stagger-children">
              {displaySeries.map((s, idx) => (
                <Link
                  key={s._id}
                  href={`/series/${s.slug}`}
                  className="ps-card"
                  style={{ '--stagger-index': idx } as React.CSSProperties}
                >
                  <div className="ps-thumb">
                    {s.thumbnail ? (
                      <img src={getMediaUrl('series', s.thumbnail)} alt={s.title} loading="lazy" />
                    ) : (
                      <div className="ps-thumb-placeholder">
                        <span>☬</span>
                      </div>
                    )}
                    <div className="ps-thumb-overlay" />
                    {s.progress ? (
                      <div className="ps-progress-ring">
                        <svg width="44" height="44" viewBox="0 0 44 44">
                          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                          <circle
                            cx="22" cy="22" r="18"
                            fill="none"
                            stroke="#C8972A"
                            strokeWidth="3"
                            strokeDasharray={`${2 * Math.PI * 18}`}
                            strokeDashoffset={`${2 * Math.PI * 18 * (1 - s.progress / 100)}`}
                            strokeLinecap="round"
                            transform="rotate(-90 22 22)"
                          />
                          <text x="22" y="26" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="700">{s.progress}%</text>
                        </svg>
                      </div>
                    ) : null}
                  </div>

                  <div className="ps-info">
                    <h3 className="ps-title">{s.title}</h3>
                    <div className="ps-meta">
                      <span>
                        {typeof s.episodeCount === 'number'
                          ? `${s.episodeCount} episodes`
                          : 'View series'}
                      </span>
                    </div>

                    {typeof s.progress === 'number' && s.progress > 0 && (
                      <div className="ps-progress-wrap">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${s.progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <button className="ps-bookmark" aria-label="Bookmark series" onClick={(e) => e.preventDefault()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                    </svg>
                  </button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ps-scroll {
          overflow-x: auto;
          padding-bottom: var(--space-2);
          margin: 0 calc(-1 * var(--space-6));
          padding-left: var(--space-6);
          padding-right: var(--space-6);
        }

        .ps-track {
          display: flex;
          gap: var(--space-5);
          width: max-content;
          padding-bottom: var(--space-2);
        }

        .ps-card {
          width: 210px;
          background: #fff;
          border: 1px solid var(--color-border);
          border-radius: 14px;
          overflow: hidden;
          text-decoration: none;
          transition: all var(--transition-base);
          position: relative;
          flex-shrink: 0;
          box-shadow: var(--shadow-sm);
        }

        .ps-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-card-hover);
          border-color: var(--color-primary);
        }

        .ps-thumb {
          height: 160px;
          position: relative;
          background: var(--color-bg-secondary);
          overflow: hidden;
        }

        .ps-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .ps-card:hover .ps-thumb img {
          transform: scale(1.05);
        }

        .ps-thumb-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          background: linear-gradient(135deg, #1e1a10, #2d2510);
        }

        .ps-thumb-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%);
        }

        .ps-progress-ring {
          position: absolute;
          bottom: 8px;
          right: 8px;
        }

        .ps-info {
          padding: var(--space-4);
          padding-bottom: var(--space-3);
        }

        .ps-title {
          font-family: var(--font-heading);
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: var(--space-1);
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ps-meta {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          margin-bottom: var(--space-2);
        }

        .ps-progress-wrap {
          margin-top: var(--space-3);
        }

        .ps-progress-wrap .progress-bar {
          height: 3px;
        }

        .ps-bookmark {
          position: absolute;
          top: var(--space-3);
          right: var(--space-3);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          color: var(--color-text-muted);
          transition: all var(--transition-fast);
          opacity: 0;
        }

        .ps-card:hover .ps-bookmark {
          opacity: 1;
        }

        .ps-bookmark:hover {
          background: var(--color-primary);
          color: #fff;
        }

        .ps-empty {
          padding: var(--space-10) 0;
          text-align: center;
          color: var(--color-text-muted);
          font-size: var(--font-size-sm);
        }
      `}</style>
    </section>
  );
}
