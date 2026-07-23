import { Metadata } from 'next';
import Link from 'next/link';
import KathaGrid from '@/components/katha/KathaGrid';
import KathaList from '@/components/katha/KathaList';
import SearchForm from '@/components/layout/SearchForm';
import { getKathas } from '@/services/kathaService';
import { getAllSeries } from '@/services/seriesService';
import { getFoldersBySeries } from '@/services/folderService';
import { IKatha, IFolder } from '@/types';
import { serializeForClient } from '@/lib/serialize';

export const metadata: Metadata = {
  title: 'ਕਥਾ ਖੋਜੋ',
  description: 'ਸਿੱਖ ਕਥਾ, ਲੜੀਆਂ, ਅਤੇ ਵਿਸ਼ੇ ਖੋਜੋ।',
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    sort?: string;
    series?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q ?? '';
  const type = (params.type as 'audio' | 'video') || undefined;
  const sort = (params.sort as 'newest' | 'popular' | 'featured') ?? 'newest';
  const seriesSlug = params.series ?? '';
  const page = parseInt(params.page ?? '1');

  const allSeries = await getAllSeries(false);
  const seriesList = serializeForClient(allSeries) as unknown as Array<{ _id: string; title: string; slug: string }>;
  const activeSeries = seriesSlug ? seriesList.find((s) => s.slug === seriesSlug) : null;

  let folders: IFolder[] = [];
  const folderMap = new Map<string, IKatha[]>();
  const uncategorized: IKatha[] = [];
  let kathas: IKatha[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    if (activeSeries) {
      const [rawFolders, kathaResult] = await Promise.all([
        getFoldersBySeries(activeSeries._id),
        getKathas({ q: q || undefined, series: activeSeries._id, type, sort: 'manual', limit: 5000, includeUnpublished: true }),
      ]);
      folders = serializeForClient(rawFolders) as unknown as IFolder[];
      const allKathas = serializeForClient(kathaResult.data) as unknown as IKatha[];
      total = kathaResult.total ?? allKathas.length;

      for (const k of allKathas) {
        if (k.folderId) {
          const list = folderMap.get(k.folderId) ?? [];
          list.push(k);
          folderMap.set(k.folderId, list);
        } else {
          uncategorized.push(k);
        }
      }
    } else {
      const result = await getKathas({ q: q || undefined, type, sort, page, limit: 24 });
      kathas = serializeForClient(result.data) as unknown as IKatha[];
      total = result.total;
      totalPages = result.totalPages;
    }
  } catch {
    // DB not connected
  }

  return (
    <div className="page-section page-fade-in">
      <div className="container">
        <div className="search-header">
          <h1>{q ? `"${q}" ਲਈ ਨਤੀਜੇ` : 'ਕਥਾ ਖੋਜੋ'}</h1>
          <SearchForm defaultQ={q} />
        </div>

        <form className="search-filters" method="get">
          {q && <input type="hidden" name="q" value={q} />}
          <div className="filter-group">
            <label className="form-label" htmlFor="filter-series">ਲੜੀ</label>
            <select id="filter-series" name="series" className="input filter-select" defaultValue={seriesSlug}>
              <option value="">ਸਭ ਲੜੀਆਂ</option>
              {seriesList.filter((s) => s.title).map((s) => (
                <option key={s._id} value={s.slug}>{s.title}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label" htmlFor="filter-type">ਕਿਸਮ</label>
            <select id="filter-type" name="type" className="input filter-select" defaultValue={type ?? ''}>
              <option value="">ਸਭ</option>
              <option value="audio">ਆਡੀਓ</option>
              <option value="video">ਵੀਡੀਓ</option>
            </select>
          </div>
          {!activeSeries && (
            <div className="filter-group">
              <label className="form-label" htmlFor="filter-sort">ਕ੍ਰਮ</label>
              <select id="filter-sort" name="sort" className="input filter-select" defaultValue={sort}>
                <option value="newest">ਨਵੀਂ</option>
                <option value="popular">ਸਭ ਤੋਂ ਪ੍ਰਸਿੱਧ</option>
                <option value="featured">ਖਾਸ</option>
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>
            ਫਿਲਟਰ ਲਗਾਓ
          </button>
        </form>

        {activeSeries && (
          <div className="series-context-bar">
            <Link href={`/series/${activeSeries.slug}`} className="series-context-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5m7-7-7 7 7 7"/>
              </svg>
              {activeSeries.title} &#8594;
            </Link>
            <span className="series-context-count">{total.toLocaleString()} {total === 1 ? 'ਅਧਿਆਇ' : 'ਅਧਿਆਇ'}</span>
          </div>
        )}

        <div className="search-results-info">
          {activeSeries ? (
            <p>{total > 0 ? `${total.toLocaleString()} ਅਧਿਆਇ` : 'ਕੋਈ ਅਧਿਆਇ ਨਹੀਂ'}</p>
          ) : q ? (
            <p>{total > 0 ? `"${q}" ਲਈ ${total.toLocaleString()} ਨਤੀਜੇ` : `"${q}" ਲਈ ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ`}</p>
          ) : (
            <p>{total > 0 ? `${total.toLocaleString()} ਕਥਾਵਾਂ` : 'ਸਾਰੀਆਂ ਕਥਾਵਾਂ'}</p>
          )}
        </div>

        {total > 0 ? (
          activeSeries ? (
            <div className="series-folder-results">
              {folders.map((folder) => {
                const fk = folderMap.get(folder._id) ?? [];
                if (fk.length === 0) return null;
                return (
                  <div key={folder._id} className="search-folder-section">
                    <div className="search-folder-header">
                      <Link href={`/series/${activeSeries.slug}/folder/${folder._id}`} className="search-folder-title">
                        <svg width="16" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 12a4 4 0 0 1 4-4h11.5l4 4H38a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V12z" fill="#FFB900"/>
                          <path d="M6 14a4 4 0 0 1 4-4h11.5l4 4H38a4 4 0 0 1 4 4v2H6v-6z" fill="#FFD144" opacity="0.7"/>
                        </svg>
                        {folder.title}
                      </Link>
                      <span className="search-folder-count">{fk.length} {fk.length === 1 ? 'ਅਧਿਆਇ' : 'ਅਧਿਆਇ'}</span>
                    </div>
                    <KathaList kathas={fk} />
                  </div>
                );
              })}
              {uncategorized.length > 0 && (
                <div className="search-folder-section">
                  <div className="search-folder-header">
                    <span className="search-folder-title">
                      <svg width="16" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 12a4 4 0 0 1 4-4h11.5l4 4H38a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V12z" fill="var(--color-text-muted)"/>
                        <path d="M6 14a4 4 0 0 1 4-4h11.5l4 4H38a4 4 0 0 1 4 4v2H6v-6z" fill="var(--color-text-muted)" opacity="0.5"/>
                      </svg>
                      ਹੋਰ
                    </span>
                    <span className="search-folder-count">{uncategorized.length} {uncategorized.length === 1 ? 'ਅਧਿਆਇ' : 'ਅਧਿਆਇ'}</span>
                  </div>
                  <KathaList kathas={uncategorized} />
                </div>
              )}
            </div>
          ) : (
            <>
              <KathaGrid kathas={kathas} columns={4} />
              {totalPages > 1 && (
                <div className="pagination">
                  {page > 1 && (
                    <Link
                      href={`/search?q=${q}&type=${type ?? ''}&sort=${sort}&page=${page - 1}`}
                      className="btn btn-outline btn-sm"
                    >
                      ← Previous
                    </Link>
                  )}
                  <span className="pagination-info">ਪੰਨਾ {page} / {totalPages}</span>
                  {page < totalPages && (
                    <Link
                      href={`/search?q=${q}&type=${type ?? ''}&sort=${sort}&page=${page + 1}`}
                      className="btn btn-outline btn-sm"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          )
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>{q ? `"${q}" ਲਈ ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ` : 'ਕੋਈ ਕਥਾ ਨਹੀਂ ਲੱਭੀ'}</h3>
            <p>ਹੋਰ ਸ਼ਬਦਾਂ ਨਾਲ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ ਵਰਗ ਅਨੁਸਾਰ ਵੇਖੋ।</p>
            <Link href="/audio" className="btn btn-primary" style={{ marginTop: 'var(--space-5)', display: 'inline-flex' }}>
              ਆਡੀਓ ਕਥਾ ਵੇਖੋ
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .search-header {
          margin-bottom: var(--space-8);
        }
        .search-header h1 {
          margin-bottom: var(--space-5);
          font-size: var(--font-size-3xl);
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .search-filters {
          display: flex;
          gap: var(--space-4);
          align-items: flex-end;
          margin-bottom: var(--space-6);
          flex-wrap: wrap;
          padding: 20px 0px 10px 20px;
          background: linear-gradient(135deg, rgba(217, 140, 41, 0.03) 0%, rgba(200, 151, 42, 0.01) 100%);
          border-radius: var(--radius-xl);
          border: 1px solid rgba(217, 140, 41, 0.08);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .form-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-text-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .filter-select {
          font-weight: 600;
          min-width: 140px;
        }

        .series-context-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
          box-shadow: var(--shadow-sm);
        }
        .series-context-link {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--color-primary);
          font-weight: 600;
          font-size: var(--font-size-sm);
          text-decoration: none;
        }
        .series-context-link:hover {
          text-decoration: underline;
        }
        .series-context-count {
          margin-left: auto;
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          background: var(--color-bg-secondary);
          padding: 2px 10px;
          border-radius: var(--radius-full);
        }

        .search-results-info {
          margin-bottom: var(--space-8);
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          font-weight: 600;
          padding: var(--space-3) var(--space-4);
          background: var(--color-surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          width: fit-content;
        }

        .series-folder-results {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .search-folder-section {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
          box-shadow: var(--shadow-sm);
          transition: box-shadow 0.2s ease;
        }
        .search-folder-section:hover {
          box-shadow: var(--shadow-md);
        }

        .search-folder-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
          padding-bottom: var(--space-3);
          border-bottom: 1px solid var(--color-border);
        }
        .search-folder-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-family: var(--font-heading);
          font-size: var(--font-size-base);
          font-weight: 600;
          color: var(--color-text-primary);
          text-decoration: none;
          flex: 1;
          min-width: 0;
        }
        .search-folder-title:hover {
          color: var(--color-primary);
        }
        .search-folder-count {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          background: var(--color-bg-secondary);
          padding: 2px 10px;
          border-radius: var(--radius-full);
          flex-shrink: 0;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-5);
          margin-top: var(--space-12);
          padding: var(--space-6) 0;
        }
        .pagination-info {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          font-weight: 600;
          padding: 0 var(--space-4);
        }
        .pagination .btn {
          box-shadow: var(--shadow-sm);
        }
        .pagination .btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .empty-state {
          text-align: center;
          padding: var(--space-24) 0;
          background: linear-gradient(135deg, rgba(217, 140, 41, 0.03) 0%, rgba(200, 151, 42, 0.01) 100%);
          border-radius: var(--radius-2xl);
          border: 2px dashed var(--color-border);
        }
        .empty-state-icon {
          font-size: 80px;
          margin-bottom: var(--space-6);
          filter: grayscale(0.3);
        }
        .empty-state h3 {
          margin-bottom: var(--space-3);
          font-size: var(--font-size-xl);
          font-weight: 700;
        }
        .empty-state p {
          color: var(--color-text-secondary);
          font-size: var(--font-size-md);
          margin-bottom: var(--space-2);
        }

        @media (max-width: 640px) {
          .search-filters {
            flex-direction: column;
            align-items: stretch;
            padding: var(--space-5);
          }
          .filter-group { width: 100%; }
          .filter-select { width: 100%; }
          .search-header h1 { font-size: var(--font-size-2xl); }
        }
      `}</style>
    </div>
  );
}
