'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import NavbarSearch from '@/components/layout/NavbarSearch';

const navLinks = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/audio', label: 'Audio' },
  { href: '/video', label: 'Video' },
  { href: '/series', label: 'Series' },
  { href: '/topics', label: 'Topics' },
  { href: '/search', label: 'Library' },
];

function NavIcon({ type }: { type?: string }) {
  if (type === 'home') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    );
  }
  return null;
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    const base = href.split('?')[0];
    return pathname.startsWith(base) && href !== '/';
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
                <Link
                  href={link.href}
                  className={`navbar-link ${isActive(link.href) ? 'active' : ''}`}
                >
                  {link.icon && <NavIcon type={link.icon} />}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            <NavbarSearch />

            <Link href="/profile/favorites" className="navbar-avatar" aria-label="Profile">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>

            <button
              className="navbar-hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M3 6h18M3 18h18"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="navbar-mobile">
            <ul className="navbar-mobile-links">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`navbar-mobile-link ${isActive(link.href) ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: var(--z-navbar);
          background: rgba(252, 251, 247, 0.97);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-border);
          height: var(--navbar-height);
        }

        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          gap: 24px;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .navbar-logo-icon {
          font-size: 28px;
          color: var(--color-primary);
          line-height: 1;
        }

        .navbar-logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .navbar-logo-title {
          font-family: var(--font-heading);
          font-size: 15px;
          font-weight: 700;
          color: var(--color-text-primary);
          letter-spacing: 0.5px;
        }

        .navbar-logo-sub {
          font-size: 8.5px;
          font-weight: 600;
          color: var(--color-primary);
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 2px;
          list-style: none;
          flex: 1;
          justify-content: center;
        }

        .navbar-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--color-text-secondary);
          text-decoration: none;
          border-radius: var(--radius-full);
          transition: color var(--transition-fast), background-color var(--transition-fast);
          white-space: nowrap;
        }

        .navbar-link:hover {
          color: var(--color-text-primary);
          background: var(--color-bg-secondary);
        }

        .navbar-link.active {
          color: var(--color-primary);
          font-weight: 600;
          background: var(--color-primary-alpha);
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .navbar-search-form {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-full);
          padding: 0 16px;
          height: 38px;
          min-width: 200px;
        }

        .navbar-search-icon {
          color: var(--color-text-muted);
          flex-shrink: 0;
        }

        .navbar-search-input {
          border: none;
          background: transparent;
          font-size: 13px;
          color: var(--color-text-primary);
          outline: none;
          width: 160px;
          font-family: var(--font-body);
        }

        .navbar-search-input::placeholder {
          color: var(--color-text-muted);
        }

        .navbar-avatar {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--color-bg-secondary);
          border: 1.5px solid var(--color-border);
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: color var(--transition-fast), border-color var(--transition-fast);
          flex-shrink: 0;
        }

        .navbar-avatar:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .navbar-hamburger {
          display: none;
          width: 36px;
          height: 36px;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: var(--color-text-primary);
          cursor: pointer;
        }

        .navbar-mobile {
          background: var(--color-surface);
          border-top: 1px solid var(--color-border);
          padding: 16px;
          animation: slideDown 0.2s ease;
        }

        .navbar-mobile-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .navbar-mobile-link {
          display: block;
          padding: 10px 16px;
          font-size: 15px;
          font-weight: 500;
          color: var(--color-text-secondary);
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: color var(--transition-fast), background-color var(--transition-fast);
        }

        .navbar-mobile-link:hover,
        .navbar-mobile-link.active {
          background: var(--color-primary-alpha);
          color: var(--color-primary);
        }

        @media (max-width: 1100px) {
          .navbar-links { display: none; }
          .navbar-hamburger { display: flex; }
        }

        @media (max-width: 640px) {
          .navbar-search-form { display: none; }
        }
      `}</style>
    </>
  );
}
