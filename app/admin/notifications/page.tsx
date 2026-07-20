'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

type NotifType = 'info' | 'success' | 'warning' | 'announcement';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotifType;
  createdAt: string;
}

interface FormState {
  title: string;
  message: string;
  type: NotifType;
}

const empty: FormState = { title: '', message: '', type: 'info' };

const typeBorder: Record<NotifType, string> = {
  info: 'var(--color-info)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  announcement: 'var(--color-primary)',
};

export default function NotificationsAdminPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) setNotifications(data.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch on mount
  useEffect(() => { void load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Notification sent.');
        setShowForm(false);
        setForm(empty);
        load();
      } else {
        setError(data.error ?? 'Failed to send');
        toast.error(data.error ?? 'Failed to send notification.');
      }
    } catch {
      setError('Network error');
      toast.error('Network error while sending notification.');
    }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    setDeleting((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Notification deleted.');
        load();
      } else {
        toast.error(data.error ?? 'Failed to delete.');
      }
    } catch {
      toast.error('Failed to delete notification.');
    } finally {
      setDeleting((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Notifications</h1>
          <p className="admin-page-sub">{notifications.length} notifications</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(true); setError(''); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Send Notification
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h2 className="admin-form-title">New Notification</h2>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="n-title">Title *</label>
              <input id="n-title" type="text" className="input" placeholder="Notification title" required
                value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="n-msg">Message *</label>
              <textarea id="n-msg" className="input" rows={3} required style={{ resize: 'vertical' }}
                value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="n-type">Type</label>
              <select id="n-type" className="input" value={form.type}
                onChange={(e) => setForm(f => ({ ...f, type: e.target.value as NotifType }))}>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>
            {error && <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? 'Sending...' : 'Send Notification'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-muted)' }}>Loading…</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 'var(--space-4)' }}>🔔</div>
          <h3>No notifications yet</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Send your first notification to users.</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => (
            <div key={n._id} className="notif-item" style={{ borderLeftColor: typeBorder[n.type] }}>
              <div className="notif-info">
                <span className="notif-title">{n.title}</span>
                <span className="notif-msg">{n.message}</span>
              </div>
                <div className="notif-meta">
                  <span className={`badge badge-${n.type === 'success' ? 'success' : 'primary'}`}>{n.type}</span>
                  <span className="notif-date">{formatDate(new Date(n.createdAt))}</span>
                  <button
                    className="notif-delete"
                    disabled={deleting.has(n._id)}
                    onClick={() => handleDelete(n._id, n.title)}
                    aria-label={`Delete ${n.title}`}
                  >
                    {deleting.has(n._id) ? '…' : '×'}
                  </button>
                </div>
              </div>
          ))}
        </div>
      )}

      <style>{`
        .admin-page { padding: var(--space-8); }
        .admin-page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-8); gap: var(--space-4); }
        .admin-page-title { font-family: var(--font-heading); font-size: var(--font-size-2xl); font-weight: 700; margin-bottom: var(--space-1); }
        .admin-page-sub { color: var(--color-text-muted); font-size: var(--font-size-sm); }
        .admin-form-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-6); margin-bottom: var(--space-6); box-shadow: var(--shadow-sm); }
        .admin-form-title { font-family: var(--font-heading); font-size: var(--font-size-lg); margin-bottom: var(--space-5); }
        .notif-list { display: flex; flex-direction: column; gap: var(--space-3); }
        .notif-item { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-5); background: var(--color-surface); border: 1px solid var(--color-border); border-left: 4px solid var(--color-primary); border-radius: var(--radius-lg); }
        .notif-info { flex: 1; }
        .notif-title { display: block; font-weight: 600; font-size: var(--font-size-sm); margin-bottom: 2px; }
        .notif-msg { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
        .notif-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .notif-date { font-size: var(--font-size-xs); color: var(--color-text-muted); }
        .notif-delete { width: 28px; height: 28px; border: 1px solid var(--color-border); border-radius: 50%; background: var(--color-surface); color: var(--color-error); cursor: pointer; font-size: 16px; display: grid; place-items: center; transition: background 140ms ease, border-color 140ms ease; margin-top: 4px; }
        .notif-delete:hover { background: rgba(239,68,68,0.08); border-color: var(--color-error); }
        .notif-delete:disabled { opacity: 0.4; cursor: not-allowed; }
        .empty-state { text-align: center; padding: var(--space-16) 0; }
        @media (max-width: 640px) { .admin-page { padding: var(--space-4); } .notif-item { flex-direction: column; align-items: flex-start; } }
      `}</style>
    </div>
  );
}
