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
              <h2 className="section-title">ਵਿਸ਼ਿਆਂ ਅਨੁਸਾਰ ਆਡੀਓ</h2>
              <Link href="/search" className="section-link">
                ਸਾਰੇ ਵਿਸ਼ੇ
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            <div className="at-grid">
              {items.map((category, i) => {
                const { color, bg } = PALETTE[i % PALETTE.length];
                return (
                  <Link
                    key={category._id}
                    href={`/search?category=${category.slug}`}
                    className="at-card"
                    style={{ '--theme-color': color, '--theme-bg': bg } as React.CSSProperties}
                  >
                    <span className="at-card-index" aria-hidden>
                      {String(i + 1).padStart(2, '0')}
                    </span>
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
                      <span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                        </svg>
                        {category.audioCount ?? 0} audio
                      </span>
                      <span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                        </svg>
                        {category.videoCount ?? 0} video
                      </span>
                    </div>
                    <span className="at-card-arrow" aria-hidden>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                      </svg>
                    </span>
                  </Link>
                );
              })}
              {!items.length && (
                <div className="at-empty">
                  <strong>ਵਿਸ਼ੇ ਤਿਆਰ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ।</strong>
                  <span>ਨਵੇਂ ਵਰਗ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੇ।</span>
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
                ਗੁਰਬਾਣੀ ਵਿਚਾਰ ਨਾਲ ਜੁੜੋ।<br />
                ਜੀਵਨ ਨੂੰ ਉੱਚਾ ਕਰੋ।
              </h3>
              <p className="at-cta-sub">
                ਆਪਣੀ ਆਤਮਕ ਯਾਤਰਾ ਲਈ ਚੁਣੀ ਹੋਈ ਕਥਾ ਖੋਜੋ।
              </p>
              <Link href="/audio" className="at-cta-btn">
                ਹੁਣ ਖੋਜੋ
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
          padding: 38px 0 58px;
        }

        .at-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(420px, .92fr);
          gap: clamp(36px, 5vw, 72px);
          align-items: start;
        }

        .at-left .section-header {
          margin-bottom: 20px;
        }

        .at-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .at-empty { grid-column: 1 / -1; min-height: 150px; display: grid; place-content: center; text-align: center; border: 1px dashed var(--color-border); border-radius: 8px; background: #fff; }
        .at-empty strong { font-family: var(--font-heading); font-size: 20px; }
        .at-empty span { margin-top: 6px; font-size: 12px; color: var(--color-text-muted); }

        .at-card {
          --theme-color: #d98c29;
          --theme-bg: #fff4e6;
          display: flex;
          align-items: center;
          gap: 14px;
          min-height: 118px;
          padding: 18px 42px 18px 16px;
          border-radius: 18px;
          border: 1px solid rgba(34,48,69,.11);
          text-decoration: none;
          text-align: left;
          background:
            radial-gradient(circle at 0 0, var(--theme-bg), transparent 48%),
            linear-gradient(135deg, rgba(255,255,255,.98), rgba(251,249,245,.96));
          box-shadow: 0 12px 32px rgba(23,35,55,.065);
          position: relative;
          overflow: hidden;
          transition:
            transform 240ms ease,
            box-shadow 240ms ease,
            border-color 240ms ease;
        }

        .at-card::before {
          content: "";
          position: absolute;
          inset: 0 auto 0 0;
          width: 3px;
          background: var(--theme-color);
          transform: scaleY(.34);
          border-radius: 0 4px 4px 0;
          transition: transform 240ms ease;
        }

        .at-card:hover {
          transform: translateY(-5px) translateX(2px);
          box-shadow: 0 20px 42px rgba(20,32,51,.13);
          border-color: color-mix(in srgb, var(--theme-color) 42%, transparent);
        }

        .at-card:hover::before,
        .at-card:focus-visible::before {
          transform: scaleY(1);
        }

        .at-card:focus-visible {
          outline: 3px solid color-mix(in srgb, var(--theme-color) 24%, transparent);
          outline-offset: 3px;
        }

        .at-icon-wrap {
          width: 58px;
          height: 58px;
          flex: 0 0 58px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid;
          box-shadow:
            inset 0 0 0 5px rgba(255,255,255,.58),
            0 8px 18px rgba(20,32,51,.08);
          transition: transform 240ms ease, box-shadow 240ms ease;
        }

        .at-card:hover .at-icon-wrap {
          transform: scale(1.07) rotate(-4deg);
          box-shadow:
            inset 0 0 0 5px rgba(255,255,255,.66),
            0 12px 24px rgba(20,32,51,.13);
        }

        .at-icon-letter {
          font-family: var(--font-heading);
          font-size: 24px;
          font-weight: 700;
        }

        .at-name {
          min-width: 0;
          flex: 1;
          font-family: var(--font-heading);
          font-size: 16px;
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1.2;
        }

        .at-count {
          position: absolute;
          left: 88px;
          bottom: 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 5px 10px;
          font-size: 9px;
          color: var(--color-text-muted);
        }

        .at-count span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .at-card-index {
          position: absolute;
          top: 10px;
          right: 12px;
          color: rgba(20,32,51,.16);
          font-family: var(--font-heading);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .08em;
        }

        .at-card-arrow {
          position: absolute;
          right: 15px;
          bottom: 17px;
          display: grid;
          place-items: center;
          color: var(--theme-color);
          transform: translateX(-3px);
          opacity: .7;
          transition: transform 220ms ease, opacity 220ms ease;
        }

        .at-card:hover .at-card-arrow {
          transform: translateX(2px);
          opacity: 1;
        }

        .at-cta {
          position: relative;
          border-radius: 22px;
          overflow: hidden;
          min-height: 280px;
          background: #f5f0e9;
          border: 1px solid var(--color-border);
          box-shadow: 0 18px 46px rgba(20,32,51,.1);
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
          .at-section { padding-top: 24px; }
          .at-grid { grid-template-columns: 1fr; }
          .at-card { min-height: 108px; }
          .at-cta-bg { background-position: 68% center; }
          .at-cta-content { max-width: 72%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .at-card,
          .at-card::before,
          .at-icon-wrap,
          .at-card-arrow {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
