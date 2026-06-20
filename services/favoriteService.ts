import connectDB from '@/lib/db';
import Favorite from '@/models/Favorite';
import Katha from '@/models/Katha';

const publicKathaMatch = {
  status: { $ne: 'archived' as const },
  $or: [{ status: 'published' as const }, { status: { $exists: false }, published: true }],
};

export async function getUserFavorites(userId: string) {
  await connectDB();
  const favorites = await Favorite.find({ userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'kathaId',
      match: publicKathaMatch,
      populate: [
        { path: 'categoryId', select: 'name slug' },
        { path: 'seriesId', select: 'title slug' },
      ],
    })
    .lean();
  return favorites.filter((favorite) => favorite.kathaId);
}

export async function addFavorite(userId: string, kathaId: string) {
  await connectDB();
  const exists = await Katha.exists({ _id: kathaId, ...publicKathaMatch });
  if (!exists) return null;
  const existing = await Favorite.findOne({ userId, kathaId });
  if (existing) return existing;
  const fav = new Favorite({ userId, kathaId });
  return fav.save();
}

export async function removeFavorite(userId: string, kathaId: string) {
  await connectDB();
  return Favorite.findOneAndDelete({ userId, kathaId });
}

export async function isFavorited(userId: string, kathaId: string): Promise<boolean> {
  await connectDB();
  const [katha, fav] = await Promise.all([
    Katha.exists({ _id: kathaId, ...publicKathaMatch }),
    Favorite.findOne({ userId, kathaId }),
  ]);
  if (!katha) return false;
  return !!fav;
}
