import { NextRequest, NextResponse } from 'next/server';
import { getEntries, addEntry, reorderEntries } from '@/services/paathService';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const { getPaathBySlug } = await import('@/services/paathService');
    const paath = await getPaathBySlug(slug);
    if (!paath) {
      return NextResponse.json({ success: false, error: 'Paath not found' }, { status: 404 });
    }
    const entries = await getEntries(String(paath._id));
    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error('GET /api/paath/[slug]/entries', error);
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
    const { getPaathBySlug: getPaath } = await import('@/services/paathService');
    const paath = await getPaath(slug);
    if (!paath) {
      return NextResponse.json({ success: false, error: 'Paath not found' }, { status: 404 });
    }

    const { kathaId, title } = await req.json() as { kathaId?: string; title?: string };
    if (!kathaId) {
      return NextResponse.json({ success: false, error: 'kathaId is required' }, { status: 400 });
    }

    const entry = await addEntry(String(paath._id), kathaId, title);
    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error('POST /api/paath/[slug]/entries', error);
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
    const { getPaathBySlug: getPaath } = await import('@/services/paathService');
    const paath = await getPaath(slug);
    if (!paath) {
      return NextResponse.json({ success: false, error: 'Paath not found' }, { status: 404 });
    }

    const { ids } = await req.json() as { ids?: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'ids array is required' }, { status: 400 });
    }

    const result = await reorderEntries(String(paath._id), ids);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('PUT /api/paath/[slug]/entries', error);
    return NextResponse.json({ success: false, error: 'Failed to reorder entries' }, { status: 500 });
  }
}
