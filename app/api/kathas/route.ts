import { NextRequest, NextResponse } from 'next/server';
import { getKathas, createKatha } from '@/services/kathaService';
import { generateSlug } from '@/lib/utils';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { ValidationError, validateKathaInput } from '@/lib/validation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DomainError } from '@/lib/domainError';
import { recordAudit } from '@/services/auditService';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = req.nextUrl;
    const params = {
      q: searchParams.get('q') ?? undefined,
      type: (searchParams.get('type') as 'audio' | 'video') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      series: searchParams.get('series') ?? undefined,
      page: parseInt(searchParams.get('page') ?? '1'),
      limit: parseInt(searchParams.get('limit') ?? '20'),
      sort: (searchParams.get('sort') as 'newest' | 'oldest' | 'popular' | 'featured' | 'manual') ?? 'newest',
      includeUnpublished: session?.user?.role === 'admin',
    };

    const result = await getKathas(params);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('GET /api/kathas', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch kathas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const body = validateKathaInput(await req.json());
    const title = body.title as string;
    const slug = (body.slug as string | undefined) || generateSlug(title);
    const katha = await createKatha({ ...body, title, slug });
    await recordAudit({
      actorId: auth.session.user.id,
      action: 'katha.create',
      entityType: 'Katha',
      entityId: String(katha._id),
      entitySlug: katha.slug,
    });

    return NextResponse.json({ success: true, data: katha }, { status: 201 });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('POST /api/kathas', error);
    return NextResponse.json({ success: false, error: 'Failed to create katha' }, { status: 500 });
  }
}
