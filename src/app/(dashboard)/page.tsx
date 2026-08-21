import Link from 'next/link';
import { and, eq, isNotNull, lte } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { db } from '@/server/db';
import { products } from '@/server/db/schema';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const lowStock = await db
    .select({
      id: products.id,
      name: products.name,
      stockQty: products.stockQty,
    })
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        isNotNull(products.minStockQty),
        lte(products.stockQty, products.minStockQty),
      ),
    )
    .limit(10);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Beranda</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Button render={<Link href="/transaksi/jual" />}>Catat Penjualan</Button>
        <Button render={<Link href="/transaksi/masuk" />} variant="secondary">
          Stok Masuk
        </Button>
        <Button render={<Link href="/opname" />} variant="secondary">
          Stock Opname
        </Button>
        <Button render={<Link href="/laporan" />} variant="secondary">
          Laporan
        </Button>
      </div>
      <section>
        <h2 className="mb-2 font-semibold">Stok Menipis</h2>
        {lowStock.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Tidak ada produk dengan stok menipis.
          </p>
        )}
        <ul className="space-y-2">
          {lowStock.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <span>{p.name}</span>
              <Badge variant="destructive">{p.stockQty} pcs</Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
