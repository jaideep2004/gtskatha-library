import { NextRequest, NextResponse } from 'next/server';
import { getAllNittnems, createNittnem } from '@/services/nittnemService';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { generateSlug } from '@/lib/utils';

export async function GET() {
  try {
    const nittnems = await getAllNittnems();
    return NextResponse.json({ success: true, data: nittnems });
  } catch (error) {
    console.error('GET /api/nittnem', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch nittnem lists' }, { status: 500 });
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
    const nittnem = await createNittnem({ title: title.trim(), slug, description, thumbnail });
    return NextResponse.json({ success: true, data: nittnem }, { status: 201 });
  } catch (error) {
    console.error('POST /api/nittnem', error);
    return NextResponse.json({ success: false, error: 'Failed to create nittnem list' }, { status: 500 });
  }
}
