'use server';

import { revalidatePath } from 'next/cache';
import { stockInInputSchema } from '@/lib/validators';
import { auth } from '@/server/auth';
import { receiveStock } from '@/server/services/stockIn';

export type ActionResult = { ok: boolean; error?: string };

export async function receiveStockAction(raw: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'Tidak terautentikasi' };
  const parsed = stockInInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }
  try {
    await receiveStock(parsed.data);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Gagal menyimpan stok masuk',
    };
  }
  revalidatePath('/stok');
  revalidatePath('/transaksi');
  return { ok: true };
}
