import type { Metadata } from 'next';
import KathaArchive from '@/components/archive/KathaArchive';
import { getKathas } from '@/services/kathaService';
import { getCategories } from '@/services/categoryService';
import { getAllSeries } from '@/services/seriesService';
import type { ICategory, IKatha, ISeries } from '@/types';
import { serializeForClient } from '@/lib/serialize';

export const metadata: Metadata = {
  title: 'ਵੀਡੀਓ ਕਥਾ ਭੰਡਾਰ',
  description: 'ਸਿੱਖ ਵੀਡੀਓ ਕਥਾ, ਆਤਮਕ ਵਿਚਾਰ, ਅਤੇ ਗੁਰਬਾਣੀ ਵਿਚਾਰ ਵੇਖੋ।',
};

interface Props {
  searchParams: Promise<{ q?: string; sort?: string; category?: string; series?: string; page?: string }>;
}

export default async function VideoPage({ searchParams }: Props) {
  const params = await searchParams;
  const sort = (params.sort as 'newest' | 'oldest' | 'popular' | 'featured') ?? 'newest';
  const page = Math.max(1, Number(params.page) || 1);
  const [result, categories, series] = await Promise.all([
    getKathas({ q: params.q, type: 'video', category: params.category, series: params.series, sort, page, limit: 12 }),
    getCategories(),
    getAllSeries(false),
  ]);

  return (
    <KathaArchive
      type="video"
      kathas={serializeForClient(result.data) as unknown as IKatha[]}
      categories={serializeForClient(categories) as unknown as ICategory[]}
      series={serializeForClient(series) as unknown as ISeries[]}
      total={result.total}
      page={result.page}
      totalPages={result.totalPages}
      query={{ q: params.q, category: params.category, series: params.series, sort }}
    />
  );
}
