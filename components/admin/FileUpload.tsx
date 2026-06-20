'use client';

import { useEffect, useRef, useState } from 'react';
import { getMediaUrl } from '@/lib/media';
import { toast } from 'sonner';

type UploadFolder = 'audio' | 'video' | 'thumbnails' | 'series';

interface FileUploadProps {
  folder: UploadFolder;
  label: string;
  accept: string;
  onUploaded: (filename: string) => void;
  currentFile?: string;
  hint?: string;
  onUploadingChange?: (uploading: boolean) => void;
}

export default function FileUpload({
  folder,
  label,
  accept,
  onUploaded,
  currentFile,
  hint,
  onUploadingChange,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(currentFile ?? '');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionRef = useRef('');
  const mountedRef = useRef(true);
  const uploadingChangeRef = useRef(onUploadingChange);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    uploadingChangeRef.current = onUploadingChange;
  }, [onUploadingChange]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      uploadingChangeRef.current?.(false);
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    uploadingChangeRef.current?.(true);
    setError('');
    setProgress(0);
    setProcessing(false);

    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const initResponse = await fetch('/api/upload/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          folder,
          mimeType: file.type,
          size: file.size,
        }),
        signal: controller.signal,
      });
      const initPayload = await initResponse.json();
      if (!initResponse.ok || !initPayload.success) {
        throw new Error(initPayload.error ?? 'Upload initialization failed');
      }

      const { sessionId, chunkSize, chunkCount } = initPayload.data as {
        sessionId: string;
        chunkSize: number;
        chunkCount: number;
      };
      sessionRef.current = sessionId;

      for (let index = 0; index < chunkCount; index += 1) {
        const chunk = file.slice(index * chunkSize, Math.min(file.size, (index + 1) * chunkSize));
        const response = await fetchWithRetry(`/api/upload/sessions/${sessionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-Chunk-Index': String(index),
          },
          body: chunk,
          signal: controller.signal,
        });
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error ?? 'Chunk upload failed');
        setProgress(Math.round(((index + 1) / chunkCount) * 95));
      }

      setProcessing(true);
      const completeResponse = await fetchWithRetry(`/api/upload/sessions/${sessionId}`, {
        method: 'POST',
        signal: controller.signal,
      });
      const completePayload = await completeResponse.json();
      if (!completeResponse.ok || !completePayload.success) {
        throw new Error(completePayload.error ?? 'Upload completion failed');
      }
      setUploaded(completePayload.data.filename);
      onUploaded(completePayload.data.filename);
      setProgress(100);
      setProcessing(false);
      setPreviewUrl('');
      sessionRef.current = '';
      toast.success(`${label} uploaded.`);
    } catch (uploadError) {
      const sessionId = sessionRef.current;
      if (sessionId) {
        void fetch(`/api/upload/sessions/${sessionId}`, { method: 'DELETE' }).catch(() => {});
      }
      sessionRef.current = '';
      if ((uploadError as Error).name === 'AbortError') {
        if (!mountedRef.current) return;
        setError('Upload cancelled');
        toast.info(`${label} upload cancelled.`);
        setProgress(0);
      } else {
        const message = uploadError instanceof Error ? uploadError.message : 'Network error during upload';
        setError(message);
        toast.error(message);
      }
    } finally {
      if (mountedRef.current) {
        setUploading(false);
        setProcessing(false);
        uploadingChangeRef.current?.(false);
      }
      abortRef.current = null;
    }
  }

  async function fetchWithRetry(
    input: RequestInfo | URL,
    init: RequestInit,
    attempts = 3
  ): Promise<Response> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await fetch(input, init);
        if (response.ok || response.status < 500 || attempt === attempts) return response;
      } catch (error) {
        if ((error as Error).name === 'AbortError') throw error;
        lastError = error;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 700));
    }
    throw lastError instanceof Error ? lastError : new Error('Upload request failed');
  }

  const storedPreview = uploaded ? getMediaUrl(folder, uploaded) : '';
  const activePreview = previewUrl || storedPreview;

  return (
    <div className="file-upload-wrap">
      <label className="form-label">{label}</label>

      <div
        className={`file-upload-area ${uploading ? 'uploading' : ''} ${uploaded ? 'has-file' : ''}`}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={`Upload ${label}`}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
          aria-hidden
        />

        {uploading ? (
          <div className="file-upload-status">
            <div className="file-upload-spinner" aria-label="Uploading" />
            <span>{processing ? 'Processing media…' : `Uploading ${progress}%`}</span>
            <button
              type="button"
              className="file-upload-cancel"
              onClick={(event) => {
                event.stopPropagation();
                abortRef.current?.abort();
              }}
            >
              Cancel
            </button>
          </div>
        ) : uploaded ? (
          <div className="file-upload-status">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-success)' }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span className="file-upload-name">{uploaded}</span>
            <button
              type="button"
              className="file-upload-clear"
              onClick={(e) => { e.stopPropagation(); setUploaded(''); onUploaded(''); }}
              aria-label="Remove file"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="file-upload-status">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-muted)' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Click to upload {label.toLowerCase()}</span>
            {hint && <span className="file-upload-hint">{hint}</span>}
          </div>
        )}
      </div>

      {activePreview && folder === 'thumbnails' && (
        <img className="file-preview-image" src={activePreview} alt={`${label} preview`} />
      )}
      {activePreview && folder === 'series' && (
        <img className="file-preview-image" src={activePreview} alt={`${label} preview`} />
      )}
      {activePreview && folder === 'audio' && (
        <audio className="file-preview-media" src={activePreview} controls preload="metadata" />
      )}
      {activePreview && folder === 'video' && (
        <video className="file-preview-media file-preview-video" src={activePreview} controls preload="metadata" />
      )}

      {error && (
        <p className="form-error">{error}</p>
      )}

      <style>{`
        .file-upload-wrap {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .file-upload-area {
          border: 1.5px dashed var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--space-4) var(--space-5);
          cursor: pointer;
          transition: border-color var(--transition-fast), background-color var(--transition-fast), opacity var(--transition-fast);
          background: var(--color-bg-secondary);
          min-height: 64px;
          display: flex;
          align-items: center;
        }

        .file-upload-area:hover,
        .file-upload-area:focus {
          border-color: var(--color-primary);
          background: var(--color-primary-alpha);
          outline: none;
        }

        .file-upload-area.uploading {
          pointer-events: none;
          opacity: 0.7;
        }

        .file-upload-area.has-file {
          border-style: solid;
          border-color: var(--color-success);
          background: var(--color-success-bg);
        }

        .file-upload-status {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }

        .file-upload-spinner {
          width: 18px; height: 18px;
          border: 2px solid var(--color-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .file-upload-name {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: var(--font-size-xs);
          color: var(--color-text-primary);
          font-weight: 500;
        }

        .file-upload-hint {
          margin-left: auto;
          font-size: 10px;
          color: var(--color-text-muted);
        }

        .file-upload-clear {
          width: 20px; height: 20px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.15);
          border: none;
          color: var(--color-error);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; line-height: 1;
          flex-shrink: 0;
          transition: background-color var(--transition-fast);
        }

        .file-upload-clear:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .file-upload-cancel {
          margin-left: auto;
          color: var(--color-error);
          font-size: 12px;
          font-weight: 600;
        }

        .file-preview-image {
          width: 100%;
          max-width: 240px;
          aspect-ratio: 16 / 10;
          object-fit: cover;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: var(--color-bg-secondary);
        }

        .file-preview-media {
          width: 100%;
        }

        .file-preview-video {
          max-height: 240px;
          border-radius: 8px;
          background: #090909;
        }
      `}</style>
    </div>
  );
}
