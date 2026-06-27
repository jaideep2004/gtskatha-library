'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateSlug } from '@/lib/utils';
import FileUpload from '@/components/admin/FileUpload';
import AdminThumbnail from '@/components/admin/AdminThumbnail';
import { toast } from 'sonner';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  audioCount?: number;
  videoCount?: number;
  kathaCount?: number;
}

interface FormState { name: string; slug: string; description: string; thumbnail: string; }
const empty: FormState = { name: '', slug: '', description: '', thumbnail: '' };

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch on mount
  useEffect(() => { void load(); }, [load]);

  function openNew() {
    setForm(empty);
    setEditingSlug(null);
    setError('');
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      thumbnail: cat.thumbnail ?? '',
    });
    setEditingSlug(cat.slug);
    setError('');
    setShowForm(true);
  }

  // Auto-fill slug from name when creating new
  function handleNameChange(name: string) {
    setForm(f => ({ ...f, name, slug: editingSlug ? f.slug : generateSlug(name) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        description: form.description,
        thumbnail: form.thumbnail || undefined,
      };
      const method = editingSlug ? 'PUT' : 'POST';
      const url = editingSlug ? `/api/categories/${editingSlug}` : '/api/categories';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        toast.success(editingSlug ? 'Category updated.' : 'Category created.');
        setShowForm(false);
        load();
      } else {
        setError(data.error ?? 'Failed to save');
        toast.error(data.error ?? 'Failed to save category.');
      }
    } catch {
      setError('Network error');
      toast.error('Network error while saving category.');
    }
    finally { setSaving(false); }
  }

  async function handleDelete(slug: string, name: string) {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`"${name}" deleted.`);
        load();
      } else toast.error(data.error || 'Delete failed.');
    } catch { toast.error('Delete failed'); }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Categories</h1>
          <p className="admin-page-sub">{categories.length} categories</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add Category
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h2 className="admin-form-title">{editingSlug ? 'Edit Category' : 'Add Category'}</h2>
          <form className="admin-form-inline" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="cat-name">Name *</label>
              <input id="cat-name" type="text" className="input" placeholder="Category name" required
                value={form.name} onChange={(e) => handleNameChange(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cat-slug">Slug</label>
              <input id="cat-slug" type="text" className="input" placeholder="auto-generated"
                value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" htmlFor="cat-desc">Description</label>
              <input id="cat-desc" type="text" className="input" placeholder="Short description"
                value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <FileUpload
                key={`category-${editingSlug ?? 'new'}-${form.thumbnail}`}
                folder="thumbnails"
                label="Category Thumbnail"
                accept="image/*"
                hint="JPG, PNG, WebP — max 20 MB"
                currentFile={form.thumbnail}
                onUploaded={(thumbnail) => setForm((current) => ({ ...current, thumbnail }))}
              />
            </div>
            {error && <p style={{ gridColumn: '1/-1', color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>{error}</p>}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 'var(--space-3)' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? 'Saving…' : 'Save Category'}
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
              <tr><th>Artwork</th><th>Name</th><th>Slug</th><th>Audio</th><th>Video</th><th>Total</th><th>Description</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-10)' }}>No categories yet.</td></tr>
              ) : categories.map((cat) => (
                <tr key={cat._id}>
                  <td>
                    <AdminThumbnail folder="thumbnails" value={cat.thumbnail} alt={`${cat.name} thumbnail`} />
                  </td>
                  <td style={{ fontWeight: 500 }}>{cat.name}</td>
                  <td><code style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{cat.slug}</code></td>
                  <td><span className="count-pill count-audio">{cat.audioCount ?? 0}</span></td>
                  <td><span className="count-pill count-video">{cat.videoCount ?? 0}</span></td>
                  <td><span className="count-pill count-total">{cat.kathaCount ?? 0}</span></td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{cat.description}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(cat)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => handleDelete(cat.slug, cat.name)}>Delete</button>
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
        .admin-form-inline { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
        .admin-table-wrap { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: auto; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
        .admin-table th { padding: var(--space-3) var(--space-5); text-align: left; font-size: var(--font-size-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-muted); background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border); white-space: nowrap; }
        .admin-table td { padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--color-border); vertical-align: middle; }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: var(--color-bg); }
        .count-pill { min-width: 32px; height: 26px; display: inline-grid; place-items: center; padding: 0 10px; border-radius: var(--radius-full); font-size: 12px; font-weight: 700; }
        .count-audio { color: #b65f00; background: #fff1df; }
        .count-video { color: #315fe0; background: #edf2ff; }
        .count-total { color: #233044; background: #eef1f5; }
        @media (max-width: 640px) { .admin-page { padding: var(--space-4); } .admin-form-inline { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
