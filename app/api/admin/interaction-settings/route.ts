import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { ValidationError, validateInteractionSettingsInput } from '@/lib/validation';
import { recordAudit } from '@/services/auditService';
import {
  getInteractionSettings,
  updateInteractionSettings,
} from '@/services/timelineInteractionService';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;
  const data = await getInteractionSettings();
  return NextResponse.json({ success: true, data });
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const input = validateInteractionSettingsInput(await req.json());
    const data = await updateInteractionSettings({
      ...input,
      actorId: auth.session.user.id,
    });
    await recordAudit({
      actorId: auth.session.user.id,
      action: 'interaction_settings.updated',
      entityType: 'InteractionSettings',
      entityId: String(data?._id),
      metadata: input,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('PUT /api/admin/interaction-settings', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update interaction settings' },
      { status: 500 }
    );
  }
}
