import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { getPaathBySlug, getEntries } from '@/services/paathService';
import { getThumbnailUrl, formatDuration } from '@/lib/utils';
import { serializeForClient } from '@/lib/serialize';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const paath = await getPaathBySlug(slug);
  if (!paath) return { title: 'Paath Not Found' };
  return {
    title: paath.title,
    description: paath.description,
    openGraph: paath.thumbnail ? { images: [getThumbnailUrl(paath.thumbnail)] } : undefined,
  };
}

export default async function PaathDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const paath = await getPaathBySlug(slug);
  if (!paath || !paath.active) notFound();

  const rawEntries = await getEntries(String(paath._id));

  const entries = serializeForClient(rawEntries) as unknown as Array<{
    _id: string; order: number; title?: string;
    kathaId: { _id: string; title: string; slug: string; type: string; thumbnail?: string; duration?: number; authorName?: string } | null;
  }>;

  return (
    <div className="page-section">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">ਮੁੱਖ ਪੰਨਾ</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/paath">ਪਾਠ</Link>
          <span className="breadcrumb-sep">›</span>
          <span>{paath.title}</span>
        </nav>

        <div className="detail-header">
          <div className="detail-header-info">
            <h1 className="detail-title">{paath.title}</h1>
            {paath.description && <p className="detail-desc">{paath.description}</p>}
            <div className="detail-meta">
              <span>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
            </div>
            <div className="detail-actions">
              <FavoriteButton targetId={String(paath._id)} itemType="paath" variant="pill" size="sm" />
            </div>
          </div>
        </div>

        <div className="entries-section">
          <div className="entries-section-header">
            <h2>Entries</h2>
            <span className="entries-count">{entries.length} total</span>
          </div>

          {entries.length === 0 ? (
            <div className="empty-state">
              <p>No entries yet.</p>
            </div>
          ) : (
            <div className="entries-list">
              {entries.map((entry) => {
                const k = entry.kathaId;
                if (!k) return null;
                return (
                  <Link key={entry._id} href={`/audio/${k.slug}`} className="entry-item">
                    <span className="entry-order">{entry.order}</span>
                    <div className="entry-thumb">
                      {k.thumbnail ? (
                        <img src={getThumbnailUrl(k.thumbnail)} alt={k.title} />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--color-primary)' }}>
                          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                        </svg>
                      )}
                    </div>
                    <div className="entry-info">
                      <strong>{entry.title ?? k.title}</strong>
                      <small>{k.type.toUpperCase()} · {k.duration ? formatDuration(k.duration) : '—'} · {k.authorName ?? '—'}</small>
                    </div>
                    <span className="entry-play">▶</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .page-section { padding-top: var(--space-6); }
        .breadcrumb { margin-bottom: var(--space-6); color: var(--color-text-muted); font-size: var(--font-size-sm); }
        .breadcrumb a { color: var(--color-text-secondary); text-decoration: none; }
        .breadcrumb a:hover { color: var(--color-primary); }
        .breadcrumb-sep { margin: 0 var(--space-2); }
        .detail-header { margin-bottom: var(--space-8); }
        .detail-title { font-family: var(--font-heading); font-size: var(--font-size-4xl); font-weight: 700; margin-bottom: var(--space-3); }
        .detail-desc { color: var(--color-text-secondary); line-height: 1.65; max-width: 600px; margin-bottom: var(--space-4); }
        .detail-meta { display: flex; gap: var(--space-4); font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: var(--space-4); }
        .detail-actions { margin-top: var(--space-3); }
        .entries-section { margin-top: var(--space-4); }
        .entries-section-header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6); }
        .entries-section-header h2 { font-family: var(--font-heading); font-size: var(--font-size-2xl); font-weight: 700; }
        .entries-count { font-size: var(--font-size-sm); color: var(--color-text-muted); background: var(--color-bg-secondary); padding: 2px 10px; border-radius: var(--radius-full); }
        .entries-list { display: flex; flex-direction: column; gap: var(--space-3); }
        .entry-item { display: grid; grid-template-columns: 40px 56px 1fr 36px; gap: var(--space-3); align-items: center; padding: var(--space-3) var(--space-4); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); text-decoration: none; color: inherit; transition: all var(--transition-fast); }
        .entry-item:hover { border-color: var(--color-primary-light); box-shadow: var(--shadow-sm); }
        .entry-order { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 50%; background: var(--color-primary-alpha); color: var(--color-primary-dark); font-size: 13px; font-weight: 700; }
        .entry-thumb { height: 40px; border-radius: var(--radius-sm); overflow: hidden; background: var(--color-bg-secondary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .entry-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .entry-info { min-width: 0; }
        .entry-info strong { display: block; font-size: var(--font-size-sm); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .entry-info small { font-size: var(--font-size-xs); color: var(--color-text-muted); }
        .entry-play { width: 32px; height: 32px; display: grid; place-items: center; border: 1px solid var(--color-border); border-radius: 50%; font-size: 11px; color: var(--color-text-secondary); transition: all var(--transition-fast); }
        .entry-item:hover .entry-play { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-alpha); }
        .empty-state { text-align: center; padding: var(--space-16) 0; color: var(--color-text-muted); }
        @media (max-width: 640px) {
          .detail-title { font-size: var(--font-size-2xl); }
          .entry-item { grid-template-columns: 32px 44px 1fr 32px; padding: var(--space-2) var(--space-3); }
          .entry-order { width: 26px; height: 26px; font-size: 11px; }
          .entry-thumb { height: 32px; }
        }
      `}</style>
    </div>
  );
}
