'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { formatDuration } from '@/lib/utils';
import FileUpload from '@/components/admin/FileUpload';
import { toast } from 'sonner';

interface Nittnem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  entryCount?: number;
  active: boolean;
}

interface NittnemEntry {
  _id: string;
  nittnemId: string;
  kathaId: { _id: string; title: string; slug: string; type: string; thumbnail?: string; duration?: number; authorName?: string };
  order: number;
  title?: string;
}

interface KathaOption {
  _id: string;
  title: string;
  slug: string;
  type: string;
}

interface KathaFormState {
  title: string;
  type: 'audio' | 'video';
  description: string;
  authorName: string;
  duration: string;
  published: boolean;
  featured: boolean;
  allowDownload: boolean;
  audioUrl: string;
  thumbnail: string;
}

const emptyKathaForm: KathaFormState = {
  title: '',
  type: 'audio',
  description: '',
  authorName: '',
  duration: '',
  published: false,
  featured: false,
  allowDownload: false,
  audioUrl: '',
  thumbnail: '',
};

export default function NittnemAdminPage() {
  const [lists, setLists] = useState<Nittnem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', thumbnail: '' });
  const [saving, setSaving] = useState(false);
  const [listThumbUploading, setListThumbUploading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [entries, setEntries] = useState<Record<string, NittnemEntry[]>>({});
  const [entriesLoading, setEntriesLoading] = useState<Record<string, boolean>>({});
  const [showAddEntry, setShowAddEntry] = useState<string | null>(null);
  const [showKathaForm, setShowKathaForm] = useState(false);
  const [kathaForm, setKathaForm] = useState<KathaFormState>(emptyKathaForm);
  const [kathaSaving, setKathaSaving] = useState(false);
  const [kathaError, setKathaError] = useState('');
  const [audioUploading, setAudioUploading] = useState(false);
  const [thumbUploading, setThumbUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nittnem');
      const data = await res.json();
      if (data.success) setLists(data.data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch on mount
  useEffect(() => { void load(); }, [load]);

  async function loadEntries(listId: string, slug: string) {
    setEntriesLoading(prev => ({ ...prev, [listId]: true }));
    try {
      const res = await fetch(`/api/nittnem/${slug}/entries`);
      const data = await res.json();
      if (data.success) setEntries(prev => ({ ...prev, [listId]: data.data }));
    } catch { toast.error('Failed to load entries'); }
    finally { setEntriesLoading(prev => ({ ...prev, [listId]: false })); }
  }

  function toggleExpand(list: Nittnem) {
    if (expandedId === list._id) {
      setExpandedId(null);
    } else {
      setExpandedId(list._id);
      if (!entries[list._id]) loadEntries(list._id, list.slug);
    }
  }

  function openNew() {
    setForm({ title: '', description: '', thumbnail: '' });
    setEditingSlug(null);
    setError('');
    setShowForm(true);
  }

  function openEdit(n: Nittnem) {
    setForm({ title: n.title, description: n.description ?? '', thumbnail: n.thumbnail ?? '' });
    setEditingSlug(n.slug);
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { title: form.title, description: form.description || undefined, thumbnail: form.thumbnail || undefined };
      const method = editingSlug ? 'PUT' : 'POST';
      const url = editingSlug ? `/api/nittnem/${editingSlug}` : '/api/nittnem';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        toast.success(editingSlug ? 'Nittnem list updated.' : 'Nittnem list created.');
        setShowForm(false);
        load();
      } else {
        setError(data.error ?? 'Failed to save');
        toast.error(data.error ?? 'Failed to save.');
      }
    } catch {
      setError('Network error');
      toast.error('Network error.');
    }
    finally { setSaving(false); }
  }

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Delete nittnem list "${title}" and all entries?`)) return;
    try {
      const res = await fetch(`/api/nittnem/${slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`"${title}" deleted.`);
        load();
      } else toast.error(data.error || 'Delete failed.');
    } catch { toast.error('Delete failed'); }
  }

  function openKathaDialog(listSlug: string) {
    setKathaForm(emptyKathaForm);
    setKathaError('');
    setShowAddEntry(listSlug);
    setShowKathaForm(true);
  }

  async function handleCreateKatha(e: React.FormEvent) {
    e.preventDefault();
    if (audioUploading || thumbUploading) {
      setKathaError('Wait for uploads to finish.');
      toast.info('Wait for uploads to finish.');
      return;
    }
    setKathaSaving(true);
    setKathaError('');
    try {
      const payload = {
        title: kathaForm.title,
        type: kathaForm.type,
        description: kathaForm.description || undefined,
        authorName: kathaForm.authorName || undefined,
        duration: kathaForm.duration ? Number(kathaForm.duration) : undefined,
        published: kathaForm.published,
        featured: kathaForm.featured,
        allowDownload: kathaForm.allowDownload,
        audioUrl: kathaForm.audioUrl || undefined,
        thumbnail: kathaForm.thumbnail || undefined,
        status: 'published' as const,
      };
      const res = await fetch('/api/kathas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        const kathaId = data.data._id ?? data.data.id;
        const parentSlug = showAddEntry;
        if (parentSlug && kathaId) {
          const entryRes = await fetch(`/api/nittnem/${parentSlug}/entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kathaId }),
          });
          const entryData = await entryRes.json();
          if (entryData.success) {
            toast.success('Katha created and added as entry.');
          } else {
            toast.success('Katha created but failed to add as entry.');
          }
        } else {
          toast.success('Katha created.');
        }
        setShowKathaForm(false);
        setKathaForm(emptyKathaForm);
        const list = lists.find(n => n.slug === parentSlug);
        if (list) loadEntries(list._id, parentSlug!);
        load();
      } else {
        setKathaError(data.error ?? 'Failed to create katha.');
        toast.error(data.error ?? 'Failed to create katha.');
      }
    } catch {
      setKathaError('Network error.');
      toast.error('Network error.');
    }
    finally { setKathaSaving(false); }
  }

  async function removeEntry(entryId: string, listId: string, slug: string) {
    if (!confirm('Remove this entry?')) return;
    try {
      const res = await fetch(`/api/nittnem/entries/${entryId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Entry removed.');
        const list = lists.find(n => n.slug === slug);
        if (list) loadEntries(list._id, slug);
        load();
      } else toast.error(data.error || 'Failed to remove entry.');
    } catch { toast.error('Failed to remove entry.'); }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Nittnem</h1>
          <p className="admin-page-sub">{lists.length} nittnem lists</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add Nittnem List
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h2 className="admin-form-title">{editingSlug ? 'Edit Nittnem List' : 'New Nittnem List'}</h2>
          <form className="admin-form-inline" onSubmit={handleSubmit}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" htmlFor="n-title">Title *</label>
              <input id="n-title" type="text" className="input" placeholder="e.g. Morning Nittnem" required
                value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" htmlFor="n-desc">Description</label>
              <textarea id="n-desc" className="input" rows={2} placeholder="Optional description"
                value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <FileUpload folder="thumbnails" label="Artwork" accept="image/*"
                currentFile={form.thumbnail}
                onUploaded={(filename) => setForm(f => ({ ...f, thumbnail: filename }))}
                onUploadingChange={setListThumbUploading} />
            </div>
            {error && <p style={{ gridColumn: '1/-1', color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>{error}</p>}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 'var(--space-3)' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? 'Saving…' : editingSlug ? 'Update' : 'Create'}
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
              <tr><th>Name</th><th>Slug</th><th>Entries</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {lists.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-10)' }}>No nittnem lists yet.</td></tr>
              ) : lists.map((n) => (
                <Fragment key={n._id}>
                  <tr className="paath-row" onClick={() => toggleExpand(n)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`paath-expand ${expandedId === n._id ? 'expanded' : ''}`}>▸</span>
                      {n.thumbnail && <img src={`/api/media/thumbnails/${n.thumbnail}`} alt="" className="admin-thumb-sm" />}
                      {n.title}
                    </td>
                    <td><code style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{n.slug}</code></td>
                    <td><span className="count-pill count-total">{n.entryCount ?? 0}</span></td>
                    <td>{n.active ? <span className="badge badge-success">Active</span> : <span className="badge badge-draft">Inactive</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(n)}>Edit</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => handleDelete(n.slug, n.title)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === n._id && (
                    <tr key={`${n._id}-entries`}>
                      <td colSpan={5} style={{ padding: 0 }}>
                        <div className="paath-entries-panel">
                          <div className="paath-entries-header">
                            <h4>Entries — {n.title}</h4>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowAddEntry(showAddEntry === n._id ? null : n._id)}>
                              {showAddEntry === n._id ? 'Cancel' : '+ Add Katha'}
                            </button>
                          </div>

                          {showAddEntry === n._id && (
                            <div className="paath-add-entry">
                              <button className="btn btn-primary btn-sm" onClick={() => openKathaDialog(n.slug)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 5v14M5 12h14"/>
                                </svg>
                                Create Katha
                              </button>
                              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Creates a new katha and adds it as an entry</span>
                            </div>
                          )}

                          {entriesLoading[n._id] ? (
                            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>Loading entries…</div>
                          ) : !entries[n._id] || entries[n._id].length === 0 ? (
                            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textAlign: 'center' }}>No kathas added yet.</div>
                          ) : (
                            <div className="paath-entries-list">
                              {entries[n._id].map((entry, idx) => (
                                <div key={entry._id} className="paath-entry-item">
                                  <span className="paath-entry-order">{idx + 1}</span>
                                  {entry.kathaId?.thumbnail && (
                                    <div className="paath-entry-thumb">
                                      <img src={`/api/media/thumbnails/${entry.kathaId.thumbnail}`} alt="" />
                                    </div>
                                  )}
                                  <div className="paath-entry-info">
                                    <strong>{entry.kathaId?.title ?? entry.title ?? 'Unknown'}</strong>
                                    <small>{entry.kathaId?.type?.toUpperCase()} · {entry.kathaId?.duration ? formatDuration(entry.kathaId.duration) : '—'} · {entry.kathaId?.authorName ?? '—'}</small>
                                  </div>
                                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }}
                                    onClick={() => removeEntry(entry._id, n._id, n.slug)}>Remove</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showKathaForm && (
        <div className="admin-form-overlay" onClick={() => { if (!kathaSaving) { setShowKathaForm(false); setKathaForm(emptyKathaForm); } }}>
          <div className="admin-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-form-modal-header">
              <h2 className="admin-form-title">Create New Katha for Entry</h2>
              {!kathaSaving && <button type="button" className="admin-form-close" onClick={() => { setShowKathaForm(false); setKathaForm(emptyKathaForm); }} aria-label="Close">×</button>}
            </div>
            <form className="admin-form" onSubmit={handleCreateKatha}>
              <div className="form-group">
                <label className="form-label" htmlFor="kn-title">Title *</label>
                <input id="kn-title" type="text" className="input" placeholder="Katha title" required
                  value={kathaForm.title}
                  onChange={(e) => setKathaForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="kn-type">Type *</label>
                  <select id="kn-type" className="input" value={kathaForm.type}
                    onChange={(e) => setKathaForm(f => ({ ...f, type: e.target.value as 'audio' | 'video' }))}>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="kn-author">Speaker / Author</label>
                  <input id="kn-author" type="text" className="input" placeholder="Bhai Sahib Ji"
                    value={kathaForm.authorName}
                    onChange={(e) => setKathaForm(f => ({ ...f, authorName: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="kn-desc">Description</label>
                <textarea id="kn-desc" className="input" rows={3} placeholder="Katha description..."
                  value={kathaForm.description}
                  onChange={(e) => setKathaForm(f => ({ ...f, description: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="kn-duration">Duration (seconds)</label>
                  <input id="kn-duration" type="number" className="input" min="0" step="1" placeholder="Enter if known"
                    value={kathaForm.duration}
                    onChange={(e) => setKathaForm(f => ({ ...f, duration: e.target.value }))} />
                </div>
              </div>
              <div className="form-card">
                <div className="form-card-label">Options</div>
                <div className="form-checkboxes">
                  <label className="form-checkbox">
                    <input type="checkbox" checked={kathaForm.published}
                      onChange={(e) => setKathaForm(f => ({ ...f, published: e.target.checked }))} />
                    Published
                  </label>
                  <label className="form-checkbox">
                    <input type="checkbox" checked={kathaForm.featured}
                      onChange={(e) => setKathaForm(f => ({ ...f, featured: e.target.checked }))} />
                    Featured
                  </label>
                  <label className="form-checkbox">
                    <input type="checkbox" checked={kathaForm.allowDownload}
                      onChange={(e) => setKathaForm(f => ({ ...f, allowDownload: e.target.checked }))} />
                    Allow download
                  </label>
                </div>
              </div>
              <div className="form-divider" />
              <div className="form-group">
                <FileUpload folder="audio" label="Audio File" accept="audio/*,.mp3,.mpeg,.mpga"
                  currentFile={kathaForm.audioUrl}
                  onUploaded={(filename) => setKathaForm(f => ({ ...f, audioUrl: filename }))}
                  onUploadingChange={setAudioUploading} />
              </div>
              <div className="form-group">
                <FileUpload folder="thumbnails" label="Thumbnail" accept="image/*"
                  currentFile={kathaForm.thumbnail}
                  onUploaded={(filename) => setKathaForm(f => ({ ...f, thumbnail: filename }))}
                  onUploadingChange={setThumbUploading} />
              </div>
              {kathaError && <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>{kathaError}</p>}
              <div className="modal-form-actions">
                <button type="submit" className="btn btn-primary" disabled={kathaSaving || audioUploading || thumbUploading}>
                  {kathaSaving ? 'Creating…' : 'Create & Add as Entry'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowKathaForm(false); setKathaForm(emptyKathaForm); }}>Cancel</button>
              </div>
            </form>
          </div>
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
        .count-total { color: #233044; background: #eef1f5; }
        .admin-thumb-sm { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; flex-shrink: 0; background: var(--color-bg-secondary); }
        .paath-expand { display: inline-block; margin-right: 8px; transition: transform 200ms ease; font-size: 12px; color: var(--color-text-muted); }
        .paath-expand.expanded { transform: rotate(90deg); }
        .paath-row:hover { background: var(--color-bg); }
        .paath-entries-panel { padding: var(--space-4) var(--space-6) var(--space-6); background: var(--color-bg); border-top: 1px solid var(--color-border); }
        .paath-entries-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); }
        .paath-entries-header h4 { font-family: var(--font-heading); font-size: var(--font-size-base); }
        .paath-add-entry { margin-bottom: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); }
        .paath-entries-list { display: flex; flex-direction: column; gap: var(--space-2); }
        .paath-entry-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
        .paath-entry-order { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; background: var(--color-primary-alpha); color: var(--color-primary-dark); font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .paath-entry-thumb { width: 40px; height: 28px; border-radius: 4px; overflow: hidden; flex-shrink: 0; background: var(--color-bg-secondary); }
        .paath-entry-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .paath-entry-info { flex: 1; min-width: 0; }
        .paath-entry-info strong { display: block; font-size: var(--font-size-sm); }
        .paath-entry-info small { font-size: var(--font-size-xs); color: var(--color-text-muted); }
        @media (max-width: 640px) { .admin-page { padding: var(--space-4); } }
        .admin-form-overlay{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:rgba(0,0,0,.45);backdrop-filter:blur(4px);animation:adminFormFadeIn 180ms ease}
        .admin-form-modal{background:var(--color-surface);border-radius:var(--radius-xl);padding:var(--space-6) var(--space-8);width:min(800px,calc(100vw - var(--space-8)));max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.25);animation:adminFormPop 220ms cubic-bezier(.34,1.56,.64,1)}
        .admin-form-modal .form-group input:not([type=checkbox]),
        .admin-form-modal .form-group select,
        .admin-form-modal .form-group textarea { width: 100%; box-sizing: border-box; }
        .admin-form-modal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-5)}
        .admin-form-close{width:32px;height:32px;border:1px solid var(--color-border);border-radius:50%;background:var(--color-surface);color:var(--color-text-muted);cursor:pointer;font-size:20px;display:grid;place-items:center;transition:color 140ms ease,border-color 140ms ease}
        .admin-form-close:hover{color:var(--color-error);border-color:var(--color-error)}
        @keyframes adminFormFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes adminFormPop{from{opacity:0;transform:scale(.92) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .admin-form > .form-group { margin-bottom: var(--space-4); }
        .form-row { display: flex; gap: var(--space-4); margin-bottom: var(--space-4); }
        .form-row > .form-group { flex: 1; margin-bottom: 0; }
        @media (max-width: 600px) { .form-row { flex-direction: column; } }
        .form-divider { height: 1px; background: var(--color-border); margin: var(--space-5) 0; }
        .form-card { background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-4) var(--space-5); margin-bottom: var(--space-4); }
        .form-card-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; color: var(--color-text-muted); margin-bottom: var(--space-3); }
        .form-checkboxes { display: flex; flex-wrap: wrap; gap: var(--space-5); padding: var(--space-2) 0; }
        .form-checkbox { display: flex; align-items: center; gap: 6px; font-size: var(--font-size-sm); cursor: pointer; }
        .modal-form-actions { display: flex; gap: var(--space-3); justify-content: flex-end; padding-top: var(--space-2); }
      `}</style>
    </div>
  );
}
