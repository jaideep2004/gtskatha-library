import Link from 'next/link';
import connectDB from '@/lib/db';
import Katha from '@/models/Katha';
import User from '@/models/User';
import Series from '@/models/Series';
import Category from '@/models/Category';
import KathaViewEvent from '@/models/KathaViewEvent';
import { formatDate } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media';

export const metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboardPage() {
  await connectDB();
  const published: Record<string, unknown> = {
    $or: [{ status: 'published' }, { status: { $exists: false }, published: true }],
  };
  const since = new Date();
  since.setDate(since.getDate() - 29);

  const [
    totalKathas,
    audioKathas,
    videoKathas,
    userCount,
    seriesCount,
    categoryCount,
    recentKathas,
    recentUsers,
    categories,
    series,
    dailyViews,
  ] = await Promise.all([
    Katha.countDocuments({ status: { $ne: 'archived' } }),
    Katha.countDocuments({ ...published, type: 'audio' }),
    Katha.countDocuments({ ...published, type: 'video' }),
    User.countDocuments({ role: 'user' }),
    Series.countDocuments({ archived: { $ne: true } }),
    Category.countDocuments({ archived: { $ne: true } }),
    Katha.find({ status: { $ne: 'archived' } }).sort({ createdAt: -1 }).limit(5)
      .select('title slug type thumbnail published status createdAt seriesId').populate('seriesId', 'title').lean(),
    User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt').lean(),
    Category.find({ archived: { $ne: true } }).sort({ name: 1 }).limit(5).lean(),
    Series.find({ archived: { $ne: true } }).sort({ featured: -1, sortOrder: 1 }).limit(5).lean(),
    KathaViewEvent.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const maxViews = Math.max(1, ...dailyViews.map((item) => item.count));
  const stats = [
    ['Total Kathas', totalKathas, 'orange', '/images/videoicon.png'],
    ['Video Kathas', videoKathas, 'violet', '/images/video2icon.png'],
    ['Audio Kathas', audioKathas, 'green', '/images/video3icon.png'],
    ['Categories', categoryCount, 'gold', '/images/video4icon.png'],
    ['Series', seriesCount, 'blue', '/images/video5icon.png'],
    ['Total Users', userCount, 'red', '/images/video6icon.png'],
  ];

  return (
    <main className="ad-page">
      <section className="ad-stats">
        {stats.map(([label, value, tone, image]) => (
          <article key={String(label)} className={`ad-stat ${tone}`}>
            <span><img src={String(image)} alt="" /></span><div><p>{label}</p><strong>{Number(value).toLocaleString()}</strong><small>Current total</small></div>
          </article>
        ))}
      </section>

      <section className="ad-main-grid">
        <div className="ad-panel ad-chart-panel">
          <div className="ad-panel-head"><h2>Katha Views Overview</h2><span>Last 30 days</span></div>
          {dailyViews.length ? (
            <div className="ad-chart" aria-label="Daily qualified views">
              {dailyViews.map((item) => (
                <div key={item._id} title={`${item._id}: ${item.count} views`}>
                  <span style={{ height: `${Math.max(6, item.count / maxViews * 100)}%` }} />
                </div>
              ))}
            </div>
          ) : <div className="ad-empty">Qualified playback analytics appear after listeners reach the view threshold.</div>}
        </div>

        <div className="ad-panel">
          <div className="ad-panel-head"><h2>Recent Kathas</h2><Link href="/admin/kathas">View all</Link></div>
          <div className="ad-katha-list">
            {recentKathas.map((katha) => (
              <Link href={`/admin/kathas?edit=${katha.slug}`} key={String(katha._id)}>
                <div>{katha.thumbnail ? <img src={getMediaUrl('thumbnails', katha.thumbnail)} alt="" /> : <span>☬</span>}</div>
                <span><strong>{katha.title}</strong><small>{katha.type.toUpperCase()} · {formatDate(katha.createdAt)}</small></span>
                <b className={katha.status === 'archived' ? 'archived' : katha.published ? 'published' : 'draft'}>
                  {katha.status === 'archived' ? 'Archived' : katha.published ? 'Published' : 'Draft'}
                </b>
              </Link>
            ))}
            {!recentKathas.length && <div className="ad-empty">No kathas yet.</div>}
          </div>
        </div>
      </section>

      <section className="ad-bottom-grid">
        <div className="ad-panel">
          <div className="ad-panel-head"><h2>Categories</h2><Link href="/admin/categories">Manage</Link></div>
          {categories.map((category) => <Link className="ad-simple-row" href="/admin/categories" key={String(category._id)}><strong>{category.name}</strong><span>›</span></Link>)}
          {!categories.length && <div className="ad-empty">No categories.</div>}
        </div>
        <div className="ad-panel">
          <div className="ad-panel-head"><h2>Top Series</h2><Link href="/admin/series">Manage</Link></div>
          {series.map((item) => <Link className="ad-simple-row" href="/admin/series" key={String(item._id)}><strong>{item.title}</strong><span>{item.featured ? 'Featured' : 'Standard'}</span></Link>)}
          {!series.length && <div className="ad-empty">No series.</div>}
        </div>
        <div className="ad-panel">
          <div className="ad-panel-head"><h2>Recent Users</h2><span>{userCount} total</span></div>
          {recentUsers.map((user) => <div className="ad-user-row" key={String(user._id)}><span>{user.name.charAt(0).toUpperCase()}</span><div><strong>{user.name}</strong><small>{user.email}</small></div><time>{formatDate(user.createdAt)}</time></div>)}
          {!recentUsers.length && <div className="ad-empty">No registered users.</div>}
        </div>
      </section>

      <section className="ad-panel ad-actions">
        <div className="ad-panel-head"><h2>Quick Actions</h2></div>
        <div><Link href="/admin/kathas">Add Katha</Link><Link href="/admin/categories">Create Category</Link><Link href="/admin/series">Create Series</Link><Link href="/admin/notifications">Send Notification</Link><Link href="/admin/homepage">Edit Homepage</Link></div>
      </section>

      <style>{`
        .ad-page{padding:20px;max-width:1600px;margin:0 auto}.ad-stats{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}.ad-stat{min-height:118px;display:flex;align-items:center;gap:15px;padding:19px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 4px 16px rgba(20,30,45,.04)}.ad-stat>span{width:56px;height:56px;border-radius:50%;background:#f6ead9;flex:0 0 auto;display:grid;place-items:center;overflow:hidden}.ad-stat>span img{width:100%;height:100%;object-fit:cover}.ad-stat.violet>span{background:#eee9fb}.ad-stat.green>span{background:#e4f3eb}.ad-stat.blue>span{background:#e8effa}.ad-stat.red>span{background:#fae9eb}.ad-stat p{font-size:12px;color:#596270}.ad-stat small{font-size:11px;color:#747b86}.ad-stat strong{display:block;font-size:29px;margin:3px 0;color:#142033}
        .ad-main-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:14px;margin-top:14px}.ad-bottom-grid{display:grid;grid-template-columns:.75fr .75fr 1.2fr;gap:14px;margin-top:14px}.ad-panel{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:19px;min-width:0}.ad-panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.ad-panel-head h2{font-family:var(--font-body);font-size:17px}.ad-panel-head a,.ad-panel-head span{font-size:12px;color:#606a78}
        .ad-chart{height:260px;display:flex;align-items:flex-end;gap:5px;padding:18px 8px 0;border-bottom:1px solid #dfe2e6;background:repeating-linear-gradient(to bottom,#fff 0,#fff 63px,#eef0f2 64px)}.ad-chart>div{height:100%;flex:1;display:flex;align-items:flex-end}.ad-chart span{display:block;width:100%;min-width:3px;background:#da8b19;border-radius:3px 3px 0 0;opacity:.82}
        .ad-katha-list{display:flex;flex-direction:column;gap:9px}.ad-katha-list>a{display:grid;grid-template-columns:98px 1fr auto;gap:13px;align-items:center}.ad-katha-list>a>div{height:56px;border-radius:6px;overflow:hidden;background:#142033;display:grid;place-items:center;color:#d98c1b}.ad-katha-list img{width:100%;height:100%;object-fit:cover}.ad-katha-list strong,.ad-katha-list small{display:block}.ad-katha-list strong{font-size:13px}.ad-katha-list small{font-size:11px;color:#707987;margin-top:4px}.ad-katha-list b{font-size:10px;padding:5px 9px;border-radius:5px;background:#e4f3eb;color:#188150}.ad-katha-list b.draft{background:#f0f1f2;color:#6e7682}.ad-katha-list b.archived{background:#fae9eb;color:#b32634}
        .ad-simple-row{min-height:46px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #eef0f2;font-size:13px}.ad-simple-row span{color:#6d7684;font-size:11px}.ad-user-row{display:grid;grid-template-columns:36px 1fr auto;gap:10px;align-items:center;padding:8px 0}.ad-user-row>span{width:36px;height:36px;display:grid;place-items:center;border-radius:50%;background:#f2e7d6;color:#c27610;font-weight:700}.ad-user-row strong,.ad-user-row small{display:block}.ad-user-row strong{font-size:12px}.ad-user-row small,.ad-user-row time{font-size:10px;color:#707987}.ad-actions{margin-top:14px}.ad-actions>div:last-child{display:flex;gap:10px;flex-wrap:wrap}.ad-actions a{min-height:50px;display:flex;align-items:center;padding:0 22px;background:#faf8f4;border:1px solid #ece8df;border-radius:7px;font-size:13px;font-weight:600}.ad-empty{min-height:120px;display:grid;place-items:center;text-align:center;color:#7f8792;font-size:13px}
        @media(max-width:1200px){.ad-stats{grid-template-columns:repeat(3,1fr)}.ad-bottom-grid{grid-template-columns:1fr 1fr}.ad-bottom-grid>:last-child{grid-column:1/-1}}@media(max-width:760px){.ad-page{padding:12px}.ad-stats{grid-template-columns:1fr 1fr}.ad-main-grid,.ad-bottom-grid{grid-template-columns:1fr}.ad-bottom-grid>:last-child{grid-column:auto}.ad-chart{height:190px}}
      `}</style>
    </main>
  );
}
