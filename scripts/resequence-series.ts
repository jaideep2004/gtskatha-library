/**
 * Resequence (reassign sortOrder) for every katha in a series so the series
 * plays in a deterministic order:
 *
 *   1. Kathas are grouped by folder (folders ordered by their sortOrder).
 *   2. Uncategorized kathas (no folder) come last, ordered by createdAt.
 *   3. Within each folder, kathas are ordered by their title's Ang number,
 *      then Pankti number (e.g. "Guru Granth Sahib Ji Ang 0004 Pankti 12"),
 *      falling back to numeric-aware title comparison.
 *   4. sortOrder is assigned 0..n-1 globally across the series.
 *
 * Usage:
 *   npm run resequence -- --series <slug-or-id> [--dry-run]
 *
 * Use this after bulk web uploads when sortOrder collisions interleaved
 * kathas out of order (new items landing between existing ones).
 */

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

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

function parseArgs(): { series: string; dryRun: boolean } {
  const args = process.argv.slice(2);
  const index = args.indexOf('--series');
  const series = index >= 0 && args[index + 1] ? args[index + 1] : 'sri-guru-granth-sahib';
  return { series, dryRun: args.includes('--dry-run') };
}

interface TitleKey {
  ang: number;
  pankti: number;
  title: string;
}

function titleKey(title: string): TitleKey {
  const ang = title.match(/ang\s*(\d+)/i);
  const pankti = title.match(/pankti\s*(\d+)/i);
  return {
    ang: ang ? Number.parseInt(ang[1], 10) : Number.POSITIVE_INFINITY,
    pankti: pankti ? Number.parseInt(pankti[1], 10) : Number.POSITIVE_INFINITY,
    title,
  };
}

function compareTitles(a: TitleKey, b: TitleKey): number {
  if (a.ang !== b.ang) return a.ang - b.ang;
  if (a.pankti !== b.pankti) return a.pankti - b.pankti;
  return a.title.localeCompare(b.title, undefined, { numeric: true });
}

async function main() {
  loadEnv();
  const { series: seriesQuery, dryRun } = parseArgs();

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured');

  await mongoose.connect(uri, { bufferCommands: false });
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB connection has no database handle');

  const series = mongoose.Types.ObjectId.isValid(seriesQuery)
    ? await db.collection('series').findOne({ _id: new mongoose.Types.ObjectId(seriesQuery) })
    : await db.collection('series').findOne({ slug: seriesQuery });
  if (!series) {
    console.error(`Series not found: ${seriesQuery}`);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`Series: ${series.title}`);

  const [folders, kathas] = await Promise.all([
    db.collection('folders').find({ seriesId: series._id }).sort({ sortOrder: 1 }).toArray(),
    db.collection('kathas')
      .find({ seriesId: series._id, status: { $ne: 'archived' } })
      .project({ title: 1, folderId: 1, sortOrder: 1, createdAt: 1 })
      .toArray(),
  ]);
  if (kathas.length === 0) {
    console.log('No kathas to resequence.');
    await mongoose.disconnect();
    return;
  }

  const orderedGroups: Array<{ label: string; items: typeof kathas }> = [];
  const matched = new Set<mongoose.Types.ObjectId>();
  for (const folder of folders) {
    const items = kathas
      .filter((k) => k.folderId && String(k.folderId) === String(folder._id))
      .sort((a, b) => compareTitles(titleKey(a.title ?? ''), titleKey(b.title ?? '')));
    if (items.length > 0) {
      items.forEach((k) => matched.add(k._id));
      orderedGroups.push({ label: folder.title, items });
    }
  }
  const uncategorized = kathas.filter((k) => !matched.has(k._id));
  if (uncategorized.length > 0) {
    uncategorized.sort((a, b) =>
      new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
    );
    orderedGroups.push({ label: '(uncategorized)', items: uncategorized });
  }

  const updates: Array<{ filter: { _id: mongoose.Types.ObjectId }; update: { $set: { sortOrder: number } } }> = [];
  let sortOrder = 0;
  for (const group of orderedGroups) {
    for (const katha of group.items) {
      updates.push({
        filter: { _id: katha._id },
        update: { $set: { sortOrder } },
      });
      sortOrder += 1;
    }
  }

  const changed = updates.filter((u, index) => {
    const katha = orderedGroups.flatMap((g) => g.items)[index];
    return katha.sortOrder !== index;
  }).length;
  console.log(
    `Plan: ${kathas.length} kathas in ${orderedGroups.length} folder groups, ` +
    `sortOrder 0..${sortOrder - 1}${dryRun ? ' (dry run)' : ''}`
  );
  for (const group of orderedGroups) {
    console.log(`  ${group.label}: ${group.items.length} kathas`);
  }

  if (dryRun) {
    console.log('\nDry run complete. Re-run without --dry-run to apply.');
    await mongoose.disconnect();
    return;
  }

  let applied = 0;
  for (let i = 0; i < updates.length; i += 500) {
    const batch = updates.slice(i, i + 500);
    const result = await db.collection('kathas').bulkWrite(
      batch.map((u) => ({ updateOne: u })),
      { ordered: false }
    );
    applied += result.modifiedCount;
  }

  console.log(`\nDone: ${applied} kathas resequenced (${changed} reordered).`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
