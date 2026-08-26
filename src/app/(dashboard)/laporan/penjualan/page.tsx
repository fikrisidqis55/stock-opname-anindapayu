import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PrintButton } from '@/components/ui/print-button';
import { RowDetailDialog } from '@/components/ui/row-detail';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatRupiah, formatRupiahSingkat, formatTanggal } from '@/lib/format';
import { dailySales, salesProfitByType } from '@/server/repositories/reports';
import { listSalesInRange } from '@/server/repositories/transactions';

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

  const [byType, daily, salesInRange] = await Promise.all([
    salesProfitByType(fromDate, toDate),
    dailySales(fromDate, toDate),
    listSalesInRange(fromDate, toDate),
  ]);

  const salesByType = new Map<string, typeof salesInRange>();
  for (const s of salesInRange) {
    const arr = salesByType.get(s.saleType) ?? [];
    arr.push(s);
    salesByType.set(s.saleType, arr);
  }

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

  // Sumbu harian kontinu: hari tanpa penjualan diisi 0 (rentang ≤ 62 hari);
  // rentang lebih panjang tetap menampilkan hari berjualan saja.
  const spanDays =
    Math.round(
      (new Date(toStr).getTime() - new Date(fromStr).getTime()) / 86_400_000,
    ) + 1;
  const dailyByDay = new Map(
    daily.map((d) => [toYMD(new Date(String(d.day))), Number(d.total)]),
  );
  const bars: { date: Date; total: number }[] = [];
  if (spanDays <= 62) {
    for (let i = 0; i < spanDays; i++) {
      const date = new Date(
        fromDate.getFullYear(),
        fromDate.getMonth(),
        fromDate.getDate() + i,
      );
      bars.push({ date, total: dailyByDay.get(toYMD(date)) ?? 0 });
    }
  } else {
    for (const d of daily) {
      bars.push({ date: new Date(String(d.day)), total: Number(d.total) });
    }
  }
  const avgPerDay = Math.round(totals.revenue / spanDays);
  const bestDay = bars.reduce(
    (b, x) => (x.total > b.total ? x : b),
    { date: null as Date | null, total: 0 },
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Penjualan & Laba</h1>

      <div className="hidden print:block">
        <p className="text-sm font-semibold">
          Aninda Payu — Laporan Penjualan &amp; Laba
        </p>
        <p className="text-sm">
          Periode {formatTanggal(fromDate)} s.d. {formatTanggal(toDate)} ·
          Dicetak {formatTanggal(new Date())}
        </p>
      </div>

      <div className="flex gap-2 print:hidden">
        <PrintButton />
        <Button
          variant="outline"
          size="sm"
          render={
            <Link
              href={`/laporan/penjualan/export?from=${fromStr}&to=${toStr}`}
            />
          }
        >
          Unduh CSV
        </Button>
      </div>

      <form method="get" className="flex max-w-xl flex-wrap items-end gap-3 print:hidden">
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

      {totals.transactions > 0 && (
        <div className="rounded-lg border border-border bg-card px-4">
          <div className="rule-row flex items-center justify-between py-2.5 text-sm">
            <span className="text-muted-foreground">Total omzet periode</span>
            <span className="tnum font-semibold">
              {formatRupiah(totals.revenue)}
            </span>
          </div>
          <div className="rule-row flex items-center justify-between py-2.5 text-sm">
            <span className="text-muted-foreground">Rata-rata per hari</span>
            <span className="tnum font-semibold">{formatRupiah(avgPerDay)}</span>
          </div>
          <div className="rule-row flex items-center justify-between py-2.5 text-sm">
            <span className="text-muted-foreground">Hari terbaik</span>
            <span className="tnum font-semibold">
              {bestDay.date
                ? `${formatTanggal(bestDay.date)} · ${formatRupiah(bestDay.total)}`
                : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-muted-foreground">Hari berjualan</span>
            <span className="tnum font-semibold">
              {daily.length} dari {spanDays} hari
            </span>
          </div>
        </div>
      )}

      <div className="rounded-lg border">
        <Table className="sm:min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>Tipe</TableHead>
              <TableHead className="hidden sm:table-cell">Transaksi</TableHead>
              <TableHead className="hidden sm:table-cell">Qty</TableHead>
              <TableHead>Omzet</TableHead>
              <TableHead className="hidden sm:table-cell">HPP</TableHead>
              <TableHead>Laba</TableHead>
              <TableHead className="sticky right-0 border-l border-border bg-background print:hidden">
                <span className="sr-only">Aksi</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {byType.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
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
                  <TableCell className="hidden sm:table-cell">{r.transactions}</TableCell>
                  <TableCell className="hidden sm:table-cell">{r.totalQty}</TableCell>
                  <TableCell>{formatRupiah(revenue)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{formatRupiah(cost)}</TableCell>
                  <TableCell>{formatRupiah(revenue - cost)}</TableCell>
                  <TableCell className="sticky right-0 border-l border-border bg-background group-hover:bg-muted print:hidden">
                    <RowDetailDialog
                      title={`Rincian ${TYPE_LABEL[r.saleType] ?? r.saleType}`}
                      description={`${formatTanggal(fromDate)} s.d. ${formatTanggal(toDate)}`}
                    >
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="rule-double text-left text-xs tracking-wide text-muted-foreground uppercase">
                            <th className="py-1 font-medium">Tanggal</th>
                            <th className="py-1 text-right font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(salesByType.get(r.saleType) ?? []).map((s) => (
                            <tr key={s.id} className="rule-row">
                              <td className="py-1.5">
                                {formatTanggal(s.createdAt)}
                                <span className="block text-xs text-muted-foreground">
                                  {s.customerName ?? 'Tanpa nama'}
                                </span>
                              </td>
                              <td className="tnum py-1.5 text-right font-medium">
                                {formatRupiah(s.totalPrice)}
                                <span className="block text-xs font-normal text-pencil-green">
                                  laba {formatRupiah(s.totalPrice - s.totalCost)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </RowDetailDialog>
                  </TableCell>
                </TableRow>
              );
            })}
            {byType.length > 0 && (
              <TableRow className="font-semibold">
                <TableCell>Total</TableCell>
                <TableCell className="hidden sm:table-cell">{totals.transactions}</TableCell>
                <TableCell className="hidden sm:table-cell">{totals.qty}</TableCell>
                <TableCell>{formatRupiah(totals.revenue)}</TableCell>
                <TableCell className="hidden sm:table-cell">{formatRupiah(totals.cost)}</TableCell>
                <TableCell>{formatRupiah(totals.revenue - totals.cost)}</TableCell>
                <TableCell className="sticky right-0 border-l border-border bg-background print:hidden" />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {bars.length > 0 && (
        <div className="space-y-2 print:hidden">
          <h2 className="text-lg font-semibold">Omzet harian</h2>
          <p className="text-sm text-muted-foreground">
            Omzet kotor per hari kalender pada periode terpilih; hari tanpa
            penjualan tampil sebagai batang abu-abu Rp 0. Angka ringkas di atas
            batang berwarna (rb = ribu, jt = juta); arahkan kursor untuk nilai
            penuh. Geser mendatar bila layar sempit.
          </p>
          <div className="overflow-x-auto">
            <div className="flex h-44 w-max min-w-full gap-1 sm:gap-2">
              {bars.map((b) => {
                const pct =
                  maxDaily > 0 ? Math.round((b.total / maxDaily) * 100) : 0;
                return (
                  <div
                    key={toYMD(b.date)}
                    className="flex h-full min-w-10 flex-1 flex-col items-center justify-end gap-1"
                    title={`${formatTanggal(b.date)}: ${formatRupiah(b.total)}`}
                  >
                    {b.total > 0 && (
                      <span className="tnum text-[10px] text-muted-foreground">
                        {formatRupiahSingkat(b.total)}
                      </span>
                    )}
                    <div
                      className={`w-full rounded-t ${
                        b.total > 0 ? 'bg-primary' : 'bg-muted'
                      }`}
                      style={{ height: `${Math.max(pct, 2)}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {b.date.getDate()}/{b.date.getMonth() + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
