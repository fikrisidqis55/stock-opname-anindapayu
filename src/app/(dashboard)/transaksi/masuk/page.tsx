import { StockInForm } from '@/components/transaksi/stock-in-form';
import { listActiveProducts } from '@/server/repositories/products';

export const dynamic = 'force-dynamic';

export default async function StokMasukPage() {
  const rows = await listActiveProducts();
  const products = rows.map((p) => ({
    id: p.id,
    name: p.name,
    priceModal: p.priceModal,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Stok Masuk</h1>
      <p className="text-sm text-muted-foreground">
        Catat stok masuk dari produksi sendiri atau kulakan luar per batch.
      </p>
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Belum ada produk aktif. Tambahkan produk dulu di menu Stok.
        </p>
      ) : (
        <StockInForm products={products} />
      )}
    </div>
  );
}
