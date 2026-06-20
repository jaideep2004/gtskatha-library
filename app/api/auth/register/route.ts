import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { enforceRateLimit, REGISTRATION_LIMIT } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, REGISTRATION_LIMIT);
    if (limited) return limited;

    const body: unknown = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid registration data' },
        { status: 400 }
      );
    }

    const { name, email, password } = body as Record<string, unknown>;

    if (
      typeof name !== 'string'
      || typeof email !== 'string'
      || typeof password !== 'string'
    ) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 120) {
      return NextResponse.json(
        { success: false, error: 'Name must be between 2 and 120 characters' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 254) {
      return NextResponse.json(
        { success: false, error: 'Enter a valid email address' },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { success: false, error: 'Password must be between 8 and 128 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: 'user',
    });

    await user.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/auth/register', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}
