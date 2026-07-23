import connectDB from '@/lib/db';
import Favorite from '@/models/Favorite';
import Katha from '@/models/Katha';
import Series from '@/models/Series';
import Paath from '@/models/Paath';
import Nittnem from '@/models/Nittnem';

const publicKathaMatch = {
  status: { $ne: 'archived' as const },
  $or: [{ status: 'published' as const }, { status: { $exists: false }, published: true }],
};

async function targetExists(id: string, itemType: string): Promise<boolean> {
  await connectDB();
  if (itemType === 'series') return !!(await Series.exists({ _id: id, archived: { $ne: true } }));
  if (itemType === 'paath') return !!(await Paath.exists({ _id: id, active: true }));
  if (itemType === 'nittnem') return !!(await Nittnem.exists({ _id: id, active: true }));
  return !!(await Katha.exists({ _id: id, ...publicKathaMatch }));
}

export async function getUserFavorites(userId: string, itemType?: string) {
  await connectDB();
  const filter: Record<string, unknown> = { userId };
  if (itemType) filter.itemType = asItemType(itemType);
  const favorites = await Favorite.find(filter)
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
  return itemType === 'katha' || !itemType
    ? favorites.filter((favorite) => favorite.kathaId)
    : favorites;
}

function asItemType(t: string): 'katha' | 'series' | 'paath' | 'nittnem' {
  if (t === 'series' || t === 'paath' || t === 'nittnem') return t;
  return 'katha';
}

export async function addFavorite(userId: string, targetId: string, itemType = 'katha') {
  await connectDB();
  const exists = await targetExists(targetId, itemType);
  if (!exists) return null;
  const t = asItemType(itemType);
  const existing = await Favorite.findOne({ userId, kathaId: targetId, itemType: t });
  if (existing) return existing;
  const fav = new Favorite({ userId, kathaId: targetId, itemType: t });
  return fav.save();
}

export async function removeFavorite(userId: string, targetId: string, itemType = 'katha') {
  await connectDB();
  const t = asItemType(itemType);
  return Favorite.findOneAndDelete({ userId, kathaId: targetId, itemType: t });
}

export async function isFavorited(userId: string, targetId: string, itemType = 'katha'): Promise<boolean> {
  await connectDB();
  const exists = await targetExists(targetId, itemType);
  if (!exists) return false;
  const t = asItemType(itemType);
  const fav = await Favorite.findOne({ userId, kathaId: targetId, itemType: t });
  return !!fav;
}
