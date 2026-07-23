'use client';

import Link from 'next/link';
import type { Session } from 'next-auth';
import { getSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import MobileMenuDrawer from '@/components/layout/MobileMenuDrawer';
import NavbarSearch from '@/components/layout/NavbarSearch';
import UserMenu from '@/components/layout/UserMenu';

const navLinks = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/audio', label: 'Kathas' },
  { href: '/nittnem', label: 'Nittnem' },
  { href: '/paath', label: 'Paath' },
  { href: '/series', label: 'Series' },
];

function NavIcon({ type }: { type?: string }) {
  if (type !== 'home') return null;
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    let active = true;
    void getSession().then((currentSession) => {
      if (active) setSession(currentSession);
    });
    return () => {
      active = false;
    };
  }, []);

  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    setMobileOpen(false);
    await signOut({ redirect: false });
    toast.success('Signed out.');
    window.location.assign('/');
  }

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">
            <span className="navbar-logo-icon" aria-hidden>☬</span>
            <div className="navbar-logo-text">
              <span className="navbar-logo-title">SIKH KATHA</span>
              <span className="navbar-logo-sub">DIGITAL LIBRARY</span>
            </div>
          </Link>

          <ul className="navbar-links">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className={`navbar-link ${isActive(link.href) ? 'active' : ''}`}>
                  {link.icon && <NavIcon type={link.icon} />}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            <div className="navbar-search-desktop">
              <NavbarSearch />
            </div>

            <button
              type="button"
              className={`navbar-search-toggle ${mobileSearchOpen ? 'active' : ''}`}
              aria-label={mobileSearchOpen ? 'Close search' : 'Search kathas'}
              aria-expanded={mobileSearchOpen}
              onClick={() => {
                setMobileSearchOpen((current) => !current);
                setMobileOpen(false);
              }}
            >
              {mobileSearchOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
              )}
            </button>

            <UserMenu session={session} />

            <button
              type="button"
              className={`navbar-hamburger ${mobileOpen ? 'active' : ''}`}
              onClick={() => {
                setMobileOpen((current) => !current);
                setMobileSearchOpen(false);
              }}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
            >
              <span/><span/><span/>
            </button>
          </div>
        </div>

        <div className={`navbar-mobile-search ${mobileSearchOpen ? 'open' : ''}`}>
          <div className="container">
            <NavbarSearch mobile autoFocus={mobileSearchOpen} onNavigate={() => setMobileSearchOpen(false)} />
            <p>ਘੱਟੋ-ਘੱਟ 2 ਅੱਖਰ ਲਿਖੋ। ਉਦਾਹਰਨ ਵਜੋਂ, “ki” ਨਾਲ “Kirtan” ਲੱਭ ਸਕਦਾ ਹੈ।</p>
          </div>
        </div>
      </nav>

      <MobileMenuDrawer
        open={mobileOpen}
        links={navLinks}
        pathname={pathname}
        session={session}
        onClose={closeMobileMenu}
        onLogout={handleLogout}
      />

      <style>{`
        .navbar{position:fixed;inset:0 0 auto;z-index:var(--z-navbar);height:var(--navbar-height);background:rgba(252,251,247,.96);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--color-border)}
        .navbar-inner{height:100%;display:flex;align-items:center;justify-content:space-between;gap:24px}
        .navbar-logo{display:flex;align-items:center;gap:10px;flex-shrink:0}.navbar-logo-icon{font-size:28px;color:var(--color-primary);line-height:1}
        .navbar-logo-text{display:flex;flex-direction:column;line-height:1.1}.navbar-logo-title{font-family:var(--font-heading);font-size:15px;font-weight:700;letter-spacing:.5px}.navbar-logo-sub{font-size:8.5px;font-weight:600;color:var(--color-primary);letter-spacing:2px}
        .navbar-links{display:flex;align-items:center;justify-content:center;gap:2px;flex:1}.navbar-link{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:var(--radius-full);color:black;font-size:13.5px;font-weight:500;white-space:nowrap;transition:color var(--transition-fast),background var(--transition-fast)}
        .navbar-link:hover{color:var(--color-text-primary);background:var(--color-bg-secondary)}.navbar-link.active{color:var(--color-primary);font-weight:600;background:var(--color-primary-alpha)}
        .navbar-actions{display:flex;align-items:center;gap:9px;flex-shrink:0}.navbar-search-desktop{display:block}
        .navbar-search-form{height:38px;min-width:200px;display:flex;align-items:center;gap:8px;padding:0 16px;background:#fff;border:1.5px solid var(--color-border);border-radius:var(--radius-full)}
        .navbar-search-icon{color:var(--color-text-muted);flex-shrink:0}.navbar-search-input{width:160px;border:0;outline:0;background:transparent;color:var(--color-text-primary);font-family:var(--font-body);font-size:13px}.navbar-search-input::placeholder{color:var(--color-text-muted)}
        .navbar-avatar,.navbar-search-toggle{width:38px;height:38px;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--color-border);border-radius:50%;background:var(--color-bg-secondary);color:var(--color-text-secondary);transition:color 150ms ease,border-color 150ms ease,background 150ms ease,transform 150ms ease;flex-shrink:0}
        .navbar-avatar:hover,.navbar-search-toggle:hover,.navbar-search-toggle.active{border-color:var(--color-primary);color:var(--color-primary);background:#fff}
        .navbar-search-toggle{display:none}
        .navbar-hamburger{display:none;width:40px;height:40px;padding:10px;align-items:flex-end;justify-content:center;flex-direction:column;gap:4px;border-radius:50%;background:#152238}
        .navbar-hamburger span{display:block;height:1.5px;background:#fff;border-radius:2px;transition:width 170ms ease,transform 170ms ease}.navbar-hamburger span:nth-child(1){width:17px}.navbar-hamburger span:nth-child(2){width:12px}.navbar-hamburger span:nth-child(3){width:17px}
        .navbar-hamburger:hover span:nth-child(2),.navbar-hamburger.active span:nth-child(2){width:17px}
        .navbar-mobile-search{display:none;position:absolute;top:100%;left:0;right:0;padding:0;background:rgba(252,251,247,.98);border-bottom:1px solid #e8e1d6;box-shadow:0 16px 35px rgba(24,34,48,.1);opacity:0;visibility:hidden;transform:translateY(-8px);transition:opacity 190ms ease,transform 190ms ease,visibility 190ms}
        .navbar-mobile-search.open{opacity:1;visibility:visible;transform:none}.navbar-mobile-search>.container{padding-top:14px;padding-bottom:12px}.navbar-mobile-search p{margin:7px 3px 0;color:#8a8277;font-size:9px}
        @media(max-width:1100px){.navbar-links{display:none}.navbar-hamburger{display:flex}.navbar-avatar{display:none}}
        @media(max-width:768px){.navbar-search-desktop{display:none}.navbar-search-toggle{display:flex}.navbar-mobile-search{display:block}.navbar-inner{gap:12px}.navbar-logo-title{font-size:14px}.navbar-logo-icon{font-size:25px}}
        @media(max-width:390px){.navbar-logo-sub{letter-spacing:1.5px}.navbar-logo-title{font-size:13px}.navbar-logo{gap:7px}.navbar-actions{gap:6px}}
        @media(prefers-reduced-motion:reduce){.navbar-mobile-search,.navbar-hamburger span{transition:none}}
      `}</style>
    </>
  );
}
