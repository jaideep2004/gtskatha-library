import { Metadata } from 'next';
import Link from 'next/link';
import KathaGrid from '@/components/katha/KathaGrid';
import SearchForm from '@/components/layout/SearchForm';
import { getKathas } from '@/services/kathaService';
import { IKatha } from '@/types';
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
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q ?? '';
  const type = (params.type as 'audio' | 'video') || undefined;
  const sort = (params.sort as 'newest' | 'popular' | 'featured') ?? 'newest';
  const page = parseInt(params.page ?? '1');

  let kathas: IKatha[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const result = await getKathas({ q: q || undefined, type, sort, page, limit: 24 });
    kathas = serializeForClient(result.data) as unknown as IKatha[];
    total = result.total;
    totalPages = result.totalPages;
  } catch {
    // DB not connected
  }

  return (
    <div className="page-section page-fade-in">
      <div className="container">
        {/* <nav className="breadcrumb-premium" aria-label="Breadcrumb">
          <Link href="/" className="breadcrumb-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            Home
          </Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Search</span>
        </nav> */}

        <div className="search-header">
          <h1>{q ? `"${q}" ਲਈ ਨਤੀਜੇ` : 'ਕਥਾ ਖੋਜੋ'}</h1>
          <SearchForm defaultQ={q} />
        </div>

        {/* Filters */}
        <form className="search-filters" method="get">
          {q && <input type="hidden" name="q" value={q} />}
          <div className="filter-group">
            <label className="form-label" htmlFor="filter-type">ਕਿਸਮ</label>
            <select id="filter-type" name="type" className="input filter-select" defaultValue={type ?? ''}>
              <option value="">ਸਭ</option>
              <option value="audio">ਆਡੀਓ</option>
              <option value="video">ਵੀਡੀਓ</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label" htmlFor="filter-sort">ਕ੍ਰਮ</label>
            <select id="filter-sort" name="sort" className="input filter-select" defaultValue={sort}>
              <option value="newest">ਨਵੀਂ</option>
              <option value="popular">ਸਭ ਤੋਂ ਪ੍ਰਸਿੱਧ</option>
              <option value="featured">ਖਾਸ</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>
            ਫਿਲਟਰ ਲਗਾਓ
          </button>
        </form>

        <div className="search-results-info">
          {q ? (
            <p>{total > 0 ? `"${q}" ਲਈ ${total.toLocaleString()} ਨਤੀਜੇ` : `"${q}" ਲਈ ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ`}</p>
          ) : (
            <p>{total > 0 ? `${total.toLocaleString()} ਕਥਾਵਾਂ` : 'ਸਾਰੀਆਂ ਕਥਾਵਾਂ'}</p>
          )}
        </div>

        {kathas.length > 0 ? (
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
        .breadcrumb-premium {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-8);
          padding: var(--space-3) var(--space-4);
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          width: fit-content;
          border: 1px solid var(--color-border);
        }
        .breadcrumb-link {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--color-text-secondary);
          text-decoration: none;
          font-size: var(--font-size-sm);
          font-weight: 600;
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        .breadcrumb-link:hover {
          color: var(--color-primary);
          background: rgba(217, 140, 41, 0.08);
        }
        .breadcrumb-sep {
          color: var(--color-text-muted);
          font-weight: 300;
          font-size: var(--font-size-base);
        }
        .breadcrumb-current {
          font-size: var(--font-size-sm);
          color: var(--color-text-primary);
          font-weight: 700;
        }

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
          color: var(--color-text-muted);
          font-size: var(--font-size-md);
          margin-bottom: var(--space-2);
        }

        @media (max-width: 640px) {
          .search-filters { 
            flex-direction: column; 
            align-items: stretch;
            padding: var(--space-5);
          }
          .filter-group {
            width: 100%;
          }
          .filter-select {
            width: 100%;
          }
          .search-header h1 {
            font-size: var(--font-size-2xl);
          }
        }
      `}</style>
    </div>
  );
}
