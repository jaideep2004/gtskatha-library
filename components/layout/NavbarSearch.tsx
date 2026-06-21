'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getMediaUrl } from '@/lib/media';
import { isSearchQueryReady, MIN_SEARCH_QUERY_LENGTH } from '@/lib/search';

interface SearchResult {
  _id: string;
  title: string;
  slug: string;
  type: 'audio' | 'video';
  thumbnail?: string;
  authorName?: string;
}

interface NavbarSearchProps {
  mobile?: boolean;
  autoFocus?: boolean;
  onNavigate?: () => void;
}

export default function NavbarSearch({
  mobile = false,
  autoFocus = false,
  onNavigate,
}: NavbarSearchProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const trimmed = query.trim();
    if (!isSearchQueryReady(trimmed)) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=6`, {
          signal: controller.signal,
        });
        const payload = await response.json();
        if (response.ok && payload.success) {
          setResults(payload.data ?? []);
          setOpen(true);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);

  function navigateToSearch() {
    const trimmed = query.trim();
    if (!isSearchQueryReady(trimmed)) return;
    setOpen(false);
    onNavigate?.();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className={`nav-search-root ${mobile ? 'nav-search-mobile' : ''}`} ref={rootRef}>
      <form className="navbar-search-form" onSubmit={(event) => { event.preventDefault(); navigateToSearch(); }} role="search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="navbar-search-icon" aria-hidden>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="search"
          placeholder="Search kathas..."
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            if (!isSearchQueryReady(value)) {
              setResults([]);
              setLoading(false);
              setOpen(false);
            }
          }}
          onFocus={() => isSearchQueryReady(query) && setOpen(true)}
          className="navbar-search-input"
          aria-label="Search kathas"
          aria-controls="navbar-search-results"
          minLength={MIN_SEARCH_QUERY_LENGTH}
          autoComplete="off"
          autoFocus={autoFocus}
        />
      </form>

      {open && (
        <div className="nav-search-results" id="navbar-search-results">
          <div className="nav-search-heading">
            <span>{loading ? 'Searching…' : 'Search results'}</span>
            {!loading && results.length > 0 && <small>{results.length} shown</small>}
          </div>
          {!loading && results.map((item) => (
            <Link
              key={item._id}
              href={`/${item.type}/${item.slug}`}
              className="nav-search-result"
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
            >
              <span className="nav-search-thumb">
                {item.thumbnail
                  ? <img src={getMediaUrl('thumbnails', item.thumbnail)} alt="" />
                  : <b aria-hidden>☬</b>}
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.authorName || `${item.type} katha`}</small>
              </span>
              <em>{item.type}</em>
            </Link>
          ))}
          {!loading && !results.length && (
            <p className="nav-search-empty">No matching kathas found.</p>
          )}
          <button type="button" className="nav-search-all" onClick={navigateToSearch}>
            View all results
          </button>
        </div>
      )}

      <style>{`
        .nav-search-root{position:relative}
        .nav-search-results{
          position:absolute;top:calc(100% + 10px);right:0;width:min(390px,calc(100vw - 32px));
          padding:8px;background:#fff;border:1px solid #e6e1d8;border-radius:8px;
          box-shadow:0 18px 48px rgba(20,25,34,.16);z-index:1200
        }
        .nav-search-heading{display:flex;align-items:center;justify-content:space-between;padding:8px 10px 10px;color:#747b86;font-size:11px;text-transform:uppercase}
        .nav-search-heading small{font-size:10px;text-transform:none}
        .nav-search-result{display:grid;grid-template-columns:52px 1fr auto;gap:11px;align-items:center;padding:8px;border-radius:7px;color:#172033}
        .nav-search-result:hover,.nav-search-result:focus-visible{background:#fbf5eb}
        .nav-search-thumb{width:52px;height:42px;overflow:hidden;border-radius:6px;background:#152235;color:#d99525;display:grid;place-items:center}
        .nav-search-thumb img{width:100%;height:100%;object-fit:cover}
        .nav-search-result strong,.nav-search-result small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .nav-search-result strong{font-size:13px}.nav-search-result small{font-size:11px;color:#767d87;margin-top:3px}
        .nav-search-result em{font-style:normal;font-size:9px;text-transform:uppercase;padding:4px 6px;border-radius:4px;background:#f6ead7;color:#bd700b}
        .nav-search-empty{padding:20px 10px;text-align:center;color:#747b86;font-size:13px}
        .nav-search-all{width:100%;min-height:38px;margin-top:4px;border-top:1px solid #eee8df;color:#bd700b;font-size:12px;font-weight:700}
        .nav-search-mobile .navbar-search-form{width:100%;height:46px;border-radius:12px;box-shadow:0 6px 20px rgba(25,34,47,.07)}
        .nav-search-mobile .navbar-search-input{width:100%;font-size:14px}
        .nav-search-mobile .nav-search-results{position:static;width:100%;max-height:min(430px,55vh);overflow-y:auto;margin-top:8px;box-shadow:none;border-radius:12px}
      `}</style>
    </div>
  );
}
