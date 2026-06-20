import Link from 'next/link';

const PALETTE = [
  { color: '#D98C29', bg: '#FFF4E6' },
  { color: '#7C5CBF', bg: '#F3EEFF' },
  { color: '#3D9B5F', bg: '#EEF8F0' },
  { color: '#4A7FD4', bg: '#EEF4FF' },
];

interface AudioThemesProps {
  categories?: Array<{
    _id: string;
    name: string;
    slug: string;
    kathaCount?: number;
    audioCount?: number;
    videoCount?: number;
    thumbnail?: string;
  }>;
}

export default function AudioThemes({ categories }: AudioThemesProps) {
  const items = categories ?? [];
  return (
    <section className="at-section">
      <div className="container">
        <div className="at-layout">
          {/* Left: theme circles */}
          <div className="at-left">
            <div className="section-header">
              <h2 className="section-title">Audio by Themes</h2>
              <Link href="/search" className="section-link">
                All Topics
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            <div className="at-grid">
              {items.map((category, i) => {
                const { color, bg } = PALETTE[i % PALETTE.length];
                return (
                  <Link key={category._id} href={`/search?category=${category.slug}`} className="at-card">
                    <div
                      className="at-icon-wrap"
                      style={{ background: bg, borderColor: `${color}30` }}
                    >
                      <span className="at-icon-letter" style={{ color }}>
                        {category.name.charAt(0)}
                      </span>
                    </div>
                    <div className="at-name">{category.name}</div>
                    <div className="at-count">
                      <span>{category.audioCount ?? 0} audio</span>
                      <span>{category.videoCount ?? 0} video</span>
                    </div>
                  </Link>
                );
              })}
              {!items.length && (
                <div className="at-empty">
                  <strong>Topics are being prepared.</strong>
                  <span>New categories will appear here.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: visual CTA */}
          <div className="at-cta">
            <div
              className="at-cta-bg"
              style={{ backgroundImage: "url('/images/home-card-bg.png')" }}
              aria-hidden
            />
            <div className="at-cta-overlay" aria-hidden />
            <div className="at-cta-content">
              <h3 className="at-cta-title">
                Immerse in Gurbani.<br />
                Elevate Your Life.
              </h3>
              <p className="at-cta-sub">
                Discover transformative kathas curated for your spiritual journey.
              </p>
              <Link href="/audio" className="at-cta-btn">
                Explore Now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .at-section {
          padding: 32px 0 48px;
        }

        .at-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 65px;
          align-items: start;
        }

        .at-left .section-header {
          margin-bottom: 20px;
        }

        .at-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .at-empty { grid-column: 1 / -1; min-height: 150px; display: grid; place-content: center; text-align: center; border: 1px dashed var(--color-border); border-radius: 8px; background: #fff; }
        .at-empty strong { font-family: var(--font-heading); font-size: 20px; }
        .at-empty span { margin-top: 6px; font-size: 12px; color: var(--color-text-muted); }

        .at-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          min-height: 152px;
          padding: 16px 8px;
          border-radius: 14px;
          border: 1px solid var(--color-border);
          text-decoration: none;
          transition: all var(--transition-base);
          text-align: center;
          background: #fff;
          box-shadow: var(--shadow-sm);
        }

        .at-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: var(--color-primary);
        }

        .at-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid;
          transition: transform var(--transition-base);
        }

        .at-card:hover .at-icon-wrap {
          transform: scale(1.06);
        }

        .at-icon-letter {
          font-family: var(--font-heading);
          font-size: 22px;
          font-weight: 700;
        }

        .at-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-primary);
          line-height: 1.3;
        }

        .at-count {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 4px 8px;
          font-size: 10px;
          color: var(--color-text-muted);
        }

        .at-cta {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          min-height: 280px;
          background: #f5f0e9;
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-sm);
        }

        .at-cta-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: 61% center;
          opacity: 1;
        }

        .at-cta-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(255,253,249,.98) 0%, rgba(255,253,249,.93) 39%, rgba(255,253,249,.2) 68%, transparent 100%);
        }

        .at-cta-content {
          position: relative;
          z-index: 1;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
          min-height: 280px;
          max-width: 55%;
        }

        .at-cta-title {
          font-family: var(--font-heading);
          font-size: 22px;
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1.25;
          margin-bottom: 10px;
        }

        .at-cta-sub {
          font-size: 13px;
          color: var(--color-text-secondary);
          line-height: 1.55;
          margin-bottom: 20px;
        }

        .at-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          border-radius: 9999px;
          background: var(--color-primary);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          align-self: flex-start;
          transition: background 150ms ease;
        }

        .at-cta-btn:hover {
          background: var(--color-primary-dark);
        }

        @media (max-width: 1024px) {
          .at-layout { grid-template-columns: 1fr; }
          .at-cta { min-height: 220px; }
          .at-cta-content { min-height: 220px; }
          .at-cta-content { max-width: 62%; }
        }

        @media (max-width: 640px) {
          .at-grid { grid-template-columns: repeat(2, 1fr); }
          .at-cta-bg { background-position: 68% center; }
          .at-cta-content { max-width: 72%; }
        }
      `}</style>
    </section>
  );
}
