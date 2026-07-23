import { NextRequest, NextResponse } from 'next/server';
import { getAllPaaths, createPaath } from '@/services/paathService';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { generateSlug } from '@/lib/utils';

export async function GET() {
  try {
    const paaths = await getAllPaaths();
    return NextResponse.json({ success: true, data: paaths });
  } catch (error) {
    console.error('GET /api/paath', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch paaths' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { title, description, thumbnail } = await req.json() as { title?: string; description?: string; thumbnail?: string };
    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }
    const slug = generateSlug(title);
    const paath = await createPaath({ title: title.trim(), slug, description, thumbnail });
    return NextResponse.json({ success: true, data: paath }, { status: 201 });
  } catch (error) {
    console.error('POST /api/paath', error);
    return NextResponse.json({ success: false, error: 'Failed to create paath' }, { status: 500 });
  }
}
