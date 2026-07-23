'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    href: '/',
    label: 'ਮੁੱਖ',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/audio',
    label: 'ਕਥਾ',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
    ),
  },
  {
    href: '/nittnem',
    label: 'ਨਿਤਨੇਮ',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
      </svg>
    ),
  },
  {
    href: '/paath',
    label: 'ਪਾਠ',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    href: '/series',
    label: 'ਲੜੀਆਂ',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
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
