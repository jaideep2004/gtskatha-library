import { NextRequest, NextResponse } from 'next/server';
import { getSeriesBySlug, updateSeries, deleteSeries } from '@/services/seriesService';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { ValidationError, validateSeriesInput } from '@/lib/validation';
import { DomainError } from '@/lib/domainError';

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const series = await getSeriesBySlug(slug);
    if (!series) {
      return NextResponse.json({ success: false, error: 'Series not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: series });
  } catch (error) {
    console.error('GET /api/series/[slug]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch series' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { slug } = await params;
    const body = validateSeriesInput(await req.json(), true);
    const updated = await updateSeries(slug, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Series not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('PUT /api/series/[slug]', error);
    return NextResponse.json({ success: false, error: 'Failed to update series' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { slug } = await params;
    await deleteSeries(slug);
    return NextResponse.json({ success: true, message: 'Series deleted' });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('DELETE /api/series/[slug]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete series' }, { status: 500 });
  }
}
