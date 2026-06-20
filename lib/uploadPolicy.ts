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

export function isMediaFolder(value: string): value is MediaFolder {
  return value in ALLOWED_TYPES;
}

export function validateUpload(folder: MediaFolder, mimeType: string, size: number) {
  if (!ALLOWED_TYPES[folder].includes(mimeType)) {
    throw new Error(`Invalid ${folder === 'thumbnails' || folder === 'series' ? 'image' : folder} format`);
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_SIZES[folder]) {
    throw new Error(`File too large. Max: ${Math.round(MAX_SIZES[folder] / 1024 / 1024)} MB`);
  }
}
