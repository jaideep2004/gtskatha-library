import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { enforceRateLimit, UPLOAD_LIMIT } from '@/lib/rateLimit';
import { isMediaFolder, validateUpload } from '@/lib/uploadPolicy';
import { createUploadSession } from '@/services/chunkUploadService';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, UPLOAD_LIMIT);
    if (limited) return limited;

    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const folder = typeof body.folder === 'string' ? body.folder : '';
    const mimeType = typeof body.mimeType === 'string' ? body.mimeType : '';
    const size = Number(body.size);
    if (!name || name.length > 255 || !isMediaFolder(folder)) {
      return NextResponse.json({ success: false, error: 'Invalid upload request' }, { status: 400 });
    }
    validateUpload(folder, mimeType, size, name);
    const session = await createUploadSession({ originalName: name, folder, mimeType, size });
    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload initialization failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
