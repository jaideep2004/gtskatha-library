/**
 * Bulk import a folder tree of katha audio files into a series.
 *
 * Usage:
 *   npm run import:kathas -- --root "<path>" [--series <slug>] [--draft] [--dry-run]
 *       [--group-by <N>] [--bucket-size <N>]
 *
 * - Walks top-level folders in name order (Ang-0001, Ang-0002, ... Ang-0356).
 * - --group-by <N>: bundles N consecutive source folders into one destination
 *   folder (title "Ang 1 - Ang 100"). Files keep source-folder order.
 * - --bucket-size <N> (recommended): ignores source-folder boundaries and
 *   assigns each file to a destination folder from the Ang number in the
 *   FILENAME ("Guru Granth Sahib Ji Ang-0162-Pankti-06.mp3" -> Ang 162).
 *   Buckets are N consecutive Angs: 1-100 -> "Ang 1 - Ang 100",
 *   101-200 -> "Ang 101 - Ang 200", etc. Files are sorted by Ang then Pankti
 *   inside each folder. Files without a parseable Ang number fall back to one
 *   folder per source folder.
 * - Either flag may be omitted: the default creates one Folder per source
 *   folder (title = folder name).
 * - Creates one published audio Katha per file with a global sequential
 *   sortOrder so the whole collection plays in order.
 * - audioUrl is the relative path from the media audio root
 *   (e.g. "Ang-0029/Guru Granth Sahib Ji Ang-0029-Pankti-02.mp3"), so the
 *   SFTP'd folder tree at <MEDIA_STORAGE_ROOT>/audio must keep its structure.
 * - Idempotent: files whose audioUrl already exists in the series are skipped.
 * - Durations are probed with ffprobe when available; otherwise left undefined.
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import mongoose from 'mongoose';

interface ImportedFile {
  fileName: string;
  relativePath: string;
  title: string;
  slug: string;
  audioUrl: string;
  fullPath: string;
}

function loadEnv() {
  for (const file of ['.env', '.env.local']) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) continue;
    for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
      const value = line.trim();
      if (!value || value.startsWith('#')) continue;
      const separator = value.indexOf('=');
      if (separator < 0) continue;
      const key = value.slice(0, separator).trim();
      const content = value.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
      process.env[key] = content;
    }
  }
}

function parseArgs(): {
  root: string;
  series: string;
  draft: boolean;
  dryRun: boolean;
  groupBy: number;
  bucketSize: number;
} {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const index = args.indexOf(flag);
    return index >= 0 && args[index + 1] ? args[index + 1] : undefined;
  };
  const root = get('--root') ?? 'C:\\Users\\jaisi\\Downloads\\katha files - Copy\\organized';
  const series = get('--series') ?? 'sri-guru-granth-sahib';
  const parsedGroupBy = Number.parseInt(get('--group-by') ?? '', 10);
  const parsedBucketSize = Number.parseInt(get('--bucket-size') ?? '', 10);
  return {
    root,
    series,
    draft: args.includes('--draft'),
    dryRun: args.includes('--dry-run'),
    groupBy: Number.isFinite(parsedGroupBy) && parsedGroupBy >= 2 ? parsedGroupBy : 1,
    bucketSize: Number.isFinite(parsedBucketSize) && parsedBucketSize >= 2 ? parsedBucketSize : 1,
  };
}

function leadingNumber(folderName: string): number | null {
  const match = folderName.match(/(\d+)/);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

function angFromFilename(fileName: string): number | null {
  const match = fileName.match(/ang-?(\d+)/i);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

function panktiFromFilename(fileName: string): number | null {
  const match = fileName.match(/pankti-?(\d+)/i);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

function compareFilesByAng(a: ImportedFile, b: ImportedFile): number {
  const aAng = angFromFilename(a.fileName) ?? Number.POSITIVE_INFINITY;
  const bAng = angFromFilename(b.fileName) ?? Number.POSITIVE_INFINITY;
  if (aAng !== bAng) return aAng - bAng;
  const aPankti = panktiFromFilename(a.fileName) ?? Number.POSITIVE_INFINITY;
  const bPankti = panktiFromFilename(b.fileName) ?? Number.POSITIVE_INFINITY;
  if (aPankti !== bPankti) return aPankti - bPankti;
  return a.fileName.localeCompare(b.fileName, undefined, { numeric: true });
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function titleFromFilename(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.mp4']);

function isAudioFile(fileName: string): boolean {
  return AUDIO_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

function uniqueSlug(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let counter = 2;
  let candidate = `${base}-${counter}`;
  while (used.has(candidate)) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  used.add(candidate);
  return candidate;
}

function probeDuration(filePath: string): Promise<number | undefined> {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn('ffprobe', [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'csv=p=0',
        filePath,
      ], { windowsHide: true });
    } catch {
      resolve(undefined);
      return;
    }
    const timeout = setTimeout(() => {
      child.kill();
      resolve(undefined);
    }, 20_000);
    let stdout = '';
    child.stdout.on('data', (chunk) => { stdout += String(chunk); });
    child.on('error', () => { clearTimeout(timeout); resolve(undefined); });
    child.on('close', (code) => {
      clearTimeout(timeout);
      const parsed = Number.parseFloat(stdout.trim());
      resolve(code === 0 && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined);
    });
  });
}

async function probeWithConcurrency(
  files: ImportedFile[],
  concurrency = 4
): Promise<Map<string, number>> {
  const durations = new Map<string, number>();
  let ffprobeAvailable = true;
  let cursor = 0;

  async function worker() {
    while (cursor < files.length) {
      const file = files[cursor];
      cursor += 1;
      if (!ffprobeAvailable) break;
      const duration = await probeDuration(file.fullPath);
      if (duration !== undefined) {
        durations.set(file.audioUrl, duration);
      } else if (!durations.has(file.audioUrl)) {
        ffprobeAvailable = false;
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return durations;
}

async function main() {
  loadEnv();
  const { root, series: seriesSlug, draft, dryRun, groupBy, bucketSize } = parseArgs();

  if (!fs.existsSync(root)) {
    console.error(`Source folder not found: ${root}`);
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured');

  await mongoose.connect(uri, { bufferCommands: false });
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB connection has no database handle');

  const series = await db.collection('series').findOne({ slug: seriesSlug });
  if (!series) {
    const available = await db.collection('series')
      .find({}, { projection: { title: 1, slug: 1 } })
      .limit(20)
      .toArray();
    console.error(`Series "${seriesSlug}" not found. Available series:`);
    available.forEach((s) => console.error(`  - ${s.slug}  (${s.title})`));
    process.exit(1);
  }
  console.log(`Series: ${series.title} (${seriesSlug})`);

  const sourceFolders = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => {
      const numberA = Number.parseInt(a.match(/(\d+)/)?.[1] ?? '', 10);
      const numberB = Number.parseInt(b.match(/(\d+)/)?.[1] ?? '', 10);
      if (Number.isFinite(numberA) && Number.isFinite(numberB)) return numberA - numberB;
      return a.localeCompare(b, undefined, { numeric: true });
    });

  const rootFiles = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isAudioFile(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  const existingKathas = await db.collection('kathas')
    .find({ seriesId: series._id }, { projection: { audioUrl: 1, slug: 1, sortOrder: 1 } })
    .toArray();
  const existingAudioUrls = new Set(existingKathas.map((k) => k.audioUrl).filter(Boolean));
  const usedSlugs = new Set(existingKathas.map((k) => k.slug).filter(Boolean));
  const maxSort = existingKathas.reduce(
    (max, k) => Math.max(max, Number(k.sortOrder ?? 0)),
    0
  );

  const existingFolders = await db.collection('folders')
    .find({ seriesId: series._id }, { projection: { title: 1, sortOrder: 1 } })
    .toArray();
  const folderByTitle = new Map(existingFolders.map((f) => [f.title, f]));
  let folderSortCounter = Math.max(0, ...existingFolders.map((f) => Number(f.sortOrder ?? 0))) + 1;

  let sortCounter = maxSort;
  const toCreate: Array<{ folder: { title: string; sortOrder: number } | null; files: ImportedFile[] }> = [];

  function buildFile(folderName: string, fileName: string): ImportedFile | null {
    const audioUrl = `${folderName}/${fileName}`;
    if (existingAudioUrls.has(audioUrl)) return null;
    return {
      fileName,
      relativePath: folderName,
      title: titleFromFilename(fileName),
      slug: uniqueSlug(generateSlug(titleFromFilename(fileName)), usedSlugs),
      audioUrl,
      fullPath: path.join(root, folderName, fileName),
    };
  }

  const rawGroups: Array<{ title: string; files: ImportedFile[] }> = [];

  if (bucketSize > 1) {
    const buckets = new Map<number, ImportedFile[]>();
    const noAngByFolder = new Map<string, ImportedFile[]>();
    for (const folderName of sourceFolders) {
      const folderPath = path.join(root, folderName);
      const folderFiles = fs
        .readdirSync(folderPath)
        .filter(isAudioFile)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((fileName) => buildFile(folderName, fileName))
        .filter((file): file is ImportedFile => file !== null);
      for (const file of folderFiles) {
        const ang = angFromFilename(file.fileName);
        if (ang === null) {
          const list = noAngByFolder.get(folderName) ?? [];
          list.push(file);
          noAngByFolder.set(folderName, list);
        } else {
          const key = Math.floor((ang - 1) / bucketSize);
          const list = buckets.get(key) ?? [];
          list.push(file);
          buckets.set(key, list);
        }
      }
    }
    for (const key of [...buckets.keys()].sort((a, b) => a - b)) {
      const files = buckets.get(key)!.sort(compareFilesByAng);
      const angs = files
        .map((file) => angFromFilename(file.fileName)!)
        .sort((a, b) => a - b);
      rawGroups.push({ title: `Ang ${angs[0]} - Ang ${angs[angs.length - 1]}`, files });
    }
    for (const [folderName, files] of noAngByFolder) {
      files.sort((a, b) => a.fileName.localeCompare(b.fileName, undefined, { numeric: true }));
      rawGroups.push({ title: folderName, files });
    }
  } else {
    const sourceGroups: Array<{ sourceFolders: string[] }> = [];
    if (groupBy > 1) {
      for (let i = 0; i < sourceFolders.length; i += groupBy) {
        sourceGroups.push({ sourceFolders: sourceFolders.slice(i, i + groupBy) });
      }
    } else {
      sourceFolders.forEach((name) => sourceGroups.push({ sourceFolders: [name] }));
    }

    for (const group of sourceGroups) {
      const files: ImportedFile[] = [];
      const firstNumber = leadingNumber(group.sourceFolders[0]);
      const lastNumber = leadingNumber(group.sourceFolders[group.sourceFolders.length - 1]);
      const useRangeTitle =
        group.sourceFolders.length > 1 &&
        firstNumber !== null &&
        lastNumber !== null &&
        group.sourceFolders.every((name) => leadingNumber(name) !== null);
      const folderTitle = useRangeTitle
        ? `Ang ${firstNumber} - Ang ${lastNumber}`
        : group.sourceFolders.length === 1
          ? group.sourceFolders[0]
          : group.sourceFolders.join(' - ');

      for (const folderName of group.sourceFolders) {
        const folderPath = path.join(root, folderName);
        files.push(
          ...fs
            .readdirSync(folderPath)
            .filter(isAudioFile)
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
            .map((fileName) => buildFile(folderName, fileName))
            .filter((file): file is ImportedFile => file !== null)
        );
      }

      if (files.length === 0) {
        console.log(`  ${folderTitle}: all files already imported, skipped.`);
        continue;
      }
      rawGroups.push({ title: folderTitle, files });
    }
  }

  for (const group of rawGroups) {
    if (group.files.length === 0) {
      console.log(`  ${group.title}: all files already imported, skipped.`);
      continue;
    }
    toCreate.push({ folder: { title: group.title, sortOrder: folderSortCounter++ }, files: group.files });
  }

  const rootImports = rootFiles
    .map((entry) => ({
      fileName: entry.name,
      relativePath: '',
      title: titleFromFilename(entry.name),
      slug: uniqueSlug(generateSlug(titleFromFilename(entry.name)), usedSlugs),
      audioUrl: entry.name,
      fullPath: path.join(root, entry.name),
    }))
    .filter((file) => !existingAudioUrls.has(file.audioUrl));

  const totalNew = toCreate.reduce((sum, group) => sum + group.files.length, 0) + rootImports.length;
  const modeLabel = bucketSize > 1 ? `bucket-size ${bucketSize}` : `group-by ${groupBy}`;
  console.log(
    `\nPlan: ${sourceFolders.length} source folders -> ${toCreate.length} destination folders ` +
    `(${modeLabel}), ${totalNew} new kathas ` +
    `(existing: ${existingKathas.length}), mode: ${draft ? 'draft' : 'published'}, dry-run: ${dryRun}`
  );

  for (const group of toCreate) {
    console.log(`  ${group.folder!.title}: ${group.files.length} files`);
  }
  if (rootImports.length > 0) {
    console.log(`  (root): ${rootImports.length} files -> no folder`);
  }

  if (dryRun) {
    console.log('\nDry run complete. Re-run without --dry-run to import.');
    await mongoose.disconnect();
    return;
  }

  const durationMap = totalNew > 0
    ? await probeWithConcurrency([...toCreate.flatMap((g) => g.files), ...rootImports])
    : new Map<string, number>();

  const now = new Date();
  let created = 0;
  let foldersCreated = 0;

  for (const group of toCreate) {
    const { folder, files } = group;
    let folderId: mongoose.Types.ObjectId | null = null;
    if (folder) {
      const existing = folderByTitle.get(folder.title);
      if (existing) {
        folderId = existing._id;
      } else {
        const inserted = await db.collection('folders').insertOne({
          seriesId: series._id,
          title: folder.title,
          sortOrder: folder.sortOrder,
        });
        folderByTitle.set(folder.title, { _id: inserted.insertedId, title: folder.title, sortOrder: folder.sortOrder });
        foldersCreated += 1;
        folderId = inserted.insertedId;
      }
    }

    const docs = files.map((file) => {
      sortCounter += 1;
      const duration = durationMap.get(file.audioUrl);
      return {
        title: file.title,
        slug: file.slug,
        type: 'audio',
        audioUrl: file.audioUrl,
        ...(duration ? { duration } : {}),
        seriesId: series._id,
        ...(folderId ? { folderId } : {}),
        tags: ['guru granth sahib'],
        featured: false,
        published: !draft,
        status: draft ? 'draft' : 'published',
        allowDownload: false,
        views: 0,
        sortOrder: sortCounter,
        createdAt: now,
        updatedAt: now,
      };
    });

    const result = await db.collection('kathas').insertMany(docs, { ordered: false });
    created += result.insertedCount;
    console.log(`  ${folder?.title ?? '(root)'}: created ${result.insertedCount} kathas`);
  }

  if (rootImports.length > 0) {
    const docs = rootImports.map((file) => {
      sortCounter += 1;
      const duration = durationMap.get(file.audioUrl);
      return {
        title: file.title,
        slug: file.slug,
        type: 'audio',
        audioUrl: file.audioUrl,
        ...(duration ? { duration } : {}),
        seriesId: series._id,
        tags: ['guru granth sahib'],
        featured: false,
        published: !draft,
        status: draft ? 'draft' : 'published',
        allowDownload: false,
        views: 0,
        sortOrder: sortCounter,
        createdAt: now,
        updatedAt: now,
      };
    });
    const result = await db.collection('kathas').insertMany(docs, { ordered: false });
    created += result.insertedCount;
    console.log(`  (root): created ${result.insertedCount} kathas`);
  }

  console.log(
    `\nDone: ${created} kathas created, ${foldersCreated} folders created, ` +
    `${durationMap.size} durations probed.`
  );
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
