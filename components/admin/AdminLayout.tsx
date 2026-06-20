'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import { toast } from 'sonner';

const adminNav = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/admin/kathas',
    label: 'Kathas',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
    ),
  },
  {
    href: '/admin/archive',
    label: 'Archived',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="16" rx="2"/>
        <path d="M7 4V2h10v2M9 12h6"/>
      </svg>
    ),
  },
  {
    href: '/admin/categories',
    label: 'Categories',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M4 12h16M4 18h7"/>
      </svg>
    ),
  },
  {
    href: '/admin/series',
    label: 'Series',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    href: '/admin/notifications',
    label: 'Notifications',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    href: '/admin/homepage',
    label: 'Homepage',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/admin/interactions',
    label: 'Interactions',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12h3l2-5 4 10 2-5h5"/>
        <path d="M5 20h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"/>
      </svg>
    ),
  },
];

export default function AdminLayout({
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
    <div className="admin-wrap">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <Link href="/admin/dashboard" className="admin-logo-link">
            <span className="admin-logo-khanda">☬</span>
            <div>
              <div className="admin-logo-title">SIKH KATHA</div>
              <div className="admin-logo-sub">ADMIN</div>
            </div>
          </Link>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-nav-item" target="_blank" rel="noopener">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            <span>View Site</span>
          </Link>
          <div className="admin-user">
            <span>{userName.charAt(0).toUpperCase()}</span>
            <div><strong>{userName}</strong><small>{email}</small></div>
            <button onClick={handleLogout} aria-label="Log out">
              <LogoutOutlined fontSize="small" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-content">
        <header className="admin-topbar">
          <div><strong>{adminNav.find((item) => item.href === pathname)?.label ?? 'Admin'}</strong><small>Sikh Katha Digital Library</small></div>
          <div className="admin-top-actions">
            <Link href="/admin/notifications" aria-label="Notifications"><NotificationsNoneOutlined fontSize="small" /></Link>
            <Link href="/" target="_blank">View site</Link>
          </div>
        </header>
        {children}
      </div>

      <style>{`
        .admin-wrap {
          display: flex;
          min-height: 100vh;
          background: #f5f6f7;
        }

        .admin-sidebar {
          width: 246px;
          flex-shrink: 0;
          background: #132235;
          border-right: 1px solid rgba(255,255,255,.06);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: var(--z-sticky);
          overflow-y: auto;
        }

        .admin-sidebar-logo {
          padding: 27px 22px;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }

        .admin-logo-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .admin-logo-khanda {
          font-size: 24px;
          color: var(--color-primary);
        }

        .admin-logo-title {
          font-family: var(--font-heading);
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #fff;
        }

        .admin-logo-sub {
          font-size: 8px;
          font-weight: 600;
          color: #e49a21;
          letter-spacing: 2px;
        }

        .admin-nav {
          flex: 1;
          padding: 18px 16px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          min-height: 46px;
          padding: 0 14px;
          border-radius: 7px;
          font-size: 15px;
          font-weight: 500;
          color: rgba(255,255,255,.74);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .admin-nav-item:hover {
          background: rgba(255,255,255,.07);
          color: #fff;
        }

        .admin-nav-item.active {
          background: #d98c1b;
          color: #fff;
          font-weight: 600;
        }

        .admin-nav-item.active .admin-nav-icon svg {
          stroke: #fff;
        }

        .admin-nav-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .admin-sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,.1);
        }

        .admin-content {
          flex: 1;
          margin-left: 246px;
          min-height: 100vh;
          overflow-x: hidden;
          font-size: 15px;
        }
        .admin-user{display:grid;grid-template-columns:40px 1fr 36px;gap:9px;align-items:center;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.1)}
        .admin-user>span{width:40px;height:40px;display:grid;place-items:center;border-radius:50%;background:#d98c1b;color:#fff;font-weight:700}
        .admin-user strong,.admin-user small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.admin-user strong{font-size:13px;color:#fff}.admin-user small{font-size:10px;color:rgba(255,255,255,.58);margin-top:3px}.admin-user button{width:36px;height:36px;display:grid;place-items:center;color:rgba(255,255,255,.65)}
        .admin-topbar{height:88px;padding:0 28px;display:flex;align-items:center;justify-content:space-between;background:#fff;border-bottom:1px solid #e5e7eb}
        .admin-topbar strong,.admin-topbar small{display:block}.admin-topbar strong{font-size:20px}.admin-topbar small{font-size:12px;color:#737b87;margin-top:4px}.admin-top-actions{display:flex;align-items:center;gap:10px}.admin-top-actions a{min-height:42px;display:flex;align-items:center;justify-content:center;padding:0 16px;border:1px solid #e1e4e8;border-radius:7px;font-size:13px;color:#263345}.admin-top-actions a:first-child{width:42px;padding:0;border-radius:50%}

        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%); }
          .admin-content { margin-left: 0; }
        }
      `}</style>
    </div>
  );
}
