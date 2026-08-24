// Reset password akun owner dari OWNER_EMAIL / OWNER_PASSWORD di .env.
// Bila akun belum ada, sekaligus dibuat.
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../src/server/db';
import { users } from '../src/server/db/schema';

async function main() {
  const email = process.env.OWNER_EMAIL;
  const password = process.env.OWNER_PASSWORD;
  if (!email || !password) {
    throw new Error('OWNER_EMAIL dan OWNER_PASSWORD wajib diisi di .env');
  }
  const passwordHash = await bcrypt.hash(password, 12);

  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) {
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, existing.id));
    console.log(`Password akun ${email} berhasil direset.`);
  } else {
    await db.insert(users).values({ email, name: 'Owner', passwordHash });
    console.log(`Akun ${email} berhasil dibuat.`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
