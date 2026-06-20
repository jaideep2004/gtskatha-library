import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import {
  cancelUploadSession,
  completeUploadSession,
  saveUploadChunk,
} from '@/services/chunkUploadService';
import { getFileUrl } from '@/services/uploadService';

export const maxDuration = 300;

interface Params {
  params: Promise<{ sessionId: string }>;
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const { sessionId } = await params;
    const index = Number(req.headers.get('x-chunk-index'));
    const buffer = Buffer.from(await req.arrayBuffer());
    await saveUploadChunk(sessionId, index, buffer);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Chunk upload failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function POST(_: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const { sessionId } = await params;
    const result = await completeUploadSession(sessionId);
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        url: getFileUrl(result.filename, result.folder),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload completion failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;
  const { sessionId } = await params;
  await cancelUploadSession(sessionId).catch(() => {});
  return NextResponse.json({ success: true });
}
