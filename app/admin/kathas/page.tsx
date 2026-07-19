'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDuration, formatDate, generateSlug } from '@/lib/utils';
import FileUpload from '@/components/admin/FileUpload';
import BulkAudioKathaUpload from '@/components/admin/BulkAudioKathaUpload';
import AdminThumbnail from '@/components/admin/AdminThumbnail';
import { toast } from 'sonner';

interface Katha {
  _id: string;
  title: string;
  slug: string;
  type: 'audio' | 'video';
  duration?: number;
  published: boolean;
  status?: 'draft' | 'published' | 'archived';
  featured: boolean;
  allowDownload: boolean;
  views: number;
  createdAt: string;
  description?: string;
  tags?: string[];
  authorName?: string;
  audioUrl?: string;
  videoUrl?: string;
  thumbnail?: string;
  categoryId?: string | { _id: string; name?: string; slug?: string };
  seriesId?: string | { _id: string };
  keyTakeaways?: string[];
  references?: string[];
  chapters?: ChapterForm[];
}

interface ChapterForm {
  id: string;
  title: string;
  startTime: string;
  duration: string;
}

interface RelationOption {
  _id: string;
  name?: string;
  title?: string;
}

interface FormState {
  title: string;
  type: 'audio' | 'video';
  description: string;
  authorName: string;
  duration: string;
  tags: string;
  published: boolean;
  featured: boolean;
  allowDownload: boolean;
  seriesId: string;
  categoryId: string;
  audioUrl: string;
  videoUrl: string;
  thumbnail: string;
  keyTakeaways: string;
  references: string;
  chapters: ChapterForm[];
}

const empty: FormState = {
  title: '',
  type: 'audio',
  description: '',
  authorName: '',
  duration: '',
  tags: '',
  published: false,
  featured: false,
  allowDownload: false,
  seriesId: '',
  categoryId: '',
  audioUrl: '',
  videoUrl: '',
  thumbnail: '',
  keyTakeaways: '',
  references: '',
  chapters: [],
};

const PAGE_SIZE = 20;

