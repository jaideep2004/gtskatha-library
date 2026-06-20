import { MediaFolder } from '@/lib/media';
import { storageAdapter } from '@/services/storageAdapter';

export async function ensureUploadDirs(): Promise<void> {
  await storageAdapter.ensureFolders();
}

export async function saveFile(
  buffer: Buffer,
  originalName: string,
  folder: MediaFolder
): Promise<string> {
  return storageAdapter.save(buffer, originalName, folder);
}

export async function deleteFile(filename: string, folder: MediaFolder): Promise<void> {
  await storageAdapter.delete(filename, folder);
}

export function getFileUrl(filename: string, folder: MediaFolder): string {
  return storageAdapter.getPublicUrl(filename, folder);
}
