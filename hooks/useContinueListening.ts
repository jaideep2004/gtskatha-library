'use client';

import { useState, useCallback } from 'react';
import { IContinueListening } from '@/types';

export function useContinueListening() {
  const [items, setItems] = useState<IContinueListening[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/continue-listening');
      if (res.ok) {
        const data = await res.json();
        setItems(data.data ?? []);
      }
    } catch (err) {
      console.error('Load continue listening error:', err);
    }
  }, []);

  const update = useCallback(async (kathaId: string, currentTime: number, duration: number) => {
    try {
      await fetch('/api/continue-listening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kathaId, currentTime, duration }),
      });
    } catch (err) {
      console.error('Update continue listening error:', err);
    }
  }, []);

  return { items, load, update };
}