export default function KathasAdminPage() {
  const [kathas, setKathas] = useState<Katha[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<RelationOption[]>([]);
  const [seriesOptions, setSeriesOptions] = useState<RelationOption[]>([]);
  const [audioUploading, setAudioUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const mediaUploading = audioUploading || videoUploading || thumbnailUploading;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkArchiving, setBulkArchiving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('admin_katha_sort') || 'newest');
  const [reorderMode, setReorderMode] = useState(false);
  const [reorderIds, setReorderIds] = useState<string[]>([]);
  const [reorderSaving, setReorderSaving] = useState(false);
  const [bulkArtworkFile, setBulkArtworkFile] = useState('');
  const [bulkArtworkUploading, setBulkArtworkUploading] = useState(false);
  const [bulkArtworkSaving, setBulkArtworkSaving] = useState(false);

  const loadKathas = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        sort: sortBy,
        page: String(page),
      });
      if (statusFilter) params.set('status', statusFilter);
      const [kathaRes, categoryRes, seriesRes] = await Promise.all([
        fetch(`/api/kathas?${params.toString()}`),
        fetch('/api/categories'),
        fetch('/api/series'),
      ]);
      const [data, categoryData, seriesData] = await Promise.all([
        kathaRes.json(),
        categoryRes.json(),
        seriesRes.json(),
      ]);
      if (data.success) {
        setKathas(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setSelectedIds(new Set());
      }
      if (categoryData.success) setCategories(categoryData.data);
      if (seriesData.success) setSeriesOptions(seriesData.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, sortBy]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch on mount
  useEffect(() => { void loadKathas(); }, [loadKathas]);

  function openNew() {
    setForm(empty);
    setEditingSlug(null);
    setError('');
    setShowForm(true);
  }

  async function openEdit(k: Katha) {
    setError('');
    try {
      const res = await fetch(`/api/kathas/${k.slug}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed to load katha');

      const detail = data.data as Katha;
      setForm({
        title: detail.title,
        type: detail.type,
        description: detail.description ?? '',
        authorName: detail.authorName ?? '',
        duration: detail.duration ? String(detail.duration) : '',
        tags: detail.tags?.join(', ') ?? '',
        published: detail.published,
        featured: detail.featured,
        allowDownload: detail.allowDownload ?? false,
        seriesId: typeof detail.seriesId === 'object'
          ? detail.seriesId._id
          : detail.seriesId ?? '',
        categoryId: typeof detail.categoryId === 'object'
          ? detail.categoryId._id
          : detail.categoryId ?? '',
        audioUrl: detail.audioUrl ?? '',
        videoUrl: detail.videoUrl ?? '',
        thumbnail: detail.thumbnail ?? '',
        keyTakeaways: detail.keyTakeaways?.join('\n') ?? '',
        references: detail.references?.join('\n') ?? '',
        chapters: detail.chapters?.map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          startTime: String(chapter.startTime),
          duration: String(chapter.duration),
        })) ?? [],
      });
      setEditingSlug(k.slug);
      setShowForm(true);
    } catch (loadError) {
      toast.error(loadError instanceof Error ? loadError.message : 'Failed to load katha');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mediaUploading) {
      setError('Wait for media uploads to finish before saving.');
      toast.info('Wait for media uploads to finish.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const payload = {
        title: form.title,
        slug: generateSlug(form.title),
        type: form.type,
        description: form.description,
        authorName: form.authorName || undefined,
        duration: form.duration ? Number(form.duration) : undefined,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        published: form.published,
        featured: form.featured,
        allowDownload: form.allowDownload,
        seriesId: form.seriesId || (editingSlug ? null : undefined),
        categoryId: form.categoryId || (editingSlug ? null : undefined),
        audioUrl: form.audioUrl || undefined,
        videoUrl: form.videoUrl || undefined,
        thumbnail: form.thumbnail || undefined,
        keyTakeaways: form.keyTakeaways.split('\n').map((item) => item.trim()).filter(Boolean),
        references: form.references.split('\n').map((item) => item.trim()).filter(Boolean),
        chapters: form.chapters
          .filter((chapter) => chapter.title.trim())
          .map((chapter, index) => ({
            id: chapter.id || `chapter-${index + 1}`,
            title: chapter.title.trim(),
            startTime: Number(chapter.startTime),
            duration: Number(chapter.duration),
          })),
      };

      const method = editingSlug ? 'PUT' : 'POST';
      const url = editingSlug ? `/api/kathas/${editingSlug}` : '/api/kathas';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingSlug ? 'Katha updated.' : 'Katha created.');
        setShowForm(false);
        setForm(empty);
        loadKathas();
      } else {
        setError(data.error ?? 'Failed to save');
        toast.error(data.error ?? 'Failed to save Katha.');
      }
    } catch {
      setError('Network error');
      toast.error('Network error while saving Katha.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Archive "${title}"? It will disappear from public pages and can be restored later.`)) return;
    try {
      const res = await fetch(`/api/kathas/${slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`"${title}" archived.`);
        loadKathas();
      } else {
        toast.error(data.error || 'Archive failed.');
      }
    } catch {
      toast.error('Archive failed');
    }
  }

  async function togglePublish(slug: string, current: boolean) {
    try {
      const response = await fetch(`/api/kathas/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !current }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to update');
      }
      toast.success(current ? 'Katha moved to draft.' : 'Katha published.');
      loadKathas();
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : 'Failed to update');
    }
  }

  function getCategoryName(katha: Katha) {
    if (!katha.categoryId) return '—';
    if (typeof katha.categoryId === 'object') return katha.categoryId.name ?? '—';
    return categories.find((category) => category._id === katha.categoryId)?.name ?? '—';
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === kathas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(kathas.map((k) => k._id)));
    }
  }

  async function handleBulkArchive() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Archive ${selectedIds.size} katha(s)? They can be restored later from the archive.`)) return;
    setBulkArchiving(true);
    try {
      const res = await fetch('/api/kathas/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setSelectedIds(new Set());
        loadKathas();
      } else {
        toast.error(data.error ?? 'Bulk archive failed.');
      }
    } catch {
      toast.error('Bulk archive failed.');
    } finally {
      setBulkArchiving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Kathas</h1>
          <p className="admin-page-sub">{total} total kathas</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ width: 130 }}
          >
            <option value="">All status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <select
            className="input"
            value={sortBy}
            onChange={(e) => { localStorage.setItem('admin_katha_sort', e.target.value); setSortBy(e.target.value); setPage(1); }}
            style={{ width: 130 }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="popular">Most popular</option>
            <option value="featured">Featured first</option>
            <option value="manual">Manual order</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowBulkUpload((visible) => !visible)}>
            {showBulkUpload ? 'Close Bulk Upload' : 'Bulk Upload Audio'}
          </button>
          <button
            className={`btn btn-sm ${reorderMode ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              if (!reorderMode) setReorderIds(kathas.map((k) => k._id));
              setReorderMode((v) => !v);
            }}
          >
            {reorderMode ? 'Done Reordering' : 'Reorder'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={openNew}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Katha
          </button>
        </div>
      </div>

      {showBulkUpload && (
        <BulkAudioKathaUpload
          categories={categories}
          series={seriesOptions}
          onComplete={() => { void loadKathas(); }}
        />
      )}

      {showForm && (
        <div className="admin-form-card">
          <h2 className="admin-form-title">{editingSlug ? 'Edit Katha' : 'Add New Katha'}</h2>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="k-title">Title *</label>
                <input
                  id="k-title"
                  type="text"
                  className="input"
                  placeholder="Katha title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="k-type">Type *</label>
                <select
                  id="k-type"
                  className="input"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'audio' | 'video' }))}
                >
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="k-desc">Description</label>
                <textarea
                  id="k-desc"
                  className="input"
                  rows={3}
                  placeholder="Katha description..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="k-author">Speaker / Author</label>
                <input
                  id="k-author"
                  type="text"
                  className="input"
                  placeholder="Bhai Sahib Ji"
                  value={form.authorName}
                  onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="k-duration">Duration in seconds</label>
                <input
                  id="k-duration"
                  type="number"
                  className="input"
                  min="0"
                  step="1"
                  placeholder="Auto-detection planned; enter if known"
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="k-tags">Tags (comma separated)</label>
                <input
                  id="k-tags"
                  type="text"
                  className="input"
                  placeholder="naam, simran, gurbani"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="k-category">Category</label>
                <select
                  id="k-category"
                  className="input"
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="k-series">Series</label>
                <select
                  id="k-series"
                  className="input"
                  value={form.seriesId}
                  onChange={(e) => setForm((f) => ({ ...f, seriesId: e.target.value }))}
                >
                  <option value="">No series</option>
                  {seriesOptions.map((series) => (
                    <option key={series._id} value={series._id}>
                      {series.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Options</label>
                <div style={{ display: 'flex', gap: 'var(--space-4)', paddingTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                    />
                    Published
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    />
                    Featured
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.allowDownload}
                      onChange={(e) => setForm((f) => ({ ...f, allowDownload: e.target.checked }))}
                    />
                    Allow download
                  </label>
                </div>
              </div>
              {/* Media uploads */}
              {form.type === 'audio' && (
                <div className="form-group">
                  <FileUpload
                    key={`audio-${editingSlug ?? 'new'}`}
                    folder="audio"
                    label="Audio File"
                    accept="audio/*,.mp3,.mpeg,.mpga"
                    hint="MP3, MPEG, MPGA, WAV, OGG, FLAC — max 1 GB"
                    currentFile={form.audioUrl}
                    onUploaded={(filename) => setForm((f) => ({ ...f, audioUrl: filename }))}
                    onUploadingChange={setAudioUploading}
                  />
                </div>
              )}
              {form.type === 'video' && (
                <div className="form-group">
                  <FileUpload
                    key={`video-${editingSlug ?? 'new'}`}
                    folder="video"
                    label="Video File"
                    accept="video/*"
                    hint="MP4, WebM — max 8 GB"
                    currentFile={form.videoUrl}
                    onUploaded={(filename) => setForm((f) => ({ ...f, videoUrl: filename }))}
                    onUploadingChange={setVideoUploading}
                  />
                </div>
              )}
              <div className="form-group">
                <FileUpload
                  key={`thumbnail-${editingSlug ?? 'new'}`}
                  folder="thumbnails"
                  label="Thumbnail"
                  accept="image/*"
                  hint="JPG, PNG, WebP — max 20 MB"
                  currentFile={form.thumbnail}
                  onUploaded={(filename) => setForm((f) => ({ ...f, thumbnail: filename }))}
                  onUploadingChange={setThumbnailUploading}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="k-takeaways">Key Takeaways</label>
                <textarea
                  id="k-takeaways"
                  className="input"
                  rows={4}
                  placeholder="One takeaway per line…"
                  value={form.keyTakeaways}
                  onChange={(e) => setForm((f) => ({ ...f, keyTakeaways: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="k-references">References</label>
                <textarea
                  id="k-references"
                  className="input"
                  rows={3}
                  placeholder="One reference per line…"
                  value={form.references}
                  onChange={(e) => setForm((f) => ({ ...f, references: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <div className="chapter-heading">
                  <label className="form-label">Chapters</label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setForm((f) => ({
                      ...f,
                      chapters: [
                        ...f.chapters,
                        { id: `chapter-${f.chapters.length + 1}`, title: '', startTime: '0', duration: '0' },
                      ],
                    }))}
                  >
                    Add Chapter
                  </button>
                </div>
                <div className="chapter-list">
                  {form.chapters.length === 0 && (
                    <p className="chapter-empty">No chapters added.</p>
                  )}
                  {form.chapters.map((chapter, index) => (
                    <div className="chapter-row" key={`${chapter.id}-${index}`}>
                      <span className="chapter-number">{index + 1}</span>
                      <input
                        className="input"
                        aria-label={`Chapter ${index + 1} title`}
                        placeholder="Chapter title…"
                        value={chapter.title}
                        onChange={(e) => setForm((f) => ({
                          ...f,
                          chapters: f.chapters.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, title: e.target.value } : item
                          ),
                        }))}
                      />
                      <input
                        className="input chapter-time"
                        type="number"
                        min="0"
                        aria-label={`Chapter ${index + 1} start time in seconds`}
                        placeholder="Start"
                        value={chapter.startTime}
                        onChange={(e) => setForm((f) => ({
                          ...f,
                          chapters: f.chapters.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, startTime: e.target.value } : item
                          ),
                        }))}
                      />
                      <input
                        className="input chapter-time"
                        type="number"
                        min="0"
                        aria-label={`Chapter ${index + 1} duration in seconds`}
                        placeholder="Duration"
                        value={chapter.duration}
                        onChange={(e) => setForm((f) => ({
                          ...f,
                          chapters: f.chapters.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, duration: e.target.value } : item
                          ),
                        }))}
                      />
                      <button
                        type="button"
                        className="chapter-remove"
                        aria-label={`Remove chapter ${index + 1}`}
                        onClick={() => setForm((f) => ({
                          ...f,
                          chapters: f.chapters.filter((_, itemIndex) => itemIndex !== index),
                        }))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {error && (
              <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-3)' }}>
                {error}
              </p>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button type="submit" className="btn btn-primary" disabled={saving || mediaUploading}>
                {mediaUploading ? 'Uploading Media…' : saving ? 'Saving…' : 'Save Katha'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-muted)' }}>
          Loading kathas...
        </div>
      ) : (
        <>
          {selectedIds.size > 0 && (
            <div className="bulk-bar">
              <span className="bulk-count">{selectedIds.size} selected</span>
              {!bulkArtworkFile && (
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={bulkArtworkUploading}
                  onClick={() => setBulkArtworkFile('__pending__')}
                >
                  Set Artwork
                </button>
              )}
              {bulkArtworkFile === '__pending__' && (
                <div className="bulk-artwork-inline">
                  <FileUpload
                    key="bulk-artwork"
                    folder="thumbnails"
                    label=""
                    accept="image/*"
                    hint="JPG, PNG, WebP — max 20 MB"
                    currentFile=""
                    onUploaded={(filename) => {
                      setBulkArtworkFile(filename);
                    }}
                    onUploadingChange={setBulkArtworkUploading}
                  />
                </div>
              )}
              {bulkArtworkFile && bulkArtworkFile !== '__pending__' && (
                <div className="bulk-artwork-inline">
                  <span className="bulk-artwork-name">{bulkArtworkFile}</span>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={bulkArtworkSaving}
                    onClick={async () => {
                      setBulkArtworkSaving(true);
                      try {
                        const res = await fetch('/api/kathas/bulk', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            ids: Array.from(selectedIds),
                            thumbnail: bulkArtworkFile,
                          }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          toast.success(data.message);
                          setBulkArtworkFile('');
                          setSelectedIds(new Set());
                          loadKathas();
                        } else {
                          toast.error(data.error ?? 'Failed to set artwork.');
                        }
                      } catch {
                        toast.error('Failed to set artwork.');
                      } finally {
                        setBulkArtworkSaving(false);
                      }
                    }}
                  >
                    {bulkArtworkSaving ? 'Saving…' : 'Apply Artwork'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setBulkArtworkFile('')}>
                    Cancel
                  </button>
                </div>
              )}
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--color-error)' }}
                disabled={bulkArchiving}
                onClick={handleBulkArchive}
              >
                {bulkArchiving ? 'Archiving…' : 'Archive Selected'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedIds(new Set())}>
                Clear selection
              </button>
            </div>
          )}
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
                      const res = await fetch('/api/kathas/reorder', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ids: reorderIds }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        toast.success('Order saved.');
                        setReorderMode(false);
                        localStorage.setItem('admin_katha_sort', 'manual');
                        setSortBy('manual');
                        setPage(1);
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
                  {!reorderMode && (
                    <th style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        checked={kathas.length > 0 && selectedIds.size === kathas.length}
                        onChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </th>
                  )}
                  <th style={{ width: 32 }}>#</th>
                  <th>Artwork</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Date</th>
                  {!reorderMode && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {kathas.length === 0 ? (
                  <tr>
                    <td colSpan={reorderMode ? 10 : 11} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-10)' }}>
                      No kathas yet. Add your first one!
                    </td>
                  </tr>
                ) : (reorderMode ? reorderIds
                  .map((id) => kathas.find((k) => k._id === id))
                  .filter(Boolean)
                  .map((k, idx) => (
                  <tr
                    key={k!._id}
                    className="reorder-row"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', k!._id);
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
                      if (!fromId || fromId === k!._id) return;
                      setReorderIds((prev) => {
                        const fromIdx = prev.indexOf(fromId);
                        const toIdx = prev.indexOf(k!._id);
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
                    <td><AdminThumbnail folder="thumbnails" value={k!.thumbnail} alt={`${k!.title} thumbnail`} /></td>
                    <td><div className="admin-table-title">{k!.title}</div>{k!.featured && <span className="badge badge-primary" style={{ fontSize: 10 }}>Featured</span>}</td>
                    <td><span className={`badge badge-${k!.type}`}>{k!.type}</span></td>
                    <td><span className="category-cell">{getCategoryName(k!)}</span></td>
                    <td>{k!.duration ? formatDuration(k!.duration) : '—'}</td>
                    <td>{k!.views.toLocaleString()}</td>
                    <td><button className={k!.published ? 'status-published' : 'status-draft'} style={{ cursor: 'default', background: 'none', border: 'none', padding: 0 }}>{k!.published ? 'Published' : 'Draft'}</button></td>
                    <td>{formatDate(new Date(k!.createdAt))}</td>
                  </tr>
                  )) : kathas.map((k, idx) => (
                  <tr
                    key={k._id}
                    className={selectedIds.has(k._id) ? 'row-selected' : ''}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(k._id)}
                        onChange={() => toggleSelect(k._id)}
                        aria-label={`Select ${k.title}`}
                      />
                    </td>
                    <td className="order-index">{idx + 1}</td>
                    <td>
                      <AdminThumbnail folder="thumbnails" value={k.thumbnail} alt={`${k.title} thumbnail`} />
                    </td>
                    <td>
                      <div className="admin-table-title">{k.title}</div>
                      {k.featured && <span className="badge badge-primary" style={{ fontSize: 10 }}>Featured</span>}
                    </td>
                    <td>
                      <span className={`badge badge-${k.type}`}>{k.type}</span>
                    </td>
                    <td><span className="category-cell">{getCategoryName(k)}</span></td>
                    <td>{k.duration ? formatDuration(k.duration) : '—'}</td>
                    <td>{k.views.toLocaleString()}</td>
                    <td>
                      <button
                        className={k.status === 'archived' ? 'status-draft' : k.published ? 'status-published' : 'status-draft'}
                        onClick={() => togglePublish(k.slug, k.published)}
                        style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                        title={k.published ? 'Click to unpublish' : 'Click to publish'}
                      >
                        {k.status === 'archived' ? 'Archived' : k.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td>{formatDate(new Date(k.createdAt))}</td>
                    {!reorderMode && (
                      <td>
                        <div className="admin-table-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(k)}>Edit</button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-error)' }}
                            onClick={() => handleDelete(k.slug, k.title)}
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-bar">
              <button
                className="btn btn-ghost btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="pagination-ellipsis">…</span>}
                      <button
                        className={`pagination-btn ${p === page ? 'pagination-active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
              </div>
              <button
                className="btn btn-ghost btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .admin-page { padding: var(--space-8); }
        .admin-page-header {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-8); gap: var(--space-4);
        }
        .admin-page-title {
          font-family: var(--font-heading);
          font-size: var(--font-size-2xl);
          font-weight: 700; margin-bottom: var(--space-1);
        }
        .admin-page-sub { color: var(--color-text-muted); font-size: var(--font-size-sm); }
        .admin-form-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          margin-bottom: var(--space-6);
          box-shadow: var(--shadow-sm);
        }
        .admin-form-title {
          font-family: var(--font-heading);
          font-size: var(--font-size-lg); margin-bottom: var(--space-5);
        }
        .admin-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
        }
        .admin-table-wrap {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: auto;
        }
        .admin-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
        .admin-table th {
          padding: var(--space-3) var(--space-5);
          text-align: left;
          font-size: var(--font-size-xs); font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.5px;
          color: var(--color-text-muted);
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
          white-space: nowrap;
        }
        .admin-table td {
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid var(--color-border);
          vertical-align: middle;
        }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: var(--color-bg); }
        .row-selected td { background: var(--color-primary-alpha); }
        .admin-table-title { font-weight: 500; color: var(--color-text-primary); margin-bottom: 2px; }
        .category-cell { color: var(--color-text-secondary); font-size: 13px; }
        .admin-table-actions { display: flex; gap: var(--space-1); }
        .order-index { color: var(--color-text-muted); font-size: 12px; font-weight: 500; text-align: center; }
        .reorder-row { cursor: grab; }
        .reorder-row.dragging { opacity: 0.3; }
        .reorder-row:hover { background: var(--color-primary-alpha) !important; }
        .reorder-handle-cell { cursor: grab; text-align: center; }
        .reorder-handle { font-size: 18px; color: var(--color-text-muted); user-select: none; line-height: 1; }
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
        .status-published {
          color: var(--color-success); background: var(--color-success-bg);
          padding: 2px 8px; border-radius: var(--radius-full);
          font-size: var(--font-size-xs); font-weight: 500;
        }
        .status-draft {
          color: var(--color-text-muted); background: var(--color-bg-secondary);
          padding: 2px 8px; border-radius: var(--radius-full);
          font-size: var(--font-size-xs); font-weight: 500;
        }
        .chapter-heading { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
        .chapter-list { display: grid; gap: var(--space-2); }
        .chapter-row { display: grid; grid-template-columns: 28px minmax(180px, 1fr) 110px 110px 36px; gap: var(--space-2); align-items: center; }
        .chapter-number { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; background: var(--color-primary-alpha); color: var(--color-primary-dark); font-size: 12px; font-weight: 700; }
        .chapter-time { font-variant-numeric: tabular-nums; }
        .chapter-remove { width: 36px; height: 36px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); color: var(--color-error); cursor: pointer; font-size: 20px; }
        .chapter-remove:hover { border-color: var(--color-error); background: rgba(239,68,68,0.06); }
        .chapter-empty { padding: var(--space-4); border: 1px dashed var(--color-border); border-radius: 8px; color: var(--color-text-muted); font-size: var(--font-size-sm); }
        .bulk-bar {
          display: flex; align-items: center; gap: var(--space-3);
          padding: var(--space-3) var(--space-5);
          background: var(--color-primary-alpha);
          border: 1px solid var(--color-primary-light);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
          flex-wrap: wrap;
        }
        .bulk-count { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-primary-dark); }
        .bulk-artwork-inline { display: flex; align-items: center; gap: var(--space-3); }
        .bulk-artwork-inline .file-upload-wrap { flex-direction: row; }
        .bulk-artwork-inline .file-upload-area { min-height: 36px; padding: 4px 12px; }
        .bulk-artwork-name { font-size: var(--font-size-xs); color: var(--color-primary-dark); font-weight: 500; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pagination-bar {
          display: flex; align-items: center; justify-content: center;
          gap: var(--space-3); margin-top: var(--space-6);
        }
        .pagination-pages { display: flex; align-items: center; gap: 2px; }
        .pagination-btn {
          width: 36px; height: 36px; display: grid; place-items: center;
          border: 1px solid var(--color-border); border-radius: var(--radius-md);
          background: var(--color-surface); color: var(--color-text-primary);
          font-size: var(--font-size-sm); cursor: pointer;
        }
        .pagination-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .pagination-active {
          background: var(--color-primary); color: white;
          border-color: var(--color-primary); font-weight: 600;
        }
        .pagination-active:hover { color: white; }
        .pagination-ellipsis { color: var(--color-text-muted); padding: 0 2px; font-size: var(--font-size-sm); }
        @media (max-width: 760px) {
          .chapter-row { grid-template-columns: 28px 1fr 36px; }
          .chapter-time { grid-column: span 1; }
          .chapter-row .chapter-time:first-of-type { grid-column: 2; }
        }
        @media (max-width: 640px) {
          .admin-form-grid { grid-template-columns: 1fr; }
          .admin-page { padding: var(--space-4); }
          .pagination-bar { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}
