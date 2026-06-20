'use client';

import { useState, useCallback } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const isFavorited = useCallback((kathaId: string) => favorites.has(kathaId), [favorites]);

  const toggle = useCallback(async (kathaId: string) => {
    const isFav = favorites.has(kathaId);
    setLoading(true);

    try {
      const method = isFav ? 'DELETE' : 'POST';
      const res = await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kathaId }),
      });

      if (res.ok) {
        setFavorites((prev) => {
          const next = new Set(prev);
          if (isFav) {
            next.delete(kathaId);
          } else {
            next.add(kathaId);
          }
          return next;
        });
      }
    } catch (err) {
      console.error('Toggle favorite error:', err);
    } finally {
      setLoading(false);
    }
  }, [favorites]);

  const loadFavorites = useCallback(async () => {
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        const ids = new Set<string>(
          data.data?.map((f: { kathaId: { _id: string } | string }) =>
            typeof f.kathaId === 'string' ? f.kathaId : f.kathaId._id
          ) ?? []
        );
        setFavorites(ids);
      }
    } catch (err) {
      console.error('Load favorites error:', err);
    }
  }, []);

  return { favorites, isFavorited, toggle, loading, loadFavorites };
}
