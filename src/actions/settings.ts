'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { categories } from '@/server/db/schema';

export type ActionResult = { ok: boolean; error?: string };

const nameSchema = z.object({ name: z.string().min(1, 'Nama wajib diisi').max(60) });

async function requireAuth(): Promise<ActionResult | null> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'Tidak terautentikasi' };
  return null;
}

export async function addCategoryAction(raw: unknown): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;
  const parsed = nameSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Tidak valid' };
  try {
    await db.insert(categories).values({ name: parsed.data.name.trim() });
  } catch {
    return { ok: false, error: 'Nama kategori sudah ada' };
  }
  revalidatePath('/pengaturan');
  revalidatePath('/stok');
  return { ok: true };
}

export async function renameCategoryAction(id: string, raw: unknown): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;
  const parsed = nameSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Tidak valid' };
  await db.update(categories).set({ name: parsed.data.name.trim(), updatedAt: new Date() })
    .where(eq(categories.id, id));
  revalidatePath('/pengaturan');
  revalidatePath('/stok');
  return { ok: true };
}
