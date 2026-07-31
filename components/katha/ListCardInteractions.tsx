'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { IInteractionSummary } from '@/types';

interface ListCardInteractionsProps {
  kathaId: string;
  slug: string;
  type: 'audio' | 'video';
  summary?: IInteractionSummary;
  loading?: boolean;
  onToggleLike: (kathaId: string) => Promise<{ ok: boolean; requiresAuth?: boolean }>;
}

export default function ListCardInteractions({
  kathaId,
  slug,
  type,
  summary,
  loading,
  onToggleLike,
}: ListCardInteractionsProps) {
  const router = useRouter();
  const liked = Boolean(summary?.likedByViewer);
  const likeCount = summary?.likeCount ?? 0;
  const commentCount = summary?.commentCount ?? 0;

  async function handleLike(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const result = await onToggleLike(kathaId);
    if (result.requiresAuth) {
      toast.info('ਕਥਾ ਨੂੰ ਪਸੰਦ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।');
      router.push(`/login?callbackUrl=/${type}/${slug}`);
    }
  }

  return (
    <span className="lci" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        className={`lci-btn lci-like${liked ? ' is-liked' : ''}`}
        onClick={(event) => void handleLike(event)}
        aria-pressed={liked}
        aria-label={liked ? 'Unlike' : 'Like'}
        disabled={loading}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>
        </svg>
        <span className="lci-count">{likeCount.toLocaleString()}</span>
      </button>

      <Link
        href={`/${type}/${slug}`}
        className="lci-btn lci-comment"
        aria-label={`${commentCount.toLocaleString()} comments`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>
        </svg>
        <span className="lci-count">{commentCount.toLocaleString()}</span>
      </Link>

      <style>{`
        .lci { display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; }
        .lci-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          min-height: 28px;
          padding: 0 10px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          background: var(--color-surface);
          color: var(--color-text-muted);
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: color var(--transition-fast), border-color var(--transition-fast), background-color var(--transition-fast), transform var(--transition-fast);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .lci-btn:hover {
          color: var(--color-primary);
          border-color: var(--color-primary-light);
          transform: translateY(-1px);
        }
        .lci-btn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
        .lci-btn:disabled { opacity: 0.55; cursor: wait; }
        .lci-like.is-liked {
          color: #c9720c;
          border-color: rgba(201, 114, 12, 0.45);
          background: #fff2dc;
        }
        .lci-count { font-variant-numeric: tabular-nums; }
      `}</style>
    </span>
  );
}
