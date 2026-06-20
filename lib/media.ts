export type MediaFolder = 'audio' | 'video' | 'thumbnails' | 'series';

const MEDIA_BASE_URL = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '/uploads')
  .replace(/\/+$/, '');

export function getMediaUrl(
  folder: MediaFolder,
  value?: string | null
): string {
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('/')) return value;
  return `${MEDIA_BASE_URL}/${folder}/${encodeURIComponent(value)}`;
}
