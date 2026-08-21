'use server';

import { revalidatePath } from 'next/cache';
import { productInputSchema } from '@/lib/validators';
import { auth } from '@/server/auth';
import { createProduct, updateProduct } from '@/server/repositories/products';

export type ActionResult = { ok: boolean; error?: string };

async function requireAuth(): Promise<ActionResult | null> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'Tidak terautentikasi' };
  return null;
}

export async function createProductAction(raw: unknown): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;
  const parsed = productInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }
  await createProduct(parsed.data);
  revalidatePath('/stok');
  return { ok: true };
}

export async function updateProductAction(
  id: string,
  raw: unknown,
): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;
  const parsed = productInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }
  await updateProduct(id, parsed.data);
  revalidatePath('/stok');
  return { ok: true };
}
