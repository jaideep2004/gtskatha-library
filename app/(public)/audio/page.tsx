import type { Metadata } from 'next';
import KathaArchive from '@/components/archive/KathaArchive';
import { getKathas } from '@/services/kathaService';
import { getCategories } from '@/services/categoryService';
import { getAllSeries } from '@/services/seriesService';
import type { ICategory, IKatha, ISeries } from '@/types';

export const metadata: Metadata = {
  title: 'Audio Kathas Archive',
  description: 'Browse Sikh audio kathas, Gurbani discourses, and spiritual talks.',
};

interface Props {
  searchParams: Promise<{ q?: string; sort?: string; category?: string; series?: string; page?: string }>;
}

export default async function AudioPage({ searchParams }: Props) {
  const params = await searchParams;
  const sort = (params.sort as 'newest' | 'oldest' | 'popular' | 'featured') ?? 'newest';
  const page = Math.max(1, Number(params.page) || 1);
  const [result, categories, series] = await Promise.all([
    getKathas({ q: params.q, type: 'audio', category: params.category, series: params.series, sort, page, limit: 12 }),
    getCategories(),
    getAllSeries(false),
  ]);

  return (
    <KathaArchive
      type="audio"
      kathas={result.data as unknown as IKatha[]}
      categories={categories as unknown as ICategory[]}
      series={series as unknown as ISeries[]}
      total={result.total}
      page={result.page}
      totalPages={result.totalPages}
      query={{ q: params.q, category: params.category, series: params.series, sort }}
    />
  );
}
