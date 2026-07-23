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
  const chartN = dailyViews.length;
  const barW = Math.max(5, Math.min(14, 800 / chartN));
  const barGap = Math.max(2, Math.min(6, barW * 0.6));
  const slotW = barW + barGap;
  const totalW = chartN * slotW;
  const chartStart = Math.max(30, (940 - totalW) / 2 + 30);
  const chartStep = Math.max(1, Math.floor(chartN / 10));
  const stats = [
    ['Total Kathas', totalKathas, 'orange', '/images/videoicon.png'],
    ['Video Kathas', videoKathas, 'violet', '/images/video2icon.png'],
    ['Audio Kathas', audioKathas, 'green', '/images/video3icon.png'],
    ['Categories', categoryCount, 'gold', '/images/video4icon.png'],
    ['Series', seriesCount, 'blue', '/images/video5icon.png'],
    ['Total Users', userCount, 'red', '/images/video6icon.png'],
  ];

  return (
    <main className="dash-page">
      <section className="dash-stats">
        {stats.map(([label, value, tone, image]) => (
          <article key={String(label)} className={`dash-stat ${tone}`}>
            <span><img src={String(image)} alt="" /></span><div><p>{label}</p><strong>{Number(value).toLocaleString()}</strong><small>Current total</small></div>
          </article>
        ))}
      </section>

      <section className="dash-main-grid">
        <div className="dash-panel dash-chart-panel">
          <div className="dash-panel-head"><h2>Katha Views Overview</h2><span>Last 30 days</span></div>
          {dailyViews.length ? (
            <div className="dash-chart" aria-label="Daily qualified views">
              <svg viewBox="0 0 1000 240" className="dash-chart-svg" preserveAspectRatio="none">
                {dailyViews.map((d, i) => {
                  const barH = Math.max(4, (d.count / maxViews) * 180);
                  const barX = chartStart + i * slotW;
                  return (
                    <rect key={d._id} x={barX} y={210 - barH} width={barW} height={barH} rx={Math.min(3, barW / 2)} className="chart-bar" style={{ animationDelay: `${i * 0.025}s` }}>
                      <title>{d._id}: {d.count} views</title>
                    </rect>
                  );
                })}
              </svg>
              <div className="dash-chart-x">
                {dailyViews.filter((_, i) => i % chartStep === 0).map((d, fi) => {
                  const idx = fi * chartStep;
                  return (
                    <span key={d._id} style={{ left: `${((chartStart + idx * slotW + barW / 2) / 1000) * 100}%` }}>{d._id.slice(5)}</span>
                  );
                })}
              </div>
            </div>
          ) : <div className="dash-empty">Qualified playback analytics appear after listeners reach the view threshold.</div>}
        </div>

        <div className="dash-panel">
          <div className="dash-panel-head"><h2>Recent Kathas</h2><Link href="/admin/kathas">View all</Link></div>
          <div className="dash-katha-list">
            {recentKathas.map((katha) => {
              const title = safeText(katha.title, 'Untitled katha');
              const slug = safeText(katha.slug);
              const type = safeText(katha.type, 'Katha').toUpperCase();
              const statusClass = dashboardStatusClass(katha);
              const statusLabel = dashboardStatusLabel(katha);

              return (
                <Link href={slug ? `/admin/kathas?edit=${slug}` : '/admin/kathas'} key={String(katha._id)}>
                  <div>{katha.thumbnail ? <img src={getMediaUrl('thumbnails', katha.thumbnail)} alt="" /> : <span>☬</span>}</div>
                  <span><strong>{title}</strong><small>{type} · {safeFormatDate(katha.createdAt)}</small></span>
                  <b className={statusClass}>{statusLabel}</b>
                </Link>
              );
            })}
            {!recentKathas.length && <div className="dash-empty">No kathas yet.</div>}
          </div>
        </div>
      </section>

      <section className="dash-bottom-grid">
        <div className="dash-panel">
          <div className="dash-panel-head"><h2>Categories</h2><Link href="/admin/categories">Manage</Link></div>
          {categories.map((category) => <Link className="dash-simple-row" href="/admin/categories" key={String(category._id)}><strong>{category.name}</strong><span>›</span></Link>)}
          {!categories.length && <div className="dash-empty">No categories.</div>}
        </div>
        <div className="dash-panel">
          <div className="dash-panel-head"><h2>Top Series</h2><Link href="/admin/series">Manage</Link></div>
          {series.map((item) => <Link className="dash-simple-row" href="/admin/series" key={String(item._id)}><strong>{item.title}</strong><span>{item.featured ? 'Featured' : 'Standard'}</span></Link>)}
          {!series.length && <div className="dash-empty">No series.</div>}
        </div>
        <div className="dash-panel">
          <div className="dash-panel-head"><h2>Recent Users</h2><span>{userCount} total</span></div>
          {recentUsers.map((user) => {
            const email = safeText(user.email, 'No email');
            const name = safeText(user.name, email !== 'No email' ? email.split('@')[0] : 'Unnamed user');

            return (
              <div className="dash-user-row" key={String(user._id)}>
                <span>{userInitial(name, email)}</span>
                <div><strong>{name}</strong><small>{email}</small></div>
                <time>{safeFormatDate(user.createdAt)}</time>
              </div>
            );
          })}
          {!recentUsers.length && <div className="dash-empty">No registered users.</div>}
        </div>
      </section>

      <section className="dash-panel dash-actions">
        <div className="dash-panel-head"><h2>Quick Actions</h2></div>
        <div><Link href="/admin/kathas">Add Katha</Link><Link href="/admin/categories">Create Category</Link><Link href="/admin/series">Create Series</Link><Link href="/admin/notifications">Send Notification</Link><Link href="/admin/homepage">Edit Homepage</Link></div>
      </section>

      <style>{`
        .dash-page{padding:24px;max-width:1600px;margin:0 auto;animation:pageFadeIn .35s ease}.dash-stats{display:grid;grid-template-columns:repeat(6,1fr);gap:16px}
        .dash-stat{min-height:112px;display:flex;align-items:center;gap:16px;padding:18px 20px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);transition:all var(--transition-base);position:relative;overflow:hidden}
        .dash-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--color-primary),var(--color-primary-light));opacity:0;transition:opacity var(--transition-base)}
        .dash-stat:hover{transform:translateY(-3px);box-shadow:var(--shadow-md);border-color:var(--color-primary-light)}.dash-stat:hover::before{opacity:1}
        .dash-stat>span{width:50px;height:50px;border-radius:var(--radius-full);background:var(--color-primary-alpha);flex:0 0 auto;display:grid;place-items:center;overflow:hidden;transition:transform var(--transition-fast)}
        .dash-stat:hover>span{transform:scale(1.08)}.dash-stat>span img{width:100%;height:100%;object-fit:cover;border-radius:50%}
        .dash-stat.violet>span{background:rgba(115,84,207,.14)}.dash-stat.green>span{background:rgba(22,129,90,.14)}.dash-stat.blue>span{background:rgba(57,116,221,.14)}.dash-stat.red>span{background:rgba(239,68,68,.12)}
        .dash-stat p{font-size:12px;color:var(--color-text-secondary);font-weight:500}.dash-stat small{font-size:11px;color:var(--color-text-muted)}
        .dash-stat strong{display:block;font-size:28px;margin:4px 0;color:var(--color-text-primary);font-family:var(--font-heading);letter-spacing:-.02em}
        .dash-main-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:16px;margin-top:16px}
        .dash-bottom-grid{display:grid;grid-template-columns:.75fr .75fr 1.2fr;gap:16px;margin-top:16px}
        .dash-panel{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:20px;min-width:0;box-shadow:var(--shadow-sm);transition:box-shadow var(--transition-base)}
        .dash-panel:hover{box-shadow:var(--shadow-md)}
        .dash-panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--color-border-light)}
        .dash-panel-head h2{font-family:var(--font-heading);font-size:18px;font-weight:700;color:var(--color-text-primary)}.dash-panel-head a,.dash-panel-head span{font-size:12px;color:var(--color-text-muted);font-weight:500}
        .dash-panel-head a{transition:color var(--transition-fast)}.dash-panel-head a:hover{color:var(--color-primary)}
        .dash-chart{height:240px;position:relative;border-bottom:1px solid var(--color-border);background:repeating-linear-gradient(to bottom,transparent 0,transparent 57px,var(--color-bg-secondary) 58px)}
        .dash-chart-svg{width:100%;height:100%;display:block}
        .chart-bar{fill:#D98C29;clip-path:inset(100% 0 0 0);animation:barGrow .55s cubic-bezier(.34,1.56,.64,1) forwards;transition:fill var(--transition-fast)}
        .chart-bar:hover{fill:#e8a84a}
        @keyframes barGrow{to{clip-path:inset(0 0 0 0)}}
        .dash-chart-x{position:relative;height:18px;margin-top:-4px;pointer-events:none}
        .dash-chart-x span{position:absolute;font-size:9px;color:var(--color-text-muted);transform:translateX(-50%);white-space:nowrap;top:0}
        .dash-katha-list{display:flex;flex-direction:column;gap:8px}.dash-katha-list>a{display:grid;grid-template-columns:86px 1fr auto;gap:12px;align-items:center;padding:4px 0;border-radius:var(--radius-md);transition:background var(--transition-fast)}.dash-katha-list>a:hover{background:var(--color-bg-secondary)}.dash-katha-list>a>div{height:44px;width:78px;border-radius:var(--radius-sm);overflow:hidden;background:var(--color-player-bg);display:grid;place-items:center;color:var(--color-primary);flex-shrink:0}.dash-katha-list img{width:100%;height:100%;object-fit:cover}.dash-katha-list strong,.dash-katha-list small{display:block}.dash-katha-list strong{font-size:13px;font-weight:600}.dash-katha-list small{font-size:11px;color:var(--color-text-muted);margin-top:3px}.dash-katha-list b{font-size:10px;padding:4px 10px;border-radius:var(--radius-full);background:rgba(22,163,74,.12);color:#16a34a;font-weight:700}.dash-katha-list b.draft{background:rgba(234,179,8,.12);color:#a16207}.dash-katha-list b.archived{background:rgba(107,114,128,.12);color:#6b7280}
        .dash-simple-row{min-height:44px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--color-border-light);font-size:13px;padding:0 4px;transition:background var(--transition-fast);border-radius:var(--radius-sm)}.dash-simple-row:hover{background:var(--color-bg-secondary)}.dash-simple-row span{color:var(--color-text-muted);font-size:11px;font-weight:500}
        .dash-user-row{display:grid;grid-template-columns:34px 1fr auto;gap:10px;align-items:center;padding:7px 4px;border-radius:var(--radius-sm);transition:background var(--transition-fast)}.dash-user-row:hover{background:var(--color-bg-secondary)}.dash-user-row>span{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:var(--color-primary-alpha);color:var(--color-primary-dark);font-weight:700;font-size:13px}.dash-user-row strong,.dash-user-row small{display:block}.dash-user-row strong{font-size:12px}.dash-user-row small,.dash-user-row time{font-size:10px;color:var(--color-text-muted)}
        .dash-actions{margin-top:16px}.dash-actions>div:last-child{display:flex;gap:10px;flex-wrap:wrap}.dash-actions a{min-height:46px;display:flex;align-items:center;padding:0 20px;background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:13px;font-weight:600;transition:all var(--transition-fast)}.dash-actions a:hover{border-color:var(--color-primary);background:var(--color-primary-alpha);color:var(--color-primary-dark);transform:translateY(-2px);box-shadow:var(--shadow-sm)}.dash-empty{min-height:100px;display:grid;place-items:center;text-align:center;color:var(--color-text-muted);font-size:13px}
        @keyframes pageFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:1200px){.dash-stats{grid-template-columns:repeat(3,1fr)}.dash-bottom-grid{grid-template-columns:1fr 1fr}.dash-bottom-grid>:last-child{grid-column:1/-1}}@media(max-width:760px){.dash-page{padding:14px}.dash-stats{grid-template-columns:1fr 1fr;gap:12px}.dash-main-grid,.dash-bottom-grid{grid-template-columns:1fr;gap:12px;margin-top:12px}.dash-bottom-grid>:last-child{grid-column:auto}.dash-chart{height:180px}.dash-stat{min-height:100px;padding:14px 16px}.dash-stat strong{font-size:24px}}@media(max-width:480px){.dash-stats{grid-template-columns:1fr;gap:10px}.dash-page{padding:10px}.dash-chart{height:140px}.dash-panel{padding:14px}.dash-panel-head h2{font-size:15px}}
      `}</style>
    </main>
  );
}

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function safeFormatDate(value: unknown) {
  const date = value instanceof Date || typeof value === 'string' || typeof value === 'number'
    ? new Date(value)
    : null;

  if (!date || Number.isNaN(date.getTime())) return 'Unknown date';
  return formatDate(date);
}

function dashboardStatusClass(katha: { status?: unknown; published?: unknown }) {
  if (katha.status === 'archived') return 'archived';
  return katha.published === true ? 'published' : 'draft';
}

function dashboardStatusLabel(katha: { status?: unknown; published?: unknown }) {
  if (katha.status === 'archived') return 'Archived';
  return katha.published === true ? 'Published' : 'Draft';
}

function userInitial(name: string, email: string) {
  const value = safeText(name) || safeText(email) || '?';
  return value.charAt(0).toUpperCase();
}
