'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { formatDuration, getThumbnailUrl } from '@/lib/utils';
import FileUpload from '@/components/admin/FileUpload';
import { toast } from 'sonner';

interface Paath {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  entryCount?: number;
  active: boolean;
}

interface PaathEntry {
  _id: string;
  paathId: string;
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

export default function PaathAdminPage() {
  const [paaths, setPaaths] = useState<Paath[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', thumbnail: '' });
  const [saving, setSaving] = useState(false);
  const [paathThumbUploading, setPaathThumbUploading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [entries, setEntries] = useState<Record<string, PaathEntry[]>>({});
  const [entriesLoading, setEntriesLoading] = useState<Record<string, boolean>>({});
  const [showAddEntry, setShowAddEntry] = useState<string | null>(null);
  const [showKathaForm, setShowKathaForm] = useState(false);
  const [kathaForm, setKathaForm] = useState<KathaFormState>(emptyKathaForm);
  const [kathaSaving, setKathaSaving] = useState(false);
  const [kathaError, setKathaError] = useState('');
  const [audioUploading, setAudioUploading] = useState(false);
  const [thumbUploading, setThumbUploading] = useState(false);
  const [copyingSlug, setCopyingSlug] = useState<string | null>(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [reorderIds, setReorderIds] = useState<string[]>([]);
  const [reorderSaving, setReorderSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/paath');
      const data = await res.json();
      if (data.success) setPaaths(data.data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch on mount
  useEffect(() => { void load(); }, [load]);

  async function loadEntries(paathId: string, slug: string) {
    setEntriesLoading(prev => ({ ...prev, [paathId]: true }));
    try {
      const res = await fetch(`/api/paath/${slug}/entries`);
      const data = await res.json();
      if (data.success) setEntries(prev => ({ ...prev, [paathId]: data.data }));
    } catch { toast.error('Failed to load entries'); }
    finally { setEntriesLoading(prev => ({ ...prev, [paathId]: false })); }
  }

  function toggleExpand(paath: Paath) {
    if (reorderMode) return;
    if (expandedId === paath._id) {
      setExpandedId(null);
    } else {
      setExpandedId(paath._id);
      if (!entries[paath._id]) loadEntries(paath._id, paath.slug);
    }
  }

  function openNew() {
    setForm({ title: '', description: '', thumbnail: '' });
    setEditingSlug(null);
    setError('');
    setShowForm(true);
  }

  function openEdit(p: Paath) {
    setForm({ title: p.title, description: p.description ?? '', thumbnail: p.thumbnail ?? '' });
    setEditingSlug(p.slug);
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
      const url = editingSlug ? `/api/paath/${editingSlug}` : '/api/paath';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        toast.success(editingSlug ? 'Paath updated.' : 'Paath created.');
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
    if (!confirm(`Delete paath "${title}" and all entries?`)) return;
    try {
      const res = await fetch(`/api/paath/${slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(data.archived > 0 ? `"${title}" deleted. ${data.archived} katha(s) archived.` : `"${title}" deleted.`);
        load();
      } else toast.error(data.error || 'Delete failed.');
    } catch { toast.error('Delete failed'); }
  }

  function openKathaDialog(paathSlug: string) {
    setKathaForm(emptyKathaForm);
    setKathaError('');
    setShowAddEntry(paathSlug);
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
          let entryOk = false;
          for (let attempt = 0; attempt < 2 && !entryOk; attempt++) {
            const entryRes = await fetch(`/api/paath/${parentSlug}/entries`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ kathaId }),
            });
            const entryData = await entryRes.json();
            entryOk = !!entryData.success;
            if (!entryOk && attempt === 0) await new Promise((r) => setTimeout(r, 600));
          }
          if (entryOk) {
            toast.success('Katha created and added as entry.');
          } else {
            const createdSlug = data.data?.slug;
            if (createdSlug) {
              try { await fetch(`/api/kathas/${createdSlug}`, { method: 'DELETE' }); } catch { /* ignore */ }
            }
            toast.success('Katha created but failed to add as entry — katha archived.');
          }
        } else {
          toast.success('Katha created.');
        }
        setShowKathaForm(false);
        setKathaForm(emptyKathaForm);
        const paath = paaths.find(p => p.slug === parentSlug);
        if (paath) loadEntries(paath._id, parentSlug!);
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

  async function removeEntry(entryId: string, paathId: string, slug: string) {
    if (!confirm('Remove this entry?')) return;
    try {
      const res = await fetch(`/api/paath/entries/${entryId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(data.archived ? 'Entry removed and katha archived.' : 'Entry removed.');
        const paath = paaths.find(p => p.slug === slug);
        if (paath) loadEntries(paath._id, slug);
        load();
      } else toast.error(data.error || 'Failed to remove entry.');
    } catch { toast.error('Failed to remove entry.'); }
  }

  async function handleCopyToNitnem(paath: Paath) {
    if (!confirm(`Duplicate "${paath.title}" into a Nitnem list? The list is created automatically if it does not exist.`)) return;
    setCopyingSlug(paath.slug);
    try {
      const res = await fetch(`/api/paath/${paath.slug}/copy-to-nitnem`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const d = (data.data ?? {}) as { created?: boolean; list?: { title: string }; added?: number; skipped?: number };
        const createdText = d.created ? ' (new Nitnem list created)' : '';
        toast.success(`Added ${d.added ?? 0} kathas to Nitnem list "${d.list?.title ?? ''}"${createdText}.`);
        load();
      } else {
        toast.error(data.error || 'Failed to copy.');
      }
    } catch { toast.error('Failed to copy.'); }
    finally { setCopyingSlug(null); }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Paath</h1>
          <p className="admin-page-sub">{paaths.length} paath categories</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            className={`btn btn-sm ${reorderMode ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              if (!reorderMode) setReorderIds(paaths.map((p) => p._id));
              setReorderMode(!reorderMode);
            }}
          >
            {reorderMode ? 'Done Reordering' : 'Reorder'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={openNew}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Paath
          </button>
        </div>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h2 className="admin-form-title">{editingSlug ? 'Edit Paath' : 'New Paath Category'}</h2>
          <form className="admin-form-inline" onSubmit={handleSubmit}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" htmlFor="p-title">Title *</label>
              <input id="p-title" type="text" className="input" placeholder="e.g. Japji Sahib" required
                value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" htmlFor="p-desc">Description</label>
              <textarea id="p-desc" className="input" rows={2} placeholder="Optional description"
                value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <FileUpload folder="thumbnails" label="Artwork" accept="image/*"
                currentFile={form.thumbnail}
                onUploaded={(filename) => setForm(f => ({ ...f, thumbnail: filename }))}
                onUploadingChange={setPaathThumbUploading} />
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
        <>
          {reorderMode && (
            <div className="reorder-bar">
              <span>Drag rows to reorder. {reorderIds.length} items.</span>
              <div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={reorderSaving}
                  onClick={async () => {
                    setReorderSaving(true);
                    try {
                      const res = await fetch('/api/paath/reorder', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ids: reorderIds }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        toast.success('Order saved.');
                        setReorderMode(false);
                        load();
                      } else {
                        toast.error(data.error ?? 'Reorder failed.');
                      }
                    } catch {
                      toast.error('Reorder failed.');
                    } finally {
                      setReorderSaving(false);
                    }
                  }}
                >
                  {reorderSaving ? 'Saving…' : 'Save Order'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setReorderMode(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {reorderMode && <th style={{ width: 32 }}></th>}
                  {reorderMode && <th style={{ width: 32 }}>#</th>}
                  <th>Name</th><th>Slug</th><th>Entries</th><th>Status</th>
                  {!reorderMode && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paaths.length === 0 ? (
                  <tr><td colSpan={reorderMode ? 6 : 5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-10)' }}>No paath categories yet.</td></tr>
                ) : reorderMode ? reorderIds
                  .map((id) => paaths.find((p) => p._id === id))
                  .filter(Boolean)
                  .map((p, idx) => (
                  <tr
                    key={p!._id}
                    className="reorder-row"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', p!._id);
                      e.dataTransfer.effectAllowed = 'move';
                      (e.currentTarget as HTMLElement).classList.add('dragging');
                    }}
                    onDragEnd={(e) => {
                      (e.currentTarget as HTMLElement).classList.remove('dragging');
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromId = e.dataTransfer.getData('text/plain');
                      if (!fromId || fromId === p!._id) return;
                      setReorderIds((prev) => {
                        const fromIdx = prev.indexOf(fromId);
                        const toIdx = prev.indexOf(p!._id);
                        if (fromIdx === -1 || toIdx === -1) return prev;
                        const next = [...prev];
                        const [moved] = next.splice(fromIdx, 1);
                        next.splice(toIdx, 0, moved);
                        return next;
                      });
                    }}
                  >
                    <td className="reorder-handle-cell">
                      <span className="reorder-handle">⠿</span>
                    </td>
                    <td className="order-index">{idx + 1}</td>
                    <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
                      {p!.thumbnail && <img src={getThumbnailUrl(p!.thumbnail)} alt="" className="admin-thumb-sm" />}
                      {p!.title}
                    </td>
                    <td><code style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{p!.slug}</code></td>
                    <td><span className="count-pill count-total">{p!.entryCount ?? 0}</span></td>
                    <td>{p!.active ? <span className="badge badge-success">Active</span> : <span className="badge badge-draft">Inactive</span>}</td>
                  </tr>
                  )) : paaths.map((p) => (
                <Fragment key={p._id}>
                  <tr className="paath-row" onClick={() => toggleExpand(p)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`paath-expand ${expandedId === p._id ? 'expanded' : ''}`}>▸</span>
                      {p.thumbnail && <img src={getThumbnailUrl(p.thumbnail)} alt="" className="admin-thumb-sm" />}
                      {p.title}
                    </td>
                    <td><code style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{p.slug}</code></td>
                    <td><span className="count-pill count-total">{p.entryCount ?? 0}</span></td>
                    <td>{p.active ? <span className="badge badge-success">Active</span> : <span className="badge badge-draft">Inactive</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-ghost btn-sm" title="Duplicate this Paath into a Nitnem list (creates the list if needed)"
                          disabled={copyingSlug !== null}
                          onClick={() => void handleCopyToNitnem(p)}>{copyingSlug === p.slug ? 'Copying…' : 'Copy to Nitnem'}</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => handleDelete(p.slug, p.title)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === p._id && (
                    <tr key={`${p._id}-entries`}>
                      <td colSpan={5} style={{ padding: 0 }}>
                        <div className="paath-entries-panel">
                          <div className="paath-entries-header">
                            <h4>Entries — {p.title}</h4>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowAddEntry(showAddEntry === p._id ? null : p._id)}>
                              {showAddEntry === p._id ? 'Cancel' : '+ Add Katha'}
                            </button>
                          </div>

                          {showAddEntry === p._id && (
                            <div className="paath-add-entry">
                              <button className="btn btn-primary btn-sm" onClick={() => openKathaDialog(p.slug)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 5v14M5 12h14"/>
                                </svg>
                                Create Paath
                              </button>
                              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Creates a new katha and adds it as a Paath entry</span>
                            </div>
                          )}

                          {entriesLoading[p._id] ? (
                            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>Loading entries…</div>
                          ) : !entries[p._id] || entries[p._id].length === 0 ? (
                            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textAlign: 'center' }}>No kathas added yet.</div>
                          ) : (
                            <div className="paath-entries-list">
                              {entries[p._id].map((entry, idx) => (
                                <div key={entry._id} className="paath-entry-item">
                                  <span className="paath-entry-order">{idx + 1}</span>
                                  {entry.kathaId?.thumbnail && (
                                    <div className="paath-entry-thumb">
                                      <img src={getThumbnailUrl(entry.kathaId.thumbnail)} alt="" />
                                    </div>
                                  )}
                                  <div className="paath-entry-info">
                                    <strong>{entry.kathaId?.title ?? entry.title ?? 'Unknown'}</strong>
                                    <small>{entry.kathaId?.type?.toUpperCase()} · {entry.kathaId?.duration ? formatDuration(entry.kathaId.duration) : '—'} · {entry.kathaId?.authorName ?? '—'}</small>
                                  </div>
                                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }}
                                    onClick={() => removeEntry(entry._id, p._id, p.slug)}>Remove</button>
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
        </>
      )}

      {showKathaForm && (
        <div className="admin-form-overlay" onClick={() => { if (!kathaSaving) { setShowKathaForm(false); setKathaForm(emptyKathaForm); } }}>
          <div className="admin-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-form-modal-header">
              <h2 className="admin-form-title">Create New Katha for Paath Entry</h2>
              {!kathaSaving && <button type="button" className="admin-form-close" onClick={() => { setShowKathaForm(false); setKathaForm(emptyKathaForm); }} aria-label="Close">×</button>}
            </div>
            <form className="admin-form" onSubmit={handleCreateKatha}>
              <div className="form-group">
                <label className="form-label" htmlFor="kp-title">Title *</label>
                <input id="kp-title" type="text" className="input" placeholder="Katha title" required
                  value={kathaForm.title}
                  onChange={(e) => setKathaForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="kp-type">Type *</label>
                  <select id="kp-type" className="input" value={kathaForm.type}
                    onChange={(e) => setKathaForm(f => ({ ...f, type: e.target.value as 'audio' | 'video' }))}>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="kp-author">Speaker / Author</label>
                  <input id="kp-author" type="text" className="input" placeholder="Bhai Sahib Ji"
                    value={kathaForm.authorName}
                    onChange={(e) => setKathaForm(f => ({ ...f, authorName: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="kp-desc">Description</label>
                <textarea id="kp-desc" className="input" rows={3} placeholder="Katha description..."
                  value={kathaForm.description}
                  onChange={(e) => setKathaForm(f => ({ ...f, description: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="kp-duration">Duration (seconds)</label>
                  <input id="kp-duration" type="number" className="input" min="0" step="1" placeholder="Enter if known"
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
                  {kathaSaving ? 'Creating…' : 'Create & Add to Paath'}
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
        .reorder-row { cursor: grab; }
        .reorder-row.dragging { opacity: 0.3; }
        .reorder-row:hover { background: var(--color-primary-alpha) !important; }
        .reorder-handle-cell { cursor: grab; text-align: center; }
        .reorder-handle { font-size: 18px; color: var(--color-text-muted); user-select: none; line-height: 1; }
        .order-index { color: var(--color-text-muted); font-size: var(--font-size-sm); }
        .reorder-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: var(--space-3) var(--space-5);
          background: var(--color-primary-alpha);
          border: 1px solid var(--color-primary-light);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
          font-size: var(--font-size-sm); color: var(--color-primary-dark);
        }
        .reorder-bar > div { display: flex; gap: var(--space-3); }
      `}</style>
    </div>
  );
}
