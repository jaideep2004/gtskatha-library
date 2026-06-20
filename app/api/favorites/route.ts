import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserFavorites, addFavorite, removeFavorite } from '@/services/favoriteService';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Katha from '@/models/Katha';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await getUserFavorites(session.user.id);
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

    const { kathaId } = await req.json();
    if (typeof kathaId !== 'string' || !mongoose.Types.ObjectId.isValid(kathaId)) {
      return NextResponse.json({ success: false, error: 'Valid kathaId is required' }, { status: 400 });
    }

    await connectDB();
    if (!await Katha.exists({
      _id: kathaId,
      status: { $ne: 'archived' },
      $or: [{ status: 'published' }, { status: { $exists: false }, published: true }],
    })) {
      return NextResponse.json({ success: false, error: 'Katha not found' }, { status: 404 });
    }
    const fav = await addFavorite(session.user.id, kathaId);
    if (!fav) {
      return NextResponse.json({ success: false, error: 'Katha not found' }, { status: 404 });
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

    const { kathaId } = await req.json();
    if (typeof kathaId !== 'string' || !mongoose.Types.ObjectId.isValid(kathaId)) {
      return NextResponse.json({ success: false, error: 'Valid kathaId is required' }, { status: 400 });
    }
    await removeFavorite(session.user.id, kathaId);
    return NextResponse.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('DELETE /api/favorites', error);
    return NextResponse.json({ success: false, error: 'Failed to remove favorite' }, { status: 500 });
  }
}
