import connectDB from '@/lib/db';
import Nittnem from '@/models/Nittnem';
import NittnemEntry from '@/models/NittnemEntry';
import { DomainError } from '@/lib/domainError';
import mongoose from 'mongoose';

export async function getAllNittnems() {
  await connectDB();
  const lists = await Nittnem.find().sort({ sortOrder: 1, title: 1 }).lean();
  const counts = await NittnemEntry.aggregate([
    { $group: { _id: '$nittnemId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  return lists.map((n) => ({ ...n, entryCount: countMap.get(String(n._id)) ?? 0 }));
}

export async function getNittnemBySlug(slug: string) {
  await connectDB();
  return Nittnem.findOne({ slug }).lean();
}

export async function createNittnem(data: { title: string; slug: string; description?: string; thumbnail?: string }) {
  await connectDB();
  const maxSort = await Nittnem.findOne().sort({ sortOrder: -1 }).select('sortOrder').lean();
  const sortOrder = (maxSort?.sortOrder ?? -1) + 1;
  const nittnem = await Nittnem.create({ ...data, sortOrder });
  return nittnem.toObject();
}

export async function updateNittnem(slug: string, data: Record<string, unknown>) {
  await connectDB();
  const nittnem = await Nittnem.findOneAndUpdate({ slug }, { $set: data }, { new: true, runValidators: true }).lean();
  if (!nittnem) throw new DomainError('Nittnem not found', 404);
  return nittnem;
}

export async function deleteNittnem(slug: string) {
  await connectDB();
  const nittnem = await Nittnem.findOneAndDelete({ slug }).lean();
  if (!nittnem) throw new DomainError('Nittnem not found', 404);
  await NittnemEntry.deleteMany({ nittnemId: nittnem._id });
  return nittnem;
}

export async function getEntries(nittnemId: string) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(nittnemId)) throw new DomainError('Invalid nittnem id', 400);
  return NittnemEntry.find({ nittnemId: new mongoose.Types.ObjectId(nittnemId) })
    .sort({ order: 1 })
    .populate('kathaId', 'title slug type thumbnail duration authorName')
    .lean();
}

export async function addEntry(nittnemId: string, kathaId: string, title?: string) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(nittnemId)) throw new DomainError('Invalid nittnem id', 400);
  if (!mongoose.Types.ObjectId.isValid(kathaId)) throw new DomainError('Invalid katha id', 400);
  const maxOrder = await NittnemEntry.findOne({ nittnemId }).sort({ order: -1 }).select('order').lean();
  const order = (maxOrder?.order ?? 0) + 1;
  const entry = await NittnemEntry.create({
    nittnemId: new mongoose.Types.ObjectId(nittnemId),
    kathaId: new mongoose.Types.ObjectId(kathaId),
    order,
    title: title?.trim() || undefined,
  });
  return entry.toObject();
}

export async function removeEntry(id: string) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) throw new DomainError('Invalid entry id', 400);
  const entry = await NittnemEntry.findByIdAndDelete(id).lean();
  if (!entry) throw new DomainError('Entry not found', 404);
  return entry;
}

export async function reorderEntries(nittnemId: string, ids: string[]) {
  await connectDB();
  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) throw new DomainError('No valid IDs provided', 400);
  const ops = validIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(id), nittnemId: new mongoose.Types.ObjectId(nittnemId) },
      update: { $set: { order: index } },
    },
  }));
  await NittnemEntry.bulkWrite(ops);
  return { reordered: validIds.length };
}
