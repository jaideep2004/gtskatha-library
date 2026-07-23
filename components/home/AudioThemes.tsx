import Link from 'next/link';

interface AudioThemesProps {
  paathData?: Array<{ _id: string; title: string; slug: string; description?: string; entryCount: number }>;
  nittnemData?: Array<{ _id: string; title: string; slug: string; description?: string; entryCount: number }>;
}

export default function AudioThemes({ paathData, nittnemData }: AudioThemesProps) {
  const paaths = paathData ?? [];
  const nittnems = nittnemData ?? [];
  const hasAny = paaths.length > 0 || nittnems.length > 0;

  if (!hasAny) return null;

  return (
    <section className="at-section">
      <div className="container">
        <div className="at-layout">
          <div className="at-left">
            <div className="section-header">
              <h2 className="section-title">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                ਪਾਠ ਅਤੇ ਨਿਤਨੇਮ
              </h2>
              <Link href="/paath" className="section-link">
                ਸਭ ਵੇਖੋ
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            <div className="at-pn-row">
              {paaths.slice(0, 2).map((p, i) => (
                <Link key={p._id} href={`/paath/${p.slug}`} className="at-pn-card at-pn-card--paath" style={{ '--gi': i } as React.CSSProperties}>
                  <div className="at-pn-glow" aria-hidden />
                  <span className="at-pn-badge">ਪਾਠ</span>
                  <div className="at-pn-icon-wrap">
                    <span className="at-pn-icon">☬</span>
                  </div>
                  <div className="at-pn-body">
                    <h4 className="at-pn-title">{p.title}</h4>
                    {p.description && <p className="at-pn-desc">{p.description}</p>}
                  </div>
                  <div className="at-pn-footer">
                    <span className="at-pn-count">{p.entryCount} entries</span>
                    <span className="at-pn-arrow">→</span>
                  </div>
                </Link>
              ))}
              {nittnems.slice(0, 2).map((n, i) => (
                <Link key={n._id} href={`/nittnem/${n.slug}`} className="at-pn-card at-pn-card--nittnem" style={{ '--gi': i } as React.CSSProperties}>
                  <div className="at-pn-glow" aria-hidden />
                  <span className="at-pn-badge at-pn-badge--teal">ਨਿਤਨੇਮ</span>
                  <div className="at-pn-icon-wrap at-pn-icon-wrap--teal">
                    <span className="at-pn-icon">☬</span>
                  </div>
                  <div className="at-pn-body">
                    <h4 className="at-pn-title">{n.title}</h4>
                    {n.description && <p className="at-pn-desc">{n.description}</p>}
                  </div>
                  <div className="at-pn-footer">
                    <span className="at-pn-count">{n.entryCount} entries</span>
                    <span className="at-pn-arrow">→</span>
                  </div>
                </Link>
              ))}
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
        .at-section { padding: 38px 0 58px; }
        .at-layout { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(420px, .92fr); gap: clamp(36px, 5vw, 72px); align-items: start; }
        .at-left .section-header { margin-bottom: 20px; }
        .section-title { display: flex; align-items: center; gap: 10px; color: #162033; }
        .at-pn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .at-pn-card {
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; gap: 8px;
          padding: 18px 18px 14px;
          border-radius: 20px; text-decoration: none; color: inherit;
          transition: transform 280ms ease, box-shadow 280ms ease;
          animation: pnCardIn .4s ease both;
          animation-delay: calc(var(--gi, 0) * .08s);
        }
        @keyframes pnCardIn { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .at-pn-card--paath {
          background: linear-gradient(145deg, #2b200b, #1e1709);
          border: 1px solid rgba(217,140,41,.28);
          box-shadow: 0 12px 28px rgba(217,140,41,.12);
        }
        .at-pn-card--paath:hover {
          transform: translateY(-6px);
          border-color: rgba(217,140,41,.5);
          box-shadow: 0 22px 44px rgba(217,140,41,.22);
        }
        .at-pn-card--nittnem {
          background: linear-gradient(145deg, #0b2820, #081b15);
          border: 1px solid rgba(22,129,90,.28);
          box-shadow: 0 12px 28px rgba(22,129,90,.12);
        }
        .at-pn-card--nittnem:hover {
          transform: translateY(-6px);
          border-color: rgba(22,129,90,.5);
          box-shadow: 0 22px 44px rgba(22,129,90,.22);
        }
        .at-pn-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(circle at 28% 0%, rgba(255,200,100,.08), transparent 60%);
          transition: opacity .3s ease;
        }
        .at-pn-card:hover .at-pn-glow { opacity: .7; }
        .at-pn-badge {
          display: inline-flex; align-items: center; gap: 6px;
          width: fit-content; padding: 4px 11px;
          border-radius: 999px; background: rgba(217,140,41,.18);
          color: #f1ae45; font-size: 9px; font-weight: 800;
          letter-spacing: 1.2px; text-transform: uppercase;
        }
        .at-pn-badge--teal { background: rgba(22,129,90,.18); color: #3fc99a; }
        .at-pn-icon-wrap {
          width: 42px; height: 42px;
          display: grid; place-items: center;
          border-radius: 12px;
          background: rgba(217,140,41,.14); color: #f1ae45;
          font-size: 18px;
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .at-pn-icon-wrap--teal { background: rgba(22,129,90,.14); color: #3fc99a; }
        .at-pn-card:hover .at-pn-icon-wrap { transform: scale(1.08) rotate(-6deg); }
        .at-pn-body { min-width: 0; }
        .at-pn-title {
          font-family: var(--font-heading);
          font-size: 15px; font-weight: 700; color: #fff;
          margin: 0 0 4px;
          display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .at-pn-desc {
          margin: 0; font-size: 11px; line-height: 1.5;
          color: rgba(255,255,255,.55);
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .at-pn-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 2px;
        }
        .at-pn-count { font-size: 10px; font-weight: 600; color: rgba(255,255,255,.4); }
        .at-pn-arrow { font-size: 14px; color: rgba(255,255,255,.3); transition: transform .2s ease, color .2s ease; }
        .at-pn-card:hover .at-pn-arrow { transform: translateX(4px); }
        .at-pn-card--paath:hover .at-pn-arrow { color: #f1ae45; }
        .at-pn-card--nittnem:hover .at-pn-arrow { color: #3fc99a; }

        .at-cta { position: relative; border-radius: 22px; overflow: hidden; min-height: 280px; background: #f5f0e9; border: 1px solid var(--color-border); box-shadow: 0 18px 46px rgba(20,32,51,.1); }
        .at-cta-bg { position: absolute; inset: 0; background-size: cover; background-position: 61% center; opacity: 1; }
        .at-cta-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(255,253,249,.98) 0%, rgba(255,253,249,.93) 39%, rgba(255,253,249,.2) 68%, transparent 100%); }
        .at-cta-content { position: relative; z-index: 1; padding: 28px 24px; display: flex; flex-direction: column; justify-content: center; height: 100%; min-height: 280px; max-width: 55%; }
        .at-cta-title { font-family: var(--font-heading); font-size: 22px; font-weight: 700; color: var(--color-text-primary); line-height: 1.25; margin-bottom: 10px; }
        .at-cta-sub { font-size: 13px; color: var(--color-text-secondary); line-height: 1.55; margin-bottom: 20px; }
        .at-cta-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; border-radius: 9999px; background: var(--color-primary); color: #fff; font-size: 13px; font-weight: 600; text-decoration: none; align-self: flex-start; transition: background 150ms ease; }
        .at-cta-btn:hover { background: var(--color-primary-dark); }

        @media (max-width: 1024px) { .at-layout { grid-template-columns: 1fr; } .at-cta { min-height: 220px; } .at-cta-content { min-height: 220px; max-width: 62%; } }
        @media (max-width: 640px) {
          .at-pn-row { grid-template-columns: 1fr; }
          .at-cta-bg { background-position: 68% center; }
          .at-cta-content { max-width: 72%; }
        }
        @media (prefers-reduced-motion: reduce) { .at-pn-card, .at-pn-arrow, .at-pn-icon-wrap { transition: none; } }
      `}</style>
    </section>
  );
}
