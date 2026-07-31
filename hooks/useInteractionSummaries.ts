'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { IInteractionSummary } from '@/types';

const emptySummary: IInteractionSummary = {
  likeCount: 0,
  commentCount: 0,
  likedByViewer: false,
  isAuthenticated: false,
};

export function useInteractionSummaries(kathaIds: string[]) {
  const [summaries, setSummaries] = useState<Record<string, IInteractionSummary>>({});
  const [loading, setLoading] = useState(false);
  const requestedRef = useRef<string>('');

  useEffect(() => {
    const ids = [...new Set(kathaIds.filter(Boolean))];
    const key = ids.slice().sort().join(',');
    if (!ids.length || key === requestedRef.current) return;
    requestedRef.current = key;
    let active = true;
    setLoading(true);
    fetch(`/api/interactions/batch?kathaIds=${encodeURIComponent(ids.join(','))}`, {
      cache: 'no-store',
    })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!active || !payload?.data?.items) return;
        const authenticated = Boolean(payload.data.authenticated);
        setSummaries(Object.fromEntries(
          ids.map((id) => [
            id,
            { ...emptySummary, ...payload.data.items[id], isAuthenticated: authenticated },
          ])
        ));
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [kathaIds]);

  const toggleLike = useCallback(async (kathaId: string): Promise<{ ok: boolean; requiresAuth?: boolean }> => {
    const current = summaries[kathaId];
    if (!current) return { ok: false };
    if (!current.isAuthenticated) return { ok: false, requiresAuth: true };

    const nextLiked = !current.likedByViewer;
    setSummaries((prev) => ({
      ...prev,
      [kathaId]: {
        ...prev[kathaId],
        likedByViewer: nextLiked,
        likeCount: Math.max(0, (prev[kathaId]?.likeCount ?? 0) + (nextLiked ? 1 : -1)),
      },
    }));
    const response = await fetch('/api/interactions/likes', {
      method: nextLiked ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kathaId }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setSummaries((prev) => ({
        ...prev,
        [kathaId]: {
          ...prev[kathaId],
          likedByViewer: !nextLiked,
          likeCount: Math.max(0, (prev[kathaId]?.likeCount ?? 0) + (nextLiked ? -1 : 1)),
        },
      }));
      return { ok: false };
    }
    if (payload?.data) {
      setSummaries((prev) => ({
        ...prev,
        [kathaId]: {
          ...prev[kathaId],
          ...payload.data,
          isAuthenticated: true,
        },
      }));
    }
    return { ok: true };
  }, [summaries]);

  return { summaries, loading, toggleLike };
}
