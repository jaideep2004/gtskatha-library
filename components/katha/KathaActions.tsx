'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMediaUrl } from '@/lib/media';
import { IKatha } from '@/types';
import { toast } from 'sonner';

interface KathaActionsProps {
  katha: Pick<IKatha, '_id' | 'slug' | 'type' | 'audioUrl' | 'videoUrl' | 'allowDownload'>;
  isAuthenticated: boolean;
}

export default function KathaActions({ katha, isAuthenticated }: KathaActionsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    void fetch('/api/favorites')
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!active || !payload?.data) return;
        setIsFavorite(payload.data.some((favorite: { kathaId: string | { _id: string } }) => {
          const id = typeof favorite.kathaId === 'string'
            ? favorite.kathaId
            : favorite.kathaId?._id;
          return id === katha._id;
        }));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [isAuthenticated, katha._id]);

  async function handleFavorite() {
    if (!isAuthenticated) {
      toast.info('Sign in to save Kathas.');
      router.push(`/login?callbackUrl=/${katha.type}/${katha.slug}`);
      return;
    }
    setSaving(true);
    const method = isFavorite ? 'DELETE' : 'POST';
    try {
      const response = await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kathaId: katha._id }),
      });
      if (response.ok) {
        setIsFavorite((current) => !current);
        toast.success(isFavorite ? 'Removed from your library.' : 'Added to your library.');
      } else {
        const payload = await response.json().catch(() => null);
        toast.error(payload?.error || 'Library update failed.');
      }
    } catch {
      toast.error('Library update failed.');
    } finally {
      setSaving(false);
    }
  }

  const mediaValue = katha.type === 'audio' ? katha.audioUrl : katha.videoUrl;
  const mediaUrl = mediaValue ? getMediaUrl(katha.type, mediaValue) : '';

  return (
    <div className="katha-actions">
      <button
        className={`btn ${isFavorite ? 'btn-primary' : 'btn-outline'}`}
        type="button"
        onClick={handleFavorite}
        disabled={saving}
        aria-pressed={isFavorite}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
        </svg>
        {saving ? 'Saving...' : isFavorite ? 'In Library' : 'Add to Library'}
      </button>

      {katha.allowDownload && mediaUrl && (
        <a className="btn btn-ghost" href={mediaUrl} download>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download
        </a>
      )}

      <style>{`
        .katha-actions {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}
