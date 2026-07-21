import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import KathaList from '@/components/katha/KathaList';
import { getSeriesBySlug } from '@/services/seriesService';
import { getFolderById } from '@/services/folderService';
import { getKathas } from '@/services/kathaService';
import { ISeries, IFolder, IKatha } from '@/types';
import { getThumbnailUrl } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media';
import { serializeForClient } from '@/lib/serialize';

interface PageProps {
  params: Promise<{ slug: string; folderId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { folderId } = await params;
  const folder = await getFolderById(folderId);
  if (!folder) return { title: 'Folder Not Found' };
  return { title: folder.title };
}

export default async function FolderDetailPage({ params }: PageProps) {
  const { slug, folderId } = await params;

  const [rawSeries, rawFolder] = await Promise.all([
    getSeriesBySlug(slug) as Promise<ISeries | null>,
    getFolderById(folderId) as Promise<IFolder | null>,
  ]);

  const series = rawSeries ? serializeForClient(rawSeries) : null;
  const folder = rawFolder ? serializeForClient(rawFolder) : null;

  if (!series || !folder) notFound();

  const result = await getKathas({ folder: folderId, sort: 'manual', limit: 5000, includeUnpublished: true });
  const kathas = serializeForClient(result.data) as unknown as IKatha[];

  const thumbSrc = series.thumbnail
    ? getMediaUrl('series', series.thumbnail)
    : null;

  return (
    <div className="page-section page-fade-in">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">ਮੁੱਖ ਪੰਨਾ</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/series">ਲੜੀਆਂ</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href={`/series/${slug}`}>{series.title}</Link>
          <span className="breadcrumb-sep">›</span>
          <span>{folder.title}</span>
        </nav>

        <div className="folder-detail-header">
          <div className="folder-detail-icon">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12a4 4 0 0 1 4-4h11.5l4 4H38a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V12z" fill="#FFB900" />
              <path d="M6 14a4 4 0 0 1 4-4h11.5l4 4H38a4 4 0 0 1 4 4v2H6v-6z" fill="#FFD144" opacity="0.7" />
            </svg>
          </div>
          <div>
            <h1 className="folder-detail-title">{folder.title}</h1>
            <p className="folder-detail-series">
              <Link href={`/series/${slug}`}>{series.title}</Link>
              <span className="folder-detail-count">{kathas.length} {kathas.length === 1 ? 'ਅਧਿਆਇ' : 'ਅਧਿਆਇ'}</span>
            </p>
          </div>
        </div>

        {kathas.length > 0 ? (
          <KathaList kathas={kathas} />
        ) : (
          <div className="empty-state">
            <h3>ਇਸ ਫੋਲਡਰ ਵਿੱਚ ਕੋਈ ਅਧਿਆਇ ਨਹੀਂ</h3>
          </div>
        )}
      </div>

      <style>{`
        .page-fade-in { animation: pageFadeIn 0.35s ease; }
        @keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .folder-detail-header {
          display: flex;
          align-items: center;
          gap: var(--space-6);
          margin-bottom: var(--space-8);
          padding: var(--space-6) var(--space-8);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          animation: folderHeadIn 0.4s ease 0.1s both;
        }
        @keyframes folderHeadIn { from { opacity: 0; transform: translateY(6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .folder-detail-icon {
          width: 64px;
          height: 56px;
          flex-shrink: 0;
        }

        .folder-detail-icon svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.1));
        }

        .folder-detail-title {
          font-family: var(--font-heading);
          font-size: var(--font-size-2xl);
          font-weight: 700;
          margin-bottom: var(--space-2);
        }

        .folder-detail-series {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
        }

        .folder-detail-series a {
          color: var(--color-primary);
          text-decoration: none;
        }

        .folder-detail-series a:hover {
          text-decoration: underline;
        }

        .folder-detail-count {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          background: var(--color-bg-secondary);
          padding: 2px 10px;
          border-radius: var(--radius-full);
        }

        .empty-state {
          text-align: center;
          padding: var(--space-16) 0;
        }
        .empty-state h3 { color: var(--color-text-muted); }

        @media (max-width: 768px) {
          .folder-detail-header { padding: var(--space-4); gap: var(--space-4); }
          .folder-detail-icon { width: 48px; height: 42px; }
          .folder-detail-title { font-size: var(--font-size-xl); }
        }
      `}</style>
    </div>
  );
}
