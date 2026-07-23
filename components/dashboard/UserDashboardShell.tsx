'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import HeadphonesOutlined from '@mui/icons-material/HeadphonesOutlined';
import VideoLibraryOutlined from '@mui/icons-material/VideoLibraryOutlined';
import CategoryOutlined from '@mui/icons-material/CategoryOutlined';
import LayersOutlined from '@mui/icons-material/LayersOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import BookmarkBorderOutlined from '@mui/icons-material/BookmarkBorderOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardOutlined },
  { href: '/audio', label: 'Audio Library', icon: HeadphonesOutlined },
  { href: '/video', label: 'Video Library', icon: VideoLibraryOutlined },
  { href: '/search', label: 'Categories', icon: CategoryOutlined },
  { href: '/series', label: 'Series', icon: LayersOutlined },
  { href: '/dashboard#continue', label: 'Continue Listening', icon: HistoryOutlined },
  { href: '/dashboard#notifications', label: 'Notifications', icon: NotificationsNoneOutlined },
  { href: '/profile/favorites', label: 'My Library', icon: BookmarkBorderOutlined },
];

export default function UserDashboardShell({
  children,
  userName,
  email,
}: {
  children: React.ReactNode;
  userName: string;
  email?: string | null;
}) {
  const pathname = usePathname();
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('dashboard-theme') === 'dark';
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark-dashboard', dark);
  }, [dark]);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark-dashboard', next);
    localStorage.setItem('dashboard-theme', next ? 'dark' : 'light');
  }

  async function handleLogout() {
    await signOut({ redirect: false });
    toast.success('Signed out.');
    window.location.assign('/login');
  }

  return (
    <div className="user-app">
      <aside className="user-sidebar">
        <Link href="/" className="user-brand">
          <span aria-hidden>☬</span>
          <div><strong>SIKH KATHA</strong><small>DIGITAL LIBRARY</small></div>
        </Link>

        <nav className="user-nav" aria-label="User dashboard">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`user-nav-link ${pathname === href ? 'active' : ''}`}
            >
              <Icon fontSize="small" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="user-account">
          <span className="user-account-avatar">{userName.charAt(0).toUpperCase()}</span>
          <div><strong>{userName}</strong><small>{email}</small></div>
          <button type="button" onClick={handleLogout} aria-label="Log out">
            <LogoutOutlined fontSize="small" />
          </button>
        </div>
      </aside>

      <div className="user-main">
        <header className="user-topbar">
          <div>
            <h1>Welcome back, {userName}</h1>
            <p>Continue your spiritual journey today.</p>
          </div>
          <div className="user-top-actions">
            <button onClick={toggleDark} aria-label={dark ? 'Light mode' : 'Dark mode'}>
              {dark ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
            </button>
            <Link href="/search" aria-label="Search"><CategoryOutlined /></Link>
            <Link href="/dashboard#notifications" aria-label="Notifications"><NotificationsNoneOutlined /></Link>
            <Link href="/profile/favorites" aria-label="Profile"><PersonOutlined /></Link>
          </div>
        </header>
        {children}
      </div>

      <style>{`
        .user-app{min-height:100vh;background:var(--color-bg);color:var(--color-text-primary)}
        .user-sidebar{position:fixed;inset:0 auto 0 0;width:240px;z-index:400;display:flex;flex-direction:column;padding:24px 18px 20px;background:linear-gradient(180deg,#132235,#0e1a2e);color:#fff;border-right:1px solid rgba(255,255,255,.06)}
        .user-brand{display:flex;gap:11px;align-items:center;color:#fff;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.07)}
        .user-brand>span{color:#e39a22;font-size:32px;filter:drop-shadow(0 2px 8px rgba(217,140,41,.25))}
        .user-brand strong,.user-brand small{display:block;letter-spacing:0}
        .user-brand strong{font-family:var(--font-heading);font-size:17px}.user-brand small{font-size:7px;color:rgba(255,255,255,.6);margin-top:2px}
        .user-nav{display:flex;flex-direction:column;gap:4px;flex:1}
        .user-nav-link{min-height:44px;display:flex;align-items:center;gap:12px;padding:0 12px;color:rgba(255,255,255,.78);border-radius:8px;font-size:14px;transition:all 160ms ease}
        .user-nav-link:hover{background:rgba(255,255,255,.07);color:#fff;transform:translateX(2px)}
        .user-nav-link.active{background:linear-gradient(135deg,#d98c1b,#c47d16);color:#fff;box-shadow:0 4px 14px rgba(217,140,27,.25)}
        .user-account{display:grid;grid-template-columns:40px 1fr 36px;gap:9px;align-items:center;padding-top:16px;border-top:1px solid rgba(255,255,255,.08)}
        .user-account-avatar{width:40px;height:40px;display:grid;place-items:center;border-radius:50%;background:linear-gradient(135deg,#d98c1b,#c47d16);font-weight:700;font-size:15px;box-shadow:0 2px 8px rgba(217,140,27,.2)}
        .user-account strong,.user-account small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .user-account strong{font-size:13px}.user-account small{color:rgba(255,255,255,.5);font-size:10px;margin-top:2px}
        .user-account button{width:36px;height:36px;display:grid;place-items:center;color:rgba(255,255,255,.6);border-radius:50%;transition:all 160ms ease}
        .user-account button:hover{background:rgba(255,255,255,.08);color:#fff}
        .user-main{margin-left:240px;padding-bottom:120px}
        .user-topbar{min-height:94px;padding:22px 34px;display:flex;justify-content:space-between;align-items:center;background:var(--color-surface);border-bottom:1px solid var(--color-border);position:sticky;top:0;z-index:50;backdrop-filter:blur(12px)}
        .user-topbar h1{font-family:var(--font-heading);font-size:24px;font-weight:700;margin-bottom:4px;color:var(--color-text-primary)}
        .user-topbar p{font-size:14px;color:var(--color-text-muted)}
        .user-top-actions{display:flex;gap:8px}
        .user-top-actions a,.user-top-actions button{width:42px;height:42px;display:grid;place-items:center;border:1px solid var(--color-border);border-radius:50%;color:var(--color-text-secondary);background:var(--color-surface);transition:all var(--transition-fast)}
        .user-top-actions a:hover,.user-top-actions button:hover{border-color:var(--color-primary);color:var(--color-primary);background:var(--color-primary-alpha)}
        .user-top-actions a svg,.user-top-actions button svg{font-size:20px}
        @media(max-width:900px){.user-main{margin-left:0}}
        @media(max-width:640px){
          .user-sidebar{position:fixed;inset:auto 0 0 0;width:100%;height:72px;padding:7px 8px max(7px,env(safe-area-inset-bottom));border:0;border-top:1px solid rgba(255,255,255,.1);box-shadow:0 -10px 30px rgba(8,16,28,.18)}
          .user-brand,.user-account{display:none}
          .user-nav{display:grid;grid-template-columns:repeat(5,1fr);gap:3px}
          .user-nav-link{min-width:0;min-height:56px;flex-direction:column;justify-content:center;gap:3px;padding:3px;border-radius:6px;font-size:10px;text-align:center}
          .user-nav-link:nth-child(4),.user-nav-link:nth-child(5),.user-nav-link:nth-child(6){display:none}
          .user-nav-link svg{font-size:20px}
          .user-main{padding-bottom:88px}
          .user-topbar{position:sticky;top:0;z-index:50;padding:14px 16px;min-height:72px;box-shadow:0 5px 18px rgba(20,30,45,.05)}
          .user-topbar h1{font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px}
          .user-topbar p{font-size:11px}.user-top-actions{gap:5px}.user-top-actions a,.user-top-actions button{width:36px;height:36px}
          .user-top-actions a:first-child,.user-top-actions a:nth-child(2){display:none}
        }
        .dark-dashboard .user-app{background:#0b1424}
        .dark-dashboard .user-sidebar{background:linear-gradient(180deg,#0b1424,#070f1c)}
        .dark-dashboard .user-main{background:#0f172a}
        .dark-dashboard .user-topbar{background:rgba(30,41,59,.92);border-color:#334155;backdrop-filter:blur(12px)}
        .dark-dashboard .user-topbar h1{color:#f1f5f9}.dark-dashboard .user-topbar p{color:#94a3b8}
        .dark-dashboard .user-top-actions a,.dark-dashboard .user-top-actions button{border-color:#475569;color:#94a3b8}
        .dark-dashboard .user-top-actions a:hover,.dark-dashboard .user-top-actions button:hover{border-color:#d98c1b;color:#d98c1b;background:rgba(217,140,27,.1)}
        .dark-dashboard .ud-stat{background:#1e293b;border-color:#334155}.dark-dashboard .ud-stat p{color:#94a3b8}
        .dark-dashboard .ud-stat small{color:#64748b}.dark-dashboard .ud-stat strong{color:#f1f5f9}
        .dark-dashboard .ud-stat-icon{background:rgba(255,255,255,.06)}
        .dark-dashboard .ud-stat.violet .ud-stat-icon{background:rgba(115,84,207,.25)}
        .dark-dashboard .ud-stat.green .ud-stat-icon{background:rgba(22,129,90,.25)}
        .dark-dashboard .ud-stat.blue .ud-stat-icon{background:rgba(57,116,221,.25)}
        .dark-dashboard .ud-panel{background:#1e293b;border-color:#334155}
        .dark-dashboard .ud-panel-head{border-bottom-color:rgba(51,65,85,.5)}
        .dark-dashboard .ud-panel-head h2{color:#f1f5f9}
        .dark-dashboard .ud-panel-head a,.dark-dashboard .ud-panel-head span{color:#94a3b8}
        .dark-dashboard .ud-progress-item{background:rgba(255,255,255,.04);border-color:#334155}
        .dark-dashboard .ud-progress-thumb{background:#0f172a}
        .dark-dashboard .ud-progress-copy strong{color:#f1f5f9}.dark-dashboard .ud-progress-copy small{color:#94a3b8}
        .dark-dashboard .ud-progress-track{background:#334155}
        .dark-dashboard .ud-round-play{border-color:#475569;color:#e2e8f0}
        .dark-dashboard .ud-recent-item>div{background:#0f172a}
        .dark-dashboard .ud-recent-item strong{color:#f1f5f9}.dark-dashboard .ud-recent-item small{color:#94a3b8}
        .dark-dashboard .ud-series-grid a>div{background:#0f172a}
        .dark-dashboard .ud-series-grid strong{color:#e2e8f0}
        .dark-dashboard .ud-category-list a>span{background:rgba(217,140,41,.2);color:#d98c1b}
        .dark-dashboard .ud-category-list strong{color:#e2e8f0}
        .dark-dashboard .ud-notification-list button{border-color:#334155}
        .dark-dashboard .ud-notification-list strong{color:#f1f5f9}.dark-dashboard .ud-notification-list p{color:#94a3b8}
        .dark-dashboard .ud-empty{color:#64748b}
        .dark-dashboard .ud-progress-item:hover{background:rgba(255,255,255,.06);border-color:rgba(217,140,41,.3)}
        .dark-dashboard .ud-recent-item:hover{background:rgba(255,255,255,.04)}
        .dark-dashboard .ud-category-list a:hover{background:rgba(255,255,255,.04)}
      `}</style>
    </div>
  );
}
