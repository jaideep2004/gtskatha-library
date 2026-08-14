import { NextRequest, NextResponse } from 'next/server';
import { copyPaathToNitnem } from '@/services/paathService';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { DomainError } from '@/lib/domainError';

interface Params {
  params: Promise<{ slug: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { slug } = await params;
    const result = await copyPaathToNitnem(slug);
    return NextResponse.json({ success: true, data: result }, { status: result.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('POST /api/paath/[slug]/copy-to-nitnem', error);
    return NextResponse.json({ success: false, error: 'Failed to copy paath to nitnem' }, { status: 500 });
  }
}