'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateSlug } from '@/lib/utils';
import FileUpload from '@/components/admin/FileUpload';
import AdminThumbnail from '@/components/admin/AdminThumbnail';
import { toast } from 'sonner';

interface Series {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  featured: boolean;
  sortOrder: number;
  thumbnail?: string;
  audioCount?: number;
  videoCount?: number;
}

interface FormState {
  title: string;
  description: string;
  featured: boolean;
  sortOrder: number;
  thumbnail: string;
}

const empty: FormState = { title: '', description: '', featured: false, sortOrder: 0, thumbnail: '' };

export default function SeriesAdminPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/series');
      const data = await res.json();
      if (data.success) setSeries(data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch on mount
  useEffect(() => { void load(); }, [load]);

  function openNew() {
    setForm(empty);
    setEditingSlug(null);
    setError('');
    setShowForm(true);
  }

  function openEdit(s: Series) {
    setForm({
      title: s.title,
      description: s.description ?? '',
      featured: s.featured,
      sortOrder: s.sortOrder,
      thumbnail: s.thumbnail ?? '',
    });
    setEditingSlug(s.slug);
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, slug: generateSlug(form.title) };
      const method = editingSlug ? 'PUT' : 'POST';
      const url = editingSlug ? `/api/series/${editingSlug}` : '/api/series';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        toast.success(editingSlug ? 'Series updated.' : 'Series created.');
        setShowForm(false);
        load();
      } else {
        setError(data.error ?? 'Failed to save');
        toast.error(data.error ?? 'Failed to save series.');
      }
    } catch {
      setError('Network error');
      toast.error('Network error while saving series.');
    }
    finally { setSaving(false); }
  }

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Delete series "${title}"?`)) return;
    try {
      const res = await fetch(`/api/series/${slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`"${title}" deleted.`);
        load();
      } else toast.error(data.error || 'Delete failed.');
    } catch { toast.error('Delete failed'); }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Series</h1>
          <p className="admin-page-sub">{series.length} series</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add Series
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h2 className="admin-form-title">{editingSlug ? 'Edit Series' : 'Add Series'}</h2>
          <form style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'var(--space-4)' }} onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="s-title">Title *</label>
              <input id="s-title" type="text" className="input" placeholder="Series title" required
                value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <FileUpload
                key={`series-${editingSlug ?? 'new'}-${form.thumbnail}`}
                folder="series"
                label="Series Thumbnail"
                accept="image/*"
                hint="JPG, PNG, WebP — max 20 MB"
                currentFile={form.thumbnail}
                onUploaded={(thumbnail) => setForm((current) => ({ ...current, thumbnail }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="s-sort">Sort Order</label>
              <input id="s-sort" type="number" className="input" min={0}
                value={form.sortOrder} onChange={(e) => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label" htmlFor="s-desc">Description</label>
              <textarea id="s-desc" className="input" rows={2} style={{ resize: 'vertical' }}
                value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Options</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-sm)', cursor: 'pointer', paddingTop: 4 }}>
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm(f => ({ ...f, featured: e.target.checked }))} />
                Featured
              </label>
            </div>
            {error && <p style={{ gridColumn: '1/-1', color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>{error}</p>}
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 'var(--space-3)' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? 'Saving…' : 'Save Series'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-muted)' }}>Loading…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Artwork</th><th>Title</th><th>Audio</th><th>Video</th><th>Sort</th><th>Featured</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {series.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-10)' }}>No series yet.</td></tr>
              ) : series.map((s) => (
                <tr key={s._id}>
                  <td>
                    <AdminThumbnail folder="series" value={s.thumbnail} alt={`${s.title} thumbnail`} />
                  </td>
                  <td style={{ fontWeight: 500 }}>{s.title}</td>
                  <td><span className="badge badge-audio">{s.audioCount ?? '—'}</span></td>
                  <td><span className="badge badge-video">{s.videoCount ?? '—'}</span></td>
                  <td>{s.sortOrder}</td>
                  <td>{s.featured ? <span className="badge badge-primary">Yes</span> : <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>No</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => handleDelete(s.slug, s.title)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .admin-page { padding: var(--space-8); }
        .admin-page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-8); gap: var(--space-4); }
        .admin-page-title { font-family: var(--font-heading); font-size: var(--font-size-2xl); font-weight: 700; margin-bottom: var(--space-1); }
        .admin-page-sub { color: var(--color-text-muted); font-size: var(--font-size-sm); }
        .admin-form-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-6); margin-bottom: var(--space-6); box-shadow: var(--shadow-sm); }
        .admin-form-title { font-family: var(--font-heading); font-size: var(--font-size-lg); margin-bottom: var(--space-5); }
        .admin-table-wrap { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: auto; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
        .admin-table th { padding: var(--space-3) var(--space-5); text-align: left; font-size: var(--font-size-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-muted); background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border); white-space: nowrap; }
        .admin-table td { padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--color-border); vertical-align: middle; }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: var(--color-bg); }
        @media (max-width: 640px) { .admin-page { padding: var(--space-4); } }
      `}</style>
    </div>
  );
}
