import { and, eq, sql } from 'drizzle-orm';
import { opnameDiffValue } from '@/lib/domain';
import { db } from '@/server/db';
import {
  opnameItems,
  opnameSessions,
  products,
  stockMovements,
} from '@/server/db/schema';

export async function createOpnameSession(label?: string) {
  return db.transaction(async (tx) => {
    const [active] = await tx
      .select({ id: opnameSessions.id })
      .from(opnameSessions)
      .where(eq(opnameSessions.status, 'counting'))
      .limit(1);
    if (active) {
      throw new Error('Masih ada sesi opname aktif. Selesaikan atau batalkan dulu.');
    }

    const finalLabel =
      label?.trim() ||
      `Opname ${new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date())}`;
    const [session] = await tx
      .insert(opnameSessions)
      .values({ label: finalLabel })
      .returning();

    const prods = await tx
      .select({ id: products.id, stockQty: products.stockQty })
      .from(products)
      .where(eq(products.isActive, true));
    if (prods.length > 0) {
      await tx.insert(opnameItems).values(
        prods.map((p) => ({
          sessionId: session.id,
          productId: p.id,
          systemQty: p.stockQty,
        })),
      );
    }
    return session;
  });
}

export async function saveOpnameCount(
  sessionId: string,
  productId: string,
  countedQty: number | null,
) {
  await db
    .update(opnameItems)
    .set({ countedQty })
    .where(
      and(eq(opnameItems.sessionId, sessionId), eq(opnameItems.productId, productId)),
    );
}

export async function applyOpnameSession(sessionId: string) {
  return db.transaction(async (tx) => {
    const [session] = await tx
      .select()
      .from(opnameSessions)
      .where(eq(opnameSessions.id, sessionId));
    if (!session || session.status !== 'counting') throw new Error('Sesi tidak aktif');

    const items = await tx
      .select({ item: opnameItems, priceModal: products.priceModal })
      .from(opnameItems)
      .innerJoin(products, eq(opnameItems.productId, products.id))
      .where(eq(opnameItems.sessionId, sessionId));

    let totalDiffQty = 0;
    let totalDiffValue = 0;
    for (const { item, priceModal } of items) {
      if (item.countedQty === null) continue; // tidak dihitung = tidak diubah
      const diff = item.countedQty - item.systemQty;
      if (diff === 0) continue;
      totalDiffQty += diff;
      totalDiffValue += opnameDiffValue(diff, priceModal);
      await tx.insert(stockMovements).values({
        productId: item.productId,
        type: 'opname_adjust',
        qtyChange: diff,
        refType: 'opname_item',
        refId: item.id,
        note: `Opname: ${session.label}`,
      });
      await tx
        .update(products)
        .set({ stockQty: sql`${products.stockQty} + ${diff}`, updatedAt: new Date() })
        .where(eq(products.id, item.productId));
    }

    await tx
      .update(opnameSessions)
      .set({
        status: 'completed',
        completedAt: new Date(),
        totalDiffQty,
        totalDiffValue,
      })
      .where(eq(opnameSessions.id, sessionId));
    return { totalDiffQty, totalDiffValue };
  });
}

export async function cancelOpnameSession(sessionId: string) {
  await db
    .update(opnameSessions)
    .set({ status: 'cancelled', completedAt: new Date() })
    .where(
      and(eq(opnameSessions.id, sessionId), eq(opnameSessions.status, 'counting')),
    );
}
