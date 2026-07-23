import { NextRequest, NextResponse } from 'next/server';
import { getPaathBySlug, updatePaath, deletePaath } from '@/services/paathService';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const paath = await getPaathBySlug(slug);
    if (!paath) {
      return NextResponse.json({ success: false, error: 'Paath not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: paath });
  } catch (error) {
    console.error('GET /api/paath/[slug]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch paath' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { slug } = await params;
    const body = await req.json();
    const updated = await updatePaath(slug, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/paath/[slug]', error);
    return NextResponse.json({ success: false, error: 'Failed to update paath' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { slug } = await params;
    await deletePaath(slug);
    return NextResponse.json({ success: true, message: 'Paath deleted' });
  } catch (error) {
    console.error('DELETE /api/paath/[slug]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete paath' }, { status: 500 });
  }
}
