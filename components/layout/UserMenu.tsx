'use client';

import Link from 'next/link';
import type { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UserMenuProps {
  session: Session | null;
}

export default function UserMenu({ session }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  if (!session?.user?.id) {
    return (
      <Link
        href="/login?callbackUrl=/dashboard"
        className="navbar-avatar"
        aria-label="Sign in"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </Link>
    );
  }

  const name = session.user.name?.trim() || 'Listener';
  const initial = name.charAt(0).toUpperCase();
  const dashboardHref = session.user.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  async function handleLogout() {
    setOpen(false);
    await signOut({ redirect: false });
    toast.success('Signed out.');
    window.location.assign('/');
  }

  return (
    <div
      className="user-menu"
      ref={rootRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={`navbar-avatar navbar-avatar-letter ${open ? 'active' : ''}`}
        aria-label={`Open ${name}'s account menu`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        {initial}
      </button>

      <div className={`user-menu-popover ${open ? 'open' : ''}`} role="menu">
        <div className="user-menu-card">
          <span className="user-menu-monogram">{initial}</span>
          <span>
            <strong>{name}</strong>
            <small>{session.user.email}</small>
          </span>
        </div>

        <div className="user-menu-links">
          <Link href={dashboardHref} role="menuitem" onClick={() => setOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span><b>Dashboard</b><small>Continue your journey</small></span>
          </Link>
          <Link href="/profile/favorites" role="menuitem" onClick={() => setOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M6 3h12a2 2 0 0 1 2 2v16l-8-4-8 4V5a2 2 0 0 1 2-2Z"/>
            </svg>
            <span><b>My Library</b><small>Saved kathas and history</small></span>
          </Link>
        </div>

        <button type="button" className="user-menu-logout" role="menuitem" onClick={handleLogout}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M10 17l5-5-5-5M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          </svg>
          Sign out
        </button>
      </div>

      <style>{`
        .user-menu{position:relative;display:flex;padding:7px 0;margin:-7px 0}
        .navbar-avatar-letter{background:#152238;border-color:#152238;color:#fff;font-size:14px;font-weight:700;box-shadow:inset 0 0 0 2px rgba(255,255,255,.13)}
        .navbar-avatar-letter:hover,.navbar-avatar-letter.active{background:#d98c29;border-color:#d98c29;color:#fff;transform:translateY(-1px)}
        .user-menu-popover{
          position:absolute;top:calc(100% + 4px);right:0;width:286px;padding:8px;
          background:rgba(255,255,255,.98);border:1px solid #e5dfd4;border-radius:16px;
          box-shadow:0 24px 70px rgba(22,31,45,.18),0 4px 15px rgba(22,31,45,.08);
          opacity:0;visibility:hidden;transform:translateY(-8px) scale(.98);
          transform-origin:top right;transition:opacity 160ms ease,transform 160ms ease,visibility 160ms;
          pointer-events:none;z-index:30
        }
        .user-menu-popover.open{opacity:1;visibility:visible;transform:none;pointer-events:auto}
        .user-menu-card{display:grid;grid-template-columns:44px minmax(0,1fr);gap:12px;align-items:center;padding:13px;background:#152238;border-radius:11px;color:#fff}
        .user-menu-monogram{width:44px;height:44px;display:grid;place-items:center;border-radius:50%;background:#d98c29;font-family:var(--font-heading);font-size:21px;font-weight:700;box-shadow:0 0 0 4px rgba(217,140,41,.15)}
        .user-menu-card strong,.user-menu-card small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .user-menu-card strong{font-size:14px}.user-menu-card small{margin-top:3px;color:rgba(255,255,255,.6);font-size:10px}
        .user-menu-links{display:grid;gap:3px;padding:7px 0}
        .user-menu-links>a{display:grid;grid-template-columns:22px 1fr;gap:10px;align-items:center;padding:10px;border-radius:9px;color:#263246;transition:background 140ms ease,color 140ms ease}
        .user-menu-links>a:hover,.user-menu-links>a:focus-visible{background:#fbf3e6;color:#b96f10;outline:none}
        .user-menu-links>a>b,.user-menu-links>a small{display:block}.user-menu-links>a b{font-size:12px}.user-menu-links>a small{margin-top:2px;color:#8a8f97;font-size:9px}
        .user-menu-logout{width:100%;display:flex;align-items:center;gap:10px;padding:10px;border-top:1px solid #eee8de;color:#9d3f38;font-size:11px;font-weight:700}
        @media(max-width:1100px){.user-menu{display:none}}
        @media(prefers-reduced-motion:reduce){.user-menu-popover{transition:none}}
      `}</style>
    </div>
  );
}
