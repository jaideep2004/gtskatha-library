import { NextRequest, NextResponse } from 'next/server';
import { getEntries, addEntry, reorderEntries } from '@/services/nittnemService';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const { getNittnemBySlug } = await import('@/services/nittnemService');
    const nittnem = await getNittnemBySlug(slug);
    if (!nittnem) {
      return NextResponse.json({ success: false, error: 'Nittnem list not found' }, { status: 404 });
    }
    const entries = await getEntries(String(nittnem._id));
    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error('GET /api/nittnem/[slug]/entries', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { slug } = await params;
    const { getNittnemBySlug: getNittnem } = await import('@/services/nittnemService');
    const nittnem = await getNittnem(slug);
    if (!nittnem) {
      return NextResponse.json({ success: false, error: 'Nittnem list not found' }, { status: 404 });
    }

    const { kathaId, title } = await req.json() as { kathaId?: string; title?: string };
    if (!kathaId) {
      return NextResponse.json({ success: false, error: 'kathaId is required' }, { status: 400 });
    }

    const entry = await addEntry(String(nittnem._id), kathaId, title);
    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error('POST /api/nittnem/[slug]/entries', error);
    return NextResponse.json({ success: false, error: 'Failed to add entry' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { slug } = await params;
    const { getNittnemBySlug: getNittnem } = await import('@/services/nittnemService');
    const nittnem = await getNittnem(slug);
    if (!nittnem) {
      return NextResponse.json({ success: false, error: 'Nittnem list not found' }, { status: 404 });
    }

    const { ids } = await req.json() as { ids?: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'ids array is required' }, { status: 400 });
    }

    const result = await reorderEntries(String(nittnem._id), ids);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('PUT /api/nittnem/[slug]/entries', error);
    return NextResponse.json({ success: false, error: 'Failed to reorder entries' }, { status: 500 });
  }
}
