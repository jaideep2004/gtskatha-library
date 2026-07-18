import type { MediaFolder } from '@/lib/media';

const ALLOWED_TYPES: Record<MediaFolder, string[]> = {
  audio: [
    'audio/mpeg',
    'audio/mp3',
    'audio/mpg',
    'audio/mpeg3',
    'audio/x-mpeg',
    'audio/x-mp3',
    'audio/x-mpeg-3',
    'audio/wav',
    'audio/ogg',
    'audio/flac',
  ],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/mpeg'],
  thumbnails: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  series: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};

const MAX_SIZES: Record<MediaFolder, number> = {
  audio: 1024 * 1024 * 1024,
  video: 8 * 1024 * 1024 * 1024,
  thumbnails: 20 * 1024 * 1024,
  series: 20 * 1024 * 1024,
};

const ALLOWED_EXTENSIONS: Record<MediaFolder, string[]> = {
  audio: ['.mp3', '.mpeg', '.mpga', '.wav', '.ogg', '.flac'],
  video: ['.mp4', '.webm', '.ogv', '.ogg', '.mpeg'],
  thumbnails: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  series: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
};

export function isMediaFolder(value: string): value is MediaFolder {
  return value in ALLOWED_TYPES;
}

export function validateUpload(folder: MediaFolder, mimeType: string, size: number, filename = '') {
  const normalizedMimeType = mimeType.toLowerCase().trim();
  const extension = filename.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? '';
  const hasAllowedMimeType = ALLOWED_TYPES[folder].includes(normalizedMimeType);
  const canInferFromExtension = ['image/jpg', 'application/octet-stream', ''].includes(normalizedMimeType)
    && ALLOWED_EXTENSIONS[folder].includes(extension);

  if (!hasAllowedMimeType && !canInferFromExtension) {
    throw new Error(`Invalid ${folder === 'thumbnails' || folder === 'series' ? 'image' : folder} format`);
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_SIZES[folder]) {
    throw new Error(`File too large. Max: ${Math.round(MAX_SIZES[folder] / 1024 / 1024)} MB`);
  }
}
