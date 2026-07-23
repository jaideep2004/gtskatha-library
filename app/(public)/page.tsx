import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import HeroSection from '@/components/home/HeroSection';
import ContinueListening from '@/components/home/ContinueListening';
import PopularSeries from '@/components/home/PopularSeries';
import PaathNittnemSection from '@/components/home/PaathNittnemSection';
import AudioThemes from '@/components/home/AudioThemes';
import { getFeaturedKathas } from '@/services/kathaService';
import { getAllSeries } from '@/services/seriesService';
import { getAllPaaths } from '@/services/paathService';
import { getAllNittnems } from '@/services/nittnemService';
import { IKatha, ISeries } from '@/types';
import connectDB from '@/lib/db';
import HomepageConfig from '@/models/HomepageConfig';
import ContinueListeningModel from '@/models/ContinueListening';
import { authOptions } from '@/lib/auth';
import { serializeForClient } from '@/lib/serialize';

export const metadata: Metadata = {
  title: 'ਸਿੱਖ ਕਥਾ ਡਿਜੀਟਲ ਲਾਇਬ੍ਰੇਰੀ',
  description: 'ਭਾਈ ਸਾਹਿਬ ਜੀ ਦੀ ਸਿੱਖ ਕਥਾ, ਗੁਰਬਾਣੀ ਵਿਚਾਰ, ਅਤੇ ਆਤਮਕ ਸਿੱਖਿਆ ਖੋਜੋ।',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let heroKatha: IKatha | undefined;
  let series: ISeries[] = [];
  let continueItem: Parameters<typeof ContinueListening>[0]['item'];
  let dailyQuote: string | undefined;
  let paathData: Array<{ _id: string; title: string; slug: string; description?: string; entryCount: number }> = [];
  let nittnemData: Array<{ _id: string; title: string; slug: string; description?: string; entryCount: number }> = [];

  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    const [featured, allSeries, config, continueRaw, paaths, nittnems] = await Promise.all([
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
      getAllPaaths(),
      getAllNittnems(),
    ]);

    series = allSeries as unknown as ISeries[];
    paathData = paaths as unknown as typeof paathData;
    nittnemData = nittnems as unknown as typeof nittnemData;

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
      <ContinueListening item={continueItem ? serializeForClient(continueItem) : undefined} dailyQuote={dailyQuote} />
      <PopularSeries series={series.length ? serializeForClient(series) : undefined} />
      <PaathNittnemSection
        paaths={paathData.length ? serializeForClient(paathData) : undefined}
        nittnems={nittnemData.length ? serializeForClient(nittnemData) : undefined}
      />
      <AudioThemes
        paathData={paathData.length ? serializeForClient(paathData) : undefined}
        nittnemData={nittnemData.length ? serializeForClient(nittnemData) : undefined}
      />
    </div>
  );
}

function isPublicKatha(katha: unknown) {
  const item = katha as { status?: string; published?: boolean };
  if (item.status === 'archived') return false;
  return item.status === 'published' || (item.status === undefined && item.published === true);
}
