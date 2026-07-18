'use client';

import { useEffect, useMemo, useRef, useState, type InputHTMLAttributes } from 'react';
import { uploadMediaFile } from '@/lib/clientUpload';
import { toast } from 'sonner';

interface RelationOption {
  _id: string;
  name?: string;
  title?: string;
}

type DraftStatus = 'pending' | 'uploading' | 'ready' | 'creating' | 'created' | 'failed';

interface AudioDraft {
  id: string;
  audioFile: File;
  title: string;
  thumbnailFile?: File;
  audioUrl?: string;
  thumbnail?: string;
  progress: number;
  status: DraftStatus;
  error?: string;
}

interface BulkAudioKathaUploadProps {
  categories: RelationOption[];
  series: RelationOption[];
  onComplete: () => void;
}

const MAX_BATCH_SIZE = 20;
const CONCURRENCY = 2;
const directoryInputProps = { webkitdirectory: '' } as unknown as InputHTMLAttributes<HTMLInputElement>;

function fileStem(fileName: string) {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
}

function titleFromFilename(fileName: string) {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function isAudioFile(file: File) {
  return file.type.startsWith('audio/') || /\.(mp3|mpeg|mpga|wav|ogg|flac)$/i.test(file.name);
}

function isArtworkFile(file: File) {
  return file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
}

function splitIntoBatches<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => (
    items.slice(index * size, (index + 1) * size)
  ));
}

