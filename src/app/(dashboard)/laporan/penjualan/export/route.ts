import { csvResponse, formatWIB } from '@/lib/csv';
import { listSalesWithQtyInRange } from '@/server/repositories/transactions';

export const dynamic = 'force-dynamic';

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Unduh CSV penjualan per transaksi (rentang mengikuti parameter halaman laporan).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const now = new Date();
  const fromStr =
    url.searchParams.get('from') ??
    toYMD(new Date(now.getFullYear(), now.getMonth(), 1));
  const toStr = url.searchParams.get('to') ?? toYMD(now);
  const from = new Date(`${fromStr}T00:00:00`);
  const to = new Date(`${toStr}T23:59:59`);

  const rows = await listSalesWithQtyInRange(from, to);
  const data: (string | number)[][] = [
    ['Tanggal', 'Waktu', 'Tipe', 'Pelanggan', 'Qty', 'Omzet', 'HPP', 'Laba'],
  ];
  for (const s of rows) {
    const { tanggal, waktu } = formatWIB(s.createdAt);
    data.push([
      tanggal,
      waktu,
      s.saleType,
      s.customerName ?? '',
      s.totalQty,
      s.totalPrice,
      s.totalCost,
      s.totalPrice - s.totalCost,
    ]);
  }
  return csvResponse(data, `penjualan_${fromStr}_${toStr}.csv`);
}
