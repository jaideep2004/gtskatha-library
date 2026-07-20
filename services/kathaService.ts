import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import Katha from '@/models/Katha';
import Category from '@/models/Category';
import Series from '@/models/Series';
import HomepageConfig from '@/models/HomepageConfig';
import Favorite from '@/models/Favorite';
import ContinueListening from '@/models/ContinueListening';
import KathaLike from '@/models/KathaLike';
import KathaNote from '@/models/KathaNote';
import KathaViewEvent from '@/models/KathaViewEvent';
import TimelineComment from '@/models/TimelineComment';
import { KathaSearchParams } from '@/types';
import { DomainError } from '@/lib/domainError';
import { deleteFile } from '@/services/uploadService';
import type { MediaFolder } from '@/lib/media';
import { isSearchQueryReady } from '@/lib/search';
import { generateSlug } from '@/lib/utils';

export interface BulkAudioKathaInput {
  title: string;
  description?: string;
  thumbnail?: string;
  audioUrl: string;
  duration?: number;
  categoryId?: string | null;
  seriesId?: string | null;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
  status?: 'draft' | 'published' | 'archived';
  allowDownload?: boolean;
  authorName?: string;
  keyTakeaways?: string[];
  references?: string[];
  chapters?: Array<{ id: string; title: string; startTime: number; duration: number }>;
  sortOrder?: number;
}

function publicKathaQuery(): Record<string, unknown> {
  return {
    $and: [
      { status: { $ne: 'archived' } },
      {
        $or: [
          { status: 'published' },
          { status: { $exists: false }, published: true },
        ],
      },
    ],
  };
}

function visibleKathaQuery(includeUnpublished: boolean): Record<string, unknown> {
  return includeUnpublished ? { status: { $ne: 'archived' } } : publicKathaQuery();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildKathaSearchClauses(value: string): Record<string, unknown>[] {
  const terms = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6)
    .map((term) => new RegExp(escapeRegExp(term.slice(0, 40)), 'i'));

  return terms.map((term) => ({
    $or: [
      { title: term },
      { authorName: term },
      { description: term },
      { tags: term },
    ],
  }));
}

