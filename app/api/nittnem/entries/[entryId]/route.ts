import { NextRequest, NextResponse } from 'next/server';
import { removeEntry } from '@/services/nittnemService';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';

interface Params {
  params: Promise<{ entryId: string }>;
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { entryId } = await params;
    await removeEntry(entryId);
    return NextResponse.json({ success: true, message: 'Entry removed' });
  } catch (error) {
    console.error('DELETE /api/nittnem/entries/[entryId]', error);
    return NextResponse.json({ success: false, error: 'Failed to remove entry' }, { status: 500 });
  }
}
