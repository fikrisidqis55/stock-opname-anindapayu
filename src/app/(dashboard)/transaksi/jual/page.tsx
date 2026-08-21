import { SaleForm } from '@/components/transaksi/sale-form';
import { listActiveProducts } from '@/server/repositories/products';

export const dynamic = 'force-dynamic';

export default async function JualPage() {
  const rows = await listActiveProducts();
  const products = rows.map((p) => ({
    id: p.id,
    name: p.name,
    stockQty: p.stockQty,
    priceEcer: p.priceEcer,
    priceGrosir: p.priceGrosir,
    priceKulakan: p.priceKulakan,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Penjualan</h1>
      <p className="text-sm text-muted-foreground">
        Catat penjualan ecer, grosir, atau kulakan (multi produk, harga bisa dinego).
      </p>
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Belum ada produk aktif. Tambahkan produk dulu di menu Stok.
        </p>
      ) : (
        <SaleForm products={products} />
      )}
    </div>
  );
}
