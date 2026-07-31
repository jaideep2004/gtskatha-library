'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';

const DEFAULT_SIZES = [5, 15, 20, 50];
const PAGE_WINDOW = 2;

interface PaginationControlsProps {
  basePath: string;
  page: number;
  size: number;
  total: number;
  totalPages: number;
  sizes?: number[];
}

function pageHref(basePath: string, page: number, size: number) {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (size !== DEFAULT_PAGE_SIZE) params.set('size', String(size));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function pageItems(current: number, totalPages: number): Array<number | 'ellipsis'> {
  const items: Array<number | 'ellipsis'> = [];
  for (let p = 1; p <= totalPages; p += 1) {
    if (
      p === 1 ||
      p === totalPages ||
      Math.abs(p - current) <= PAGE_WINDOW
    ) {
      items.push(p);
    }
  }
  const withEllipsis: Array<number | 'ellipsis'> = [];
  let previous = 0;
  for (const item of items) {
    if (typeof item === 'number' && previous > 0 && item - previous > 1) {
      withEllipsis.push('ellipsis');
    }
    withEllipsis.push(item);
    if (typeof item === 'number') previous = item;
  }
  return withEllipsis;
}

export default function PaginationControls({
  basePath,
  page,
  size,
  total,
  totalPages,
  sizes = DEFAULT_SIZES,
}: PaginationControlsProps) {
  const router = useRouter();
  const needsPagination = totalPages > 1 || total > Math.max(...sizes);
  if (!needsPagination) return null;

  const from = total === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(page * size, total);

  function handleSizeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextSize = parseInt(event.target.value, 10);
    if (Number.isFinite(nextSize) && nextSize !== size) {
      router.push(pageHref(basePath, 1, nextSize));
    }
  }

  return (
    <nav className="pc" aria-label="Pagination">
      <div className="pc-toolbar">
        <span className="pc-summary">
          {from.toLocaleString()}–{to.toLocaleString()} / {total.toLocaleString()}
        </span>
        <label className="pc-size">
          <span>ਪ੍ਰਤੀ ਪੰਨਾ</span>
          <select value={size} onChange={handleSizeChange}>
            {sizes.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="pc-pages">
        {page > 1 ? (
          <Link className="pc-btn" href={pageHref(basePath, page - 1, size)} aria-label="Previous page">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
        ) : (
          <span className="pc-btn is-disabled" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </span>
        )}

        {pageItems(page, totalPages).map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="pc-ellipsis" aria-hidden="true">…</span>
          ) : (
            <Link
              key={item}
              className={`pc-btn pc-num${item === page ? ' is-active' : ''}`}
              href={pageHref(basePath, item, size)}
              aria-current={item === page ? 'page' : undefined}
              aria-label={`Page ${item}`}
            >
              {item}
            </Link>
          )
        )}

        {page < totalPages ? (
          <Link className="pc-btn" href={pageHref(basePath, page + 1, size)} aria-label="Next page">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        ) : (
          <span className="pc-btn is-disabled" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        )}
      </div>

      <style>{`
        .pc {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          margin-top: var(--space-6);
        }
        .pc-toolbar {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          flex-wrap: wrap;
          justify-content: center;
        }
        .pc-summary {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          font-variant-numeric: tabular-nums;
        }
        .pc-size {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
          font-weight: 600;
        }
        .pc-size select {
          min-height: 32px;
          padding: 0 28px 0 10px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-surface);
          color: var(--color-text-primary);
          font: inherit;
          font-size: var(--font-size-sm);
          cursor: pointer;
        }
        .pc-size select:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
        .pc-pages {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .pc-btn {
          min-width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 10px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-surface);
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
          font-weight: 700;
          text-decoration: none;
          font-variant-numeric: tabular-nums;
          transition: border-color var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .pc-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .pc-btn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
        .pc-btn.is-active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: #fff;
        }
        .pc-btn.is-disabled { opacity: 0.35; pointer-events: none; }
        .pc-ellipsis { color: var(--color-text-muted); padding: 0 2px; }
      `}</style>
    </nav>
  );
}
