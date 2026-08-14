import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FavoriteButton from '@/components/ui/FavoriteButton';
import KathaList, { ListKatha } from '@/components/katha/KathaList';
import PaginationControls from '@/components/katha/PaginationControls';
import { getNittnemBySlug, getEntries } from '@/services/nittnemService';
import { getThumbnailUrl } from '@/lib/utils';
import { serializeForClient } from '@/lib/serialize';
import { PAGE_SIZES, parsePage, parsePageSize } from '@/lib/pagination';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[]; size?: string | string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const nittnem = await getNittnemBySlug(slug);
  if (!nittnem) return { title: 'Nitnem Not Found' };
  return {
    title: nittnem.title,
    description: nittnem.description,
    openGraph: nittnem.thumbnail ? { images: [getThumbnailUrl(nittnem.thumbnail)] } : undefined,
  };
}

export default async function NittnemDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: rawPage, size: rawSize } = await searchParams;
  const page = parsePage(rawPage);
  const size = parsePageSize(rawSize);

  const nittnem = await getNittnemBySlug(slug);
  if (!nittnem || !nittnem.active) notFound();

  const rawEntries = await getEntries(String(nittnem._id));

  const entries = serializeForClient(rawEntries) as unknown as Array<{
    _id: string; order: number; title?: string;
    kathaId: { _id: string; title: string; slug: string; type: string; thumbnail?: string; duration?: number; authorName?: string } | null;
  }>;

  const allKathas: ListKatha[] = entries
    .filter((entry) => entry.kathaId)
    .map((entry) => {
      const k = entry.kathaId as NonNullable<typeof entry.kathaId>;
      return {
        _id: k._id,
        title: entry.title ?? k.title,
        slug: k.slug,
        type: k.type as 'audio' | 'video',
        thumbnail: k.thumbnail,
        duration: k.duration,
        authorName: k.authorName,
        sortOrder: entry.order,
      };
    });

  const totalPages = Math.max(1, Math.ceil(allKathas.length / size));
  const safePage = Math.min(page, totalPages);
  const pageKathas = allKathas.slice((safePage - 1) * size, safePage * size);

  return (
    <div className="page-section">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">ਮੁੱਖ ਪੰਨਾ</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/nittnem">ਨਿਤਨੇਮ</Link>
          <span className="breadcrumb-sep">›</span>
          <span>{nittnem.title}</span>
        </nav>

        <div className="detail-header">
          {nittnem.thumbnail && (
            <div className="detail-artwork">
              <img src={getThumbnailUrl(nittnem.thumbnail)} alt={nittnem.title} />
            </div>
          )}
          <div className="detail-header-info">
            <h1 className="detail-title">{nittnem.title}</h1>
            {nittnem.description && <p className="detail-desc">{nittnem.description}</p>}
            <div className="detail-meta">
              <span>{allKathas.length} {allKathas.length === 1 ? 'entry' : 'entries'}</span>
            </div>
            <div className="detail-actions">
              <FavoriteButton targetId={String(nittnem._id)} itemType="nittnem" variant="pill" size="sm" />
            </div>
          </div>
        </div>

        <div className="entries-section">
          <div className="entries-section-header">
            <h2>Entries</h2>
            <span className="entries-count">{allKathas.length} total</span>
          </div>

          {allKathas.length === 0 ? (
            <div className="empty-state">
              <p>No entries yet.</p>
            </div>
          ) : (
            <>
              <KathaList kathas={pageKathas} playAllKathas={allKathas} />
              <PaginationControls
                basePath={`/nittnem/${slug}`}
                page={safePage}
                size={size}
                total={allKathas.length}
                totalPages={totalPages}
                sizes={[...PAGE_SIZES]}
              />
            </>
          )}
        </div>
      </div>

      <style>{`
        .page-section { padding-top: var(--space-6); }
        .breadcrumb { margin-bottom: var(--space-6); color: var(--color-text-muted); font-size: var(--font-size-sm); }
        .breadcrumb a { color: var(--color-text-secondary); text-decoration: none; }
        .breadcrumb a:hover { color: var(--color-primary); }
        .breadcrumb-sep { margin: 0 var(--space-2); }
        .detail-header { display: flex; gap: var(--space-8); margin-bottom: var(--space-8); align-items: flex-start; }
        .detail-artwork { width: 180px; flex-shrink: 0; border-radius: var(--radius-lg); overflow: hidden; background: var(--color-bg-secondary); box-shadow: var(--shadow-md); }
        .detail-artwork img { width: 100%; display: block; }
        .detail-title { font-family: var(--font-heading); font-size: var(--font-size-4xl); font-weight: 700; margin-bottom: var(--space-3); }
        .detail-desc { color: var(--color-text-secondary); line-height: 1.65; max-width: 600px; margin-bottom: var(--space-4); }
        .detail-meta { display: flex; gap: var(--space-4); font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: var(--space-4); }
        .detail-actions { margin-top: var(--space-3); }
        .entries-section { margin-top: var(--space-4); }
        .entries-section-header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6); }
        .entries-section-header h2 { font-family: var(--font-heading); font-size: var(--font-size-2xl); font-weight: 700; }
        .entries-count { font-size: var(--font-size-sm); color: var(--color-text-muted); background: var(--color-bg-secondary); padding: 2px 10px; border-radius: var(--radius-full); }
        .empty-state { text-align: center; padding: var(--space-16) 0; color: var(--color-text-muted); }
        @media (max-width: 640px) {
          .detail-title { font-size: var(--font-size-2xl); }
        }
      `}</style>
    </div>
  );
}
