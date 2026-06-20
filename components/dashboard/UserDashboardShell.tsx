'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
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
            <Link href="/search" aria-label="Search"><CategoryOutlined /></Link>
            <Link href="/dashboard#notifications" aria-label="Notifications"><NotificationsNoneOutlined /></Link>
            <Link href="/profile/favorites" aria-label="Profile"><PersonOutlined /></Link>
          </div>
        </header>
        {children}
      </div>

      <style>{`
        .user-app { min-height: 100vh; background: #f7f7f5; color: #131c2b; }
        .user-sidebar {
          position: fixed; inset: 0 auto 0 0; width: 240px; z-index: 400;
          display: flex; flex-direction: column; padding: 26px 20px;
          background: #132235; color: #fff; border-right: 1px solid rgba(255,255,255,.06);
        }
        .user-brand { display: flex; gap: 11px; align-items: center; color: #fff; margin-bottom: 30px; }
        .user-brand > span { color: #e39a22; font-size: 34px; }
        .user-brand strong,.user-brand small { display: block; letter-spacing: 0; }
        .user-brand strong { font-family: var(--font-heading); font-size: 18px; }
        .user-brand small { font-size: 8px; color: rgba(255,255,255,.62); }
        .user-nav { display: flex; flex-direction: column; gap: 5px; flex: 1; }
        .user-nav-link {
          min-height: 46px; display: flex; align-items: center; gap: 13px; padding: 0 13px;
          color: rgba(255,255,255,.8); border-radius: 7px; font-size: 15px;
          transition: background 160ms ease,color 160ms ease;
        }
        .user-nav-link:hover { background: rgba(255,255,255,.07); color: #fff; }
        .user-nav-link.active { background: #d98c1b; color: #fff; }
        .user-account {
          display: grid; grid-template-columns: 42px 1fr 38px; gap: 10px; align-items: center;
          padding-top: 18px; border-top: 1px solid rgba(255,255,255,.12);
        }
        .user-account-avatar { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 50%; background: #d98c1b; font-weight: 700; }
        .user-account strong,.user-account small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .user-account strong { font-size: 14px; }.user-account small { color: rgba(255,255,255,.55); font-size: 11px; margin-top: 3px; }
        .user-account button { width: 38px; height: 38px; display: grid; place-items: center; color: rgba(255,255,255,.66); }
        .user-main { margin-left: 240px; padding-bottom: 120px; }
        .user-topbar {
          min-height: 98px; padding: 22px 34px; display: flex; justify-content: space-between; align-items: center;
          background: #fff; border-bottom: 1px solid #e9e7e1;
        }
        .user-topbar h1 { font-family: var(--font-body); font-size: 24px; margin-bottom: 5px; }
        .user-topbar p { font-size: 14px; color: #6b7280; }
        .user-top-actions { display: flex; gap: 9px; }
        .user-top-actions a { width: 44px; height: 44px; display: grid; place-items: center; border: 1px solid #e6e4dd; border-radius: 50%; color: #263345; }
        @media (max-width: 900px) {
          .user-main { margin-left: 0; }
        }
        @media (max-width: 640px) {
          .user-sidebar {
            position: fixed;inset:auto 0 0 0;width:100%;height:72px;padding:7px 8px max(7px,env(safe-area-inset-bottom));
            border:0;border-top:1px solid rgba(255,255,255,.1);box-shadow:0 -10px 30px rgba(8,16,28,.18)
          }
          .user-brand,.user-account{display:none}
          .user-nav{display:grid;grid-template-columns:repeat(5,1fr);gap:3px}
          .user-nav-link{min-width:0;min-height:56px;flex-direction:column;justify-content:center;gap:3px;padding:3px;border-radius:6px;font-size:10px;text-align:center}
          .user-nav-link:nth-child(4),.user-nav-link:nth-child(5),.user-nav-link:nth-child(6){display:none}
          .user-nav-link svg{font-size:20px}
          .user-main{padding-bottom:88px}
          .user-topbar{position:sticky;top:0;z-index:50;padding:14px 15px;min-height:76px;box-shadow:0 5px 18px rgba(20,30,45,.05)}
          .user-topbar h1{font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px}
          .user-topbar p{font-size:11px}.user-top-actions{gap:5px}.user-top-actions a{width:38px;height:38px}
          .user-top-actions a:first-child,.user-top-actions a:nth-child(2){display:none}
        }
      `}</style>
    </div>
  );
}
