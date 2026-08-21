import { eq, sql } from 'drizzle-orm';
import { weightedAverageCost } from '@/lib/domain';
import type { StockInInput } from '@/lib/validators';
import { db } from '@/server/db';
import { products, stockBatches, stockMovements } from '@/server/db/schema';

export async function receiveStock(input: StockInInput) {
  return db.transaction(async (tx) => {
    const [product] = await tx
      .select()
      .from(products)
      .where(eq(products.id, input.productId));
    if (!product || !product.isActive) throw new Error('Produk tidak ditemukan');

    const totalCost = input.qty * input.unitCost;
    const [batch] = await tx
      .insert(stockBatches)
      .values({
        productId: input.productId,
        source: input.source,
        qty: input.qty,
        unitCost: input.unitCost,
        totalCost,
        supplierName: input.supplierName?.trim() || null,
        note: input.note?.trim() || null,
      })
      .returning();

    await tx.insert(stockMovements).values({
      productId: input.productId,
      type: input.source === 'production' ? 'in_production' : 'in_purchase',
      qtyChange: input.qty,
      refType: 'batch',
      refId: batch.id,
    });

    await tx
      .update(products)
      .set({ stockQty: sql`${products.stockQty} + ${input.qty}`, updatedAt: new Date() })
      .where(eq(products.id, input.productId));

    if (input.updateModal && input.unitCost !== product.priceModal) {
      const newModal = weightedAverageCost(
        product.stockQty,
        product.priceModal,
        input.qty,
        input.unitCost,
      );
      await tx
        .update(products)
        .set({ priceModal: newModal })
        .where(eq(products.id, input.productId));
    }
    return batch;
  });
}
