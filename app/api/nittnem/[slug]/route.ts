import { NextRequest, NextResponse } from 'next/server';
import { getNittnemBySlug, updateNittnem, deleteNittnem } from '@/services/nittnemService';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const nittnem = await getNittnemBySlug(slug);
    if (!nittnem) {
      return NextResponse.json({ success: false, error: 'Nittnem list not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: nittnem });
  } catch (error) {
    console.error('GET /api/nittnem/[slug]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch nittnem list' }, { status: 500 });
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
    const updated = await updateNittnem(slug, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/nittnem/[slug]', error);
    return NextResponse.json({ success: false, error: 'Failed to update nittnem list' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { slug } = await params;
    await deleteNittnem(slug);
    return NextResponse.json({ success: true, message: 'Nittnem list deleted' });
  } catch (error) {
    console.error('DELETE /api/nittnem/[slug]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete nittnem list' }, { status: 500 });
  }
}
