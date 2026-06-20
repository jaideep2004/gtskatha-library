import type { Metadata } from 'next';
import SeriesArchive from '@/components/archive/SeriesArchive';
import { getAllSeries, getSeriesEpisodeCounts } from '@/services/seriesService';
import type { ISeries } from '@/types';

export const metadata: Metadata = {
  title: 'Series Archive',
  description: 'Browse curated series of Sikh kathas and Gurbani discourses.',
};

interface Props {
  searchParams: Promise<{ q?: string; sort?: string }>;
}

export default async function SeriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const [rawSeries, episodeCounts] = await Promise.all([
    getAllSeries(false),
    getSeriesEpisodeCounts(),
  ]);
  let series = rawSeries as unknown as ISeries[];
  const q = params.q?.trim().toLocaleLowerCase();
  if (q) {
    series = series.filter((item) =>
      `${item.title} ${item.description ?? ''}`.toLocaleLowerCase().includes(q)
    );
  }
  if (params.sort === 'featured') {
    series = [...series].sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  return <SeriesArchive series={series} episodeCounts={episodeCounts} q={params.q} />;
}
