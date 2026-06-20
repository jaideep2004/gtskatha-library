/**
 * Seed Admin User
 *
 * Usage:
 *   npm run seed:admin
 *   npx tsx scripts/seed-admin.ts
 *   Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME in .env, then run npm run seed:admin.
 *   CLI flags may override environment values.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

// ─── Load .env then .env.local (.env.local wins on conflicts) ────────────────
function loadEnv() {
  const root = process.cwd();
  for (const file of ['.env', '.env.local']) {
    const fp = path.join(root, file);
    if (!fs.existsSync(fp)) continue;
    for (const line of fs.readFileSync(fp, 'utf-8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i < 0) continue;
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
      process.env[k] = v;
    }
  }
}

loadEnv();

// ─── CLI args ────────────────────────────────────────────────────────────────
function arg(flag: string, fallback = ''): string {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const EMAIL = arg('--email', process.env.ADMIN_EMAIL ?? '');
const PASSWORD = arg('--password', process.env.ADMIN_PASSWORD ?? '');
const NAME = arg('--name', process.env.ADMIN_NAME || 'Administrator');

// ─── User model (inline to avoid Next.js module issues) ──────────────────────
const UserSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar:       { type: String },
    role:         { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

const User = mongoose.models['User'] ?? mongoose.model('User', UserSchema);

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('\nMONGODB_URI not set. Add it to .env or .env.local.\n');
    process.exit(1);
  }
  if (!EMAIL || !PASSWORD) {
    console.error('\nADMIN_EMAIL and ADMIN_PASSWORD must be set in .env or .env.local.\n');
    process.exit(1);
  }
  if (PASSWORD.length < 12) {
    console.error('\nADMIN_PASSWORD must contain at least 12 characters.\n');
    process.exit(1);
  }

  const masked = uri.replace(/:\/\/[^@]+@/, '://***:***@');
  console.log('\nSikh Katha - Seed Admin');
  console.log('────────────────────────────────────────');
  console.log(`  MongoDB : ${masked}`);
  console.log(`  Email   : ${EMAIL}`);
  console.log(`  Name    : ${NAME}`);
  console.log('────────────────────────────────────────\n');

  await mongoose.connect(uri, { bufferCommands: false });
  console.log('Connected to MongoDB\n');

  const existing = await User.findOne({ email: EMAIL.toLowerCase() });

  if (existing) {
    const action = existing.role === 'admin' ? 'Updating password' : 'Promoting to admin';
    console.log(`User exists - ${action}…`);
    existing.role = 'admin';
    existing.name = NAME;
    existing.passwordHash = await bcrypt.hash(PASSWORD, 12);
    await existing.save();
    console.log('Done\n');
  } else {
    await User.create({
      name: NAME,
      email: EMAIL.toLowerCase(),
      passwordHash: await bcrypt.hash(PASSWORD, 12),
      role: 'admin',
    });
    console.log('Admin user created\n');
  }

  console.log('Admin seeded successfully.');
  console.log(`Email: ${EMAIL}`);
  console.log('Login: /login\n');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message ?? err);
  process.exit(1);
});
