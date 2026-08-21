import bcrypt from 'bcryptjs';
import { db } from '../src/server/db';
import { categories, users } from '../src/server/db/schema';

const BABARAN = ['malaman', 'colet', 'babar pindo', 'embos', 'babar 1'];

async function main() {
  for (const name of BABARAN) {
    await db.insert(categories).values({ name }).onConflictDoNothing();
  }

  const email = process.env.OWNER_EMAIL;
  const password = process.env.OWNER_PASSWORD;
  if (!email || !password) {
    throw new Error('OWNER_EMAIL dan OWNER_PASSWORD wajib diisi di .env');
  }
  await db
    .insert(users)
    .values({ email, name: 'Owner', passwordHash: await bcrypt.hash(password, 12) })
    .onConflictDoNothing();

  console.log('Seed selesai: kategori babaran + akun owner');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
