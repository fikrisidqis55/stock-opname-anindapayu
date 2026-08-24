import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DetailList, RowDetailDialog } from '@/components/ui/row-detail';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatTanggal, formatWaktu } from '@/lib/format';
import { listActiveProducts } from '@/server/repositories/products';
import { stockCard } from '@/server/repositories/reports';

export const dynamic = 'force-dynamic';

const TYPE_LABEL: Record<string, string> = {
  in_production: 'Produksi sendiri',
  in_purchase: 'Kulakan luar',
  sale: 'Penjualan',
  opname_adjust: 'Penyesuaian opname',
};

const REF_LABEL: Record<string, string> = {
  batch: 'Stok masuk',
  sale: 'Penjualan',
  opname_item: 'Sesi opname',
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
            className="h-9 w-full rounded-md border border-input bg-card px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
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
            <Table className="sm:min-w-[560px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="hidden sm:table-cell">Kejadian</TableHead>
                  <TableHead className="hidden sm:table-cell">Masuk</TableHead>
                  <TableHead>
                    <span className="sm:hidden">Mutasi</span>
                    <span className="hidden sm:inline">Keluar</span>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Saldo</TableHead>
                  <TableHead className="sticky right-0 border-l border-border bg-background">
                    <span className="sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {card.rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      Tidak ada mutasi pada rentang ini.
                    </TableCell>
                  </TableRow>
                )}
                {card.rows.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      {formatTanggal(m.occurredAt)}
                      <span className="block text-xs text-muted-foreground sm:hidden">
                        saldo {m.balance} pcs
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {TYPE_LABEL[m.type] ?? m.type}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {m.qtyChange > 0 ? `+${m.qtyChange}` : ''}
                    </TableCell>
                    <TableCell>
                      <span className="sm:hidden">
                        {m.qtyChange > 0 ? `+${m.qtyChange}` : m.qtyChange}
                      </span>
                      <span className="hidden sm:inline">
                        {m.qtyChange < 0 ? m.qtyChange : ''}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{m.balance}</TableCell>
                    <TableCell className="sticky right-0 border-l border-border bg-background group-hover:bg-muted">
                      <RowDetailDialog
                        title={TYPE_LABEL[m.type] ?? m.type}
                        description={formatWaktu(m.occurredAt)}
                      >
                        <DetailList
                          rows={[
                            ['Kejadian', TYPE_LABEL[m.type] ?? m.type],
                            ['Waktu', formatWaktu(m.occurredAt)],
                            ['Rujukan', REF_LABEL[m.refType] ?? m.refType],
                            [
                              'Perubahan',
                              m.qtyChange > 0 ? `+${m.qtyChange} pcs` : `${m.qtyChange} pcs`,
                            ],
                            ['Saldo akhir', `${m.balance} pcs`],
                            ...(m.note ? ([['Catatan', m.note]] as [string, string][]) : []),
                          ]}
                        />
                      </RowDetailDialog>
                    </TableCell>
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
