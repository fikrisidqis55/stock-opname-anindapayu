import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/stok/product-form';
import { listCategories } from '@/server/repositories/categories';
import { getProductById } from '@/server/repositories/products';

export const dynamic = 'force-dynamic';

export default async function ProdukEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  const categories = await listCategories();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Produk</h1>
      <ProductForm categories={categories} initial={product} />
    </div>
  );
}
