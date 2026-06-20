import { NextRequest, NextResponse } from 'next/server';
import { getCategoriesWithCount, createCategory } from '@/services/categoryService';
import { generateSlug } from '@/lib/utils';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { ValidationError, validateCategoryInput } from '@/lib/validation';

export async function GET() {
  try {
    const categories = await getCategoriesWithCount();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('GET /api/categories', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const body = validateCategoryInput(await req.json());
    const name = body.name as string;
    const slug = (body.slug as string | undefined) || generateSlug(name);
    const category = await createCategory({ ...body, name, slug });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('POST /api/categories', error);
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
  }
}
