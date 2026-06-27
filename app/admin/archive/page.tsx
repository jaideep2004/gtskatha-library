'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import AdminThumbnail from '@/components/admin/AdminThumbnail';
import { toast } from 'sonner';

interface ArchivedKatha {
  _id: string;
  title: string;
  slug: string;
  type: 'audio' | 'video';
  status: 'archived';
  archivedAt?: string;
  updatedAt: string;
  authorName?: string;
  thumbnail?: string;
  audioUrl?: string;
  videoUrl?: string;
  categoryId?: { _id: string; name?: string; slug?: string } | string;
}

export default function ArchivedKathasPage() {
  const [kathas, setKathas] = useState<ArchivedKatha[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search.trim()) params.set('q', search.trim());
      if (type) params.set('type', type);
      const res = await fetch(`/api/admin/archive/kathas?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed to load archive');
      setKathas(data.data);
      setTotal(data.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load archive');
    } finally {
      setLoading(false);
    }
  }, [search, type]);

  useEffect(() => {
    const timeout = window.setTimeout(() => { void load(); }, 250);
    return () => window.clearTimeout(timeout);
  }, [load]);

  async function restoreKatha(katha: ArchivedKatha) {
    if (!confirm(`Restore "${katha.title}" as a draft?`)) return;
    setBusyId(katha._id);
    try {
      const res = await fetch('/api/admin/archive/kathas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: katha._id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Restore failed');
      toast.success(`"${katha.title}" restored as draft.`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Restore failed');
    } finally {
      setBusyId(null);
    }
  }

  async function hardDeleteKatha(katha: ArchivedKatha) {
    if (!confirm(`Permanently delete "${katha.title}" and its uploaded media? This cannot be undone.`)) return;
    setBusyId(katha._id);
    try {
      const res = await fetch(`/api/admin/archive/kathas?id=${encodeURIComponent(katha._id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Delete failed');
      toast.success(`"${katha.title}" permanently deleted.`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setBusyId(null);
    }
  }

  function categoryName(katha: ArchivedKatha) {
    if (!katha.categoryId || typeof katha.categoryId === 'string') return '—';
    return katha.categoryId.name ?? '—';
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Archived Kathas</h1>
          <p className="admin-page-sub">{total} archived kathas</p>
        </div>
      </div>

      <div className="archive-toolbar">
        <input
          className="input"
          placeholder="Search archived kathas..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className="input" value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">All types</option>
          <option value="audio">Audio</option>
          <option value="video">Video</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Loading archived kathas...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Artwork</th>
                <th>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Media</th>
                <th>Archived</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {kathas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">No archived kathas.</td>
                </tr>
              ) : kathas.map((katha) => (
                <tr key={katha._id}>
                  <td>
                    <AdminThumbnail folder="thumbnails" value={katha.thumbnail} alt={`${katha.title} thumbnail`} />
                  </td>
                  <td>
                    <div className="admin-table-title">{katha.title}</div>
                    <code className="slug-cell">{katha.slug}</code>
                  </td>
                  <td><span className={`badge badge-${katha.type}`}>{katha.type}</span></td>
                  <td>{categoryName(katha)}</td>
                  <td>
                    <div className="media-pills">
                      {katha.thumbnail && <span>Thumbnail</span>}
                      {katha.audioUrl && <span>Audio</span>}
                      {katha.videoUrl && <span>Video</span>}
                      {!katha.thumbnail && !katha.audioUrl && !katha.videoUrl && '—'}
                    </div>
                  </td>
                  <td>{formatDate(new Date(katha.archivedAt ?? katha.updatedAt))}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        disabled={busyId === katha._id}
                        onClick={() => restoreKatha(katha)}
                      >
                        Restore
                      </button>
                      <button
                        className="btn btn-ghost btn-sm danger"
                        disabled={busyId === katha._id}
                        onClick={() => hardDeleteKatha(katha)}
                      >
                        Delete forever
                      </button>
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
        .admin-page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-6); gap: var(--space-4); }
        .admin-page-title { font-family: var(--font-heading); font-size: var(--font-size-2xl); font-weight: 700; margin-bottom: var(--space-1); }
        .admin-page-sub { color: var(--color-text-muted); font-size: var(--font-size-sm); }
        .archive-toolbar { display: grid; grid-template-columns: minmax(260px, 1fr) 180px; gap: var(--space-3); margin-bottom: var(--space-5); }
        .loading-state, .empty-cell { text-align: center; padding: var(--space-10); color: var(--color-text-muted); }
        .admin-table-wrap { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: auto; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
        .admin-table th { padding: var(--space-3) var(--space-5); text-align: left; font-size: var(--font-size-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-muted); background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border); white-space: nowrap; }
        .admin-table td { padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--color-border); vertical-align: middle; }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: var(--color-bg); }
        .admin-table-title { font-weight: 600; color: var(--color-text-primary); margin-bottom: 3px; }
        .slug-cell { font-size: 12px; color: var(--color-text-muted); }
        .media-pills { display: flex; flex-wrap: wrap; gap: 6px; color: var(--color-text-muted); }
        .media-pills span { border-radius: var(--radius-full); background: #eef1f5; padding: 3px 8px; font-size: 11px; color: #536174; }
        .admin-table-actions { display: flex; gap: var(--space-1); flex-wrap: wrap; }
        .danger { color: var(--color-error); }
        @media (max-width: 640px) {
          .admin-page { padding: var(--space-4); }
          .archive-toolbar { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
