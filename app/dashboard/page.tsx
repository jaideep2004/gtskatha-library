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
    status: { $ne: 'archived' },
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
      .populate({
        path: 'kathaId',
        select: 'title slug type thumbnail duration seriesId authorName status published',
        match: published,
      }).lean(),
    Katha.find(published).sort({ createdAt: -1 }).limit(5)
      .populate('seriesId', 'title').lean(),
    Series.find({ archived: { $ne: true } }).sort({ featured: -1, sortOrder: 1 }).limit(4).lean(),
    Category.find({ archived: { $ne: true } }).sort({ name: 1 }).limit(5).lean(),
    Notification.find().sort({ createdAt: -1 }).limit(4).lean(),
    UserNotification.find({ userId, isRead: true }).select('notificationId').lean(),
  ]);

  const readIds = new Set(readReceipts.map((item) => String(item.notificationId)));
  const unreadCount = Math.max(0, await Notification.countDocuments() - readIds.size);
  const visibleContinueItems = continueItems.filter((item) => item.kathaId);

  const stats = [
    { label: 'Audio Kathas', value: audioCount, tone: 'orange', subtitle: 'Total available' },
    { label: 'Video Kathas', value: videoCount, tone: 'violet', subtitle: 'Total available' },
    { label: 'My Library', value: favoriteCount, tone: 'green', subtitle: 'Saved kathas' },
    { label: 'Continue Listening', value: visibleContinueItems.length, tone: 'gold', subtitle: 'In progress' },
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
          {visibleContinueItems.length ? (
            <div className="ud-progress-list">
              {visibleContinueItems.map((item) => {
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
        .ud-page{padding:20px;max-width:1500px;margin:0 auto;animation:udFadeIn .35s ease}
        @keyframes udFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .ud-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
        .ud-stat{min-height:114px;display:flex;gap:14px;align-items:center;padding:18px 20px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);position:relative;overflow:hidden;transition:all var(--transition-base)}
        .ud-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--color-primary),var(--color-primary-light));opacity:0;transition:opacity var(--transition-base)}
        .ud-stat:hover{transform:translateY(-3px);box-shadow:var(--shadow-md);border-color:var(--color-primary-light)}.ud-stat:hover::before{opacity:1}
        .ud-stat-icon{width:48px;height:48px;border-radius:50%;background:var(--color-primary-alpha);flex:0 0 auto;display:grid;place-items:center;color:var(--color-primary-dark);transition:transform var(--transition-fast)}
        .ud-stat:hover .ud-stat-icon{transform:scale(1.08)}
        .ud-stat-icon svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
        .ud-stat.violet .ud-stat-icon{background:rgba(115,84,207,.14);color:#7354cf}
        .ud-stat.green .ud-stat-icon{background:rgba(22,129,90,.14);color:#16815a}
        .ud-stat.blue .ud-stat-icon{background:rgba(57,116,221,.14);color:#3974dd}
        .ud-stat p{margin:0;color:var(--color-text-secondary);font-size:13px;font-weight:500}
        .ud-stat small{margin:0;color:var(--color-text-muted);font-size:11px}
        .ud-stat strong{display:block;font-size:28px;margin:3px 0;color:var(--color-text-primary);font-family:var(--font-heading);letter-spacing:-.02em}
        .ud-primary-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:16px;margin-top:16px}
        .ud-secondary-grid{display:grid;grid-template-columns:1.25fr .7fr 1fr;gap:16px;margin-top:16px}
        .ud-panel{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:18px;min-width:0;box-shadow:var(--shadow-sm);transition:box-shadow var(--transition-base)}
        .ud-panel:hover{box-shadow:var(--shadow-md)}
        .ud-panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--color-border-light)}
        .ud-panel-head h2{font-family:var(--font-heading);font-size:18px;font-weight:700;color:var(--color-text-primary)}
        .ud-panel-head a,.ud-panel-head span{font-size:12px;color:var(--color-text-muted);font-weight:500}
        .ud-panel-head a{transition:color var(--transition-fast)}.ud-panel-head a:hover{color:var(--color-primary)}
        .ud-progress-list,.ud-recent-list,.ud-category-list,.ud-notification-list{display:flex;flex-direction:column;gap:8px}
        .ud-progress-item{display:grid;grid-template-columns:104px 1fr auto 38px;gap:12px;align-items:center;padding:10px 12px;border-radius:var(--radius-md);border:1px solid var(--color-border);background:var(--color-bg);transition:all var(--transition-fast)}
        .ud-progress-item:hover{border-color:var(--color-primary-light);background:var(--color-primary-alpha)}
        .ud-progress-thumb{height:48px;border-radius:var(--radius-sm);overflow:hidden;background:var(--color-player-bg);display:grid;place-items:center;color:var(--color-primary);flex-shrink:0}
        .ud-progress-thumb img,.ud-recent-item>div img,.ud-series-grid img{width:100%;height:100%;object-fit:cover}
        .ud-progress-copy strong,.ud-progress-copy small{display:block}.ud-progress-copy strong{font-size:14px;font-weight:600}
        .ud-progress-copy small,.ud-progress-meta small{font-size:11px;color:var(--color-text-muted);margin-top:3px}
        .ud-progress-track{height:4px;background:var(--color-border);border-radius:3px;margin-top:10px}.ud-progress-track span{display:block;height:100%;background:linear-gradient(90deg,var(--color-primary),var(--color-primary-light));border-radius:3px}
        .ud-progress-meta{text-align:right}.ud-progress-meta strong{font-size:12px}.ud-round-play{width:36px;height:36px;display:grid;place-items:center;border:1px solid var(--color-border);border-radius:50%;font-size:11px;color:var(--color-text-secondary);transition:all var(--transition-fast)}
        .ud-progress-item:hover .ud-round-play{border-color:var(--color-primary);color:var(--color-primary);background:var(--color-primary-alpha)}
        .ud-recent-item{display:grid;grid-template-columns:74px 1fr auto;gap:12px;align-items:center;padding:7px 0;border-radius:var(--radius-sm);transition:background var(--transition-fast)}
        .ud-recent-item:hover{background:var(--color-bg-secondary)}.ud-recent-item>div{height:42px;width:66px;border-radius:var(--radius-sm);overflow:hidden;background:var(--color-player-bg);display:grid;place-items:center;color:var(--color-primary);flex-shrink:0}
        .ud-recent-item strong,.ud-recent-item small{display:block}.ud-recent-item strong{font-size:13px;font-weight:600}.ud-recent-item small{font-size:11px;color:var(--color-text-muted);margin-top:3px}
        .ud-series-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.ud-series-grid a>div{aspect-ratio:1;border-radius:var(--radius-md);overflow:hidden;background:var(--color-player-bg);display:grid;place-items:center;color:var(--color-primary);transition:transform var(--transition-fast)}.ud-series-grid a:hover>div{transform:scale(1.04)}.ud-series-grid strong{display:block;font-size:13px;margin-top:7px;font-weight:600;transition:color var(--transition-fast)}.ud-series-grid a:hover strong{color:var(--color-primary)}
        .ud-category-list a{display:grid;grid-template-columns:34px 1fr auto;gap:10px;align-items:center;padding:8px 4px;border-radius:var(--radius-sm);transition:background var(--transition-fast)}
        .ud-category-list a:hover{background:var(--color-bg-secondary)}
        .ud-category-list a>span{width:32px;height:32px;display:grid;place-items:center;border-radius:50%;background:var(--color-primary-alpha);color:var(--color-primary-dark);font-weight:700;font-size:13px}
        .ud-category-list strong{font-size:13px}
        .ud-notification-list button{width:100%;display:grid;grid-template-columns:16px 1fr auto;gap:8px;padding:8px 0;border:0;border-bottom:1px solid var(--color-border-light);background:transparent;text-align:left;cursor:default;transition:background var(--transition-fast)}.ud-notification-list button:last-child{border-bottom:none}
        .ud-notification-list button.unread:hover{cursor:pointer;background:var(--color-bg-secondary);border-radius:var(--radius-sm);padding:8px 8px}
        .ud-notification-list button>span{color:var(--color-text-muted)}.ud-notification-list button.unread>span{color:var(--color-primary)}
        .ud-notification-list strong{font-size:11px}.ud-notification-list p{font-size:9px;line-height:1.45;margin-top:3px;color:var(--color-text-muted)}
        .ud-notification-list small{font-size:9px;color:var(--color-primary-dark);white-space:nowrap}
        .ud-notification-list button:focus-visible{outline:2px solid var(--color-primary);outline-offset:3px}
        .ud-empty{padding:24px;text-align:center;color:var(--color-text-muted);font-size:13px}
        @media(max-width:1200px){.ud-stats{grid-template-columns:repeat(3,1fr)}.ud-secondary-grid{grid-template-columns:1fr 1fr}.ud-secondary-grid>:last-child{grid-column:1/-1}}
        @media(max-width:760px){
          .ud-page{padding:12px 12px 24px}
          .ud-stats{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:5px;gap:10px}
          .ud-stat{flex:0 0 72%;min-height:100px;padding:14px 16px;scroll-snap-align:start}.ud-stat-icon{width:44px;height:44px}.ud-stat strong{font-size:24px}
          .ud-primary-grid,.ud-secondary-grid{grid-template-columns:1fr;gap:12px;margin-top:12px}.ud-secondary-grid>:last-child{grid-column:auto}
          .ud-panel{padding:14px}.ud-panel-head h2{font-size:16px}
          .ud-progress-item{grid-template-columns:68px 1fr 34px;gap:10px;padding:8px}
          .ud-progress-thumb{height:48px}.ud-progress-meta{display:none}.ud-round-play{width:32px;height:32px}
          .ud-progress-copy strong{font-size:13px}.ud-progress-copy small{font-size:10px}.ud-progress-track{margin-top:8px}
          .ud-recent-item{grid-template-columns:64px 1fr auto}.ud-recent-item>div{height:38px}
          .ud-series-grid{display:flex;overflow-x:auto;scroll-snap-type:x mandatory}.ud-series-grid a{flex:0 0 40%;scroll-snap-align:start}
          .ud-category-list a{min-height:44px}
        }
        @media(max-width:390px){.ud-stat{flex-basis:82%}.ud-series-grid a{flex-basis:52%}}
      `}</style>
    </main>
  );
}
