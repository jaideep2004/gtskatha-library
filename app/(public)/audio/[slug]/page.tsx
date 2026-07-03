import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import AudioPlayer from '@/components/player/AudioPlayer';
import AudioDetailClient from '@/components/katha/AudioDetailClient';
import ChaptersList from '@/components/katha/ChaptersList';
import TabContent from '@/components/katha/TabContent';
import ShareButtons from '@/components/katha/ShareButtons';
import { getKathaBySlug, getKathas } from '@/services/kathaService';
import { formatDuration, formatDate, getThumbnailUrl } from '@/lib/utils';
import { authOptions } from '@/lib/auth';
import { IKatha, ISeries, ICategory } from '@/types';
import { serializeForClient } from '@/lib/serialize';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const katha = await getKathaBySlug(slug) as IKatha | null;
  if (!katha) return { title: 'Katha Not Found' };
  return {
    title: katha.title,
    description: katha.description,
    openGraph: {
      title: katha.title,
      description: katha.description,
      images: katha.thumbnail ? [getThumbnailUrl(katha.thumbnail)] : [],
    },
  };
}

export default async function AudioDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const rawKatha = await getKathaBySlug(slug) as IKatha | null;
  if (!rawKatha || rawKatha.type !== 'audio') notFound();

  const katha = serializeForClient(rawKatha);
  const series = typeof katha.seriesId === 'object' ? katha.seriesId as ISeries : null;
  const category = typeof katha.categoryId === 'object' ? katha.categoryId as ICategory : null;
  const thumbSrc = getThumbnailUrl(katha.thumbnail);

  // Fetch related kathas (same series or same category, limit 3, exclude current)
  let relatedKathas: IKatha[] = [];
  try {
    const seriesId = series ? (series as ISeries & { _id: string })._id : undefined;
    const categoryId = category ? (category as ICategory & { _id: string })._id : undefined;
    const relatedResult = await getKathas({
      type: 'audio',
      series: seriesId,
      category: !seriesId && categoryId ? categoryId : undefined,
      limit: 4,
      sort: 'newest',
    });
    relatedKathas = (serializeForClient(relatedResult.data) as unknown as IKatha[])
      .filter((k) => k.slug !== slug)
      .slice(0, 3);
  } catch { /* ignore */ }

  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user;

  return (
    <div className="page-section">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">ਮੁੱਖ ਪੰਨਾ</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/audio">ਆਡੀਓ</Link>
          {series && (
            <>
              <span className="breadcrumb-sep">›</span>
              <Link href={`/series/${series.slug}`}>{series.title}</Link>
            </>
          )}
          <span className="breadcrumb-sep">›</span>
          <span>{katha.title}</span>
        </nav>

        <div className="audio-detail-layout">
          {/* Left: main */}
          <div className="audio-detail-main">
            {/* Header */}
            <div className="audio-header">
              <div className="audio-art">
                <img
                  src={thumbSrc}
                  alt={katha.title}
                  onError={undefined}
                  className="audio-art-img"
                />
              </div>

              <div className="audio-info">
                <div className="audio-info-top">
                  <span className="badge badge-audio">Audio</span>
                  {series && (
                    <Link href={`/series/${series.slug}`} className="audio-series-link">
                      {series.title}
                    </Link>
                  )}
                </div>

                <h1 className="audio-title">{katha.title}</h1>

                <div className="audio-author">
                  <div className="audio-author-avatar">S</div>
                  <div>
                    <div className="audio-author-name">
                      {katha.authorName ?? 'Sikh Katha Library'}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#C8972A" aria-label="Verified">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                      </svg>
                    </div>
                    <div className="audio-author-label">ਕਥਾ ਵਾਚਕ</div>
                  </div>
                </div>

                {katha.description && (
                  <p className="audio-description">{katha.description}</p>
                )}

                <div className="audio-meta-row">
                  {katha.duration && (
                    <span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {formatDuration(katha.duration)}
                    </span>
                  )}
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {formatDate(katha.createdAt)}
                  </span>
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {katha.views.toLocaleString()} plays
                  </span>
                  {category && (
                    <Link href={`/search?category=${category.slug}`} className="audio-category-tag">
                      {category.name}
                    </Link>
                  )}
                </div>

                {/* Client component handles Play button (needs context) */}
                <AudioDetailClient katha={katha} isAuthenticated={isAuthenticated} />

              </div>
            </div>

            {/* Audio Player */}
            <AudioPlayer katha={katha} />

            {/* Tabs + Tab Content */}
            <TabContent
              katha={katha}
              categorySlug={category?.slug}
              categoryName={category?.name}
              isAuthenticated={isAuthenticated}
            />
          </div>

          {/* Sidebar */}
          <aside className="audio-sidebar">
            

            {/* Chapters */}
            {(katha.chapters?.length ?? 0) > 0 && (
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">ਅਧਿਆਇ</h3>
                <ChaptersList chapters={katha.chapters ?? []} />
              </div>
            )}

            {/* About Series */}
            {series && (
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">ਲੜੀ ਬਾਰੇ</h3>
                <div className="series-sidebar-thumb">
                  {series.thumbnail ? (
                    <img src={getThumbnailUrl(series.thumbnail)} alt={series.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                  ) : <span style={{ fontSize: 48, color: 'var(--color-primary)' }}>☬</span>}
                </div>
                <p className="series-sidebar-title">{series.title}</p>
                {series.description && (
                  <p className="series-sidebar-desc">{series.description}</p>
                )}
                <Link href={`/series/${series.slug}`} className="btn btn-outline btn-sm" style={{ marginTop: '12px' }}>
                  ਲੜੀ ਵੇਖੋ
                </Link>
              </div>
            )}

            {/* You Might Also Like */}
            {relatedKathas.length > 0 && (
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">ਇਹ ਵੀ ਸੁਣੋ</h3>
                <ul className="related-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {relatedKathas.map((r) => (
                    <li key={r._id}>
                      <Link href={`/audio/${r.slug}`} className="related-item">
                        <div className="related-thumb">
                          {r.thumbnail ? (
                            <img src={getThumbnailUrl(r.thumbnail)} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--color-primary)' }}>
                              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                            </svg>
                          )}
                        </div>
                        <div className="related-info">
                          <span className="related-title">{r.title}</span>
                          <span className="related-meta">
                            {r.authorName ?? 'Sikh Katha Library'}
                            {r.duration ? ` · ${formatDuration(r.duration)}` : ''}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Share */}
            <div className="sidebar-card">
              <h3 className="sidebar-card-title">ਇਹ ਕਥਾ ਸਾਂਝੀ ਕਰੋ</h3>
              <ShareButtons title={katha.title} />
            </div>
            {katha.tags?.length > 0 && (
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">ਟੈਗ</h3>
                <div className="audio-tags sidebar-tags">
                  {katha.tags.map((tag) => (
                    <Link key={tag} href={`/search?q=${tag}`} className="audio-tag">
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <style>{`
        .page-section {
          padding-top: 28px;
          background: #fdfbf7;
        }

        .breadcrumb {
          margin-bottom: 28px;
          color: #7a8290;
        }

        .audio-detail-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          gap: 28px;
          align-items: start;
        }

        .audio-header {
          display: flex;
          gap: 32px;
          margin-bottom: 32px;
          align-items: center;
        }

        .audio-art {
          flex-shrink: 0;
          width: 292px;
          height: 365px;
          border-radius: 8px;
          overflow: hidden;
          background: linear-gradient(135deg, #1a1608, #2d2510, #1a1608);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 42px rgba(31, 26, 18, .17);
        }

        .audio-art-img {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        .audio-info { flex: 1; min-width: 0; }

        .audio-info-top {
          display: flex; align-items: center; gap: var(--space-3);
          margin-bottom: 15px;
        }

        .audio-series-link {
          font-size: 11px; color: #bb7212;
          font-weight: 700; text-decoration: none;
          text-transform: uppercase;
          letter-spacing: .5px;
          padding: 5px 9px;
          border-radius: 5px;
          background: #fbf0df;
        }
        .audio-series-link:hover { text-decoration: underline; }

        .audio-title {
          font-family: var(--font-heading);
          font-size: 42px;
          font-weight: 700;
          margin-bottom: 13px;
          line-height: 1.13;
          color: #162033;
        }

        .audio-author {
          display: flex; align-items: center; gap: var(--space-3);
          margin-bottom: 20px;
        }

        .audio-author-avatar {
          width: 42px; height: 42px; border-radius: 50%;
          background: var(--color-primary); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px;
        }

        .audio-author-name {
          font-size: 15px; font-weight: 600;
          color: var(--color-text-primary);
          display: flex; align-items: center; gap: 4px;
        }

        .audio-author-label {
          font-size: 11px; color: var(--color-text-muted);
        }

        .audio-description {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.65;
          margin-bottom: 24px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .audio-meta-row {
          display: flex; align-items: center; gap: var(--space-4);
          font-size: 13px; color: #697384;
          margin-bottom: 24px; flex-wrap: wrap;
        }

        .audio-meta-row span {
          display: flex; align-items: center; gap: 4px;
        }

        .audio-category-tag {
          background: var(--color-primary-alpha);
          color: var(--color-primary-dark);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-weight: 500;
          text-decoration: none;
          font-size: var(--font-size-xs);
        }

        .audio-tags {
          display: flex; gap: var(--space-2); flex-wrap: wrap;
          margin-top: var(--space-4);
        }

        .sidebar-tags { margin-top: 0; }

        .audio-tag {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          background: var(--color-bg-secondary);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .audio-tag:hover {
          background: var(--color-primary-alpha);
          color: var(--color-primary);
        }

        .audio-sidebar {
          display: flex; flex-direction: column; gap: var(--space-5);
          position: sticky; top: calc(var(--navbar-height) + var(--space-4));
        }

        .sidebar-card {
          background: var(--color-surface);
          border: 1px solid #e6e1d8;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 8px 24px rgba(28,35,45,.04);
        }

        .sidebar-card-title {
          font-family: var(--font-body);
          font-size: 17px; font-weight: 700;
          text-transform: none; letter-spacing: 0;
          color: #1c2638; margin-bottom: 16px;
        }

        .series-sidebar-thumb {
          height: 80px; display: flex; align-items: center; justify-content: center;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md); margin-bottom: var(--space-3);
          overflow: hidden;
        }

        .series-sidebar-title {
          font-size: 14px; font-weight: 600;
          color: var(--color-text-primary); margin-bottom: var(--space-2);
        }
        .series-sidebar-desc {
          font-size: 12px; color: var(--color-text-muted); line-height: 1.65;
        }

        .related-list { display: flex; flex-direction: column; gap: var(--space-3); list-style: none; padding: 0; margin: 0; }
        .related-item { display: flex; gap: var(--space-3); align-items: center; text-decoration: none; transition: opacity var(--transition-fast); }
        .related-item:hover { opacity: 0.75; }
        .related-thumb { width: 56px; height: 40px; border-radius: var(--radius-sm); background: var(--color-bg-secondary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .related-info { flex: 1; min-width: 0; }
        .related-title { display: block; font-size: 13px; font-weight: 600; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
        .related-meta { font-size: 11px; color: var(--color-text-muted); }

        .audio-detail-main :global(.audio-player-wrap) {
          margin: 0 0 30px;
          border-radius: 8px;
          padding: 26px 28px;
          background: linear-gradient(135deg, #111820, #171b20);
          box-shadow: 0 18px 40px rgba(18, 25, 33, .18);
        }

        .audio-detail-main :global(.tabs) {
          margin-bottom: 0;
          padding: 0 10px;
          gap: 42px;
          border-bottom: 1px solid #e1dbd0;
        }

        .audio-detail-main :global(.tab-panels) {
          min-height: 290px;
          margin-top: 12px;
          padding: 0 24px;
          border: 1px solid #e6e1d8;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 8px 24px rgba(28,35,45,.035);
        }

        .audio-detail-main :global(.tab-panel h3) {
          font-size: 22px;
        }

        .audio-detail-main :global(.tab-panel p),
        .audio-detail-main :global(.takeaway-item) {
          font-size: 14px;
          line-height: 1.75;
        }

        .audio-info :global(.audio-actions .btn) {
          min-height: 48px;
          border-radius: 7px;
          padding: 0 22px;
        }

        @media (max-width: 1100px) {
          .audio-detail-layout { grid-template-columns: 1fr; }
          .audio-sidebar { position: static; }
        }

        @media (max-width: 640px) {
          .page-section {
            background: #10161d;
            color: #f7f2e8;
            padding-top: 18px;
          }
          .breadcrumb,
          .breadcrumb a,
          .breadcrumb span { color: rgba(255,255,255,0.62); }
          .audio-header { flex-direction: column; }
          .audio-art {
            width: min(76vw, 320px);
            height: auto;
            aspect-ratio: 4 / 5;
            margin: 0 auto;
            box-shadow: 0 20px 48px rgba(0,0,0,0.42);
          }
          .audio-title,
          .audio-author-name,
          .series-sidebar-title,
          .related-title { color: #fff; }
          .audio-description,
          .audio-meta-row,
          .audio-author-label,
          .related-meta { color: rgba(255,255,255,0.66); }
          .audio-sidebar { margin-top: var(--space-4); }
          .audio-detail-main :global(.tabs) { gap: 24px; overflow-x: auto; }
          .audio-detail-main :global(.tab-panels) { padding: 0 16px; }
          .sidebar-card {
            background: #151c23;
            border-color: rgba(255,255,255,0.1);
          }
          .sidebar-card-title { color: rgba(255,255,255,0.58); }
          .audio-tag { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); }
        }
      `}</style>
    </div>
  );
}
