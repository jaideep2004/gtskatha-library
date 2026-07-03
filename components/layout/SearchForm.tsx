'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { isSearchQueryReady, MIN_SEARCH_QUERY_LENGTH } from '@/lib/search';

export default function SearchForm({ defaultQ = '' }: { defaultQ?: string }) {
  const [query, setQuery] = useState(defaultQ);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSearchQueryReady(query)) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else if (!query.trim()) {
      router.push('/search');
    }
  }

  return (
    <form className="search-form-large" onSubmit={handleSubmit} role="search">
      <div className="search-input-wrap">
        <svg
          width="20" height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="search-form-icon"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="search"
          className="input search-input-large"
          placeholder="ਕਥਾ, ਵਿਸ਼ੇ, ਲੜੀਆਂ ਖੋਜੋ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="ਕਥਾ ਖੋਜੋ"
          minLength={MIN_SEARCH_QUERY_LENGTH}
          autoFocus={false}
        />
      </div>
      <button type="submit" className="btn btn-primary">ਖੋਜੋ</button>

      <style>{`
        .search-form-large {
          display: flex;
          gap: var(--space-3);
          max-width: 700px;
        }
        .search-input-wrap {
          position: relative;
          flex: 1;
        }
        .search-form-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
          pointer-events: none;
        }
        .search-input-large {
          padding-left: 44px;
        }
        @media (max-width: 480px) {
          .search-form-large { flex-direction: column; }
        }
      `}</style>
    </form>
  );
}
