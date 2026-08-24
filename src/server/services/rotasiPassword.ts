import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { passwordHarian } from '@/lib/domain';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';

// Set password owner ke `AnindaDDMM!` hari ini (WIB).
// Dipanggil cron Vercel harian dan setup e2e; login tetap murni bcrypt dari DB.
export async function rotasiPasswordOwner(): Promise<void> {
  const email = (process.env.OWNER_EMAIL ?? '').toLowerCase().trim();
  if (!email) throw new Error('OWNER_EMAIL belum diset di .env');
  const hash = await bcrypt.hash(passwordHarian(), 12);
  await db.update(users).set({ passwordHash: hash }).where(eq(users.email, email));
}
