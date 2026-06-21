import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Katha from '@/models/Katha';
import { DomainError } from '@/lib/domainError';

export async function getCategories() {
  await connectDB();
  return Category.find({ archived: { $ne: true } }).sort({ name: 1 }).lean();
}

export async function getCategoriesWithCount() {
  await connectDB();
  const categories = await Category.find({ archived: { $ne: true } }).sort({ name: 1 }).lean();
  const categoryIds = categories.map((category) => category._id);
  const counts = await Katha.aggregate<{
    _id: { categoryId: typeof categoryIds[number]; type: 'audio' | 'video' };
    count: number;
  }>([
    {
      $match: {
        categoryId: { $in: categoryIds },
        status: { $ne: 'archived' },
        $or: [
          { status: 'published' },
          { status: { $exists: false }, published: true },
        ],
      },
    },
    { $group: { _id: { categoryId: '$categoryId', type: '$type' }, count: { $sum: 1 } } },
  ]);

  const countMap = new Map(
    counts.map((item) => [`${String(item._id.categoryId)}:${item._id.type}`, item.count])
  );

  return categories.map((category) => {
    const audioCount = countMap.get(`${String(category._id)}:audio`) ?? 0;
    const videoCount = countMap.get(`${String(category._id)}:video`) ?? 0;
    return {
      ...category,
      audioCount,
      videoCount,
      kathaCount: audioCount + videoCount,
    };
  });
}

export async function getCategoryBySlug(slug: string) {
  await connectDB();
  return Category.findOne({ slug, archived: { $ne: true } }).lean();
}

export async function createCategory(data: { name: string; slug: string; description?: string; thumbnail?: string }) {
  await connectDB();
  const cat = new Category(data);
  return cat.save();
}

export async function updateCategory(slug: string, data: Record<string, unknown>) {
  await connectDB();
  return Category.findOneAndUpdate(
    { slug },
    { $set: data },
    { returnDocument: "after", runValidators: true }
  );
}

export async function deleteCategory(slug: string) {
  await connectDB();
  const category = await Category.findOne({ slug }).select('_id').lean();
  if (!category) return null;

  const inUse = await Katha.exists({ categoryId: category._id });
  if (inUse) {
    throw new DomainError('Category cannot be deleted while kathas reference it');
  }
  return Category.findOneAndUpdate(
    { slug },
    { $set: { archived: true, archivedAt: new Date() } },
    { returnDocument: "after" }
  );
}
