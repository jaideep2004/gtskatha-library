import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import type { MediaFolder } from '@/lib/media';
import { createFilename, resolveStorageRoot } from '@/services/storageAdapter';

interface UploadMetadata {
  originalName: string;
  folder: MediaFolder;
  size: number;
  mimeType: string;
  chunkSize: number;
  chunkCount: number;
}

const CHUNK_SIZE = 5 * 1024 * 1024;
const SESSION_PATTERN = /^[0-9a-f-]{36}$/i;
const STAGING_FILE = 'media.tmp';

function sessionDirectory(sessionId: string) {
  if (!SESSION_PATTERN.test(sessionId)) throw new Error('Invalid upload session');
  return path.join(resolveStorageRoot(), '.chunks', sessionId);
}

async function readMetadata(sessionId: string): Promise<UploadMetadata> {
  const content = await fs.readFile(path.join(sessionDirectory(sessionId), 'metadata.json'), 'utf8');
  return JSON.parse(content) as UploadMetadata;
}

export async function createUploadSession(
  metadata: Omit<UploadMetadata, 'chunkSize' | 'chunkCount'>
) {
  const sessionId = randomUUID();
  const directory = sessionDirectory(sessionId);
  const completeMetadata: UploadMetadata = {
    ...metadata,
    chunkSize: CHUNK_SIZE,
    chunkCount: Math.ceil(metadata.size / CHUNK_SIZE),
  };
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(
    path.join(directory, 'metadata.json'),
    JSON.stringify(completeMetadata),
    { flag: 'wx' }
  );
  const stagingHandle = await fs.open(path.join(directory, STAGING_FILE), 'wx+');
  try {
    await stagingHandle.truncate(metadata.size);
  } finally {
    await stagingHandle.close();
  }
  return { sessionId, chunkSize: CHUNK_SIZE, chunkCount: completeMetadata.chunkCount };
}

export async function saveUploadChunk(sessionId: string, index: number, buffer: Buffer) {
  const metadata = await readMetadata(sessionId);
  if (!Number.isInteger(index) || index < 0 || index >= metadata.chunkCount) {
    throw new Error('Invalid chunk index');
  }
  const expectedSize = index === metadata.chunkCount - 1
    ? metadata.size - (index * metadata.chunkSize)
    : metadata.chunkSize;
  if (buffer.length !== expectedSize) throw new Error('Invalid chunk size');

  const directory = sessionDirectory(sessionId);
  const stagingHandle = await fs.open(path.join(directory, STAGING_FILE), 'r+');
  try {
    await stagingHandle.write(buffer, 0, buffer.length, index * metadata.chunkSize);
    await stagingHandle.sync();
  } finally {
    await stagingHandle.close();
  }
  await fs.writeFile(path.join(directory, `${index}.done`), String(buffer.length));
}

export async function completeUploadSession(sessionId: string) {
  const metadata = await readMetadata(sessionId);
  const directory = sessionDirectory(sessionId);
  const targetDirectory = path.join(resolveStorageRoot(), metadata.folder);
  const filename = createFilename(metadata.originalName);
  const targetPath = path.join(targetDirectory, filename);
  const stagingPath = path.join(directory, STAGING_FILE);
  await fs.mkdir(targetDirectory, { recursive: true });

  try {
    for (let index = 0; index < metadata.chunkCount; index += 1) {
      const expectedSize = index === metadata.chunkCount - 1
        ? metadata.size - (index * metadata.chunkSize)
        : metadata.chunkSize;
      const writtenSize = Number(await fs.readFile(path.join(directory, `${index}.done`), 'utf8'));
      if (writtenSize !== expectedSize) throw new Error(`Chunk ${index} is incomplete`);
    }

    const result = await fs.stat(stagingPath);
    if (result.size !== metadata.size) throw new Error('Completed file size mismatch');
    await fs.rename(stagingPath, targetPath);
    await fs.rm(directory, { recursive: true, force: true });
    return { filename, folder: metadata.folder };
  } catch (error) {
    await fs.unlink(targetPath).catch(() => {});
    throw error;
  }
}

export async function cancelUploadSession(sessionId: string) {
  await fs.rm(sessionDirectory(sessionId), { recursive: true, force: true });
}
