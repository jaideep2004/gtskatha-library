import Link from 'next/link';
import { IKatha } from '@/types';
import { formatDuration } from '@/lib/utils';

interface FeaturedKathaProps {
  katha?: Partial<IKatha>;
}

export default function FeaturedKatha({ katha }: FeaturedKathaProps) {
  if (!katha?.slug || !katha.title || !katha.type) return null;
  const k = katha;

  return (
    <section className="page-section-sm">
      <div className="container">
        <div className="fk-banner">
          <div className="fk-bg" aria-hidden>
            <div className="fk-bg-glow" />
          </div>

          <div className="fk-content">
            <div className="fk-left">
              <div className="fk-label">
                <span className="fk-dot" aria-hidden />
                Featured Katha
              </div>
              <h2 className="fk-title">{k.title}</h2>
              <p className="fk-desc">{k.description}</p>
              <div className="fk-meta">
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {formatDuration(k.duration ?? 0)}
                </span>
                {k.views !== undefined && (
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {k.views.toLocaleString()} plays
                  </span>
                )}
              </div>
              <div className="fk-actions">
                <Link href={`/${k.type}/${k.slug}`} className="btn btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Listen Now
                </Link>
                <button className="btn btn-outline fk-save-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                  </svg>
                  Save
                </button>
              </div>
            </div>

            <div className="fk-visual">
              <div className="fk-disc">
                <div className="fk-disc-inner">
                  <span className="fk-disc-khanda">☬</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .fk-banner {
          position: relative;
          border-radius: var(--radius-xl);
          overflow: hidden;
          padding: var(--space-10) var(--space-10);
          background: linear-gradient(135deg, #0f0c08 0%, #1e1206 60%, #2a1a08 100%);
          border: 1px solid rgba(200, 151, 42, 0.15);
        }

        .fk-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .fk-bg-glow {
          position: absolute;
          right: 10%;
          top: -30%;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(200, 151, 42, 0.12) 0%, transparent 70%);
        }

        .fk-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-10);
        }

        .fk-left {
          flex: 1;
          max-width: 560px;
        }

        .fk-label {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-xs);
          font-weight: 600;
          color: var(--color-primary-light);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: var(--space-4);
        }

        .fk-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-primary);
          animation: pulse 2s ease-in-out infinite;
        }

        .fk-title {
          font-family: var(--font-heading);
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          margin-bottom: var(--space-4);
        }

        .fk-desc {
          font-size: var(--font-size-base);
          color: rgba(255,255,255,0.6);
          line-height: 1.65;
          margin-bottom: var(--space-5);
        }

        .fk-meta {
          display: flex;
          gap: var(--space-5);
          font-size: var(--font-size-sm);
          color: rgba(255,255,255,0.5);
          margin-bottom: var(--space-6);
        }

        .fk-meta span {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .fk-actions {
          display: flex;
          gap: var(--space-3);
        }

        .fk-save-btn {
          color: rgba(255,255,255,0.7);
          border-color: rgba(255,255,255,0.2);
        }

        .fk-save-btn:hover {
          background: rgba(255,255,255,0.08);
        }

        .fk-visual {
          flex-shrink: 0;
        }

        .fk-disc {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          border: 2px solid rgba(200, 151, 42, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle, rgba(200, 151, 42, 0.1) 0%, transparent 70%);
          animation: spin 20s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .fk-disc-inner {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(200, 151, 42, 0.08);
          border: 2px solid rgba(200, 151, 42, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fk-disc-khanda {
          font-size: 48px;
          color: var(--color-primary);
          animation: spin 20s linear infinite reverse;
        }

        @media (max-width: 768px) {
          .fk-visual { display: none; }
          .fk-banner { padding: var(--space-8); }
          .fk-title { font-size: var(--font-size-2xl); }
        }
      `}</style>
    </section>
  );
}
