import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { DomainError } from '@/lib/domainError';
import { bulkPublishKathas } from '@/services/kathaService';
import { recordAudit } from '@/services/auditService';

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { ids, published } = await req.json() as { ids?: string[]; published?: boolean };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'ids array is required' }, { status: 400 });
    }

    const result = await bulkPublishKathas(ids, published ?? true);

    await recordAudit({
      actorId: auth.session.user.id,
      action: published ? 'katha.bulk_publish' : 'katha.bulk_unpublish',
      entityType: 'Katha',
      metadata: { ids, count: result.modifiedCount },
    });

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} katha(s) ${published ? 'published' : 'unpublished'}`,
      data: result,
    });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('PUT /api/kathas/bulk-publish', error);
    return NextResponse.json({ success: false, error: 'Failed to update publish status' }, { status: 500 });
  }
}
