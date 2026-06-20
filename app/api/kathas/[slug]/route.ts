import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminKathaBySlug,
  getKathaBySlug,
  updateKatha,
  archiveKatha,
} from '@/services/kathaService';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { ValidationError, validateKathaInput } from '@/lib/validation';
import { DomainError } from '@/lib/domainError';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { recordAudit } from '@/services/auditService';

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'admin';
    const katha = isAdmin
      ? await getAdminKathaBySlug(slug)
      : await getKathaBySlug(slug);

    if (!katha) {
      return NextResponse.json({ success: false, error: 'Katha not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: katha });
  } catch (error) {
    console.error('GET /api/kathas/[slug]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch katha' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { slug } = await params;
    const body = validateKathaInput(await req.json(), true);
    const updated = await updateKatha(slug, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Katha not found' }, { status: 404 });
    }

    await recordAudit({
      actorId: auth.session.user.id,
      action: 'katha.update',
      entityType: 'Katha',
      entityId: String(updated._id),
      entitySlug: updated.slug,
      metadata: { fields: Object.keys(body) },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('PUT /api/kathas/[slug]', error);
    return NextResponse.json({ success: false, error: 'Failed to update katha' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { slug } = await params;
    const archived = await archiveKatha(slug);
    if (!archived) {
      return NextResponse.json({ success: false, error: 'Katha not found' }, { status: 404 });
    }
    await recordAudit({
      actorId: auth.session.user.id,
      action: 'katha.archive',
      entityType: 'Katha',
      entityId: String(archived._id),
      entitySlug: archived.slug,
    });
    return NextResponse.json({ success: true, message: 'Katha archived' });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('DELETE /api/kathas/[slug]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete katha' }, { status: 500 });
  }
}
