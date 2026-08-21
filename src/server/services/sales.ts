import { desc, eq, inArray, sql } from 'drizzle-orm';
import type { SaleInput } from '@/lib/validators';
import { db } from '@/server/db';
import { products, saleItems, sales, stockMovements } from '@/server/db/schema';

export async function createSale(input: SaleInput) {
  return db.transaction(async (tx) => {
    const prods = await tx
      .select()
      .from(products)
      .where(inArray(products.id, input.items.map((i) => i.productId)));
    const byId = new Map(prods.map((p) => [p.id, p]));

    // akumulasi qty per produk (satu produk bisa muncul di beberapa baris)
    const totalByProduct = new Map<string, number>();
    for (const item of input.items) {
      const product = byId.get(item.productId);
      if (!product || !product.isActive) throw new Error('Produk tidak ditemukan');
      totalByProduct.set(
        item.productId,
        (totalByProduct.get(item.productId) ?? 0) + item.qty,
      );
    }
    for (const [productId, qty] of totalByProduct) {
      const product = byId.get(productId)!;
      if (product.stockQty < qty) {
        throw new Error(`Stok ${product.name} tidak cukup (tersisa ${product.stockQty})`);
      }
    }

    let totalPrice = 0;
    let totalCost = 0;
    const itemValues = input.items.map((item) => {
      const product = byId.get(item.productId)!;
      totalPrice += item.qty * item.unitPrice;
      totalCost += item.qty * product.priceModal;
      return {
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.unitPrice,
        unitCostSnapshot: product.priceModal,
        subtotal: item.qty * item.unitPrice,
      };
    });

    const [sale] = await tx
      .insert(sales)
      .values({
        saleType: input.saleType,
        customerName: input.customerName?.trim() || null,
        totalPrice,
        totalCost,
        note: input.note?.trim() || null,
      })
      .returning();

    await tx.insert(saleItems).values(itemValues.map((v) => ({ ...v, saleId: sale.id })));
    await tx.insert(stockMovements).values(
      input.items.map((item) => ({
        productId: item.productId,
        type: 'sale' as const,
        qtyChange: -item.qty,
        refType: 'sale' as const,
        refId: sale.id,
      })),
    );

    for (const [productId, qty] of totalByProduct) {
      await tx
        .update(products)
        .set({ stockQty: sql`${products.stockQty} - ${qty}`, updatedAt: new Date() })
        .where(eq(products.id, productId));
    }
    return sale;
  });
}

export function listRecentSales(limit = 50) {
  return db.select().from(sales).orderBy(desc(sales.createdAt)).limit(limit);
}
