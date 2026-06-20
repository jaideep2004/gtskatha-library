import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import HeroSection from '@/components/home/HeroSection';
import ContinueListening from '@/components/home/ContinueListening';
import PopularSeries from '@/components/home/PopularSeries';
import RecentlyAdded from '@/components/home/RecentlyAdded';
import AudioThemes from '@/components/home/AudioThemes';
import { getRecentKathas, getFeaturedKathas } from '@/services/kathaService';
import { getAllSeries } from '@/services/seriesService';
import { getCategoriesWithCount } from '@/services/categoryService';
import { IKatha, ISeries } from '@/types';
import connectDB from '@/lib/db';
import HomepageConfig from '@/models/HomepageConfig';
import ContinueListeningModel from '@/models/ContinueListening';
import { authOptions } from '@/lib/auth';
import { serializeForClient } from '@/lib/serialize';

export const metadata: Metadata = {
  title: 'Sikh Katha Digital Library — Home',
  description: 'Discover Sikh kathas, gurbani vichar, and spiritual discourses by Bhai Sahib Ji.',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let recentKathas: IKatha[] = [];
  let heroKatha: IKatha | undefined;
  let series: ISeries[] = [];
  let continueItem: Parameters<typeof ContinueListening>[0]['item'];
  let dailyQuote: string | undefined;
  let categories: Array<{ _id: string; name: string; slug: string; kathaCount: number; audioCount: number; videoCount: number }> = [];

  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    const [recent, featured, allSeries, config, continueRaw, categoriesRaw] = await Promise.all([
      getRecentKathas(10),
      getFeaturedKathas(undefined, 1),
      getAllSeries(true),
      HomepageConfig.findOne()
        .populate('heroKatha', 'title slug type thumbnail duration audioUrl videoUrl authorName status published')
        .lean(),
      session?.user?.id
        ? ContinueListeningModel.findOne({ userId: session.user.id })
            .sort({ lastPlayedAt: -1 })
            .populate('kathaId', 'title slug type thumbnail authorName duration status published')
            .lean()
        : null,
      getCategoriesWithCount(),
    ]);

    recentKathas = recent as unknown as IKatha[];
    series = allSeries as unknown as ISeries[];
    categories = categoriesRaw as unknown as Array<{ _id: string; name: string; slug: string; kathaCount: number; audioCount: number; videoCount: number }>;

    const featuredKatha = (featured as unknown as IKatha[])[0];

    if (config?.heroKatha && typeof config.heroKatha === 'object' && isPublicKatha(config.heroKatha)) {
      heroKatha = config.heroKatha as unknown as IKatha;
    } else {
      heroKatha = featuredKatha;
    }
    dailyQuote = config?.quote;

    if (continueRaw?.kathaId && typeof continueRaw.kathaId === 'object' && isPublicKatha(continueRaw.kathaId)) {
      const k = (continueRaw.kathaId as unknown) as {
        title: string;
        slug: string;
        type: 'audio' | 'video';
        thumbnail?: string;
        authorName?: string;
        duration?: number;
      };
      continueItem = ({
        _id: String(continueRaw._id),
        userId: String(continueRaw.userId),
        kathaId: continueRaw.kathaId,
        lastPlayedAt: continueRaw.lastPlayedAt,
        currentTime: continueRaw.currentTime,
        duration: continueRaw.duration || k.duration || 0,
        katha: {
          title: k.title,
          slug: k.slug,
          type: k.type,
          thumbnail: k.thumbnail,
          authorName: k.authorName,
        },
      } as unknown) as typeof continueItem;
    }
  } catch {
    // Public sections render honest empty states when data is unavailable.
  }

  return (
    <div className="page-fade-in">
      <HeroSection heroKatha={heroKatha ? serializeForClient(heroKatha) : undefined} />
      <ContinueListening item={continueItem} dailyQuote={dailyQuote} />
      <PopularSeries series={series.length ? serializeForClient(series) : undefined} />
      <RecentlyAdded kathas={recentKathas.length ? recentKathas : undefined} />
      <AudioThemes categories={categories} />
    </div>
  );
}

function isPublicKatha(katha: unknown) {
  const item = katha as { status?: string; published?: boolean };
  if (item.status === 'archived') return false;
  return item.status === 'published' || (item.status === undefined && item.published === true);
}
