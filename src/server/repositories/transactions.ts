import { and, desc, eq, gte, inArray, lte } from 'drizzle-orm';
import { db } from '@/server/db';
import { products, saleItems, sales, stockBatches } from '@/server/db/schema';

export type SaleTxItem = {
  productName: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
};

export type SaleTxRow = {
  kind: 'sale';
  id: string;
  at: Date;
  saleType: 'ecer' | 'grosir' | 'kulakan';
  customerName: string | null;
  note: string | null;
  totalPrice: number;
  totalCost: number;
  items: SaleTxItem[];
};

export type StockInTxRow = {
  kind: 'stockin';
  id: string;
  at: Date;
  source: 'production' | 'purchase';
  supplierName: string | null;
  note: string | null;
  productName: string;
  qty: number;
  unitCost: number;
  totalCost: number;
};

export type TxRow = SaleTxRow | StockInTxRow;

/** Buku kas transaksi: penjualan + stok masuk, urut tanggal menurun. */
export async function listRecentTransactions(limit = 50): Promise<TxRow[]> {
  const [saleRows, batchRows] = await Promise.all([
    db.select().from(sales).orderBy(desc(sales.createdAt)).limit(limit),
    db
      .select({ batch: stockBatches, productName: products.name })
      .from(stockBatches)
      .innerJoin(products, eq(products.id, stockBatches.productId))
      .orderBy(desc(stockBatches.receivedAt))
      .limit(limit),
  ]);

  const itemRows =
    saleRows.length > 0
      ? await db
          .select({
            saleId: saleItems.saleId,
            productName: products.name,
            qty: saleItems.qty,
            unitPrice: saleItems.unitPrice,
            subtotal: saleItems.subtotal,
          })
          .from(saleItems)
          .innerJoin(products, eq(products.id, saleItems.productId))
          .where(inArray(saleItems.saleId, saleRows.map((s) => s.id)))
      : [];

  const itemsBySale = new Map<string, SaleTxItem[]>();
  for (const it of itemRows) {
    const arr = itemsBySale.get(it.saleId) ?? [];
    arr.push({
      productName: it.productName,
      qty: it.qty,
      unitPrice: it.unitPrice,
      subtotal: it.subtotal,
    });
    itemsBySale.set(it.saleId, arr);
  }

  const rows: TxRow[] = [
    ...saleRows.map(
      (s): TxRow => ({
        kind: 'sale',
        id: s.id,
        at: s.createdAt,
        saleType: s.saleType,
        customerName: s.customerName,
        note: s.note,
        totalPrice: s.totalPrice,
        totalCost: s.totalCost,
        items: itemsBySale.get(s.id) ?? [],
      }),
    ),
    ...batchRows.map(
      ({ batch, productName }): TxRow => ({
        kind: 'stockin',
        id: batch.id,
        at: batch.receivedAt,
        source: batch.source,
        supplierName: batch.supplierName,
        note: batch.note,
        productName,
        qty: batch.qty,
        unitCost: batch.unitCost,
        totalCost: batch.totalCost,
      }),
    ),
  ];
  rows.sort((a, b) => b.at.getTime() - a.at.getTime());
  return rows.slice(0, limit);
}

/** Daftar penjualan dalam rentang waktu (untuk rincian laporan per tipe). */
export function listSalesInRange(from: Date, to: Date) {
  return db
    .select()
    .from(sales)
    .where(and(gte(sales.createdAt, from), lte(sales.createdAt, to)))
    .orderBy(desc(sales.createdAt));
}
