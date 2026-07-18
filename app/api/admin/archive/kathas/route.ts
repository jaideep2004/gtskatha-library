import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import {
  getArchivedKathas,
  hardDeleteArchivedKatha,
  restoreArchivedKatha,
  bulkRestoreArchivedKathas,
} from '@/services/kathaService';
import { DomainError } from '@/lib/domainError';
import { recordAudit } from '@/services/auditService';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { searchParams } = req.nextUrl;
    const result = await getArchivedKathas({
      q: searchParams.get('q') ?? undefined,
      type: (searchParams.get('type') as 'audio' | 'video') ?? undefined,
      page: parseInt(searchParams.get('page') ?? '1', 10),
      limit: parseInt(searchParams.get('limit') ?? '20', 10),
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('GET /api/admin/archive/kathas', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch archived kathas' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const body = await req.json() as { id?: string; ids?: string[] };

    if (body.ids) {
      const result = await bulkRestoreArchivedKathas(body.ids);
      await recordAudit({
        actorId: auth.session.user.id,
        action: 'katha.bulk_restore',
        entityType: 'Katha',
        metadata: { ids: body.ids, count: result.modifiedCount },
      });
      return NextResponse.json({
        success: true,
        message: `${result.modifiedCount} katha(s) restored as draft`,
        data: result,
      });
    }

    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Katha id or ids array is required' }, { status: 400 });
    }

    const restored = await restoreArchivedKatha(body.id);
    if (!restored) {
      return NextResponse.json({ success: false, error: 'Archived katha not found' }, { status: 404 });
    }

    await recordAudit({
      actorId: auth.session.user.id,
      action: 'katha.restore',
      entityType: 'Katha',
      entityId: String(restored._id),
      entitySlug: restored.slug,
    });

    return NextResponse.json({ success: true, data: restored, message: 'Katha restored as draft' });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('PATCH /api/admin/archive/kathas', error);
    return NextResponse.json({ success: false, error: 'Failed to restore katha' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Katha id is required' }, { status: 400 });
    }

    const deleted = await hardDeleteArchivedKatha(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Archived katha not found' }, { status: 404 });
    }

    await recordAudit({
      actorId: auth.session.user.id,
      action: 'katha.hard_delete',
      entityType: 'Katha',
      entityId: String(deleted._id),
      entitySlug: deleted.slug,
    });

    return NextResponse.json({ success: true, message: 'Katha permanently deleted' });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('DELETE /api/admin/archive/kathas', error);
    return NextResponse.json({ success: false, error: 'Failed to permanently delete katha' }, { status: 500 });
  }
}
