import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatTanggal } from '@/lib/format';
import { listActiveProducts } from '@/server/repositories/products';
import { stockCard } from '@/server/repositories/reports';

export const dynamic = 'force-dynamic';

const TYPE_LABEL: Record<string, string> = {
  in_production: 'Produksi sendiri',
  in_purchase: 'Kulakan luar',
  sale: 'Penjualan',
  opname_adjust: 'Penyesuaian opname',
};

export default async function KartuStokPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; from?: string; to?: string }>;
}) {
  const { productId, from, to } = await searchParams;
  const products = await listActiveProducts();

  const fromDate = from ? new Date(`${from}T00:00:00`) : undefined;
  const toDate = to ? new Date(`${to}T23:59:59`) : undefined;
  const card = productId
    ? await stockCard(productId, fromDate, toDate)
    : null;
  const selected = products.find((p) => p.id === productId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Kartu Stok</h1>

      <form
        method="get"
        className="flex max-w-2xl flex-wrap items-end gap-3"
      >
        <label className="w-full space-y-1 text-sm sm:w-64">
          Produk
          <select
            name="productId"
            defaultValue={productId ?? ''}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
          >
            <option value="" disabled>
              Pilih produk
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          Dari
          <Input type="date" name="from" defaultValue={from ?? ''} />
        </label>
        <label className="space-y-1 text-sm">
          Sampai
          <Input type="date" name="to" defaultValue={to ?? ''} />
        </label>
        <Button type="submit">Tampilkan</Button>
      </form>

      {card && selected && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total masuk</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{card.totalIn}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total keluar</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{card.totalOut}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Selisih</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {card.totalIn - card.totalOut}
              </CardContent>
            </Card>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kejadian</TableHead>
                  <TableHead>Masuk</TableHead>
                  <TableHead>Keluar</TableHead>
                  <TableHead>Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {card.rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      Tidak ada mutasi pada rentang ini.
                    </TableCell>
                  </TableRow>
                )}
                {card.rows.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{formatTanggal(m.occurredAt)}</TableCell>
                    <TableCell>{TYPE_LABEL[m.type] ?? m.type}</TableCell>
                    <TableCell>{m.qtyChange > 0 ? `+${m.qtyChange}` : ''}</TableCell>
                    <TableCell>{m.qtyChange < 0 ? m.qtyChange : ''}</TableCell>
                    <TableCell>{m.balance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
