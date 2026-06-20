'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    href: '/',
    label: 'Home',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/audio',
    label: 'Audio',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
    ),
  },
  {
    href: '/search',
    label: 'Search',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    href: '/video',
    label: 'Video',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
  },
  {
    href: '/profile/favorites',
    label: 'Library',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
];

export default function MobileNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`mobile-nav-tab ${isActive(tab.href) ? 'active' : ''}`}
          aria-label={tab.label}
        >
          <span className="mobile-nav-icon">{tab.icon}</span>
          <span className="mobile-nav-label">{tab.label}</span>
        </Link>
      ))}

      <style>{`
        .mobile-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: var(--z-sticky);
          background: var(--color-surface);
          border-top: 1px solid var(--color-border);
          padding: 8px 0 env(safe-area-inset-bottom, 8px);
          flex-direction: row;
          align-items: center;
          justify-content: space-around;
        }

        @media (max-width: 768px) {
          .mobile-nav { display: flex; }
        }

        .mobile-nav-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 4px 12px;
          border-radius: var(--radius-md);
          color: var(--color-text-muted);
          text-decoration: none;
          transition: color var(--transition-fast);
          min-width: 60px;
        }

        .mobile-nav-tab.active {
          color: var(--color-primary);
        }

        .mobile-nav-tab.active .mobile-nav-icon svg {
          fill: rgba(200, 151, 42, 0.15);
        }

        .mobile-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-nav-label {
          font-size: 10px;
          font-weight: 500;
        }
      `}</style>
    </nav>
  );
}
