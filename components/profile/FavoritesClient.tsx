'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import KathaGrid from '@/components/katha/KathaGrid';
import { IKatha } from '@/types';

export default function FavoritesClient() {
  const [kathas, setKathas] = useState<IKatha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/favorites');
        if (res.ok) {
          const data = await res.json();
          // favorites returns { data: IFavorite[] } where kathaId is populated
          const populated = (data.data ?? [])
            .map((f: { kathaId: IKatha | string }) =>
              typeof f.kathaId === 'object' ? f.kathaId : null
            )
            .filter(Boolean) as IKatha[];
          setKathas(populated);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)' }}>
        Loading your library...
      </div>
    );
  }

  return (
    <>
      <div className="favorites-header">
        <div>
          <h1>My Library</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            {kathas.length > 0 ? `${kathas.length} saved kathas` : 'Your personal collection'}
          </p>
        </div>
        <Link href="/search" className="btn btn-outline btn-sm">
          Discover More
        </Link>
      </div>

      {kathas.length > 0 ? (
        <KathaGrid kathas={kathas} columns={3} />
      ) : (
        <div className="favorites-empty">
          <span style={{ fontSize: 64 }}>❤️</span>
          <h3>No favorites yet</h3>
          <p>Start saving kathas to build your personal library.</p>
          <Link href="/audio" className="btn btn-primary">Browse Audio Kathas</Link>
        </div>
      )}

      <style>{`
        .favorites-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: var(--space-8);
          gap: var(--space-4);
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