export async function getKathas(params: KathaSearchParams = {}) {
  await connectDB();
  const {
    q,
    type,
    category,
    series,
    page = 1,
    limit = 20,
    sort = 'newest',
    includeUnpublished = false,
  } = params;

  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
  const query: Record<string, unknown> = visibleKathaQuery(includeUnpublished);

  if (q?.trim() && !isSearchQueryReady(q)) {
    return emptyResult(safePage, safeLimit);
  }
  if (q?.trim()) {
    const searchClauses = buildKathaSearchClauses(q);
    const visibilityClauses = Array.isArray(query.$and) ? query.$and : [];
    query.$and = [...visibilityClauses, ...searchClauses];
  }
  if (type) query.type = type;
  if (category) {
    const categoryId = await resolveRelationId(Category, category);
    if (!categoryId) return emptyResult(safePage, safeLimit);
    query.categoryId = categoryId;
  }
  if (series) {
    const seriesId = await resolveRelationId(Series, series);
    if (!seriesId) return emptyResult(safePage, safeLimit);
    query.seriesId = seriesId;
  }

  const sortMap: Record<string, [string, 1 | -1][]> = {
    newest: [['createdAt', -1]],
    oldest: [['createdAt', 1]],
    popular: [['views', -1]],
    featured: [['featured', -1], ['createdAt', -1]],
    manual: [['sortOrder', 1], ['createdAt', -1]],
  };

  const skip = (safePage - 1) * safeLimit;
  const [data, total] = await Promise.all([
    Katha.find(query)
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(safeLimit)
      .populate('categoryId', 'name slug')
      .populate('seriesId', 'title slug thumbnail')
      .lean(),
    Katha.countDocuments(query),
  ]);

  return {
    data,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

export async function getKathaBySlug(slug: string) {
  await connectDB();
  return Katha.findOne({
    slug,
    ...publicKathaQuery(),
  })
    .populate('categoryId', 'name slug')
    .populate('seriesId', 'title slug thumbnail description')
    .lean();
}

export async function getFeaturedKathas(type?: 'audio' | 'video', limit = 6) {
  await connectDB();
  const query: Record<string, unknown> = {
    featured: true,
    ...publicKathaQuery(),
  };
  if (type) query.type = type;
  return Katha.find(query).sort({ createdAt: -1 }).limit(limit).lean();
}

export async function getRecentKathas(limit = 10) {
  await connectDB();
  return Katha.find({
    ...publicKathaQuery(),
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('categoryId', 'name slug')
    .lean();
}

export async function incrementViews(slug: string) {
  await connectDB();
  return Katha.findOneAndUpdate(
    { slug },
    { $inc: { views: 1 } },
    { returnDocument: "after" }
  );
}

export async function createKatha(data: Partial<{
  title: string;
  slug: string;
  description: string;
  type: 'audio' | 'video';
  thumbnail: string;
  audioUrl: string;
  videoUrl: string;
  duration: number;
  categoryId: string;
  seriesId: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  status: 'draft' | 'published' | 'archived';
  allowDownload: boolean;
  sortOrder: number;
}>) {
  await connectDB();
  if (!data.status) data.status = data.published ? 'published' : 'draft';
  data.published = data.status === 'published';
  await assertKathaRelations(data);
  assertMediaRequirements(data);
  const katha = new Katha(data);
  return katha.save();
}

export async function createBulkAudioKathas(items: BulkAudioKathaInput[]) {
  await connectDB();
  const reservedSlugs = new Set<string>();
  const results: Array<{ katha?: Awaited<ReturnType<typeof createKatha>>; error?: string }> = [];

  for (const item of items) {
    try {
      const slug = await reserveKathaSlug(item.title, reservedSlugs);
      const katha = await createKatha({
        ...item,
        categoryId: item.categoryId ?? undefined,
        seriesId: item.seriesId ?? undefined,
        type: 'audio',
        slug,
      });
      results.push({ katha });
    } catch (error) {
      results.push({ error: error instanceof Error ? error.message : 'Katha creation failed' });
    }
  }

  return results;
}

export async function getAdminKathaBySlug(slug: string) {
  await connectDB();
  return Katha.findOne({ slug })
    .populate('categoryId', 'name slug')
    .populate('seriesId', 'title slug thumbnail description')
    .lean();
}

export async function updateKatha(slug: string, data: Record<string, unknown>) {
  await connectDB();
  if (data.status) data.published = data.status === 'published';
  if ('published' in data && !data.status) {
    data.status = data.published ? 'published' : 'draft';
  }
  await assertKathaRelations(data);

  const existing = await Katha.findOne({ slug }).lean();
  if (!existing) return null;
  assertMediaRequirements({ ...existing, ...data });

  const setData: Record<string, unknown> = {};
  const unsetData: Record<string, 1> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === null) unsetData[key] = 1;
    else setData[key] = value;
  }

  return Katha.findOneAndUpdate(
    { slug },
    {
      ...(Object.keys(setData).length ? { $set: setData } : {}),
      ...(Object.keys(unsetData).length ? { $unset: unsetData } : {}),
    },
    { returnDocument: "after", runValidators: true }
  );
}

export async function archiveKatha(slug: string) {
  await connectDB();
  const katha = await Katha.findOne({ slug });
  if (!katha) return null;

  await Promise.all([
    deleteMediaIfPresent(katha.audioUrl, 'audio'),
    deleteMediaIfPresent(katha.videoUrl, 'video'),
    deleteMediaIfPresent(katha.thumbnail, 'thumbnails'),
  ]);

  return Katha.findOneAndUpdate(
    { slug },
    {
      $set: {
        status: 'archived',
        published: false,
        archivedAt: new Date(),
        audioUrl: undefined,
        videoUrl: undefined,
        thumbnail: undefined,
      },
    },
    { returnDocument: "after" }
  );
}

export async function getArchivedKathas(params: Pick<KathaSearchParams, 'q' | 'type' | 'page' | 'limit'> = {}) {
  await connectDB();
  const {
    q,
    type,
    page = 1,
    limit = 20,
  } = params;
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
  const query: Record<string, unknown> = { status: 'archived' };

  if (q?.trim()) {
    query.$and = buildKathaSearchClauses(q);
  }
  if (type) query.type = type;

  const skip = (safePage - 1) * safeLimit;
  const [data, total] = await Promise.all([
    Katha.find(query)
      .sort({ archivedAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate('categoryId', 'name slug')
      .populate('seriesId', 'title slug thumbnail')
      .lean(),
    Katha.countDocuments(query),
  ]);

  return {
    data,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

export async function restoreArchivedKatha(id: string) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new DomainError('Invalid katha id', 400);
  }

  return Katha.findOneAndUpdate(
    { _id: id, status: 'archived' },
    {
      $set: { status: 'draft', published: false },
      $unset: { archivedAt: 1 },
    },
    { returnDocument: "after" }
  );
}

export async function bulkRestoreArchivedKathas(ids: string[]) {
  await connectDB();
  const objectIds = ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  if (objectIds.length === 0) throw new DomainError('No valid IDs provided', 400);

  const result = await Katha.updateMany(
    { _id: { $in: objectIds }, status: 'archived' },
    {
      $set: { status: 'draft', published: false },
      $unset: { archivedAt: 1 },
    }
  );

  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}

export async function hardDeleteArchivedKatha(id: string) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new DomainError('Invalid katha id', 400);
  }

  const katha = await Katha.findOne({ _id: id, status: 'archived' });
  if (!katha) return null;

  await Promise.all([
    deleteMediaIfPresent(katha.audioUrl, 'audio'),
    deleteMediaIfPresent(katha.videoUrl, 'video'),
    deleteMediaIfPresent(katha.thumbnail, 'thumbnails'),
  ]);

  await Promise.all([
    HomepageConfig.updateMany({ heroKatha: katha._id }, { $unset: { heroKatha: 1 } }),
    HomepageConfig.updateMany({ featuredKatha: katha._id }, { $unset: { featuredKatha: 1 } }),
    Favorite.deleteMany({ kathaId: katha._id }),
    ContinueListening.deleteMany({ kathaId: katha._id }),
    KathaLike.deleteMany({ kathaId: katha._id }),
    KathaNote.deleteMany({ kathaId: katha._id }),
    KathaViewEvent.deleteMany({ kathaId: katha._id }),
    TimelineComment.deleteMany({ kathaId: katha._id }),
  ]);

  const deleted = await Katha.deleteOne({ _id: katha._id, status: 'archived' });
  if (deleted.deletedCount !== 1) {
    throw new DomainError('Katha could not be deleted safely', 409);
  }

  return katha;
}

async function assertKathaRelations(data: Record<string, unknown>) {
  const checks: Promise<unknown>[] = [];
  const labels: string[] = [];

  if (data.categoryId) {
    checks.push(Category.exists({ _id: data.categoryId }));
    labels.push('category');
  }
  if (data.seriesId) {
    checks.push(Series.exists({ _id: data.seriesId }));
    labels.push('series');
  }

  const results = await Promise.all(checks);
  const missingIndex = results.findIndex((result) => !result);
  if (missingIndex >= 0) {
    throw new DomainError(`Selected ${labels[missingIndex]} does not exist`, 400);
  }
}

function assertMediaRequirements(data: Record<string, unknown>) {
  const isPublished = data.status === 'published' || data.published === true;
  if (!isPublished) return;

  if (data.type === 'audio' && !data.audioUrl) {
    throw new DomainError('Published audio katha requires an audio file', 400);
  }
  if (data.type === 'video' && !data.videoUrl) {
    throw new DomainError('Published video katha requires a video file', 400);
  }
  if (!data.thumbnail) {
    throw new DomainError('Published katha requires a thumbnail', 400);
  }
}

export async function bulkUpdateTitles(updates: Array<{ id: string; title: string }>) {
  await connectDB();
  const ops = updates
    .filter(({ id }) => mongoose.Types.ObjectId.isValid(id))
    .map(({ id, title }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { title } },
      },
    }));
  if (ops.length === 0) throw new DomainError('No valid IDs provided', 400);
  const result = await Katha.bulkWrite(ops);
  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}

