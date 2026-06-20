import { NextRequest, NextResponse } from 'next/server';
import { getAllSeries, createSeries } from '@/services/seriesService';
import { generateSlug } from '@/lib/utils';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { ValidationError, validateSeriesInput } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const featuredOnly = req.nextUrl.searchParams.get('featured') === 'true';
    const series = await getAllSeries(featuredOnly);
    return NextResponse.json({ success: true, data: series });
  } catch (error) {
    console.error('GET /api/series', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch series' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const body = validateSeriesInput(await req.json());
    const title = body.title as string;
    const slug = (body.slug as string | undefined) || generateSlug(title);
    const series = await createSeries({ ...body, title, slug });

    return NextResponse.json({ success: true, data: series }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('POST /api/series', error);
    return NextResponse.json({ success: false, error: 'Failed to create series' }, { status: 500 });
  }
}
