'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  targetId: string;
  itemType: 'katha' | 'series' | 'paath' | 'nittnem';
  className?: string;
  variant?: 'icon' | 'pill';
  size?: 'sm' | 'md';
}

export default function FavoriteButton({ targetId, itemType, className = '', variant = 'pill', size = 'md' }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    void fetch(`/api/favorites?itemType=${itemType}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!active || !payload?.data) return;
        setIsFavorite(payload.data.some((fav: { kathaId: string | { _id: string } }) => {
          const id = typeof fav.kathaId === 'string' ? fav.kathaId : fav.kathaId?._id;
          return id === targetId;
        }));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [targetId, itemType]);

  async function handleClick() {
    setSaving(true);
    try {
      const res = await fetch('/api/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, itemType }),
      });
      if (res.ok) {
        setIsFavorite((c) => !c);
        toast.success(isFavorite ? 'Removed' : 'Added to favorites');
      } else {
        const payload = await res.json().catch(() => null);
        if (res.status === 401) {
          toast.info('Sign in to save favorites.');
          router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        toast.error(payload?.error || 'Failed');
      }
    } catch {
      toast.error('Failed');
    } finally {
      setSaving(false);
    }
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={saving}
        className={`fav-btn-icon ${className}`}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={isFavorite}
      >
        <svg width={size === 'sm' ? 16 : 20} height={size === 'sm' ? 16 : 20} viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
        <style>{`
          .fav-btn-icon{display:inline-flex;align-items:center;justify-content:center;border:none;background:transparent;cursor:pointer;color:var(--color-text-muted);transition:color .15s ease,transform .15s ease;padding:4px}
          .fav-btn-icon:hover{color:var(--color-primary);transform:scale(1.12)}
          .fav-btn-icon[aria-pressed=true]{color:var(--color-primary)}
          .fav-btn-icon:disabled{opacity:.5;cursor:default}
        `}</style>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saving}
      className={`fav-btn-pill ${isFavorite ? 'is-fav' : ''} ${className}`}
      aria-pressed={isFavorite}
    >
      <svg width={size === 'sm' ? 14 : 16} height={size === 'sm' ? 14 : 16} viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
      {saving ? '…' : isFavorite ? 'Saved' : 'Save'}
      <style>{`
        .fav-btn-pill{display:inline-flex;align-items:center;gap:6px;padding:${size === 'sm' ? '5px 12px' : '8px 18px'};border-radius:999px;border:1px solid var(--color-border);background:var(--color-surface);color:var(--color-text-secondary);cursor:pointer;font-size:${size === 'sm' ? '11px' : '13px'};font-weight:600;transition:all .15s ease}
        .fav-btn-pill:hover{border-color:var(--color-primary);color:var(--color-primary)}
        .fav-btn-pill.is-fav{background:var(--color-primary-alpha);border-color:var(--color-primary);color:var(--color-primary-dark)}
        .fav-btn-pill:disabled{opacity:.5;cursor:default}
      `}</style>
    </button>
  );
}
