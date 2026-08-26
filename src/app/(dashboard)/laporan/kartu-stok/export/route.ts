import { csvResponse, formatWIB } from '@/lib/csv';
import { getProductById } from '@/server/repositories/products';
import { stockCard } from '@/server/repositories/reports';

export const dynamic = 'force-dynamic';

const TYPE_LABEL: Record<string, string> = {
  in_production: 'Produksi sendiri',
  in_purchase: 'Kulakan luar',
  sale: 'Penjualan',
  opname_adjust: 'Penyesuaian opname',
};

// Unduh CSV kartu stok per produk: baris pergerakan masuk/keluar/saldo.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get('productId');
  if (!productId) {
    return Response.json({ error: 'productId wajib diisi' }, { status: 400 });
  }
  const product = await getProductById(productId);
  if (!product) {
    return Response.json({ error: 'produk tidak ditemukan' }, { status: 404 });
  }

  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const card = await stockCard(
    productId,
    from ? new Date(`${from}T00:00:00`) : undefined,
    to ? new Date(`${to}T23:59:59`) : undefined,
  );

  const data: (string | number)[][] = [
    ['Tanggal', 'Waktu', 'Kejadian', 'Masuk', 'Keluar', 'Saldo'],
  ];
  for (const m of card.rows) {
    const { tanggal, waktu } = formatWIB(m.occurredAt);
    data.push([
      tanggal,
      waktu,
      TYPE_LABEL[m.type] ?? m.type,
      m.qtyChange > 0 ? m.qtyChange : '',
      m.qtyChange < 0 ? m.qtyChange : '',
      m.balance,
    ]);
  }
  const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return csvResponse(data, `kartu-stok_${slug}.csv`);
}
