import { ProductForm } from '@/components/stok/product-form';
import { listCategories } from '@/server/repositories/categories';

export const dynamic = 'force-dynamic';

export default async function ProdukBaruPage() {
  const categories = await listCategories();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tambah Produk</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
