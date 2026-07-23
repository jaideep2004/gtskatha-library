'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import KathaGrid from '@/components/katha/KathaGrid';
import { IKatha } from '@/types';

type FavTab = 'katha' | 'series' | 'paath' | 'nittnem';

const TABS: { key: FavTab; label: string }[] = [
  { key: 'katha', label: 'Kathas' },
  { key: 'series', label: 'Series' },
  { key: 'paath', label: 'Paath' },
  { key: 'nittnem', label: 'Nittnem' },
];

export default function FavoritesClient() {
  const [activeTab, setActiveTab] = useState<FavTab>('katha');

  return (
    <>
      <div className="favorites-header">
        <div>
          <h1>My Library</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            Your personal collection
          </p>
        </div>
      </div>

      <div className="fav-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`fav-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <FavTabContent key={activeTab} activeTab={activeTab} />

      <style>{`
        .favorites-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: var(--space-6);
          gap: var(--space-4);
        }
        .fav-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: var(--space-6);
          padding: 4px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          width: fit-content;
        }
        .fav-tab {
          padding: 8px 18px;
          border: none;
          border-radius: var(--radius-md);
          background: transparent;
          color: var(--color-text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all .15s ease;
        }
        .fav-tab.active {
          background: var(--color-surface);
          color: var(--color-text-primary);
          box-shadow: 0 2px 8px rgba(0,0,0,.06);
        }
        .fav-tab:hover:not(.active) { color: var(--color-text-primary); }
        .fav-type-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .fav-type-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          text-decoration: none;
          color: inherit;
          transition: all .15s ease;
        }
        .fav-type-item:hover {
          border-color: var(--color-primary-light);
          box-shadow: var(--shadow-sm);
        }
        .fav-type-icon {
          width: 36px; height: 36px;
          display: grid; place-items: center;
          border-radius: 50%;
          background: var(--color-primary-alpha);
          color: var(--color-primary-dark);
        }
        .fav-type-label {
          flex: 1;
          font-weight: 600;
          font-size: 14px;
        }
        .fav-type-arrow {
          font-size: 14px;
          color: var(--color-text-muted);
        }
        .favorites-empty {
          text-align: center;
          padding: var(--space-20) 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
        }
        .favorites-empty h3 {
          font-family: var(--font-heading);
          font-size: var(--font-size-xl);
        }
        .favorites-empty p { color: var(--color-text-muted); }
      `}</style>
    </>
  );
}

function FavTabContent({ activeTab }: { activeTab: FavTab }) {
  const [kathas, setKathas] = useState<IKatha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData(activeTab).then((data) => {
      setKathas(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)' }}>
        Loading...
      </div>
    );
  }

  if (kathas.length === 0) {
    return (
      <div className="favorites-empty">
        <span style={{ fontSize: 64 }}>❤️</span>
        <h3>No favorites yet</h3>
        <p>Start saving items to build your personal library.</p>
        <Link href="/audio" className="btn btn-primary">Browse Audio Kathas</Link>
      </div>
    );
  }

  if (activeTab === 'katha') {
    return <KathaGrid kathas={kathas} columns={3} />;
  }

  return (
    <div className="fav-type-list">
      {kathas.map((item) => {
        const id = item._id;
        const slug = (item as unknown as { slug?: string }).slug ?? id;
        const title = (item as unknown as { title?: string }).title ?? 'Untitled';
        return (
          <Link key={id} href={`/${activeTab}/${slug}`} className="fav-type-item">
            <span className="fav-type-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </span>
            <span className="fav-type-label">{title}</span>
            <span className="fav-type-arrow">→</span>
          </Link>
        );
      })}
    </div>
  );
}

async function fetchData(activeTab: FavTab) {
  try {
    const params = activeTab !== 'katha' ? `?itemType=${activeTab}` : '';
    const res = await fetch(`/api/favorites${params}`);
    if (res.ok) {
      const data = await res.json();
      return (data.data ?? [])
        .map((f: { kathaId: IKatha | string }) =>
          typeof f.kathaId === 'object' ? f.kathaId : null
        )
        .filter(Boolean) as IKatha[];
    }
  } catch { /* ignore */ }
  return [];
}
