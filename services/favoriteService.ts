import connectDB from '@/lib/db';
import Favorite from '@/models/Favorite';

export async function getUserFavorites(userId: string) {
  await connectDB();
  return Favorite.find({ userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'kathaId',
      populate: [
        { path: 'categoryId', select: 'name slug' },
        { path: 'seriesId', select: 'title slug' },
      ],
    })
    .lean();
}

export async function addFavorite(userId: string, kathaId: string) {
  await connectDB();
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
  const fav = await Favorite.findOne({ userId, kathaId });
  return !!fav;
}
