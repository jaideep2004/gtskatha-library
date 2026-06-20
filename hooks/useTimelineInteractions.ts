'use client';

import { useCallback, useEffect, useState } from 'react';
import type { IInteractionSnapshot, ITimelineComment } from '@/types';

const emptySnapshot: IInteractionSnapshot = {
  comments: [],
  likeCount: 0,
  likedByViewer: false,
  isAuthenticated: false,
  commentAccess: 'authenticated',
  canComment: false,
};

export function useTimelineInteractions(kathaId?: string, enabled = true) {
  const [data, setData] = useState<IInteractionSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!kathaId || !enabled) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `/api/interactions?kathaId=${encodeURIComponent(kathaId)}`,
        { cache: 'no-store' }
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to load activity');
      setData(payload.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [enabled, kathaId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch lifecycle begins when media identity changes
    void load();
  }, [load]);

  const addComment = useCallback(
    async (input: {
      content: string;
      timestampSeconds: number;
      guestName?: string;
    }) => {
      if (!kathaId) return { ok: false, error: 'Missing Katha' };
      const response = await fetch('/api/interactions/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kathaId, ...input }),
      });
      const payload = await response.json();
      if (!response.ok) return { ok: false, error: payload.error || 'Comment failed' };
      setData((current) => ({
        ...current,
        comments: [...current.comments, payload.data].sort(
          (a: ITimelineComment, b: ITimelineComment) =>
            a.timestampSeconds - b.timestampSeconds
        ),
      }));
      return { ok: true };
    },
    [kathaId]
  );

  const toggleLike = useCallback(async () => {
    if (!kathaId) return { ok: false, error: 'Missing Katha' };
    if (!data.isAuthenticated) return { ok: false, requiresAuth: true };

    const nextLiked = !data.likedByViewer;
    setData((current) => ({
      ...current,
      likedByViewer: nextLiked,
      likeCount: Math.max(0, current.likeCount + (nextLiked ? 1 : -1)),
    }));
    const response = await fetch('/api/interactions/likes', {
      method: nextLiked ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kathaId }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setData((current) => ({
        ...current,
        likedByViewer: !nextLiked,
        likeCount: Math.max(0, current.likeCount + (nextLiked ? -1 : 1)),
      }));
      return { ok: false, error: payload.error || 'Like failed' };
    }
    setData((current) => ({ ...current, ...payload.data }));
    return { ok: true };
  }, [data.isAuthenticated, data.likedByViewer, kathaId]);

  return { data, loading, error, addComment, toggleLike, reload: load };
}
