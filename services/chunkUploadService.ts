import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import type { MediaFolder } from '@/lib/media';
import { createFilename, resolveStorageRoot } from '@/services/storageAdapter';

interface UploadMetadata {
  originalName: string;
  filename: string;
  folder: MediaFolder;
  size: number;
  mimeType: string;
  chunkSize: number;
  chunkCount: number;
}

const DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024;
const MIN_CHUNK_SIZE = 1 * 1024 * 1024;
const MAX_CHUNK_SIZE = 6 * 1024 * 1024;
const SESSION_PATTERN = /^[0-9a-f-]{36}$/i;
const STAGING_FILE = 'media.tmp';
const COMPLETE_FILE = 'complete.json';
const SESSION_RETENTION_MS = 24 * 60 * 60 * 1000;
const PRUNE_INTERVAL_MS = 15 * 60 * 1000;

let lastPruneAt = 0;

function chunkSize() {
  const configuredMegabytes = Number(process.env.UPLOAD_CHUNK_SIZE_MB);
  if (!Number.isFinite(configuredMegabytes)) return DEFAULT_CHUNK_SIZE;
  return Math.min(
    MAX_CHUNK_SIZE,
    Math.max(MIN_CHUNK_SIZE, Math.floor(configuredMegabytes * 1024 * 1024))
  );
}

function sessionDirectory(sessionId: string) {
  if (!SESSION_PATTERN.test(sessionId)) throw new Error('Invalid upload session');
  return path.join(resolveStorageRoot(), '.chunks', sessionId);
}

async function readMetadata(sessionId: string): Promise<UploadMetadata> {
  const content = await fs.readFile(path.join(sessionDirectory(sessionId), 'metadata.json'), 'utf8');
  return JSON.parse(content) as UploadMetadata;
}

async function readCompletion(sessionId: string) {
  try {
    const content = await fs.readFile(path.join(sessionDirectory(sessionId), COMPLETE_FILE), 'utf8');
    return JSON.parse(content) as { filename: string; folder: MediaFolder };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

function pruneExpiredSessions() {
  const now = Date.now();
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) return;
  lastPruneAt = now;

  void (async () => {
    const chunksRoot = path.join(resolveStorageRoot(), '.chunks');
    const entries = await fs.readdir(chunksRoot, { withFileTypes: true }).catch(() => []);
    await Promise.all(entries.filter((entry) => entry.isDirectory() && SESSION_PATTERN.test(entry.name)).map(async (entry) => {
      const directory = path.join(chunksRoot, entry.name);
      const stats = await fs.stat(directory).catch(() => null);
      if (stats && now - stats.mtimeMs > SESSION_RETENTION_MS) {
        await fs.rm(directory, { recursive: true, force: true });
      }
    }));
  })().catch(() => {});
}

export async function createUploadSession(
  metadata: Omit<UploadMetadata, 'filename' | 'chunkSize' | 'chunkCount'>
) {
  pruneExpiredSessions();
  const sessionId = randomUUID();
  const directory = sessionDirectory(sessionId);
  const selectedChunkSize = chunkSize();
  const completeMetadata: UploadMetadata = {
    ...metadata,
    filename: createFilename(metadata.originalName),
    chunkSize: selectedChunkSize,
    chunkCount: Math.ceil(metadata.size / selectedChunkSize),
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
  return { sessionId, chunkSize: selectedChunkSize, chunkCount: completeMetadata.chunkCount };
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
  const completed = await readCompletion(sessionId);
  if (completed) return completed;
  const targetDirectory = path.join(resolveStorageRoot(), metadata.folder);
  const targetPath = path.join(targetDirectory, metadata.filename);
  const stagingPath = path.join(directory, STAGING_FILE);
  await fs.mkdir(targetDirectory, { recursive: true });

  try {
    const existingTarget = await fs.stat(targetPath).catch(() => null);
    if (existingTarget?.size === metadata.size) {
      const result = { filename: metadata.filename, folder: metadata.folder };
      await fs.writeFile(path.join(directory, COMPLETE_FILE), JSON.stringify(result), { flag: 'wx' }).catch(async (error) => {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      });
      return result;
    }

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
    const completion = { filename: metadata.filename, folder: metadata.folder };
    await fs.writeFile(path.join(directory, COMPLETE_FILE), JSON.stringify(completion), { flag: 'wx' });
    return completion;
  } catch (error) {
    throw error;
  }
}

export async function cancelUploadSession(sessionId: string) {
  await fs.rm(sessionDirectory(sessionId), { recursive: true, force: true });
}
