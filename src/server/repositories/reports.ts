import { and, asc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '@/server/db';
import { products, saleItems, sales, stockMovements } from '@/server/db/schema';

export async function homeSummary() {
  const [stock] = await db
    .select({
      totalQty: sql<number>`coalesce(sum(${products.stockQty}), 0)::int`,
      totalModal: sql<number>`coalesce(sum(${products.stockQty} * ${products.priceModal}), 0)::int`,
    })
    .from(products)
    .where(eq(products.isActive, true));
  const [today] = await db
    .select({
      total: sql<number>`coalesce(sum(${sales.totalPrice}), 0)::int`,
    })
    .from(sales)
    .where(
      sql`date_trunc('day', ${sales.createdAt} at time zone 'Asia/Jakarta') = date_trunc('day', now() at time zone 'Asia/Jakarta')`,
    );
  return {
    totalQty: stock?.totalQty ?? 0,
    totalModal: stock?.totalModal ?? 0,
    salesToday: today?.total ?? 0,
  };
}

export async function stockCard(productId: string, from?: Date, to?: Date) {
  const movements = await db
    .select()
    .from(stockMovements)
    .where(
      and(
        eq(stockMovements.productId, productId),
        to ? lte(stockMovements.occurredAt, to) : undefined,
      ),
    )
    .orderBy(asc(stockMovements.occurredAt));

  let balance = 0;
  let totalIn = 0;
  let totalOut = 0;
  const rows: Array<(typeof movements)[number] & { balance: number }> = [];
  for (const m of movements) {
    balance += m.qtyChange;
    if (from && m.occurredAt < from) continue;
    if (m.qtyChange > 0) totalIn += m.qtyChange;
    else totalOut += -m.qtyChange;
    rows.push({ ...m, balance });
  }
  return { rows, totalIn, totalOut };
}

export async function salesProfitByType(from?: Date, to?: Date) {
  return db
    .select({
      saleType: sales.saleType,
      transactions: sql<number>`count(distinct ${sales.id})`,
      totalQty: sql<number>`coalesce(sum(${saleItems.qty}), 0)::int`,
      revenue: sql<number>`coalesce(sum(${saleItems.subtotal}), 0)::int`,
      cost: sql<number>`coalesce(sum(${saleItems.qty} * ${saleItems.unitCostSnapshot}), 0)::int`,
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .where(
      and(
        from ? gte(sales.createdAt, from) : undefined,
        to ? lte(sales.createdAt, to) : undefined,
      ),
    )
    .groupBy(sales.saleType);
}

export async function dailySales(from?: Date, to?: Date) {
  // Hari kalender WIB agar sesuai hari versi toko (sama seperti homeSummary).
  const day = sql<string>`date_trunc('day', ${sales.createdAt} at time zone 'Asia/Jakarta')`;
  return db
    .select({
      day,
      total: sql<number>`coalesce(sum(${sales.totalPrice}), 0)::int`,
    })
    .from(sales)
    .where(
      and(
        from ? gte(sales.createdAt, from) : undefined,
        to ? lte(sales.createdAt, to) : undefined,
      ),
    )
    .groupBy(day)
    .orderBy(day);
}
