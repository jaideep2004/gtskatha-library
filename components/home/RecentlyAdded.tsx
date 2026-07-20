'use client';

import Link from 'next/link';
import { useRef, useState, useEffect, useCallback } from 'react';
import { IKatha } from '@/types';
import { formatDuration, formatDate } from '@/lib/utils';
import Skeleton from '@/components/ui/Skeleton';
import { getMediaUrl } from '@/lib/media';

interface RecentlyAddedProps {
  kathas?: IKatha[];
  isLoading?: boolean;
}

export default function RecentlyAdded({ kathas, isLoading }: RecentlyAddedProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = trackRef.current?.parentElement;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current?.parentElement;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  useEffect(() => { checkScroll(); }, [checkScroll, kathas]);

  function scroll(dir: 'left' | 'right') {
    const el = trackRef.current?.parentElement;
    if (!el) return;
    const card = trackRef.current?.firstElementChild;
    const step = (card as HTMLElement)?.offsetWidth ?? 260;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  }

  const displayKathas = kathas ?? [];

  if (isLoading) {
    return (
      <section className="page-section-sm">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">ਨਵੀਂ ਜੋੜੀ ਗਈ ਕਥਾ</h2>
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
          <h2 className="section-title">ਨਵੀਂ ਜੋੜੀ ਗਈ ਕਥਾ</h2>
          <div className="ra-header-actions">
            <button
              className="ra-nav-btn"
              disabled={!canScrollLeft}
              onClick={() => scroll('left')}
              aria-label="Previous"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button
              className="ra-nav-btn"
              disabled={!canScrollRight}
              onClick={() => scroll('right')}
              aria-label="Next"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
            <Link href="/search?sort=newest" className="section-link">
              ਸਭ ਵੇਖੋ
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>

        {displayKathas.length === 0 ? (
          <div className="ra-empty">
            <p>ਹਾਲੇ ਨਵੀਂ ਕਥਾ ਨਹੀਂ ਜੋੜੀ ਗਈ। ਜਲਦੀ ਮੁੜ ਵੇਖੋ।</p>
          </div>
        ) : (
          <div className="ra-scroll scroll-x">
            <div className="ra-track stagger-children" ref={trackRef}>
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
                    <div className="ra-image-wash" aria-hidden />

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
                    <div className="ra-eyebrow">
                      <span>ਨਵੀਂ ਕਥਾ</span>
                      <span className="ra-eyebrow-line" aria-hidden />
                    </div>
                    <h3 className="ra-title">{katha.title}</h3>
                    <div className="ra-meta">
                      <p className="ra-author">{katha.authorName || 'Sikh Katha Library'}</p>
                      <time className="ra-date">{formatDate(katha.createdAt)}</time>
                    </div>
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
          padding-bottom: var(--space-4);
          margin: 0 calc(-1 * var(--space-6));
          padding-left: var(--space-6);
          padding-right: var(--space-6);
          scroll-snap-type: x proximity;
          scrollbar-width: none;
        }
        .ra-scroll::-webkit-scrollbar { display: none; }
        }

        .ra-track {
          display: flex;
          gap: 20px;
          width: max-content;
          padding: 2px 0 10px;
        }

        .ra-card {
          --card-accent: #d98c29;
          width: 260px;
          flex-shrink: 0;
          scroll-snap-align: start;
          text-decoration: none;
          border-radius: 22px;
          overflow: hidden;
          background:
            linear-gradient(135deg, rgba(255,255,255,.98), rgba(251,247,239,.96));
          border: 1px solid rgba(34, 48, 69, .12);
          box-shadow:
            0 18px 45px rgba(25, 34, 48, .08),
            inset 0 1px 0 rgba(255,255,255,.8);
          position: relative;
          transition:
            transform 260ms ease,
            box-shadow 260ms ease,
            border-color 260ms ease;
        }

        .ra-card::after {
          content: "";
          position: absolute;
          left: 18px;
          right: 18px;
          bottom: 0;
          height: 3px;
          border-radius: 99px 99px 0 0;
          background: linear-gradient(90deg, transparent, var(--card-accent), transparent);
          transform: scaleX(.25);
          opacity: 0;
          transition: transform 260ms ease, opacity 260ms ease;
        }

        .ra-card:hover {
          transform: translateY(-8px);
          box-shadow:
            0 26px 56px rgba(20, 32, 51, .16),
            0 8px 20px rgba(217, 140, 41, .1);
          border-color: rgba(217, 140, 41, .46);
        }

        .ra-card:hover::after,
        .ra-card:focus-visible::after {
          transform: scaleX(1);
          opacity: 1;
        }

        .ra-card:focus-visible {
          outline: 3px solid rgba(217, 140, 41, .32);
          outline-offset: 4px;
        }

        .ra-thumb {
          height: 174px;
          position: relative;
          background:
            radial-gradient(circle at 20% 10%, rgba(217,140,41,.3), transparent 42%),
            #172337;
          overflow: hidden;
        }

        .ra-image-wash {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(9,17,29,.08) 10%, transparent 48%, rgba(9,17,29,.72) 100%),
            linear-gradient(120deg, rgba(217,140,41,.13), transparent 45%);
          pointer-events: none;
          z-index: 1;
        }

        .ra-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .ra-card:hover .ra-thumb img {
          transform: scale(1.075);
        }

        .ra-thumb-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          color: #e6a13c;
          background:
            radial-gradient(circle at 50% 30%, rgba(217,140,41,.28), transparent 26%),
            linear-gradient(145deg, #142138, #0e1727);
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
          top: 14px;
          left: 14px;
          z-index: 3;
          backdrop-filter: blur(8px);
          box-shadow: 0 8px 24px rgba(0,0,0,.18);
        }

        .ra-info {
          min-height: 142px;
          padding: 18px 18px 19px;
          display: flex;
          flex-direction: column;
        }

        .ra-play-btn {
          position: absolute;
          right: 16px;
          bottom: 16px;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--color-primary);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
          box-shadow:
            0 12px 28px rgba(217, 140, 27, .42),
            0 0 0 5px rgba(255,255,255,.14);
          transition: transform 220ms ease, background 220ms ease;
        }

        .ra-card:hover .ra-play-btn {
          transform: scale(1.08) rotate(-3deg);
          background: var(--color-primary-dark);
        }

        .ra-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 8px;
          color: var(--color-primary-dark);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .ra-eyebrow-line {
          width: 28px;
          height: 1px;
          background: linear-gradient(90deg, rgba(217,140,41,.8), transparent);
        }

        .ra-title {
          font-family: var(--font-heading);
          font-size: 19px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 14px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.18;
          letter-spacing: -.015em;
        }

        .ra-meta {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-top: 12px;
          border-top: 1px solid rgba(34,48,69,.09);
        }

        .ra-author,
        .ra-date {
          margin: 0;
          font-size: 11px;
          color: var(--color-text-muted);
        }

        .ra-author {
          max-width: 135px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--color-text-secondary);
          font-weight: 600;
        }

        .ra-empty {
          padding: var(--space-8) 0;
          text-align: center;
          color: var(--color-text-muted);
          font-size: var(--font-size-sm);
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          margin-bottom: var(--space-5);
        }

        .ra-header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .ra-nav-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-secondary);
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: border-color 180ms ease, color 180ms ease, opacity 180ms ease;
          flex-shrink: 0;
        }

        .ra-nav-btn:hover:not(:disabled) {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .ra-nav-btn:disabled {
          opacity: .3;
          cursor: default;
        }

        .section-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--color-primary-dark);
          text-decoration: none;
          white-space: nowrap;
          transition: color 180ms ease;
          flex-shrink: 0;
        }

        .section-link:hover {
          color: var(--color-primary);
        }

        @media (max-width: 640px) {
          .ra-card { width: 238px; }
          .ra-thumb { height: 158px; }
          .ra-info { min-height: 132px; padding: 16px; }
          .ra-title { font-size: 18px; }
          .ra-nav-btn { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ra-card,
          .ra-thumb img,
          .ra-play-btn,
          .ra-card::after {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
