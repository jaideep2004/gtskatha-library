import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import PasswordResetToken from '@/models/PasswordResetToken';
import User from '@/models/User';
import { getEmailProvider } from '@/services/email';

const RESET_TTL_MS = 30 * 60 * 1000;

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function requestPasswordReset(email: string) {
  await connectDB();
  const user = await User.findOne({ email: email.trim().toLowerCase() })
    .select('_id name email')
    .lean();
  if (!user) return;

  const rawToken = randomBytes(32).toString('hex');
  const resetToken = await PasswordResetToken.create({
    userId: user._id,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
  });

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`;
  try {
    await getEmailProvider().sendPasswordReset({
      to: user.email,
      name: user.name,
      resetUrl,
    });
  } catch (error) {
    await PasswordResetToken.deleteOne({ _id: resetToken._id });
    throw error;
  }

  await PasswordResetToken.updateMany(
    {
      userId: user._id,
      _id: { $ne: resetToken._id },
      consumedAt: { $exists: false },
    },
    { $set: { consumedAt: new Date() } }
  );
}

export async function resetPassword(rawToken: string, password: string) {
  await connectDB();
  const tokenHash = hashToken(rawToken);
  const passwordHash = await bcrypt.hash(password, 12);
  const claimed = await PasswordResetToken.findOneAndUpdate(
    {
      tokenHash,
      expiresAt: { $gt: new Date() },
      consumedAt: { $exists: false },
    },
    { $set: { consumedAt: new Date() } },
    { returnDocument: 'after' }
  ).lean();
  if (!claimed) return false;

  const result = await User.updateOne(
    { _id: claimed.userId },
    {
      $set: { passwordHash },
      $inc: { sessionVersion: 1 },
    }
  );
  if (result.modifiedCount !== 1) return false;

  await PasswordResetToken.updateMany(
    {
      userId: claimed.userId,
      _id: { $ne: claimed._id },
      consumedAt: { $exists: false },
    },
    { $set: { consumedAt: new Date() } }
  );
  return true;
}
