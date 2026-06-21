'use client';

import Link from 'next/link';
import type { Session } from 'next-auth';
import { createPortal } from 'react-dom';
import { useEffect, useSyncExternalStore } from 'react';

interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuDrawerProps {
  open: boolean;
  links: NavLink[];
  pathname: string;
  session: Session | null;
  onClose: () => void;
  onLogout: () => void;
}

export default function MobileMenuDrawer({
  open,
  links,
  pathname,
  session,
  onClose,
  onLogout,
}: MobileMenuDrawerProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const name = session?.user?.name?.trim() || 'Guest listener';
  const initial = name.charAt(0).toUpperCase();
  const dashboardHref = session?.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  return createPortal(
    <div className={`mobile-drawer-layer ${open ? 'open' : ''}`} aria-hidden={!open}>
      <button className="mobile-drawer-scrim" type="button" onClick={onClose} aria-label="Close navigation" />
      <aside className="mobile-drawer" aria-label="Mobile menu">
        <header>
          <Link href="/" onClick={onClose}>
            <span aria-hidden>☬</span>
            <div><b>SIKH KATHA</b><small>DIGITAL LIBRARY</small></div>
          </Link>
          <button type="button" onClick={onClose} aria-label="Close menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </header>

        <nav>
          {links.map((link, index) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                href={link.href}
                key={link.href}
                className={active ? 'active' : ''}
                onClick={onClose}
                style={{ '--drawer-index': index } as React.CSSProperties}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <b>{link.label}</b>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Link>
            );
          })}
        </nav>

        <footer>
          <div className="mobile-drawer-account">
            <span>{initial}</span>
            <div><b>{name}</b><small>{session?.user?.email || 'Sign in to save your journey'}</small></div>
          </div>
          {session?.user?.id ? (
            <div className="mobile-drawer-actions">
              <Link href={dashboardHref} onClick={onClose}>Dashboard</Link>
              <Link href="/profile/favorites" onClick={onClose}>My Library</Link>
              <button type="button" onClick={onLogout}>Sign out</button>
            </div>
          ) : (
            <Link className="mobile-drawer-signin" href="/login?callbackUrl=/dashboard" onClick={onClose}>
              Sign in to your library
            </Link>
          )}
        </footer>
      </aside>

      <style>{`
        .mobile-drawer-layer{position:fixed;inset:0;z-index:1300;visibility:hidden;pointer-events:none;transition:visibility 300ms}
        .mobile-drawer-layer.open{visibility:visible;pointer-events:auto}
        .mobile-drawer-scrim{position:absolute;inset:0;width:100%;background:rgba(9,17,29,.54);backdrop-filter:blur(3px);opacity:0;transition:opacity 260ms ease}
        .mobile-drawer-layer.open .mobile-drawer-scrim{opacity:1}
        .mobile-drawer{position:absolute;inset:0 0 0 auto;width:min(88vw,390px);display:flex;flex-direction:column;background:#fcfbf7;box-shadow:-24px 0 70px rgba(8,17,29,.25);transform:translateX(104%);transition:transform 320ms cubic-bezier(.22,.9,.28,1);overflow:auto}
        .mobile-drawer-layer.open .mobile-drawer{transform:none}
        .mobile-drawer>header{min-height:78px;display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-bottom:1px solid #e9e3d9}
        .mobile-drawer>header>a{display:flex;align-items:center;gap:9px}.mobile-drawer>header>a>span{color:#d98c29;font-size:29px}
        .mobile-drawer>header b,.mobile-drawer>header small{display:block}.mobile-drawer>header b{font-family:var(--font-heading);font-size:16px;letter-spacing:.5px}.mobile-drawer>header small{font-size:7px;letter-spacing:2px;color:#d98c29}
        .mobile-drawer>header>button{width:40px;height:40px;display:grid;place-items:center;border-radius:50%;background:#f1ede5;color:#1b2637}
        .mobile-drawer>nav{padding:18px;display:grid;gap:5px;flex:1}
        .mobile-drawer>nav>a{min-height:56px;display:grid;grid-template-columns:30px 1fr 24px;align-items:center;padding:0 14px;border-radius:12px;color:#4b5565;opacity:0;transform:translateX(18px);transition:background 150ms ease,color 150ms ease}
        .mobile-drawer-layer.open .mobile-drawer>nav>a{animation:drawerItem 360ms ease forwards;animation-delay:calc(80ms + var(--drawer-index) * 35ms)}
        .mobile-drawer>nav>a>span{font-size:9px;color:#a4a6a8;letter-spacing:.08em}.mobile-drawer>nav>a>b{font-family:var(--font-heading);font-size:19px;font-weight:600}.mobile-drawer>nav>a>svg{justify-self:end}
        .mobile-drawer>nav>a:hover,.mobile-drawer>nav>a.active{background:#f7ead7;color:#b86d0b}.mobile-drawer>nav>a.active>span{color:#d98c29}
        .mobile-drawer>footer{padding:18px;background:#142237;color:#fff}
        .mobile-drawer-account{display:grid;grid-template-columns:44px 1fr;gap:11px;align-items:center}.mobile-drawer-account>span{width:44px;height:44px;display:grid;place-items:center;border-radius:50%;background:#d98c29;font-weight:700}
        .mobile-drawer-account b,.mobile-drawer-account small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mobile-drawer-account b{font-size:13px}.mobile-drawer-account small{margin-top:3px;color:rgba(255,255,255,.58);font-size:9px}
        .mobile-drawer-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:14px}.mobile-drawer-actions a,.mobile-drawer-actions button,.mobile-drawer-signin{min-height:40px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.13);border-radius:9px;color:#fff;font-size:10px;font-weight:700}
        .mobile-drawer-actions button{grid-column:1/-1;color:#f1baae}.mobile-drawer-signin{margin-top:14px;background:#d98c29;border-color:#d98c29}
        @keyframes drawerItem{to{opacity:1;transform:none}}
        @media(min-width:1101px){.mobile-drawer-layer{display:none}}
        @media(prefers-reduced-motion:reduce){.mobile-drawer,.mobile-drawer-scrim{transition:none}.mobile-drawer-layer.open .mobile-drawer>nav>a{animation:none;opacity:1;transform:none}}
      `}</style>
    </div>,
    document.body
  );
}
