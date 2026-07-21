import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { DomainError } from '@/lib/domainError';
import { updateFolder, deleteFolder } from '@/services/folderService';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { id } = await params;
    const body = await req.json() as { title?: string; sortOrder?: number };
    const result = await updateFolder(id, body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('PUT /api/folders/[id]', error);
    return NextResponse.json({ success: false, error: 'Failed to update folder' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { id } = await params;
    const result = await deleteFolder(id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('DELETE /api/folders/[id]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete folder' }, { status: 500 });
  }
}
