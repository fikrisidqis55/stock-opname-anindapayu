import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { listRecentSales } from '@/server/services/sales';

export const dynamic = 'force-dynamic';

export default async function TransaksiPage() {
  const riwayat = await listRecentSales();

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
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Pelanggan/Bakul</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Laba</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riwayat.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{formatTanggal(s.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {s.saleType}
                    </Badge>
                  </TableCell>
                  <TableCell>{s.customerName ?? '—'}</TableCell>
                  <TableCell>{formatRupiah(s.totalPrice)}</TableCell>
                  <TableCell>{formatRupiah(s.totalPrice - s.totalCost)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
