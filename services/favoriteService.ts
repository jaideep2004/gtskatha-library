import connectDB from '@/lib/db';
import mongoose from 'mongoose';
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
  const favorites = await Favorite.find(filter).sort({ createdAt: -1 }).lean();

  const idsByType = new Map<string, mongoose.Types.ObjectId[]>();
  for (const fav of favorites) {
    const list = idsByType.get(fav.itemType) ?? [];
    list.push(fav.kathaId);
    idsByType.set(fav.itemType, list);
  }

  const resolved = new Map<string, Record<string, unknown>>();
  for (const [type, ids] of idsByType) {
    if (type === 'katha') {
      const docs = await Katha.find({ _id: { $in: ids }, ...publicKathaMatch })
        .populate('categoryId', 'name slug')
        .populate('seriesId', 'title slug')
        .lean();
      for (const doc of docs) {
        resolved.set(String(doc._id), doc as unknown as Record<string, unknown>);
      }
    } else if (type === 'series') {
      const docs = await Series.find({ _id: { $in: ids }, archived: { $ne: true } })
        .select('title slug thumbnail')
        .lean();
      for (const doc of docs) {
        resolved.set(String(doc._id), { _id: doc._id, title: doc.title, slug: doc.slug });
      }
    } else if (type === 'paath') {
      const docs = await Paath.find({ _id: { $in: ids }, active: true })
        .select('title slug thumbnail')
        .lean();
      for (const doc of docs) {
        resolved.set(String(doc._id), { _id: doc._id, title: doc.title, slug: doc.slug });
      }
    } else {
      const docs = await Nittnem.find({ _id: { $in: ids }, active: true })
        .select('title slug thumbnail')
        .lean();
      for (const doc of docs) {
        resolved.set(String(doc._id), { _id: doc._id, title: doc.title, slug: doc.slug });
      }
    }
  }

  return favorites.map((favorite) => ({
    ...favorite,
    kathaId: resolved.get(String(favorite.kathaId)) ?? null,
  }));
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
