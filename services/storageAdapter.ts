import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import { getMediaUrl, MediaFolder } from '@/lib/media';

export interface StorageAdapter {
  ensureFolders(): Promise<void>;
  save(buffer: Buffer, originalName: string, folder: MediaFolder): Promise<string>;
  delete(filename: string, folder: MediaFolder): Promise<void>;
  getPublicUrl(filename: string, folder: MediaFolder): string;
}

const folders: MediaFolder[] = ['audio', 'video', 'thumbnails', 'series'];

export function resolveStorageRoot(): string {
  const configured = process.env.MEDIA_STORAGE_ROOT;
  if (!configured) {
    return path.join(/* turbopackIgnore: true */ process.cwd(), 'public', 'uploads');
  }
  return path.isAbsolute(configured)
    ? path.resolve(/* turbopackIgnore: true */ configured)
    : path.resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}

function safeFilename(filename: string): string {
  const basename = path.basename(filename);
  if (basename !== filename || basename === '.' || basename === '..') {
    throw new Error('Invalid media filename');
  }
  return basename;
}

export function createFilename(originalName: string): string {
  const originalExt = path.extname(originalName).toLowerCase();
  const ext = originalExt.replace(/[^a-z0-9.]/g, '').slice(0, 12);
  const rawName = path.basename(originalName, originalExt);
  const basename = rawName
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 80) || 'media';

  return `${basename}-${randomUUID()}${ext}`;
}

class FileSystemStorageAdapter implements StorageAdapter {
  private readonly root = resolveStorageRoot();

  async ensureFolders(): Promise<void> {
    await Promise.all(
      folders.map((folder) => fs.mkdir(
        path.join(/* turbopackIgnore: true */ this.root, folder),
        { recursive: true }
      ))
    );
  }

  async save(
    buffer: Buffer,
    originalName: string,
    folder: MediaFolder
  ): Promise<string> {
    await this.ensureFolders();
    const filename = createFilename(originalName);
    await fs.writeFile(
      path.join(/* turbopackIgnore: true */ this.root, folder, filename),
      buffer,
      { flag: 'wx' }
    );
    return filename;
  }

  async delete(filename: string, folder: MediaFolder): Promise<void> {
    const fullPath = path.join(
      /* turbopackIgnore: true */ this.root,
      folder,
      safeFilename(filename)
    );
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }

  getPublicUrl(filename: string, folder: MediaFolder): string {
    return getMediaUrl(folder, safeFilename(filename));
  }
}

export const storageAdapter: StorageAdapter = new FileSystemStorageAdapter();
