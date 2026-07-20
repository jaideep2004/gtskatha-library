import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { DomainError } from '@/lib/domainError';
import { bulkUpdateTitles } from '@/services/kathaService';
import { recordAudit } from '@/services/auditService';

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { titles } = await req.json() as { titles?: Array<{ id: string; title: string }> };
    if (!Array.isArray(titles) || titles.length === 0) {
      return NextResponse.json({ success: false, error: 'titles array is required' }, { status: 400 });
    }
    for (const t of titles) {
      if (!t.id || typeof t.title !== 'string' || !t.title.trim()) {
        return NextResponse.json({ success: false, error: 'Each entry must have a valid id and non-empty title' }, { status: 400 });
      }
    }

    const result = await bulkUpdateTitles(titles);

    await recordAudit({
      actorId: auth.session.user.id,
      action: 'katha.bulk_update_titles',
      entityType: 'Katha',
      metadata: { ids: titles.map((t) => t.id), count: result.modifiedCount },
    });

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} katha(s) updated`,
      data: result,
    });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('PUT /api/kathas/bulk-titles', error);
    return NextResponse.json({ success: false, error: 'Failed to update titles' }, { status: 500 });
  }
}
