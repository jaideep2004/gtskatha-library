import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { DomainError } from '@/lib/domainError';
import { ValidationError, validateKathaInput } from '@/lib/validation';
import { createBulkAudioKathas, type BulkAudioKathaInput } from '@/services/kathaService';
import { recordAudit } from '@/services/auditService';

const MAX_BATCH_SIZE = 20;

interface RequestItem {
  clientId?: unknown;
  [key: string]: unknown;
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