export async function bulkSetThumbnail(ids: string[], thumbnail: string) {
  await connectDB();
  const objectIds = ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  if (objectIds.length === 0) throw new DomainError('No valid IDs provided', 400);

  const result = await Katha.updateMany(
    { _id: { $in: objectIds } },
    { $set: { thumbnail } }
  );

  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}

export async function reorderKathas(ids: string[]) {
  await connectDB();
  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length !== ids.length) throw new DomainError('Invalid katha id in reorder request', 400);

  const ops = validIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(id) },
      update: { $set: { sortOrder: index } },
    },
  }));

  await Katha.bulkWrite(ops);
  return { reordered: validIds.length };
}

export async function bulkPublishKathas(ids: string[], published: boolean) {
  await connectDB();
  const objectIds = ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  if (objectIds.length === 0) throw new DomainError('No valid IDs provided', 400);

  const result = await Katha.updateMany(
    { _id: { $in: objectIds } },
    { $set: { published, status: published ? 'published' : 'draft' } }
  );

  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}

export async function bulkArchiveKathas(ids: string[]) {
  await connectDB();
  const objectIds = ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  if (objectIds.length === 0) throw new DomainError('No valid IDs provided', 400);

  const kathas = await Katha.find({ _id: { $in: objectIds }, status: { $ne: 'archived' } });
  await Promise.all(
    kathas.flatMap((k) => [
      deleteMediaIfPresent(k.audioUrl, 'audio'),
      deleteMediaIfPresent(k.videoUrl, 'video'),
      deleteMediaIfPresent(k.thumbnail, 'thumbnails'),
    ])
  );

  const result = await Katha.updateMany(
    { _id: { $in: objectIds }, status: { $ne: 'archived' } },
    { $set: { status: 'archived', published: false, archivedAt: new Date(), audioUrl: undefined, videoUrl: undefined, thumbnail: undefined } }
  );

  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}

