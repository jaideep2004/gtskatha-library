import Link from 'next/link';

interface PaathNittnemItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  entryCount: number;
}

interface PaathNittnemSectionProps {
  paaths?: PaathNittnemItem[];
  nittnems?: PaathNittnemItem[];
}

export default function PaathNittnemSection({ paaths, nittnems }: PaathNittnemSectionProps) {
  const hasPaaths = paaths && paaths.length > 0;
  const hasNittnems = nittnems && nittnems.length > 0;

  if (!hasPaaths && !hasNittnems) return null;

  return (
    <section className="pn-section">
      <div className="container">
        <div className="pn-header">
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

        <div className="pn-grid">
          {hasPaaths && (
            <div className="pn-col">
              <div className="pn-col-head">
                <span className="pn-badge pn-badge-gold">ਪਾਠ</span>
                <span className="pn-summary">{paaths!.length} categories</span>
              </div>
              <div className="pn-list">
                {paaths!.slice(0, 5).map((p, i) => (
                  <Link key={p._id} href={`/paath/${p.slug}`} className="pn-item" style={{ '--i': i } as React.CSSProperties}>
                    <span className="pn-item-icon">☬</span>
                    <div className="pn-item-body">
                      <strong>{p.title}</strong>
                      {p.description && <small>{p.description}</small>}
                    </div>
                    <span className="pn-item-meta">{p.entryCount}</span>
                    <svg className="pn-item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {hasNittnems && (
            <div className="pn-col">
              <div className="pn-col-head">
                <span className="pn-badge pn-badge-teal">ਨਿਤਨੇਮ</span>
                <span className="pn-summary">{nittnems!.length} lists</span>
              </div>
              <div className="pn-list">
                {nittnems!.slice(0, 5).map((n, i) => (
                  <Link key={n._id} href={`/nittnem/${n.slug}`} className="pn-item" style={{ '--i': i } as React.CSSProperties}>
                    <span className="pn-item-icon">☬</span>
                    <div className="pn-item-body">
                      <strong>{n.title}</strong>
                      {n.description && <small>{n.description}</small>}
                    </div>
                    <span className="pn-item-meta">{n.entryCount}</span>
                    <svg className="pn-item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pn-footer">
          <Link href="/paath" className="pn-footer-link">
            <span>Explore all Paath</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <Link href="/nittnem" className="pn-footer-link">
            <span>Explore all Nittnem</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>

      <style>{`
        .pn-section{padding:44px 0 52px;background:linear-gradient(180deg,var(--color-bg) 0%,#f8f4ec 100%)}
        .pn-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
        .pn-header .section-title{display:flex;align-items:center;gap:10px;color:#162033}
        .pn-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .pn-col{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:20px;box-shadow:0 8px 28px rgba(20,32,51,.045)}
        .pn-col-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--color-border-light)}
        .pn-badge{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;padding:4px 12px;border-radius:999px}
        .pn-badge-gold{background:rgba(217,140,41,.14);color:#b8731a}
        .pn-badge-teal{background:rgba(22,129,90,.14);color:#16815a}
        .pn-summary{font-size:11px;color:var(--color-text-muted)}
        .pn-list{display:flex;flex-direction:column;gap:4px}
        .pn-item{display:grid;grid-template-columns:28px 1fr auto 16px;gap:10px;align-items:center;padding:10px 8px;border-radius:var(--radius-md);text-decoration:none;color:inherit;transition:all .2s ease;animation:pnItemIn .35s ease both;animation-delay:calc(var(--i,0)*.05s)}
        .pn-item:hover{background:var(--color-bg-secondary)}
        @keyframes pnItemIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        .pn-item-icon{width:26px;height:26px;display:grid;place-items:center;border-radius:50%;background:var(--color-primary-alpha);color:var(--color-primary-dark);font-size:11px}
        .pn-item-body{min-width:0}
        .pn-item-body strong{display:block;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .pn-item-body small{font-size:11px;color:var(--color-text-muted);display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
        .pn-item-meta{font-size:11px;font-weight:700;color:var(--color-text-muted);background:var(--color-bg-secondary);padding:2px 8px;border-radius:999px;min-width:22px;text-align:center}
        .pn-item-arrow{color:var(--color-text-muted);opacity:0;transition:opacity .2s ease,transform .2s ease}
        .pn-item:hover .pn-item-arrow{opacity:1;transform:translateX(2px);color:var(--color-primary)}
        .pn-footer{display:flex;gap:16px;margin-top:16px;justify-content:center}
        .pn-footer-link{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:999px;border:1px solid var(--color-border);background:var(--color-surface);font-size:13px;font-weight:600;color:var(--color-text-secondary);text-decoration:none;transition:all .2s ease}
        .pn-footer-link:hover{border-color:var(--color-primary);color:var(--color-primary);box-shadow:0 6px 20px rgba(217,140,41,.12)}
        @media(max-width:800px){.pn-grid{grid-template-columns:1fr}}
        @media(max-width:640px){.pn-section{padding:28px 0 36px}.pn-item{padding:8px 6px}}
      `}</style>
    </section>
  );
}
