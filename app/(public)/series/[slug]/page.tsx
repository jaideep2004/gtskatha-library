import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import KathaList from '@/components/katha/KathaList';
import { getSeriesBySlug } from '@/services/seriesService';
import { getKathas } from '@/services/kathaService';
import { ISeries, IKatha } from '@/types';
import { getThumbnailUrl } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug) as ISeries | null;
  if (!series) return { title: 'Series Not Found' };
  return {
    title: series.title,
    description: series.description,
    openGraph: {
      title: series.title,
      description: series.description,
      images: series.thumbnail ? [getThumbnailUrl(series.thumbnail)] : [],
    },
  };
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let series: ISeries | null = null;
  let kathas: IKatha[] = [];

  try {
    series = await getSeriesBySlug(slug) as ISeries | null;
    if (!series) notFound();

    const result = await getKathas({
      series: (series as ISeries & { _id: string })._id,
      sort: 'newest',
      limit: 100,
    });
    kathas = result.data as unknown as IKatha[];
  } catch {
    if (!series) notFound();
  }

  const thumbSrc = series!.thumbnail
    ? getMediaUrl('series', series!.thumbnail)
    : null;

  return (
    <div className="page-section">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/series">Series</Link>
          <span className="breadcrumb-sep">›</span>
          <span>{series!.title}</span>
        </nav>

        {/* Series header */}
        <div className="series-detail-header">
          <div className="series-detail-thumb">
            {thumbSrc ? (
              <img src={thumbSrc} alt={series!.title} />
            ) : (
              <div className="series-thumb-placeholder">
                <span>☬</span>
              </div>
            )}
          </div>

          <div className="series-detail-info">
            <div className="series-detail-badges">
              <span className="badge badge-primary">Series</span>
              {series!.featured && (
                <span className="badge badge-success">Featured</span>
              )}
            </div>

            <h1 className="series-detail-title">{series!.title}</h1>

            {series!.description && (
              <p className="series-detail-desc">{series!.description}</p>
            )}

            <div className="series-detail-stats">
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
                {kathas.length} {kathas.length === 1 ? 'Episode' : 'Episodes'}
              </span>
            </div>

            {kathas.length > 0 && (
              <Link
                href={`/${kathas[0].type}/${kathas[0].slug}`}
                className="btn btn-primary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Start from Beginning
              </Link>
            )}
          </div>
        </div>

        {/* Episodes */}
        <div className="series-episodes">
          <div className="series-episodes-header">
            <h2>Episodes</h2>
            <span className="series-episodes-count">{kathas.length} total</span>
          </div>

          {kathas.length > 0 ? (
            <KathaList kathas={kathas} />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🎵</div>
              <h3>No episodes yet</h3>
              <p>Episodes will appear here once added to this series.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .series-detail-header {
          display: flex;
          gap: var(--space-8);
          margin-bottom: var(--space-10);
          padding: var(--space-8);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
        }

        .series-detail-thumb {
          width: 220px;
          height: 220px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          flex-shrink: 0;
          background: linear-gradient(135deg, #1e1a10, #2d2510);
        }

        .series-detail-thumb img {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        .series-thumb-placeholder {
          width: 100%; height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 80px;
          color: var(--color-primary);
        }

        .series-detail-info { flex: 1; min-width: 0; }

        .series-detail-badges {
          display: flex;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
        }

        .series-detail-title {
          font-family: var(--font-heading);
          font-size: var(--font-size-3xl);
          font-weight: 700;
          margin-bottom: var(--space-4);
          line-height: 1.2;
        }

        .series-detail-desc {
          color: var(--color-text-secondary);
          line-height: 1.65;
          margin-bottom: var(--space-5);
          max-width: 520px;
        }

        .series-detail-stats {
          display: flex;
          gap: var(--space-5);
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          margin-bottom: var(--space-6);
        }

        .series-detail-stats span {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .series-episodes { margin-top: var(--space-4); }

        .series-episodes-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }

        .series-episodes-header h2 {
          font-family: var(--font-heading);
          font-size: var(--font-size-2xl);
          font-weight: 700;
        }

        .series-episodes-count {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          background: var(--color-bg-secondary);
          padding: 2px 10px;
          border-radius: var(--radius-full);
        }

        .empty-state {
          text-align: center;
          padding: var(--space-16) 0;
        }
        .empty-state-icon { font-size: 48px; margin-bottom: var(--space-4); }
        .empty-state h3 { margin-bottom: var(--space-3); }
        .empty-state p { color: var(--color-text-muted); }

        @media (max-width: 768px) {
          .series-detail-header { flex-direction: column; }
          .series-detail-thumb { width: 100%; height: 200px; }
          .series-detail-title { font-size: var(--font-size-2xl); }
        }
      `}</style>
    </div>
  );
}
