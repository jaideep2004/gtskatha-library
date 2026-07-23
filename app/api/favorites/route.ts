import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserFavorites, addFavorite, removeFavorite } from '@/services/favoriteService';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const itemType = searchParams.get('itemType') || undefined;
    const favorites = await getUserFavorites(session.user.id, itemType);
    return NextResponse.json({ success: true, data: favorites });
  } catch (error) {
    console.error('GET /api/favorites', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const targetId = body.kathaId || body.targetId;
    const itemType = body.itemType || 'katha';

    if (typeof targetId !== 'string' || !mongoose.Types.ObjectId.isValid(targetId)) {
      return NextResponse.json({ success: false, error: 'Valid kathaId/targetId is required' }, { status: 400 });
    }

    const types = ['katha', 'series', 'paath', 'nittnem'];
    if (!types.includes(itemType)) {
      return NextResponse.json({ success: false, error: 'Invalid itemType' }, { status: 400 });
    }

    const fav = await addFavorite(session.user.id, targetId, itemType);
    if (!fav) {
      return NextResponse.json({ success: false, error: 'Target not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: fav }, { status: 201 });
  } catch (error) {
    console.error('POST /api/favorites', error);
    return NextResponse.json({ success: false, error: 'Failed to add favorite' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const targetId = body.kathaId || body.targetId;
    const itemType = body.itemType || 'katha';

    if (typeof targetId !== 'string' || !mongoose.Types.ObjectId.isValid(targetId)) {
      return NextResponse.json({ success: false, error: 'Valid kathaId/targetId is required' }, { status: 400 });
    }

    await removeFavorite(session.user.id, targetId, itemType);
    return NextResponse.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('DELETE /api/favorites', error);
    return NextResponse.json({ success: false, error: 'Failed to remove favorite' }, { status: 500 });
  }
}
