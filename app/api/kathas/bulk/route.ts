import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { DomainError } from '@/lib/domainError';
import { ValidationError, validateKathaInput } from '@/lib/validation';
import {
  createBulkAudioKathas,
  bulkArchiveKathas,
  bulkHardDeleteKathas,
  bulkSetThumbnail,
  type BulkAudioKathaInput,
} from '@/services/kathaService';
import { recordAudit } from '@/services/auditService';

const MAX_BATCH_SIZE = 20;

interface RequestItem {
  clientId?: unknown;
  [key: string]: unknown;
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { ids } = await req.json() as { ids?: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'ids array is required' }, { status: 400 });
    }

    const result = await bulkArchiveKathas(ids);

    await recordAudit({
      actorId: auth.session.user.id,
      action: 'katha.bulk_archive',
      entityType: 'Katha',
      metadata: { ids, count: result.modifiedCount },
    });

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} katha(s) archived`,
      data: result,
    });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('PATCH /api/kathas/bulk', error);
    return NextResponse.json({ success: false, error: 'Failed to archive kathas' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { ids } = await req.json() as { ids?: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'ids array is required' }, { status: 400 });
    }

    const result = await bulkHardDeleteKathas(ids);

    await recordAudit({
      actorId: auth.session.user.id,
      action: 'katha.bulk_hard_delete',
      entityType: 'Katha',
      metadata: { ids, count: result.deletedCount },
    });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} katha(s) permanently deleted`,
      data: result,
    });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('DELETE /api/kathas/bulk', error);
    return NextResponse.json({ success: false, error: 'Failed to delete kathas' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { ids, thumbnail } = await req.json() as { ids?: string[]; thumbnail?: string };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'ids array is required' }, { status: 400 });
    }
    if (!thumbnail) {
      return NextResponse.json({ success: false, error: 'thumbnail is required' }, { status: 400 });
    }

    const result = await bulkSetThumbnail(ids, thumbnail);

    await recordAudit({
      actorId: auth.session.user.id,
      action: 'katha.bulk_set_thumbnail',
      entityType: 'Katha',
      metadata: { ids, count: result.modifiedCount },
    });

    return NextResponse.json({
      success: true,
      message: `Artwork set for ${result.modifiedCount} katha(s)`,
      data: result,
    });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('PUT /api/kathas/bulk', error);
    return NextResponse.json({ success: false, error: 'Failed to set artwork' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const body = await req.json() as { items?: unknown };
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > MAX_BATCH_SIZE) {
      throw new ValidationError(`items must contain between 1 and ${MAX_BATCH_SIZE} entries`);
    }

    const items = body.items.map((value, index) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new ValidationError(`items[${index}] is invalid`);
      }
      const item = value as RequestItem;
      if (typeof item.clientId !== 'string' || !item.clientId.trim() || item.clientId.length > 300) {
        throw new ValidationError(`items[${index}].clientId is invalid`);
      }
      if (item.type !== 'audio') throw new ValidationError('Bulk intake supports audio kathas only');
      const validated = validateKathaInput(item);
      if (!validated.audioUrl) throw new ValidationError(`items[${index}] requires an audio file`);
      return { clientId: item.clientId, data: validated as unknown as BulkAudioKathaInput };
    });

    const results = await createBulkAudioKathas(items.map((item) => item.data));
    await Promise.all(results.map(async (result, index) => {
      if (!result.katha) return;
      await recordAudit({
        actorId: auth.session.user.id,
        action: 'katha.bulk_create',
        entityType: 'Katha',
        entityId: String(result.katha._id),
        entitySlug: result.katha.slug,
        metadata: { batchPosition: index + 1 },
      });
    }));

    return NextResponse.json({
      success: true,
      data: results.map((result, index) => ({
        clientId: items[index].clientId,
        success: Boolean(result.katha),
        error: result.error,
        katha: result.katha,
      })),
    }, { status: results.every((result) => result.katha) ? 201 : 207 });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error instanceof DomainError ? error.status : 400 });
    }
    console.error('POST /api/kathas/bulk', error);
    return NextResponse.json({ success: false, error: 'Failed to create bulk kathas' }, { status: 500 });
  }
}
