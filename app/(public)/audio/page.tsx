import type { Metadata } from 'next';
import KathaArchive from '@/components/archive/KathaArchive';
import { getKathas, getKathaParentAssociations } from '@/services/kathaService';
import { getCategories } from '@/services/categoryService';
import { getAllSeries, getSeriesBySlug } from '@/services/seriesService';
import { getFoldersBySeries } from '@/services/folderService';
import type { ICategory, IKatha, ISeries, IFolder, IKathaParentAssociation } from '@/types';
import { serializeForClient } from '@/lib/serialize';

export const metadata: Metadata = {
  title: 'ਆਡੀਓ ਕਥਾ ਭੰਡਾਰ',
  description: 'ਸਿੱਖ ਆਡੀਓ ਕਥਾ, ਗੁਰਬਾਣੀ ਵਿਚਾਰ, ਅਤੇ ਆਤਮਕ ਸਿੱਖਿਆ ਸੁਣੋ।',
};

interface Props {
  searchParams: Promise<{ q?: string; sort?: string; category?: string; series?: string; page?: string }>;
}

export default async function AudioPage({ searchParams }: Props) {
  const params = await searchParams;
  const sort = (params.sort as 'newest' | 'oldest' | 'popular' | 'featured' | 'manual') ?? (params.series ? 'manual' : 'manual');
  const page = Math.max(1, Number(params.page) || 1);

  let folders: IFolder[] = [];
  let currentSeries: ISeries | null = null;

  if (params.series) {
    const seriesData = await getSeriesBySlug(params.series) as ISeries | null;
    if (seriesData) {
      currentSeries = serializeForClient(seriesData) as unknown as ISeries;
      const rawFolders = await getFoldersBySeries((seriesData as ISeries & { _id: string })._id);
      folders = serializeForClient(rawFolders) as unknown as IFolder[];
    }
  }

  const [result, categories, allSeries] = await Promise.all([
    getKathas({ q: params.q, type: 'audio', category: params.category, series: params.series, sort, page, limit: 24 }),
    getCategories(),
    getAllSeries(false),
  ]);

  const kathas = serializeForClient(result.data) as unknown as IKatha[];

  const kathaIds = kathas.map((k) => k._id);
  const assocMap = await getKathaParentAssociations(kathaIds);
  const parentAssociations = serializeForClient(
    Array.from(assocMap.entries()).map(([kathaId, assoc]) => ({
      kathaId,
      ...assoc,
    }))
  ) as unknown as IKathaParentAssociation[];

  const folderMap = new Map<string, IKatha[]>();
  const uncategorized: IKatha[] = [];
  if (folders.length > 0) {
    for (const k of kathas) {
      if (k.folderId) {
        const list = folderMap.get(k.folderId) ?? [];
        list.push(k);
        folderMap.set(k.folderId, list);
      } else {
        uncategorized.push(k);
      }
    }
  }

  return (
    <KathaArchive
      type="audio"
      kathas={kathas}
      categories={serializeForClient(categories) as unknown as ICategory[]}
      series={serializeForClient(allSeries) as unknown as ISeries[]}
      total={result.total}
      page={result.page}
      totalPages={result.totalPages}
      query={{ q: params.q, category: params.category, series: params.series, sort }}
      folders={folders.length > 0 ? folders : undefined}
      folderMap={folderMap.size > 0 ? Object.fromEntries(folderMap) : undefined}
      uncategorized={uncategorized.length > 0 ? uncategorized : undefined}
      currentSeries={currentSeries}
      parentAssociations={parentAssociations}
    />
  );
}
