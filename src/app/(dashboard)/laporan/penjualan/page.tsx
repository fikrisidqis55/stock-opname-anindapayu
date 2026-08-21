import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { dailySales, salesProfitByType } from '@/server/repositories/reports';

export const dynamic = 'force-dynamic';

const TYPE_LABEL: Record<string, string> = {
  ecer: 'Ecer',
  grosir: 'Grosir',
  kulakan: 'Kulakan',
};

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default async function LaporanPenjualanPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const fromStr = params.from ?? toYMD(new Date(now.getFullYear(), now.getMonth(), 1));
  const toStr = params.to ?? toYMD(now);
  const fromDate = new Date(`${fromStr}T00:00:00`);
  const toDate = new Date(`${toStr}T23:59:59`);

  const [byType, daily] = await Promise.all([
    salesProfitByType(fromDate, toDate),
    dailySales(fromDate, toDate),
  ]);

  const totals = byType.reduce(
    (acc, r) => ({
      transactions: acc.transactions + Number(r.transactions),
      qty: acc.qty + Number(r.totalQty),
      revenue: acc.revenue + Number(r.revenue),
      cost: acc.cost + Number(r.cost),
    }),
    { transactions: 0, qty: 0, revenue: 0, cost: 0 },
  );
  const maxDaily = daily.reduce((m, d) => Math.max(m, Number(d.total)), 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Penjualan & Laba</h1>

      <form method="get" className="flex max-w-xl flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm">
          Dari
          <Input type="date" name="from" defaultValue={fromStr} />
        </label>
        <label className="space-y-1 text-sm">
          Sampai
          <Input type="date" name="to" defaultValue={toStr} />
        </label>
        <Button type="submit">Tampilkan</Button>
      </form>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipe</TableHead>
              <TableHead>Transaksi</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Omzet</TableHead>
              <TableHead>HPP</TableHead>
              <TableHead>Laba</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {byType.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  Tidak ada penjualan pada rentang ini.
                </TableCell>
              </TableRow>
            )}
            {byType.map((r) => {
              const revenue = Number(r.revenue);
              const cost = Number(r.cost);
              return (
                <TableRow key={r.saleType}>
                  <TableCell>{TYPE_LABEL[r.saleType] ?? r.saleType}</TableCell>
                  <TableCell>{r.transactions}</TableCell>
                  <TableCell>{r.totalQty}</TableCell>
                  <TableCell>{formatRupiah(revenue)}</TableCell>
                  <TableCell>{formatRupiah(cost)}</TableCell>
                  <TableCell>{formatRupiah(revenue - cost)}</TableCell>
                </TableRow>
              );
            })}
            {byType.length > 0 && (
              <TableRow className="font-semibold">
                <TableCell>Total</TableCell>
                <TableCell>{totals.transactions}</TableCell>
                <TableCell>{totals.qty}</TableCell>
                <TableCell>{formatRupiah(totals.revenue)}</TableCell>
                <TableCell>{formatRupiah(totals.cost)}</TableCell>
                <TableCell>{formatRupiah(totals.revenue - totals.cost)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {daily.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Omzet harian</h2>
          <div className="flex h-40 items-end gap-2">
            {daily.map((d) => {
              const pct = maxDaily > 0 ? Math.round((Number(d.total) / maxDaily) * 100) : 0;
              return (
                <div
                  key={String(d.day)}
                  className="flex flex-1 flex-col items-center gap-1"
                  title={`${formatTanggal(new Date(String(d.day)))}: ${formatRupiah(Number(d.total))}`}
                >
                  <div
                    className="w-full rounded-t bg-primary"
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(String(d.day)).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
