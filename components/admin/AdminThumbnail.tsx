import Image from 'next/image';
import type { CSSProperties } from 'react';
import { getMediaUrl, type MediaFolder } from '@/lib/media';

interface AdminThumbnailProps {
  folder: MediaFolder;
  value?: string;
  alt: string;
}

export default function AdminThumbnail({ folder, value, alt }: AdminThumbnailProps) {
  const src = getMediaUrl(folder, value);

  return (
    <div style={thumbnailStyle}>
      {src ? (
        <Image src={src} alt={alt} width={72} height={48} style={imageStyle} />
      ) : (
        <span style={placeholderStyle} role="img" aria-label="No thumbnail">☬</span>
      )}
    </div>
  );
}

const thumbnailStyle: CSSProperties = {
  width: 72,
  height: 48,
  display: 'grid',
  placeItems: 'center',
  overflow: 'hidden',
  borderRadius: 8,
  border: '1px solid rgba(36, 43, 55, 0.1)',
  background: 'linear-gradient(135deg, rgba(217, 140, 27, 0.12), rgba(19, 34, 53, 0.04)), #f7f4ee',
  color: '#d98c1b',
  boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.45)',
};

const imageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const placeholderStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1,
};
