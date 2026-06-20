import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import HomepageConfig from '@/models/HomepageConfig';
import { getKathaBySlug } from '@/services/kathaService';
import { getSeriesBySlug } from '@/services/seriesService';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { ValidationError, validateHomepageInput } from '@/lib/validation';

export async function GET() {
  try {
    await connectDB();
    const config = await HomepageConfig.findOne()
      .populate('heroKatha', 'title slug type thumbnail duration')
      .populate('featuredKatha', 'title slug type thumbnail duration description views')
      .populate('featuredSeries', 'title slug thumbnail description')
      .lean();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('GET /api/homepage', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    await connectDB();
    const body = validateHomepageInput(await req.json());

    // Resolve slugs to ObjectIds if provided as strings
    const update: Record<string, unknown> = {};

    if (body.heroKathaSlug) {
      const k = await getKathaBySlug(body.heroKathaSlug);
      if (k) update.heroKatha = (k as { _id: unknown })._id;
    }
    if (body.featuredKathaSlug) {
      const k = await getKathaBySlug(body.featuredKathaSlug);
      if (k) update.featuredKatha = (k as { _id: unknown })._id;
    }
    if (body.featuredSeriesSlug) {
      const s = await getSeriesBySlug(body.featuredSeriesSlug);
      if (s) update.featuredSeries = (s as { _id: unknown })._id;
    }
    if (body.quote !== undefined) update.quote = body.quote;

    const config = await HomepageConfig.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('POST /api/homepage', error);
    return NextResponse.json({ success: false, error: 'Failed to update config' }, { status: 500 });
  }
}
