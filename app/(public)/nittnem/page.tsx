import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllNittnems } from '@/services/nittnemService';
import { getThumbnailUrl } from '@/lib/utils';
import { serializeForClient } from '@/lib/serialize';

export const metadata: Metadata = {
  title: 'ਨਿਤਨੇਮ',
  description: 'ਨਿਤਨੇਮ ਦੀਆਂ ਬਾਣੀਆਂ ਵੇਖੋ ਅਤੇ ਸੁਣੋ।',
};

export default async function NittnemListPage() {
  const lists = serializeForClient(await getAllNittnems()) as unknown as Array<{
    _id: string; title: string; slug: string; description?: string; thumbnail?: string; entryCount: number; active: boolean;
  }>;
  const activeLists = lists.filter((n) => n.active);

  return (
    <div className="page-section">
      <div className="container">
        <div className="list-page-header">
          <h1 className="list-page-title">ਨਿਤਨੇਮ</h1>
          <p className="list-page-sub">ਨਿਤਨੇਮ ਦੀਆਂ ਬਾਣੀਆਂ</p>
        </div>

        <div className="list-page-grid">
          {activeLists.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <p>ਕੋਈ ਨਿਤਨੇਮ ਉਪਲਬਧ ਨਹੀਂ ਹਨ।</p>
            </div>
          ) : activeLists.map((n) => (
            <Link key={n._id} href={`/nittnem/${n.slug}`} className="list-page-card">
              <div className="list-page-card-thumb">
                {n.thumbnail ? (
                  <img src={getThumbnailUrl(n.thumbnail)} alt={n.title} />
                ) : (
                  <span>☬</span>
                )}
              </div>
              <div className="list-page-card-body">
                <h3>{n.title}</h3>
                {n.description && <p>{n.description}</p>}
              </div>
              <div className="list-page-card-footer">
                <span className="count-badge">{n.entryCount} {n.entryCount === 1 ? 'entry' : 'entries'}</span>
                <span className="list-page-card-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .page-section { padding-top: var(--space-8); }
        .list-page-header { margin-bottom: var(--space-8); }
        .list-page-title { font-family: var(--font-heading); font-size: var(--font-size-4xl); font-weight: 700; margin-bottom: var(--space-2); }
        .list-page-sub { color: var(--color-text-secondary); }
        .list-page-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-4); }
        .list-page-card { display: flex; flex-direction: column; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; text-decoration: none; color: inherit; transition: all var(--transition-base); }
        .list-page-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--color-primary-light); }
        .list-page-card-thumb { height: 120px; background: linear-gradient(135deg, #1e1a10, #2d2510); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .list-page-card-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .list-page-card-thumb span { font-size: 48px; color: var(--color-primary); }
        .list-page-card-body { padding: var(--space-4); flex: 1; }
        .list-page-card-body h3 { font-family: var(--font-heading); font-size: var(--font-size-lg); font-weight: 700; margin-bottom: var(--space-2); }
        .list-page-card-body p { font-size: var(--font-size-sm); color: var(--color-text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .list-page-card-footer { display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) var(--space-4); border-top: 1px solid var(--color-border-light); }
        .count-badge { font-size: 12px; color: var(--color-text-muted); background: var(--color-bg-secondary); padding: 2px 10px; border-radius: var(--radius-full); }
        .list-page-card-arrow { color: var(--color-primary); font-size: 18px; }
        .empty-state { text-align: center; padding: var(--space-16) 0; color: var(--color-text-muted); }
        @media (max-width: 640px) { .list-page-grid { grid-template-columns: 1fr; } .list-page-title { font-size: var(--font-size-2xl); } }
      `}</style>
    </div>
  );
}
