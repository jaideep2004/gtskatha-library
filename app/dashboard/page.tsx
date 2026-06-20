import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Favorite from '@/models/Favorite';
import ContinueListening from '@/models/ContinueListening';
import UserNotification from '@/models/UserNotification';
import Notification from '@/models/Notification';
import Katha from '@/models/Katha';
import Series from '@/models/Series';
import Category from '@/models/Category';
import { formatDuration, getProgress } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media';
import NotificationList from '@/components/dashboard/NotificationList';

export const metadata = {
  title: 'Dashboard',
  description: 'Your Sikh Katha library dashboard.',
};

function UserStatIcon({ tone }: { tone: string }) {
  if (tone === 'violet') return <svg viewBox="0 0 24 24"><rect x="3" y="6" width="14" height="12" rx="2"/><path d="m17 10 4-2v8l-4-2"/></svg>;
  if (tone === 'green') return <svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4V3Z"/></svg>;
  if (tone === 'gold') return <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
  if (tone === 'blue') return <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M10 20h4"/></svg>;
  return <svg viewBox="0 0 24 24"><path d="M4 14v-3a8 8 0 0 1 16 0v3"/><path d="M4 14h3v6H5a1 1 0 0 1-1-1v-5Zm16 0h-3v6h2a1 1 0 0 0 1-1v-5Z"/></svg>;
}

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;
  await connectDB();

  const published: Record<string, unknown> = {
    $or: [{ status: 'published' }, { status: { $exists: false }, published: true }],
  };
  const [
    audioCount,
    videoCount,
    favoriteCount,
    continueItems,
    recentKathas,
    popularSeries,
    categories,
    notifications,
    readReceipts,
  ] = await Promise.all([
    Katha.countDocuments({ ...published, type: 'audio' }),
    Katha.countDocuments({ ...published, type: 'video' }),
    Favorite.countDocuments({ userId }),
    ContinueListening.find({ userId, completed: { $ne: true } })
      .sort({ lastPlayedAt: -1 }).limit(4)
      .populate('kathaId', 'title slug type thumbnail duration seriesId authorName').lean(),
    Katha.find(published).sort({ createdAt: -1 }).limit(5)
      .populate('seriesId', 'title').lean(),
    Series.find({ archived: { $ne: true } }).sort({ featured: -1, sortOrder: 1 }).limit(4).lean(),
    Category.find({ archived: { $ne: true } }).sort({ name: 1 }).limit(5).lean(),
    Notification.find().sort({ createdAt: -1 }).limit(4).lean(),
    UserNotification.find({ userId, isRead: true }).select('notificationId').lean(),
  ]);

  const readIds = new Set(readReceipts.map((item) => String(item.notificationId)));
  const unreadCount = Math.max(0, await Notification.countDocuments() - readIds.size);

  const stats = [
    { label: 'Audio Kathas', value: audioCount, tone: 'orange', subtitle: 'Total available' },
    { label: 'Video Kathas', value: videoCount, tone: 'violet', subtitle: 'Total available' },
    { label: 'My Library', value: favoriteCount, tone: 'green', subtitle: 'Saved kathas' },
    { label: 'Continue Listening', value: continueItems.length, tone: 'gold', subtitle: 'In progress' },
    { label: 'Notifications', value: unreadCount, tone: 'blue', subtitle: 'New updates' },
  ];

  return (
    <main className="ud-page">
      <section className="ud-stats">
        {stats.map((stat) => (
          <article key={stat.label} className={`ud-stat ${stat.tone}`}>
            <span className="ud-stat-icon" aria-hidden><UserStatIcon tone={stat.tone} /></span>
            <div><p>{stat.label}</p><strong>{stat.value}</strong><small>{stat.subtitle}</small></div>
          </article>
        ))}
      </section>

      <section className="ud-primary-grid">
        <div className="ud-panel" id="continue">
          <div className="ud-panel-head"><h2>Continue Listening</h2><Link href="/audio">View all</Link></div>
          {continueItems.length ? (
            <div className="ud-progress-list">
              {continueItems.map((item) => {
                const katha = item.kathaId as unknown as {
                  _id: string; title: string; slug: string; type: 'audio' | 'video';
                  thumbnail?: string; duration?: number; authorName?: string;
                };
                const duration = item.duration || katha.duration || 0;
                const progress = getProgress(item.currentTime, duration);
                return (
                  <Link key={String(item._id)} href={`/${katha.type}/${katha.slug}`} className="ud-progress-item">
                    <div className="ud-progress-thumb">
                      {katha.thumbnail ? <img src={getMediaUrl('thumbnails', katha.thumbnail)} alt="" /> : <span>☬</span>}
                    </div>
                    <div className="ud-progress-copy">
                      <strong>{katha.title}</strong><small>{katha.authorName ?? 'Sikh Katha Library'}</small>
                      <div className="ud-progress-track"><span style={{ width: `${progress}%` }} /></div>
                    </div>
                    <div className="ud-progress-meta"><strong>{progress}%</strong><small>{formatDuration(item.currentTime)} / {formatDuration(duration)}</small></div>
                    <span className="ud-round-play">▶</span>
                  </Link>
                );
              })}
            </div>
          ) : <div className="ud-empty">Start a katha. Progress appears here automatically.</div>}
        </div>

        <div className="ud-panel">
          <div className="ud-panel-head"><h2>Recently Added</h2><Link href="/search?sort=newest">View all</Link></div>
          {recentKathas.length ? (
            <div className="ud-recent-list">
              {recentKathas.map((katha) => (
                <Link href={`/${katha.type}/${katha.slug}`} key={String(katha._id)} className="ud-recent-item">
                  <div>{katha.thumbnail ? <img src={getMediaUrl('thumbnails', katha.thumbnail)} alt="" /> : <span>☬</span>}</div>
                  <span><strong>{katha.title}</strong><small>{katha.type.toUpperCase()} · {formatDuration(katha.duration ?? 0)}</small></span>
                  <b>›</b>
                </Link>
              ))}
            </div>
          ) : <div className="ud-empty">No published kathas yet.</div>}
        </div>
      </section>

      <section className="ud-secondary-grid">
        <div className="ud-panel">
          <div className="ud-panel-head"><h2>Popular Series</h2><Link href="/series">View all</Link></div>
          <div className="ud-series-grid">
            {popularSeries.map((series) => (
              <Link href={`/series/${series.slug}`} key={String(series._id)}>
                <div>{series.thumbnail ? <img src={getMediaUrl('series', series.thumbnail)} alt="" /> : <span>☬</span>}</div>
                <strong>{series.title}</strong>
              </Link>
            ))}
            {!popularSeries.length && <div className="ud-empty">No series yet.</div>}
          </div>
        </div>

        <div className="ud-panel">
          <div className="ud-panel-head"><h2>Categories</h2><Link href="/search">View all</Link></div>
          <div className="ud-category-list">
            {categories.map((category) => (
              <Link href={`/search?category=${category.slug}`} key={String(category._id)}>
                <span>{category.name.charAt(0)}</span><strong>{category.name}</strong><b>›</b>
              </Link>
            ))}
            {!categories.length && <div className="ud-empty">No categories yet.</div>}
          </div>
        </div>

        <div className="ud-panel" id="notifications">
          <div className="ud-panel-head"><h2>Latest Notifications</h2><span>{unreadCount} unread</span></div>
          <NotificationList
            initialNotifications={notifications.map((notification) => ({
              id: String(notification._id),
              title: notification.title,
              message: notification.message,
              isRead: readIds.has(String(notification._id)),
            }))}
          />
        </div>
      </section>

      <style>{`
        .ud-page { padding: 20px; max-width: 1500px; margin: 0 auto; }
        .ud-stats { display: grid; grid-template-columns: repeat(5,1fr); gap: 14px; }
        .ud-stat { min-height: 120px; display: flex; gap: 15px; align-items: center; padding: 20px; background: #fff; border: 1px solid #e9e6df; border-radius: 8px; box-shadow: 0 5px 18px rgba(20,30,45,.04); }
        .ud-stat-icon { width: 50px; height: 50px; border-radius: 50%; background: #f5eee2; flex: 0 0 auto; display:grid;place-items:center;color:#dc8312 }
        .ud-stat-icon svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.ud-stat.violet .ud-stat-icon { background:#eeeafb;color:#7354cf }.ud-stat.green .ud-stat-icon { background:#e4f3eb;color:#16815a }.ud-stat.blue .ud-stat-icon{background:#e9f1fb;color:#3974dd}
        .ud-stat p { margin:0;color:#596270;font-size:13px }.ud-stat small { margin:0;color:#727b88;font-size:11px }.ud-stat strong{display:block;font-size:30px;margin:3px 0;color:#152033}
        .ud-primary-grid { display:grid;grid-template-columns:1.2fr .8fr;gap:16px;margin-top:16px }
        .ud-secondary-grid { display:grid;grid-template-columns:1.25fr .7fr 1fr;gap:16px;margin-top:16px }
        .ud-panel { background:#fff;border:1px solid #e9e6df;border-radius:8px;padding:18px;min-width:0 }
        .ud-panel-head { display:flex;align-items:center;justify-content:space-between;margin-bottom:16px }.ud-panel-head h2{font-family:var(--font-body);font-size:18px}.ud-panel-head a,.ud-panel-head span{font-size:12px;color:#606a78}
        .ud-progress-list,.ud-recent-list,.ud-category-list,.ud-notification-list{display:flex;flex-direction:column;gap:9px}
        .ud-progress-item{display:grid;grid-template-columns:116px 1fr auto 42px;gap:14px;align-items:center;padding:10px;border-radius:7px;background:#fbf8f2}
        .ud-progress-thumb{height:72px;border-radius:6px;overflow:hidden;background:#192435;display:grid;place-items:center;color:#d98c1b}.ud-progress-thumb img,.ud-recent-item>div img,.ud-series-grid img{width:100%;height:100%;object-fit:cover}
        .ud-progress-copy strong,.ud-progress-copy small{display:block}.ud-progress-copy strong{font-size:15px}.ud-progress-copy small,.ud-progress-meta small{font-size:12px;color:#687280;margin-top:4px}.ud-progress-track{height:4px;background:#e5e2dc;border-radius:3px;margin-top:12px}.ud-progress-track span{display:block;height:100%;background:#d98c1b;border-radius:3px}
        .ud-progress-meta{text-align:right}.ud-progress-meta strong{font-size:13px}.ud-round-play{width:40px;height:40px;display:grid;place-items:center;border:1px solid #e5ded1;border-radius:50%;font-size:12px;color:#152033}
        .ud-recent-item{display:grid;grid-template-columns:86px 1fr auto;gap:12px;align-items:center;padding:8px 0}.ud-recent-item>div{height:54px;border-radius:6px;overflow:hidden;background:#192435;display:grid;place-items:center;color:#d98c1b}.ud-recent-item strong,.ud-recent-item small{display:block}.ud-recent-item strong{font-size:14px}.ud-recent-item small{font-size:11px;color:#707987;margin-top:4px}
        .ud-series-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:11px}.ud-series-grid a>div{aspect-ratio:1;border-radius:6px;overflow:hidden;background:#192435;display:grid;place-items:center;color:#d98c1b}.ud-series-grid strong{display:block;font-size:13px;margin-top:8px}
        .ud-category-list a{display:grid;grid-template-columns:36px 1fr auto;gap:10px;align-items:center;padding:9px}.ud-category-list a>span{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:#f5eee2;color:#c77b13}.ud-category-list strong{font-size:13px}
        .ud-notification-list button{width:100%;display:grid;grid-template-columns:16px 1fr auto;gap:8px;padding:9px 0;border:0;border-bottom:1px solid #f0ede7;background:transparent;text-align:left;cursor:default}.ud-notification-list button.unread{cursor:pointer}.ud-notification-list button>span{color:#aeb4bd}.ud-notification-list button.unread>span{color:#d98c1b}.ud-notification-list strong{font-size:11px}.ud-notification-list p{font-size:9px;line-height:1.45;margin-top:3px;color:#747b87}.ud-notification-list small{font-size:9px;color:#b56d0d;white-space:nowrap}.ud-notification-list button:focus-visible{outline:2px solid #d98c1b;outline-offset:3px}
        .ud-empty{padding:28px;text-align:center;color:#7f8792;font-size:13px}
        @media(max-width:1200px){.ud-stats{grid-template-columns:repeat(3,1fr)}.ud-secondary-grid{grid-template-columns:1fr 1fr}.ud-secondary-grid>:last-child{grid-column:1/-1}}
        @media(max-width:760px){
          .ud-page{padding:12px 12px 24px}
          .ud-stats{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:5px}
          .ud-stat{flex:0 0 76%;min-height:104px;padding:16px;scroll-snap-align:start}
          .ud-stat-icon{width:46px;height:46px}.ud-stat strong{font-size:26px}
          .ud-primary-grid,.ud-secondary-grid{grid-template-columns:1fr;gap:12px;margin-top:12px}
          .ud-secondary-grid>:last-child{grid-column:auto}
          .ud-panel{padding:14px}.ud-panel-head h2{font-size:16px}
          .ud-progress-item{grid-template-columns:74px 1fr 36px;gap:10px;padding:8px}
          .ud-progress-thumb{height:64px}.ud-progress-meta{display:none}.ud-round-play{width:34px;height:34px}
          .ud-progress-copy strong{font-size:13px}.ud-progress-copy small{font-size:10px}.ud-progress-track{margin-top:8px}
          .ud-recent-item{grid-template-columns:72px 1fr auto}.ud-recent-item>div{height:50px}
          .ud-series-grid{display:flex;overflow-x:auto;scroll-snap-type:x mandatory}.ud-series-grid a{flex:0 0 43%;scroll-snap-align:start}
          .ud-category-list a{min-height:48px}
        }
        @media(max-width:390px){.ud-stat{flex-basis:86%}.ud-series-grid a{flex-basis:55%}}
      `}</style>
    </main>
  );
}
