// Bersihkan sisa data uji E2E yang gagal (produk bernama "E2E ...")
import { eq, inArray, like } from 'drizzle-orm';
import { db } from '../src/server/db';
import {
  opnameItems,
  products,
  saleItems,
  sales,
  stockBatches,
  stockMovements,
} from '../src/server/db/schema';

async function main() {
  const rows = await db
    .select({ id: products.id })
    .from(products)
    .where(like(products.name, 'E2E %'));
  if (rows.length === 0) {
    console.log('Tidak ada sisa data uji.');
    process.exit(0);
  }
  for (const p of rows) {
    const saleRows = await db
      .select({ saleId: saleItems.saleId })
      .from(saleItems)
      .where(eq(saleItems.productId, p.id));
    const saleIds = saleRows.map((r) => r.saleId);
    await db.delete(saleItems).where(eq(saleItems.productId, p.id));
    if (saleIds.length > 0) await db.delete(sales).where(inArray(sales.id, saleIds));
    await db.delete(stockMovements).where(eq(stockMovements.productId, p.id));
    await db.delete(stockBatches).where(eq(stockBatches.productId, p.id));
    await db.delete(opnameItems).where(eq(opnameItems.productId, p.id));
    await db.delete(products).where(eq(products.id, p.id));
    console.log(`Dihapus: ${p.id}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
