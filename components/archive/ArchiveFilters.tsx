'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ICategory, ISeries } from '@/types';

interface ArchiveFiltersProps {
  type: 'audio' | 'video';
  categories: ICategory[];
  series: ISeries[];
  query: {
    q?: string;
    category?: string;
    series?: string;
    sort?: string;
  };
}

export default function ArchiveFilters({ type, categories, series, query }: ArchiveFiltersProps) {
  const router = useRouter();

  function updateFilter(key: 'category' | 'series' | 'sort', value: string) {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);

    const next = {
      category: query.category ?? '',
      series: query.series ?? '',
      sort: query.sort ?? 'newest',
      [key]: value,
    };

    if (next.category) params.set('category', next.category);
    if (next.series) params.set('series', next.series);
    if (next.sort && next.sort !== 'newest') params.set('sort', next.sort);

    const qs = params.toString();
    router.push(qs ? `/${type}?${qs}` : `/${type}`);
  }

  return (
    <aside className="archive-filters">
      <div className="archive-filter-head">
        <h2>Filters</h2>
        <Link href={`/${type}`}>Reset</Link>
      </div>
      <form>
        <fieldset>
          <legend>Category</legend>
          <label>
            <input
              type="radio"
              name="category"
              value=""
              checked={!query.category}
              onChange={(event) => updateFilter('category', event.target.value)}
            />{' '}
            All categories
          </label>
          {categories.map((category) => (
            <label key={category._id}>
              <input
                type="radio"
                name="category"
                value={category.slug}
                checked={query.category === category.slug}
                onChange={(event) => updateFilter('category', event.target.value)}
              />
              {category.name}
            </label>
          ))}
        </fieldset>
        <label className="archive-select-label">
          Series
          <select
            name="series"
            value={query.series ?? ''}
            onChange={(event) => updateFilter('series', event.target.value)}
          >
            <option value="">All series</option>
            {series.map((item) => (
              <option key={item._id} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label className="archive-select-label">
          Sort by
          <select
            name="sort"
            value={query.sort ?? 'newest'}
            onChange={(event) => updateFilter('sort', event.target.value)}
          >
            <option value="newest">Latest first</option>
            <option value="popular">Most popular</option>
            <option value="featured">Featured</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </form>
    </aside>
  );
}