export default function BulkAudioKathaUpload({
  categories,
  series,
  onComplete,
}: BulkAudioKathaUploadProps) {
  const [drafts, setDrafts] = useState<AudioDraft[]>([]);
  const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([]);
  const [artworkPreviewUrls, setArtworkPreviewUrls] = useState<Record<string, string>>({});
  const [authorName, setAuthorName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [tags, setTags] = useState('');
  const [publish, setPublish] = useState(false);
  const [allowDownload, setAllowDownload] = useState(false);
  const [running, setRunning] = useState(false);
  const [activeBatch, setActiveBatch] = useState<{ current: number; total: number } | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const artworkPreviewUrlsRef = useRef<Record<string, string>>({});

  const completeCount = useMemo(
    () => drafts.filter((draft) => draft.status === 'created').length,
    [drafts]
  );

  useEffect(() => () => {
    Object.values(artworkPreviewUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function updateDraft(id: string, patch: Partial<AudioDraft>) {
    setDrafts((current) => current.map((draft) => (
      draft.id === id ? { ...draft, ...patch } : draft
    )));
  }

  function selectAudio(files: FileList | null) {
    if (!files?.length) return;
    const selected = Array.from(files).filter(isAudioFile);
    if (!selected.length) {
      toast.error('No supported audio files were found in this selection.');
      return;
    }
    const artworkByStem = new Map(thumbnailFiles.map((file) => [fileStem(file.name), file]));
    setDrafts((current) => {
      const existing = new Set(current.map((draft) => fileKey(draft.audioFile)));
      const additions = selected.filter((file) => !existing.has(fileKey(file))).map((audioFile, index) => ({
        id: `${fileKey(audioFile)}-${current.length + index}`,
        audioFile,
        title: titleFromFilename(audioFile.name),
        thumbnailFile: artworkByStem.get(fileStem(audioFile.name)),
        progress: 0,
        status: 'pending' as const,
      }));
      if (!additions.length) toast.info('Those audio files are already in this intake.');
      return [...current, ...additions];
    });
  }

  function selectArtwork(files: FileList | null) {
    if (!files?.length) return;
    const selected = Array.from(files).filter(isArtworkFile);
    if (!selected.length) {
      toast.error('No supported artwork files were found. Use JPG, PNG, WebP, or GIF.');
      return;
    }
    const artworkByStem = new Map(selected.map((file) => [fileStem(file.name), file]));
    const defaultArtwork = selected.length === 1 ? selected[0] : undefined;
    const newPreviewUrls: Record<string, string> = {};
    selected.forEach((file) => {
      const key = fileKey(file);
      if (!artworkPreviewUrlsRef.current[key]) {
        newPreviewUrls[key] = URL.createObjectURL(file);
      }
    });
    if (Object.keys(newPreviewUrls).length) {
      setArtworkPreviewUrls((current) => {
        const next = { ...current, ...newPreviewUrls };
        artworkPreviewUrlsRef.current = next;
        return next;
      });
    }
    setThumbnailFiles((current) => {
      const existing = new Set(current.map(fileKey));
      return [...current, ...selected.filter((file) => !existing.has(fileKey(file)))];
    });
    setDrafts((current) => current.map((draft) => ({
      ...draft,
      thumbnailFile: artworkByStem.get(fileStem(draft.audioFile.name)) ?? defaultArtwork ?? draft.thumbnailFile,
      thumbnail: undefined,
    })));
    toast.success(defaultArtwork
      ? 'Artwork set as the default for all selected kathas. You can override it per row.'
      : 'Artwork added. Files with matching names were linked automatically; choose others per row.');
  }

  async function uploadDraft(
    draft: AudioDraft,
    controller: AbortController,
    thumbnailUploads: Map<File, Promise<string>>
  ): Promise<AudioDraft | null> {
    updateDraft(draft.id, { status: 'uploading', progress: 0, error: undefined });
    try {
      const audioUrl = draft.audioUrl ?? await uploadMediaFile(draft.audioFile, 'audio', {
        signal: controller.signal,
        onProgress: (progress) => updateDraft(draft.id, { progress }),
      });
      let thumbnail = draft.thumbnail;
      if (draft.thumbnailFile && !thumbnail) {
        const existing = thumbnailUploads.get(draft.thumbnailFile);
        const upload = existing ?? uploadMediaFile(draft.thumbnailFile, 'thumbnails', {
          signal: controller.signal,
        });
        thumbnailUploads.set(draft.thumbnailFile, upload);
        thumbnail = await upload;
      }
      updateDraft(draft.id, { audioUrl, thumbnail, progress: 100, status: 'ready' });
      return { ...draft, audioUrl, thumbnail, progress: 100, status: 'ready' };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        updateDraft(draft.id, { status: 'pending', progress: 0 });
        return null;
      }
      updateDraft(draft.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Upload failed',
      });
      return null;
    }
  }

  async function createReadyKathas(ready: AudioDraft[]) {
    if (!ready.length) return;

    ready.forEach((draft) => updateDraft(draft.id, { status: 'creating', error: undefined }));
    const response = await fetch('/api/kathas/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: ready.map((draft) => ({
          clientId: draft.id,
          title: draft.title,
          type: 'audio',
          audioUrl: draft.audioUrl,
          thumbnail: draft.thumbnail,
          authorName: authorName || undefined,
          categoryId: categoryId || undefined,
          seriesId: seriesId || undefined,
          tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
          published: publish,
          allowDownload,
        })),
      }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.error ?? 'Katha creation failed');
    }

    for (const result of payload.data as Array<{ clientId: string; success: boolean; error?: string }>) {
      updateDraft(result.clientId, result.success
        ? { status: 'created', error: undefined }
        : { status: 'failed', error: result.error ?? 'Katha creation failed' });
    }
  }

  async function uploadBatch(
    batch: AudioDraft[],
    controller: AbortController,
    thumbnailUploads: Map<File, Promise<string>>
  ) {
    const ready = batch.filter((draft) => draft.status === 'ready' && draft.audioUrl);
    const queue = batch.filter((draft) => draft.status !== 'ready');
    const uploaded: AudioDraft[] = [];
    let cursor = 0;
    const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      while (cursor < queue.length && !controller.signal.aborted) {
        const draft = queue[cursor];
        cursor += 1;
        const result = await uploadDraft(draft, controller, thumbnailUploads);
        if (result) uploaded.push(result);
      }
    });
    await Promise.all(workers);
    return [...ready, ...uploaded];
  }

  async function startBatch() {
    if (!drafts.length || running) return;
    const candidates = drafts.filter((draft) => draft.status !== 'created');
    if (!candidates.length) {
      toast.info('Every selected katha has already been created.');
      return;
    }
    if (publish && candidates.some((draft) => !draft.thumbnailFile && !draft.thumbnail)) {
      toast.error('Published kathas require artwork. Match or select a thumbnail for every audio file.');
      return;
    }
    if (candidates.some((draft) => !draft.title.trim())) {
      toast.error('Every audio file needs a title.');
      return;
    }

    setRunning(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const thumbnailUploads = new Map<File, Promise<string>>();
    const batches = splitIntoBatches(candidates, MAX_BATCH_SIZE);

    try {
      for (const [index, batch] of batches.entries()) {
        if (controller.signal.aborted) break;
        setActiveBatch({ current: index + 1, total: batches.length });
        const ready = await uploadBatch(batch, controller, thumbnailUploads);
        if (controller.signal.aborted || !ready.length) continue;
        try {
          await createReadyKathas(ready);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Katha creation failed. Retry this batch.';
          ready.forEach((draft) => updateDraft(draft.id, { status: 'failed', error: message }));
          toast.error(`Batch ${index + 1} failed to create. Remaining batches continue.`);
        }
      }
      if (!controller.signal.aborted) {
        toast.success('All selected batches finished. Review any rows marked failed.');
        onComplete();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bulk upload failed');
      setDrafts((current) => current.map((draft) => (
        draft.status === 'creating'
          ? { ...draft, status: 'failed', error: 'Katha creation failed. Retry this batch.' }
          : draft
      )));
    } finally {
      setRunning(false);
      setActiveBatch(null);
      abortRef.current = null;
    }
  }

  return (
    <section className="bulk-katha-panel" aria-labelledby="bulk-katha-title">
      <div className="bulk-katha-heading">
        <div>
          <p className="bulk-katha-kicker">Bulk audio intake</p>
          <h2 id="bulk-katha-title">Build kathas from audio collection</h2>
          <p>Select any number of audio files or a whole folder. Uploads run two at a time; records create in groups of {MAX_BATCH_SIZE}.</p>
        </div>
        <div className="bulk-katha-count">{completeCount}/{drafts.length} created</div>
      </div>

      <div className="bulk-katha-actions">
        <button type="button" className="btn btn-primary" onClick={() => audioInputRef.current?.click()} disabled={running}>
          Add audio files
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => folderInputRef.current?.click()} disabled={running}>
          Add audio folder
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => artworkInputRef.current?.click()} disabled={running}>
          Choose artwork
        </button>
        <input ref={audioInputRef} type="file" accept="audio/*,.mp3,.wav,.ogg,.flac" multiple hidden onChange={(event) => selectAudio(event.target.files)} />
        <input ref={folderInputRef} type="file" accept="audio/*,.mp3,.wav,.ogg,.flac" multiple hidden {...directoryInputProps} onChange={(event) => selectAudio(event.target.files)} />
        <input ref={artworkInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif" multiple hidden onChange={(event) => { selectArtwork(event.target.files); event.currentTarget.value = ''; }} />
      </div>

      {drafts.length > 0 && (
        <>
          <div className="bulk-katha-defaults">
            <label>Speaker<input value={authorName} disabled={running} onChange={(event) => setAuthorName(event.target.value)} placeholder="Applied to all" /></label>
            <label>Category<select value={categoryId} disabled={running} onChange={(event) => setCategoryId(event.target.value)}><option value="">None</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>
            <label>Series<select value={seriesId} disabled={running} onChange={(event) => setSeriesId(event.target.value)}><option value="">None</option>{series.map((item) => <option key={item._id} value={item._id}>{item.title}</option>)}</select></label>
            <label>Tags<input value={tags} disabled={running} onChange={(event) => setTags(event.target.value)} placeholder="gurbani, ang 1" /></label>
            <label className="bulk-katha-check"><input type="checkbox" checked={publish} disabled={running} onChange={(event) => setPublish(event.target.checked)} /> Publish after upload</label>
            <label className="bulk-katha-check"><input type="checkbox" checked={allowDownload} disabled={running} onChange={(event) => setAllowDownload(event.target.checked)} /> Allow downloads</label>
          </div>

          <div className="bulk-katha-list">
            {drafts.map((draft, index) => (
              <article className={`bulk-katha-row is-${draft.status}`} key={draft.id}>
                <span className="bulk-katha-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="bulk-katha-file"><strong>{draft.audioFile.name}</strong><small>Batch {Math.floor(index / MAX_BATCH_SIZE) + 1} · {Math.round(draft.audioFile.size / 1024 / 1024)} MB</small></div>
                <label className="bulk-katha-title-input"><span>Title</span><input value={draft.title} disabled={running || draft.status === 'created'} onChange={(event) => updateDraft(draft.id, { title: event.target.value })} /></label>
                <label className="bulk-katha-artwork"><span>Artwork</span><div className="bulk-katha-artwork-control">{draft.thumbnailFile && artworkPreviewUrls[fileKey(draft.thumbnailFile)] ? <span className="bulk-katha-artwork-preview" role="img" aria-label="Selected artwork preview" style={{ backgroundImage: `url(${artworkPreviewUrls[fileKey(draft.thumbnailFile)]})` }} /> : <span className="bulk-katha-artwork-empty" aria-hidden>✦</span>}<select value={draft.thumbnailFile ? fileKey(draft.thumbnailFile) : ''} disabled={running || draft.status === 'created'} onChange={(event) => updateDraft(draft.id, { thumbnailFile: thumbnailFiles.find((file) => fileKey(file) === event.target.value), thumbnail: undefined })}><option value="">No artwork</option>{thumbnailFiles.map((file) => <option key={fileKey(file)} value={fileKey(file)}>{file.name}</option>)}</select></div></label>
                <div className="bulk-katha-state"><strong>{draft.status === 'uploading' ? `${draft.progress}% uploading` : draft.status}</strong>{draft.error && <small>{draft.error}</small>}</div>
                {!running && draft.status !== 'created' && <button type="button" className="bulk-katha-remove" onClick={() => setDrafts((current) => current.filter((item) => item.id !== draft.id))} aria-label={`Remove ${draft.title}`}>×</button>}
              </article>
            ))}
          </div>

          <div className="bulk-katha-footer">
            <p>{activeBatch ? `Processing batch ${activeBatch.current} of ${activeBatch.total}.` : publish ? 'Publishing is enabled. Every row must have artwork.' : 'Items stay as drafts until you publish them.'}</p>
            <div>
              {running && <button type="button" className="btn btn-ghost" onClick={() => abortRef.current?.abort()}>Cancel</button>}
              <button type="button" className="btn btn-primary" onClick={() => void startBatch()} disabled={running}>{running ? 'Uploading…' : 'Upload and create kathas'}</button>
            </div>
          </div>
        </>
      )}

      <style>{`
        .bulk-katha-panel { margin: 0 0 var(--space-6); padding: clamp(18px, 3vw, 30px); border: 1px solid color-mix(in srgb, var(--color-primary) 34%, var(--color-border)); border-radius: var(--radius-lg); background: linear-gradient(135deg, var(--color-surface), var(--color-primary-alpha)); box-shadow: var(--shadow-sm); }
        .bulk-katha-heading { display: flex; justify-content: space-between; gap: var(--space-5); align-items: flex-start; margin-bottom: var(--space-5); }
        .bulk-katha-heading h2 { margin: 0; font-family: var(--font-heading); font-size: var(--font-size-xl); }
        .bulk-katha-heading p { margin: var(--space-1) 0 0; color: var(--color-text-secondary); font-size: var(--font-size-sm); }
        .bulk-katha-kicker { color: var(--color-primary-dark) !important; font-size: 10px !important; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
        .bulk-katha-count { padding: 7px 11px; border: 1px solid var(--color-border); border-radius: var(--radius-full); background: var(--color-surface); color: var(--color-primary-dark); font-size: 12px; font-weight: 800; white-space: nowrap; }
        .bulk-katha-actions, .bulk-katha-footer, .bulk-katha-footer > div { display: flex; gap: var(--space-3); align-items: center; flex-wrap: wrap; }
        .bulk-katha-defaults { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-3); margin: var(--space-5) 0; padding: var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: color-mix(in srgb, var(--color-surface) 84%, transparent); }
        .bulk-katha-defaults label, .bulk-katha-row label { display: grid; gap: 5px; color: var(--color-text-secondary); font-size: 11px; font-weight: 700; }
        .bulk-katha-defaults input, .bulk-katha-defaults select, .bulk-katha-row input, .bulk-katha-row select { min-width: 0; padding: 8px 10px; border: 1px solid var(--color-border); border-radius: 7px; background: var(--color-surface); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-sm); }
        .bulk-katha-artwork-control { display: flex; align-items: center; gap: 8px; min-width: 0; }
        .bulk-katha-artwork-preview, .bulk-katha-artwork-empty { width: 34px; height: 34px; flex: 0 0 34px; border: 1px solid var(--color-border); border-radius: 7px; background-color: var(--color-bg-secondary); background-position: center; background-size: cover; }
        .bulk-katha-artwork-empty { display: grid; place-items: center; color: var(--color-text-muted); font-size: 13px; }
        .bulk-katha-artwork-control select { flex: 1; }
        .bulk-katha-check { display: flex !important; align-items: center; gap: 8px; padding-top: 20px; }
        .bulk-katha-check input { min-width: auto !important; }
        .bulk-katha-list { display: grid; gap: 8px; max-height: 520px; overflow: auto; }
        .bulk-katha-row { display: grid; grid-template-columns: 34px minmax(150px, 1.2fr) minmax(180px, 1fr) minmax(140px, .9fr) minmax(94px, .7fr) 30px; gap: var(--space-3); align-items: end; padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); content-visibility: auto; contain-intrinsic-size: 74px; }
        .bulk-katha-row.is-created { border-color: color-mix(in srgb, var(--color-success) 55%, var(--color-border)); }
        .bulk-katha-row.is-failed { border-color: color-mix(in srgb, var(--color-error) 55%, var(--color-border)); }
        .bulk-katha-index { align-self: center; color: var(--color-primary-dark); font-family: var(--font-heading); font-weight: 800; }
        .bulk-katha-file { min-width: 0; display: grid; gap: 3px; }
        .bulk-katha-file strong, .bulk-katha-state small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .bulk-katha-file strong { font-size: var(--font-size-sm); color: var(--color-text-primary); }
        .bulk-katha-file small, .bulk-katha-state small { color: var(--color-text-muted); font-size: 11px; }
        .bulk-katha-state { display: grid; gap: 3px; padding-bottom: 9px; color: var(--color-text-secondary); font-size: 11px; text-transform: capitalize; }
        .bulk-katha-state strong { color: var(--color-primary-dark); }
        .is-failed .bulk-katha-state strong, .is-failed .bulk-katha-state small { color: var(--color-error); }
        .bulk-katha-remove { align-self: center; width: 28px; height: 28px; border: 1px solid var(--color-border); border-radius: 50%; background: transparent; color: var(--color-error); cursor: pointer; font-size: 18px; }
        .bulk-katha-footer { justify-content: space-between; margin-top: var(--space-5); }
        .bulk-katha-footer p { margin: 0; color: var(--color-text-muted); font-size: var(--font-size-sm); }
        @media (max-width: 900px) { .bulk-katha-defaults { grid-template-columns: repeat(2, minmax(0, 1fr)); } .bulk-katha-row { grid-template-columns: 30px 1fr 1fr 28px; } .bulk-katha-file { grid-column: span 2; } .bulk-katha-state { grid-column: 2 / span 2; padding: 0; } }
        @media (max-width: 560px) { .bulk-katha-heading, .bulk-katha-footer { display: grid; } .bulk-katha-defaults, .bulk-katha-row { grid-template-columns: 28px 1fr 28px; } .bulk-katha-file, .bulk-katha-title-input, .bulk-katha-artwork, .bulk-katha-state { grid-column: 2; } .bulk-katha-row { align-items: center; } .bulk-katha-remove { grid-column: 3; grid-row: 1; } }
      `}</style>
    </section>
  );
}
