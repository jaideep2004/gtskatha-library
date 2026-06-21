import connectDB from '@/lib/db';
import Series from '@/models/Series';
import Katha from '@/models/Katha';
import { DomainError } from '@/lib/domainError';

export async function getAllSeries(featuredOnly = false) {
  await connectDB();
  const query = featuredOnly
    ? { featured: true, archived: { $ne: true } }
    : { archived: { $ne: true } };
  return Series.find(query).sort({ sortOrder: 1, title: 1 }).lean();
}

export async function getSeriesBySlug(slug: string) {
  await connectDB();
  return Series.findOne({ slug, archived: { $ne: true } }).lean();
}

export async function createSeries(data: {
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  featured?: boolean;
  sortOrder?: number;
}) {
  await connectDB();
  const s = new Series(data);
  return s.save();
}

export async function updateSeries(slug: string, data: Record<string, unknown>) {
  await connectDB();
  return Series.findOneAndUpdate(
    { slug },
    { $set: data },
    { returnDocument: "after", runValidators: true }
  );
}

export async function getSeriesEpisodeCounts() {
  await connectDB();
  const rows = await Katha.aggregate([
    {
      $match: {
        seriesId: { $ne: null },
        $or: [
          { status: 'published' },
          { status: { $exists: false }, published: true },
        ],
      },
    },
    { $group: { _id: '$seriesId', count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((row) => [String(row._id), row.count])) as Record<string, number>;
}

export async function deleteSeries(slug: string) {
  await connectDB();
  const series = await Series.findOne({ slug }).select('_id').lean();
  if (!series) return null;

  const inUse = await Katha.exists({ seriesId: series._id });
  if (inUse) {
    throw new DomainError('Series cannot be deleted while kathas reference it');
  }
  return Series.findOneAndUpdate(
    { slug },
    { $set: { archived: true, archivedAt: new Date(), featured: false } },
    { returnDocument: "after" }
  );
}
