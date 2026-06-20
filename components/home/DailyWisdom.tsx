export default function DailyWisdom() {
  return (
    <section className="page-section-sm">
      <div className="container">
        <div className="dw-banner">
          <div className="dw-khanda-bg" aria-hidden>☬</div>
          <div className="dw-content">
            <div className="dw-eyebrow">
              <span>Daily Hukamnama</span>
            </div>
            <blockquote className="dw-verse text-gurmukhi">
              ਹਰਿ ਕੇ ਦਾਸ ਕਉ ਦੁਖੁ ਸੁਪਨੈ ਨਾਹਿ ॥
            </blockquote>
            <p className="dw-translation">
              &ldquo;The servant of the Lord has no pain, even in dreams.&rdquo;
            </p>
            <p className="dw-source">— Sukhmani Sahib, Ang 276</p>
          </div>
        </div>
      </div>

      <style>{`
        .dw-banner {
          position: relative;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-10);
          text-align: center;
          overflow: hidden;
        }

        .dw-khanda-bg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 200px;
          color: var(--color-primary);
          opacity: 0.04;
          pointer-events: none;
          user-select: none;
        }

        .dw-content {
          position: relative;
          z-index: 1;
        }

        .dw-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: var(--font-size-xs);
          font-weight: 600;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: var(--space-5);
          padding: 4px 16px;
          background: var(--color-primary-alpha);
          border-radius: var(--radius-full);
        }

        .dw-verse {
          font-size: clamp(1.25rem, 3vw, 2rem);
          color: var(--color-text-primary);
          margin-bottom: var(--space-4);
          line-height: 1.8;
        }

        .dw-translation {
          font-size: var(--font-size-lg);
          color: var(--color-text-secondary);
          font-style: italic;
          margin-bottom: var(--space-3);
        }

        .dw-source {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          font-weight: 500;
        }
      `}</style>
    </section>
  );
}
