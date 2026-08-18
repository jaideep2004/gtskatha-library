import connectDB from '@/lib/db';
import Paath from '@/models/Paath';
import PaathEntry from '@/models/PaathEntry';
import Nittnem from '@/models/Nittnem';
import NittnemEntry from '@/models/NittnemEntry';
import { DomainError } from '@/lib/domainError';
import mongoose from 'mongoose';

export async function getAllPaaths() {
  await connectDB();
  const paaths = await Paath.find().sort({ sortOrder: 1, title: 1 }).lean();
  const counts = await PaathEntry.aggregate([
    { $group: { _id: '$paathId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  return paaths.map((p) => ({ ...p, entryCount: countMap.get(String(p._id)) ?? 0 }));
}

export async function getPaathBySlug(slug: string) {
  await connectDB();
  return Paath.findOne({ slug }).lean();
}

export async function createPaath(data: { title: string; slug: string; description?: string; thumbnail?: string }) {
  await connectDB();
  const maxSort = await Paath.findOne().sort({ sortOrder: -1 }).select('sortOrder').lean();
  const sortOrder = (maxSort?.sortOrder ?? -1) + 1;
  const paath = await Paath.create({ ...data, sortOrder });
  return paath.toObject();
}

export async function updatePaath(slug: string, data: Record<string, unknown>) {
  await connectDB();
  const paath = await Paath.findOneAndUpdate({ slug }, { $set: data }, { new: true, runValidators: true }).lean();
  if (!paath) throw new DomainError('Paath not found', 404);
  return paath;
}

export async function deletePaath(slug: string) {
  await connectDB();
  const paath = await Paath.findOneAndDelete({ slug }).lean();
  if (!paath) throw new DomainError('Paath not found', 404);
  await PaathEntry.deleteMany({ paathId: paath._id });
  return paath;
}

export async function getEntries(paathId: string) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(paathId)) throw new DomainError('Invalid paath id', 400);
  return PaathEntry.find({ paathId: new mongoose.Types.ObjectId(paathId) })
    .sort({ order: 1 })
    .populate('kathaId', 'title slug type thumbnail duration authorName')
    .lean();
}

export async function addEntry(paathId: string, kathaId: string, title?: string) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(paathId)) throw new DomainError('Invalid paath id', 400);
  if (!mongoose.Types.ObjectId.isValid(kathaId)) throw new DomainError('Invalid katha id', 400);
  const existing = await PaathEntry.exists({
    paathId: new mongoose.Types.ObjectId(paathId),
    kathaId: new mongoose.Types.ObjectId(kathaId),
  });
  if (existing) throw new DomainError('This katha is already in the paath', 409);
  const maxOrder = await PaathEntry.findOne({ paathId }).sort({ order: -1 }).select('order').lean();
  const order = (maxOrder?.order ?? 0) + 1;
  const entry = await PaathEntry.create({
    paathId: new mongoose.Types.ObjectId(paathId),
    kathaId: new mongoose.Types.ObjectId(kathaId),
    order,
    title: title?.trim() || undefined,
  });
  return entry.toObject();
}

export async function reorderPaaths(ids: string[]) {
  await connectDB();
  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length !== ids.length) throw new DomainError('Invalid paath id in reorder request', 400);

  const ops = validIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(id) },
      update: { $set: { sortOrder: index } },
    },
  }));

  await Paath.bulkWrite(ops);
  return { reordered: validIds.length };
}

export async function copyPaathToNitnem(slug: string) {
  await connectDB();
  const paath = await Paath.findOne({ slug }).lean();
  if (!paath) throw new DomainError('Paath not found', 404);

  const entries = await PaathEntry.find({ paathId: paath._id }).sort({ order: 1 }).select('kathaId').lean();
  const kathaIds = entries
    .map((e) => String(e.kathaId))
    .filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (kathaIds.length === 0) throw new DomainError('This Paath has no kathas to copy', 409);

  let list = await Nittnem.findOne({ slug: paath.slug }).lean();
  const created = !list;
  if (!list) {
    const maxSort = await Nittnem.findOne().sort({ sortOrder: -1 }).select('sortOrder').lean();
    list = (
      await Nittnem.create({
        title: paath.title,
        slug: paath.slug,
        description: paath.description,
        thumbnail: paath.thumbnail,
        sortOrder: (maxSort?.sortOrder ?? -1) + 1,
      })
    ).toObject();
  }

  const existing = await NittnemEntry.find({
    nittnemId: list._id,
    kathaId: { $in: kathaIds },
  }).distinct('kathaId');
  const existingSet = new Set(existing.map((id) => String(id)));
  const fresh = kathaIds.filter((id) => !existingSet.has(String(id)));

  if (fresh.length > 0) {
    const maxOrder = await NittnemEntry.findOne({ nittnemId: list._id }).sort({ order: -1 }).select('order').lean();
    let order = (maxOrder?.order ?? 0) + 1;
    await NittnemEntry.insertMany(
      fresh.map((kathaId) => ({
        nittnemId: list._id,
        kathaId: new mongoose.Types.ObjectId(kathaId),
        order: order++,
      }))
    );
  }

  return {
    created,
    list: { _id: list._id, title: list.title, slug: list.slug },
    added: fresh.length,
    skipped: existing.length,
  };
}

export async function removeEntry(id: string) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) throw new DomainError('Invalid entry id', 400);
  const entry = await PaathEntry.findByIdAndDelete(id).lean();
  if (!entry) throw new DomainError('Entry not found', 404);
  return entry;
}

export async function reorderEntries(paathId: string, ids: string[]) {
  await connectDB();
  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) throw new DomainError('No valid IDs provided', 400);
  const ops = validIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(id), paathId: new mongoose.Types.ObjectId(paathId) },
      update: { $set: { order: index } },
    },
  }));
  await PaathEntry.bulkWrite(ops);
  return { reordered: validIds.length };
}