export async function bulkHardDeleteKathas(ids: string[]) {
  await connectDB();
  const objectIds = ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  if (objectIds.length === 0) throw new DomainError('No valid IDs provided', 400);

  const kathas = await Katha.find({ _id: { $in: objectIds }, status: 'archived' });
  const kathaIds = kathas.map((k) => k._id);

  if (kathaIds.length === 0) return { deletedCount: 0 };

  await Promise.all(
    kathas.map((katha) =>
      Promise.all([
        deleteMediaIfPresent(katha.audioUrl, 'audio'),
        deleteMediaIfPresent(katha.videoUrl, 'video'),
        deleteMediaIfPresent(katha.thumbnail, 'thumbnails'),
      ])
    )
  );

  await Promise.all([
    HomepageConfig.updateMany({ heroKatha: { $in: kathaIds } }, { $unset: { heroKatha: 1 } }),
    HomepageConfig.updateMany({ featuredKatha: { $in: kathaIds } }, { $unset: { featuredKatha: 1 } }),
    Favorite.deleteMany({ kathaId: { $in: kathaIds } }),
    ContinueListening.deleteMany({ kathaId: { $in: kathaIds } }),
    KathaLike.deleteMany({ kathaId: { $in: kathaIds } }),
    KathaNote.deleteMany({ kathaId: { $in: kathaIds } }),
    KathaViewEvent.deleteMany({ kathaId: { $in: kathaIds } }),
    TimelineComment.deleteMany({ kathaId: { $in: kathaIds } }),
  ]);

  const result = await Katha.deleteMany({ _id: { $in: kathaIds }, status: 'archived' });

  return { deletedCount: result.deletedCount };
}

async function reserveKathaSlug(title: string, reservedSlugs: Set<string>) {
  const base = generateSlug(title) || 'katha';
  let candidate = base;
  let suffix = 2;

  while (reservedSlugs.has(candidate) || await Katha.exists({ slug: candidate })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  reservedSlugs.add(candidate);
  return candidate;
}

async function deleteMediaIfPresent(value: string | undefined, folder: MediaFolder) {
  const filename = extractStoredFilename(value);
  if (!filename) return;
  await deleteFile(filename, folder);
}

function extractStoredFilename(value: string | undefined): string | null {
  if (!value) return null;
  const withoutQuery = value.split(/[?#]/)[0];
  const normalized = withoutQuery.replace(/\\/g, '/');
  const filename = normalized.split('/').filter(Boolean).pop();
  if (!filename) return null;

  try {
    return decodeURIComponent(filename);
  } catch {
    return filename;
  }
}

async function resolveRelationId(
  model: typeof Category | typeof Series,
  value: string
): Promise<string | null> {
  if (mongoose.Types.ObjectId.isValid(value)) return value;
  const relation = model === Category
    ? await Category.findOne({ slug: value, archived: { $ne: true } }).select('_id').lean()
    : await Series.findOne({ slug: value, archived: { $ne: true } }).select('_id').lean();
  return relation?._id ? String(relation._id) : null;
}

function emptyResult(page: number, limit: number) {
  return { data: [], total: 0, page, limit, totalPages: 0 };
}
