'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TimelineRail from '@/components/timeline/TimelineRail';
import { useTimelineInteractions } from '@/hooks/useTimelineInteractions';
import { formatDuration } from '@/lib/utils';
import { toast } from 'sonner';

interface TimelineCommunityProps {
  kathaId: string;
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  isPlaying?: boolean;
  compact?: boolean;
  dense?: boolean;
}

export default function TimelineCommunity({
  kathaId,
  duration,
  currentTime,
  onSeek,
  isPlaying,
  compact = false,
  dense = false,
}: TimelineCommunityProps) {
  const { data, loading, error, addComment, toggleLike } =
    useTimelineInteractions(kathaId);
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [composing, setComposing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const router = useRouter();

  async function submitComment(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    setActionError('');
    const result = await addComment({
      content: content.trim(),
      timestampSeconds: currentTime,
      guestName: guestName.trim() || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      setActionError(result.error || 'Comment failed');
      toast.error(result.error || 'Comment failed');
      return;
    }
    setContent('');
    setComposing(false);
    toast.success(`Comment added at ${formatDuration(currentTime)}.`);
  }

  async function handleLike() {
    const result = await toggleLike();
    if (result.requiresAuth) {
      toast.info('Sign in to like this Katha.');
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    } else if (!result.ok) {
      setActionError(result.error || 'Like failed');
      toast.error(result.error || 'Like failed');
    } else {
      toast.success(data.likedByViewer ? 'Like removed.' : 'Katha liked.');
    }
  }

  function openComposer() {
    if (data.commentAccess === 'disabled') return;
    if (!data.canComment) {
      toast.info('Sign in to join this timeline conversation.');
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setComposing(true);
  }

  const reduced = compact || dense;
  const comments = reduced ? data.comments.slice(0, 12) : data.comments;

  return (
    <section
      className={`timeline-community ${compact ? 'timeline-community--compact' : ''} ${dense ? 'timeline-community--dense' : ''}`}
      aria-label="Timeline community"
      onClick={(event) => compact && event.stopPropagation()}
    >
      <TimelineRail
        duration={duration}
        currentTime={currentTime}
        comments={comments}
        onSeek={onSeek}
        isPlaying={isPlaying}
        variant={reduced ? 'compact' : 'full'}
      />

      <div className="timeline-actions">
        <button
          type="button"
          className={`timeline-like ${data.likedByViewer ? 'is-liked' : ''}`}
          onClick={handleLike}
          aria-pressed={data.likedByViewer}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill={data.likedByViewer ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>
          </svg>
          <span>{data.likeCount.toLocaleString()}</span>
        </button>
        <button
          type="button"
          className="timeline-comment-trigger"
          onClick={openComposer}
          disabled={data.commentAccess === 'disabled'}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>
          </svg>
          <span>{data.comments.length}</span>
          {!reduced && (
            <b>
              {data.commentAccess === 'disabled'
                ? 'Comments off'
                : `Comment at ${formatDuration(currentTime)}`}
            </b>
          )}
        </button>
        {loading && <span className="timeline-loading">Syncing…</span>}
      </div>

      {composing && (
        <form className="timeline-composer" onSubmit={submitComment}>
          {!data.isAuthenticated && (
            <input
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              maxLength={60}
              placeholder="Your name (optional)"
              aria-label="Your name"
            />
          )}
          <div>
            <span>{formatDuration(currentTime)}</span>
            <input
              autoFocus
              required
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={500}
              placeholder="Share a thought at this moment…"
              aria-label="Timeline comment"
            />
            <button type="submit" disabled={saving}>
              {saving ? '…' : 'Post'}
            </button>
          </div>
        </form>
      )}

      {!reduced && data.comments.length > 0 && (
        <div className="timeline-comment-list">
          {data.comments.slice(0, 8).map((comment) => (
            <button
              type="button"
              key={comment._id}
              onClick={() => onSeek(comment.timestampSeconds)}
            >
              <span>{comment.author.name.charAt(0).toUpperCase()}</span>
              <div>
                <strong>{comment.author.name}</strong>
                <time>{formatDuration(comment.timestampSeconds)}</time>
                <p>{comment.content}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {(error || actionError) && (
        <p className="timeline-error" role="status">{actionError || error}</p>
      )}

      <style>{`
        .timeline-community{margin-top:20px;padding-top:18px;border-top:1px solid rgba(255,255,255,.1);color:#fff}
        .timeline-actions{display:flex;align-items:center;gap:8px;margin-top:11px}
        .timeline-actions button{min-height:35px;display:inline-flex;align-items:center;gap:7px;padding:0 12px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.055);color:rgba(255,255,255,.78);font-size:12px;font-weight:700;transition:.18s ease}
        .timeline-actions button:hover{color:#fff;border-color:rgba(230,148,36,.65);background:rgba(230,148,36,.11)}
        .timeline-actions button:disabled{opacity:.48;cursor:not-allowed}
        .timeline-actions .timeline-like.is-liked{color:#ffad38;border-color:rgba(255,173,56,.48);background:rgba(255,145,25,.12)}
        .timeline-comment-trigger b{font-weight:600;color:rgba(255,255,255,.54)}
        .timeline-loading{font-size:10px;color:rgba(255,255,255,.42)}
        .timeline-composer{margin-top:10px;display:grid;grid-template-columns:minmax(120px,170px) 1fr;gap:8px;animation:timeline-compose-in .2s ease}
        .timeline-composer>input,.timeline-composer>div{min-height:42px;border:1px solid rgba(255,255,255,.14);border-radius:9px;background:rgba(0,0,0,.18)}
        .timeline-composer input{min-width:0;width:100%;padding:0 12px;border:0;outline:0;background:transparent;color:#fff;font-size:12px}
        .timeline-composer>div{display:grid;grid-template-columns:auto 1fr auto;align-items:center;overflow:hidden}
        .timeline-composer>div>span{padding-left:12px;color:#f0aa43;font-size:10px;font-weight:800;font-variant-numeric:tabular-nums}
        .timeline-composer button{align-self:stretch;padding:0 14px;background:#df8a1b;color:#fff;font-size:11px;font-weight:800}
        .timeline-comment-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:12px}
        .timeline-comment-list>button{display:grid;grid-template-columns:28px 1fr;gap:9px;padding:9px;text-align:left;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:rgba(255,255,255,.035);color:#fff;transition:.16s ease}
        .timeline-comment-list>button:hover{background:rgba(255,255,255,.07);border-color:rgba(230,148,36,.35)}
        .timeline-comment-list>button>span{width:28px;height:28px;display:grid;place-items:center;border-radius:50%;background:#b96e12;color:#fff;font-size:10px;font-weight:800}
        .timeline-comment-list strong,.timeline-comment-list time{font-size:10px}.timeline-comment-list time{margin-left:7px;color:#e9a23a}.timeline-comment-list p{margin-top:2px;color:rgba(255,255,255,.65);font-size:11px;line-height:1.4}
        .timeline-error{margin-top:8px;color:#ffb4a8;font-size:11px}
        .timeline-community--compact{margin-top:0;padding:10px 12px 11px;border-top:1px solid #e7e1d7;background:linear-gradient(180deg,#fffdf9,#fff8ed);color:#25344a}
        .timeline-community--compact .timeline-actions{margin-top:7px}
        .timeline-community--compact .timeline-actions button{min-height:29px;padding:0 9px;border-color:#e7d8c2;background:#fff;color:#667085}
        .timeline-community--compact .timeline-actions .timeline-like.is-liked{color:#c9720c;background:#fff2dc}
        .timeline-community--compact .timeline-composer{grid-template-columns:1fr}
        .timeline-community--compact .timeline-composer>input,.timeline-community--compact .timeline-composer>div{border-color:#eadbc5;background:#fff}
        .timeline-community--compact .timeline-composer input{color:#27364d}
        .timeline-community--dense{margin-top:0;padding-top:12px;padding-bottom:12px}
        .timeline-community--dense .timeline-actions{margin-top:7px}
        .timeline-community--dense .timeline-actions button{min-height:30px;padding:0 10px}
        .timeline-community--dense .timeline-rail--compact .timeline-bars i{background:rgba(213,220,231,.42)}
        .timeline-community--dense .timeline-rail--compact .timeline-played{mix-blend-mode:screen}
        @keyframes timeline-compose-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
        @media(max-width:640px){.timeline-comment-list{grid-template-columns:1fr}.timeline-composer{grid-template-columns:1fr}.timeline-comment-trigger b{display:none}}
      `}</style>
    </section>
  );
}
