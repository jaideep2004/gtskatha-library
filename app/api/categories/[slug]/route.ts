import { NextRequest, NextResponse } from 'next/server';
import { getCategoryBySlug, updateCategory, deleteCategory } from '@/services/categoryService';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { ValidationError, validateCategoryInput } from '@/lib/validation';
import { DomainError } from '@/lib/domainError';

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('GET /api/categories/[slug]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { slug } = await params;
    const body = validateCategoryInput(await req.json(), true);
    const updated = await updateCategory(slug, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('PUT /api/categories/[slug]', error);
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { slug } = await params;
    await deleteCategory(slug);
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('DELETE /api/categories/[slug]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}
