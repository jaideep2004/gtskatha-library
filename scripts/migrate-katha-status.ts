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

async function main() {
  loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured');

  const apply = process.argv.includes('--apply');
  await mongoose.connect(uri, { bufferCommands: false });
  const collection = mongoose.connection.collection('kathas');
  const missingStatus = { status: { $exists: false } };
  const total = await collection.countDocuments(missingStatus);
  const published = await collection.countDocuments({ ...missingStatus, published: true });
  const drafts = total - published;

  console.log(`Katha status migration: ${total} records (${published} published, ${drafts} draft).`);
  if (!apply) {
    console.log('Dry run only. Re-run with --apply to update records.');
    await mongoose.disconnect();
    return;
  }

  const [publishedResult, draftResult, downloadResult] = await Promise.all([
    collection.updateMany(
      { status: { $exists: false }, published: true },
      { $set: { status: 'published' } }
    ),
    collection.updateMany(
      { status: { $exists: false }, published: { $ne: true } },
      { $set: { status: 'draft', published: false } }
    ),
    collection.updateMany(
      { allowDownload: { $exists: false } },
      { $set: { allowDownload: false } }
    ),
  ]);

  console.log(
    `Updated ${publishedResult.modifiedCount + draftResult.modifiedCount} statuses and ${downloadResult.modifiedCount} download policies.`
  );
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
