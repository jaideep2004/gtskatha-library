import connectDB from '@/lib/db';
import Folder from '@/models/Folder';
import Katha from '@/models/Katha';
import { DomainError } from '@/lib/domainError';
import mongoose from 'mongoose';

export async function getFolderById(id: string) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Folder.findById(id).lean();
}

export async function getFoldersBySeries(seriesId: string) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(seriesId)) {
    throw new DomainError('Invalid series id', 400);
  }

  const folders = await Folder.find({ seriesId: new mongoose.Types.ObjectId(seriesId) })
    .sort({ sortOrder: 1, title: 1 })
    .lean();

  const counts = await Katha.aggregate([
    { $match: { seriesId: new mongoose.Types.ObjectId(seriesId), folderId: { $ne: null } } },
    { $group: { _id: '$folderId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  return folders.map((f) => ({
    ...f,
    kathaCount: countMap.get(String(f._id)) ?? 0,
  }));
}

export async function createFolder(seriesId: string, title: string) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(seriesId)) {
    throw new DomainError('Invalid series id', 400);
  }
  if (!title.trim()) throw new DomainError('Folder title is required', 400);

  const maxSort = await Folder.findOne({ seriesId }).sort({ sortOrder: -1 }).select('sortOrder').lean();
  const sortOrder = (maxSort?.sortOrder ?? -1) + 1;

  const folder = await Folder.create({ seriesId: new mongoose.Types.ObjectId(seriesId), title: title.trim(), sortOrder });
  return folder.toObject();
}

export async function updateFolder(id: string, data: { title?: string; sortOrder?: number }) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) throw new DomainError('Invalid folder id', 400);

  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title.trim();
  if (data.sortOrder !== undefined) update.sortOrder = data.sortOrder;

  if (Object.keys(update).length === 0) throw new DomainError('Nothing to update', 400);

  const folder = await Folder.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).lean();
  if (!folder) throw new DomainError('Folder not found', 404);
  return folder;
}

export async function deleteFolder(id: string) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) throw new DomainError('Invalid folder id', 400);

  const folder = await Folder.findByIdAndDelete(id).lean();
  if (!folder) throw new DomainError('Folder not found', 404);

  await Katha.updateMany(
    { folderId: folder._id },
    { $unset: { folderId: 1 } }
  );

  return folder;
}

export async function reorderFolders(ids: string[]) {
  await connectDB();
  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) throw new DomainError('No valid IDs provided', 400);

  const ops = validIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(id) },
      update: { $set: { sortOrder: index } },
    },
  }));

  await Folder.bulkWrite(ops);
  return { reordered: validIds.length };
}
