import type { MediaFolder } from '@/lib/media';

interface UploadSession {
  sessionId: string;
  chunkSize: number;
  chunkCount: number;
}

interface UploadResponse {
  success: boolean;
  error?: string;
  data?: {
    filename: string;
  };
}

export async function uploadMediaFile(
  file: File,
  folder: MediaFolder,
  options: {
    signal?: AbortSignal;
    onProgress?: (progress: number, processing: boolean) => void;
  } = {}
): Promise<string> {
  let sessionId = '';

  try {
    const initResponse = await fetchWithRetry('/api/upload/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: file.name,
        folder,
        mimeType: file.type,
        size: file.size,
      }),
      signal: options.signal,
    });
    const initPayload = await readPayload(initResponse);
    if (!initResponse.ok || !initPayload.success || !initPayload.data) {
      throw new Error(initPayload.error ?? 'Upload initialization failed');
    }

    const session = initPayload.data as unknown as UploadSession;
    sessionId = session.sessionId;

    for (let index = 0; index < session.chunkCount; index += 1) {
      const chunk = file.slice(
        index * session.chunkSize,
        Math.min(file.size, (index + 1) * session.chunkSize)
      );
      const response = await fetchWithRetry(`/api/upload/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Chunk-Index': String(index),
        },
        body: chunk,
        signal: options.signal,
      });
      const payload = await readPayload(response);
      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? 'Chunk upload failed');
      }
      options.onProgress?.(Math.round(((index + 1) / session.chunkCount) * 95), false);
    }

    options.onProgress?.(95, true);
    const completeResponse = await fetchWithRetry(`/api/upload/sessions/${sessionId}`, {
      method: 'POST',
      signal: options.signal,
    });
    const completePayload = await readPayload(completeResponse);
    if (!completeResponse.ok || !completePayload.success || !completePayload.data?.filename) {
      throw new Error(completePayload.error ?? 'Upload completion failed');
    }

    options.onProgress?.(100, false);
    return completePayload.data.filename;
  } catch (error) {
    if (sessionId) {
      void fetch(`/api/upload/sessions/${sessionId}`, { method: 'DELETE' }).catch(() => {});
    }
    throw error;
  }
}

async function readPayload(response: Response): Promise<UploadResponse> {
  try {
    return await response.json() as UploadResponse;
  } catch {
    return { success: false, error: 'Invalid upload response' };
  }
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit,
  attempts = 5
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(input, init);
      const retryable = response.status === 429 || response.status >= 500;
      if (response.ok || !retryable || attempt === attempts) return response;
      const retryAfter = Number(response.headers.get('Retry-After'));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : Math.min(8_000, attempt * attempt * 700);
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    } catch (error) {
      if ((error as Error).name === 'AbortError') throw error;
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, Math.min(8_000, attempt * attempt * 700)));
  }
  throw lastError instanceof Error ? lastError : new Error('Upload request failed');
}
