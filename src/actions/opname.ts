'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/server/auth';
import {
  applyOpnameSession,
  cancelOpnameSession,
  createOpnameSession,
  saveOpnameCount,
} from '@/server/services/opname';

export type ActionResult = { ok: boolean; error?: string };

async function requireAuth(): Promise<ActionResult | null> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'Tidak terautentikasi' };
  return null;
}

export async function createOpnameSessionAction(
  raw: unknown,
): Promise<ActionResult & { id?: string }> {
  const denied = await requireAuth();
  if (denied) return denied;
  const parsed = z
    .object({ label: z.string().max(80).optional().or(z.literal('')) })
    .safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Label tidak valid' };
  try {
    const session = await createOpnameSession(parsed.data.label);
    revalidatePath('/opname');
    return { ok: true, id: session.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Gagal membuat sesi' };
  }
}

export async function saveOpnameCountAction(raw: unknown): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;
  const parsed = z
    .object({
      sessionId: z.uuid(),
      productId: z.uuid(),
      countedQty: z.preprocess(
        (v) => (v === '' || v === undefined ? null : v),
        z.coerce.number().int().min(0).nullable(),
      ),
    })
    .safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Data tidak valid' };
  await saveOpnameCount(
    parsed.data.sessionId,
    parsed.data.productId,
    parsed.data.countedQty,
  );
  return { ok: true };
}

export async function applyOpnameSessionAction(sessionId: string): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;
  try {
    await applyOpnameSession(sessionId);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Gagal menerapkan opname',
    };
  }
  revalidatePath('/opname');
  revalidatePath('/stok');
  return { ok: true };
}

export async function cancelOpnameSessionAction(sessionId: string): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;
  await cancelOpnameSession(sessionId);
  revalidatePath('/opname');
  return { ok: true };
}
