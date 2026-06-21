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
}>) {
  await connectDB();
  if (!data.status) data.status = data.published ? 'published' : 'draft';
  data.published = data.status === 'published';
  await assertKathaRelations(data);
  assertMediaRequirements(data);
  const katha = new Katha(data);
  return katha.save();
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
  return Katha.findOneAndUpdate(
    { slug },
    {
      $set: {
        status: 'archived',
        published: false,
        archivedAt: new Date(),
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
