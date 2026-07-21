import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { DomainError } from '@/lib/domainError';
import { getFoldersBySeries, createFolder, reorderFolders } from '@/services/folderService';

export async function GET(req: NextRequest) {
  try {
    const series = req.nextUrl.searchParams.get('series');
    if (!series) {
      return NextResponse.json({ success: false, error: 'series parameter is required' }, { status: 400 });
    }
    const folders = await getFoldersBySeries(series);
    return NextResponse.json({ success: true, data: folders });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('GET /api/folders', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch folders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { seriesId, title } = await req.json() as { seriesId?: string; title?: string };
    if (!seriesId || !title?.trim()) {
      return NextResponse.json({ success: false, error: 'seriesId and title are required' }, { status: 400 });
    }

    const folder = await createFolder(seriesId, title);
    return NextResponse.json({ success: true, data: folder }, { status: 201 });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('POST /api/folders', error);
    return NextResponse.json({ success: false, error: 'Failed to create folder' }, { status: 500 });
  }
}

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

    const result = await reorderFolders(ids);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('PUT /api/folders', error);
    return NextResponse.json({ success: false, error: 'Failed to reorder folders' }, { status: 500 });
  }
}
