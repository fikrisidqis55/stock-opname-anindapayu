import type { ReactNode } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DetailList, RowDetailDialog } from '@/components/ui/row-detail';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatRupiah, formatTanggal } from '@/lib/format';
import {
  listRecentTransactions,
  type SaleTxRow,
  type StockInTxRow,
} from '@/server/repositories/transactions';

export const dynamic = 'force-dynamic';

const SALE_LABEL: Record<string, string> = {
  ecer: 'Ecer',
  grosir: 'Grosir',
  kulakan: 'Kulakan',
};
const SOURCE_LABEL: Record<string, string> = {
  production: 'Produksi sendiri',
  purchase: 'Kulakan luar',
};

function SaleDetail({ row }: { row: SaleTxRow }) {
  const qtyTotal = row.items.reduce((s, i) => s + i.qty, 0);
  const rows: [string, ReactNode][] = [
    ['Jumlah', `${qtyTotal} pcs`],
    ['Pelanggan/Bakul', row.customerName ?? '—'],
    ['Total', formatRupiah(row.totalPrice)],
    ['HPP', formatRupiah(row.totalCost)],
    [
      'Laba',
      <span key="laba" className="text-pencil-green">
        {formatRupiah(row.totalPrice - row.totalCost)}
      </span>,
    ],
  ];
  if (row.note) rows.push(['Catatan', row.note]);
  return (
    <RowDetailDialog
      title="Detail penjualan"
      description={`${SALE_LABEL[row.saleType] ?? row.saleType} · ${formatTanggal(row.at)}`}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="rule-double text-left text-xs tracking-wide text-muted-foreground uppercase">
            <th className="py-1 font-medium">Produk</th>
            <th className="py-1 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {row.items.map((it, i) => (
            <tr key={i} className="rule-row">
              <td className="py-1.5">
                {it.productName}
                <span className="block text-xs text-muted-foreground">
                  {it.qty} × {formatRupiah(it.unitPrice)}
                </span>
              </td>
              <td className="tnum py-1.5 text-right font-medium">
                {formatRupiah(it.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <DetailList rows={rows} />
    </RowDetailDialog>
  );
}

function StockInDetail({ row }: { row: StockInTxRow }) {
  const rows: [string, ReactNode][] = [
    ['Produk', row.productName],
    ['Sumber', SOURCE_LABEL[row.source] ?? row.source],
    ['Jumlah', `${row.qty} pcs`],
    ['Biaya satuan', formatRupiah(row.unitCost)],
    ['Total biaya', formatRupiah(row.totalCost)],
    ['Supplier/Bakul', row.supplierName ?? '—'],
  ];
  if (row.note) rows.push(['Catatan', row.note]);
  return (
    <RowDetailDialog
      title="Detail stok masuk"
      description={`${SOURCE_LABEL[row.source] ?? row.source} · ${formatTanggal(row.at)}`}
    >
      <DetailList rows={rows} />
    </RowDetailDialog>
  );
}

export default async function TransaksiPage() {
  const riwayat = await listRecentTransactions();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Transaksi</h1>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/transaksi/masuk" />}>
            Stok Masuk
          </Button>
          <Button render={<Link href="/transaksi/jual" />}>Penjualan</Button>
        </div>
      </div>

      {riwayat.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Belum ada transaksi. Mulai dari stok masuk atau penjualan.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table className="sm:min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead className="hidden sm:table-cell">Tipe</TableHead>
                <TableHead className="hidden sm:table-cell">Rincian</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Pelanggan/Supplier
                </TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="sticky right-0 border-l border-border bg-background">
                  <span className="sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riwayat.map((t) =>
                t.kind === 'sale' ? (
                  <TableRow key={`s-${t.id}`}>
                    <TableCell>
                      {formatTanggal(t.at)}
                      <span className="block text-xs text-muted-foreground sm:hidden">
                        {SALE_LABEL[t.saleType] ?? t.saleType}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary">
                        {SALE_LABEL[t.saleType] ?? t.saleType}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {t.items.length} produk ·{' '}
                      {t.items.reduce((s, i) => s + i.qty, 0)} pcs
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {t.customerName ?? '—'}
                    </TableCell>
                    <TableCell>{formatRupiah(t.totalPrice)}</TableCell>
                    <TableCell className="sticky right-0 border-l border-border bg-background group-hover:bg-muted">
                      <SaleDetail row={t} />
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={`b-${t.id}`}>
                    <TableCell>
                      {formatTanggal(t.at)}
                      <span className="block text-xs text-muted-foreground sm:hidden">
                        {SOURCE_LABEL[t.source] ?? t.source}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        className={
                          t.source === 'production'
                            ? 'bg-pencil-green/10 text-pencil-green'
                            : 'bg-soga/10 text-soga'
                        }
                      >
                        {SOURCE_LABEL[t.source] ?? t.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {t.productName} · {t.qty} pcs
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {t.supplierName ?? '—'}
                    </TableCell>
                    <TableCell>{formatRupiah(t.totalCost)}</TableCell>
                    <TableCell className="sticky right-0 border-l border-border bg-background group-hover:bg-muted">
                      <StockInDetail row={t} />
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
