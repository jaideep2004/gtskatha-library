'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CommentAccess } from '@/types';
import { toast } from 'sonner';

interface Settings {
  audioCommentAccess: CommentAccess;
  videoCommentAccess: CommentAccess;
}

const accessOptions: Array<{
  value: CommentAccess;
  title: string;
  description: string;
}> = [
  {
    value: 'everyone',
    title: 'Everyone',
    description: 'Guests and signed-in listeners can leave timeline comments.',
  },
  {
    value: 'authenticated',
    title: 'Members only',
    description: 'Only signed-in users can comment. Everyone can still read comments.',
  },
  {
    value: 'disabled',
    title: 'Comments off',
    description: 'Timeline remains visible, but new comments are blocked.',
  },
];

export default function InteractionSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    audioCommentAccess: 'authenticated',
    videoCommentAccess: 'authenticated',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/interaction-settings', {
        cache: 'no-store',
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to load settings');
      setSettings(payload.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- admin settings load on route mount
    void load();
  }, [load]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/admin/interaction-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to save settings');
      setSettings(payload.data);
      setMessage('Interaction policy saved and added to audit log.');
      toast.success('Interaction policy saved.');
    } catch (saveError) {
      const errorMessage = saveError instanceof Error ? saveError.message : 'Failed to save settings';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="interaction-admin-state">Loading interaction policy…</div>;
  }

  return (
    <div className="interaction-admin">
      <header className="interaction-admin-head">
        <div>
          <span>Community controls</span>
          <h1>Timeline interactions</h1>
          <p>Choose who can join conversations pinned to audio and video moments.</p>
        </div>
        <div className="interaction-signal" aria-hidden>
          {Array.from({ length: 13 }, (_, index) => (
            <i key={index} style={{ height: `${22 + ((index * 17) % 50)}%` }} />
          ))}
        </div>
      </header>

      <form onSubmit={save}>
        <PolicyCard
          media="Audio"
          accent="#df8a1b"
          value={settings.audioCommentAccess}
          onChange={(value) =>
            setSettings((current) => ({ ...current, audioCommentAccess: value }))
          }
        />
        <PolicyCard
          media="Video"
          accent="#536fd1"
          value={settings.videoCommentAccess}
          onChange={(value) =>
            setSettings((current) => ({ ...current, videoCommentAccess: value }))
          }
        />

        <div className="interaction-admin-footer">
          <div>
            <strong>Likes require an account</strong>
            <p>Prevents duplicate anonymous likes and keeps counts trustworthy.</p>
          </div>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save policy'}
          </button>
        </div>
        {message && <p className="interaction-message success">{message}</p>}
        {error && <p className="interaction-message error">{error}</p>}
      </form>

      <style>{`
        .interaction-admin,.interaction-admin-state{padding:32px;max-width:1120px;margin:0 auto}
        .interaction-admin-head{position:relative;min-height:180px;display:flex;align-items:center;justify-content:space-between;overflow:hidden;margin-bottom:22px;padding:30px 34px;border-radius:14px;background:linear-gradient(118deg,#111c2b 0%,#172b3d 58%,#3b2a12 130%);box-shadow:0 18px 45px rgba(18,31,47,.16)}
        .interaction-admin-head>div:first-child{position:relative;z-index:2;max-width:610px}.interaction-admin-head span{color:#e9a23a;font-size:11px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase}.interaction-admin-head h1{margin:8px 0;color:#fff;font-size:36px}.interaction-admin-head p{color:rgba(255,255,255,.62);font-size:14px}
        .interaction-signal{width:250px;height:110px;display:flex;align-items:center;justify-content:flex-end;gap:5px;opacity:.78;transform:skewX(-8deg)}.interaction-signal i{width:8px;min-height:18px;border-radius:99px;background:linear-gradient(#ffc05e,#c97712);box-shadow:0 0 18px rgba(231,148,34,.22)}
        .interaction-admin form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
        .policy-card{--policy-accent:#df8a1b;padding:23px;border:1px solid #e2e5e9;border-radius:12px;background:#fff;box-shadow:0 8px 24px rgba(24,35,49,.045)}
        .policy-card-head{display:flex;align-items:center;gap:12px;margin-bottom:18px}.policy-card-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:10px;background:color-mix(in srgb,var(--policy-accent) 14%,white);color:var(--policy-accent)}.policy-card h2{font-family:var(--font-body);font-size:18px}.policy-card-head p{font-size:12px;color:#7c8695}
        .policy-options{display:grid;gap:9px}.policy-option{position:relative;display:grid;grid-template-columns:20px 1fr;gap:11px;padding:13px;border:1px solid #e4e7eb;border-radius:9px;cursor:pointer;transition:.16s ease}.policy-option:hover{border-color:var(--policy-accent);background:#fffcf7}.policy-option:has(input:checked){border-color:var(--policy-accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--policy-accent) 12%,transparent);background:color-mix(in srgb,var(--policy-accent) 5%,white)}.policy-option input{margin-top:3px;accent-color:var(--policy-accent)}.policy-option strong{display:block;font-size:13px;color:#263449}.policy-option small{display:block;margin-top:3px;color:#7a8491;font-size:11px;line-height:1.5}
        .interaction-admin-footer{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:20px 23px;border:1px solid #e2e5e9;border-radius:12px;background:#fff}.interaction-admin-footer strong{font-size:14px}.interaction-admin-footer p{font-size:11px;color:#7a8491}.interaction-admin-footer button{min-width:140px;height:44px;border-radius:8px;background:#d98519;color:#fff;font-size:13px;font-weight:800;box-shadow:0 8px 18px rgba(217,133,25,.22)}.interaction-admin-footer button:disabled{opacity:.6}
        .interaction-message{grid-column:1/-1;padding:12px 14px;border-radius:8px;font-size:12px}.interaction-message.success{background:#eaf8ef;color:#20723c}.interaction-message.error{background:#fff0ee;color:#b64032}
        @media(max-width:800px){.interaction-admin{padding:18px}.interaction-admin form{grid-template-columns:1fr}.interaction-signal{display:none}.interaction-admin-footer{align-items:flex-start;flex-direction:column}.interaction-admin-footer button{width:100%}}
      `}</style>
    </div>
  );
}

function PolicyCard({
  media,
  accent,
  value,
  onChange,
}: {
  media: 'Audio' | 'Video';
  accent: string;
  value: CommentAccess;
  onChange: (value: CommentAccess) => void;
}) {
  return (
    <section
      className="policy-card"
      style={{ '--policy-accent': accent } as React.CSSProperties}
    >
      <header className="policy-card-head">
        <span className="policy-card-icon" aria-hidden>
          {media === 'Audio' ? (
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          ) : (
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3Z"/>
            </svg>
          )}
        </span>
        <div>
          <h2>{media} comments</h2>
          <p>Policy applies to every published {media.toLowerCase()} Katha.</p>
        </div>
      </header>
      <div className="policy-options">
        {accessOptions.map((option) => (
          <label className="policy-option" key={option.value}>
            <input
              type="radio"
              name={`${media.toLowerCase()}-comment-access`}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>
              <strong>{option.title}</strong>
              <small>{option.description}</small>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
