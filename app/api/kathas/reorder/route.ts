import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { DomainError } from '@/lib/domainError';
import { reorderKathas } from '@/services/kathaService';
import { recordAudit } from '@/services/auditService';

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { ids } = await req.json() as { ids?: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'ids array is required' }, { status: 400 });
    }

    const result = await reorderKathas(ids);

    await recordAudit({
      actorId: auth.session.user.id,
      action: 'katha.reorder',
      entityType: 'Katha',
      metadata: { count: result.reordered },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('PUT /api/kathas/reorder', error);
    return NextResponse.json({ success: false, error: 'Failed to reorder kathas' }, { status: 500 });
  }
}
