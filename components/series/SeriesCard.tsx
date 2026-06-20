import Link from 'next/link';
import { ISeries } from '@/types';
import { getMediaUrl } from '@/lib/media';

interface SeriesCardProps {
  series: Partial<ISeries> & { _id: string; title: string; slug: string };
  episodeCount?: number;
}

export default function SeriesCard({ series, episodeCount }: SeriesCardProps) {
  return (
    <Link href={`/series/${series.slug}`} className="series-card">
      <div className="series-card-thumb">
        {series.thumbnail ? (
          <img src={getMediaUrl('series', series.thumbnail)} alt={series.title} loading="lazy" />
        ) : (
          <div className="series-card-placeholder">
            <span>☬</span>
          </div>
        )}
        <div className="series-card-overlay" />
        {series.featured && <span className="series-featured-tag">Featured</span>}
      </div>

      <div className="series-card-info">
        <h3 className="series-card-title">{series.title}</h3>
        {series.description && (
          <p className="series-card-desc">{series.description}</p>
        )}
        {episodeCount !== undefined && (
          <span className="series-card-count">{episodeCount} episodes</span>
        )}
      </div>

      <style>{`
        .series-card {
          display: block;
          text-decoration: none;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          transition: all var(--transition-base);
        }
        .series-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-card-hover);
          border-color: var(--color-primary);
        }
        .series-card-thumb {
          height: 200px;
          position: relative;
          background: var(--color-bg-secondary);
          overflow: hidden;
        }
        .series-card-thumb img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform var(--transition-slow);
        }
        .series-card:hover .series-card-thumb img { transform: scale(1.05); }
        .series-card-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 48px;
          background: linear-gradient(135deg, #1e1a10, #2d2510);
        }
        .series-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%);
        }
        .series-featured-tag {
          position: absolute; top: var(--space-2); right: var(--space-2);
          background: var(--color-primary);
          color: #fff;
          font-size: 10px; font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }
        .series-card-info { padding: var(--space-4); }
        .series-card-title {
          font-family: var(--font-heading);
          font-size: var(--font-size-base);
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .series-card-desc {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 6px;
        }
        .series-card-count {
          font-size: var(--font-size-xs);
          color: var(--color-primary);
          font-weight: 500;
        }
      `}</style>
    </Link>
  );
}
