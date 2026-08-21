import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatRupiah } from '@/lib/format';
import { listProductsGroupedByCategory } from '@/server/repositories/products';

export const dynamic = 'force-dynamic';

export default async function LaporanStokPage() {
  const groups = await listProductsGroupedByCategory();

  let grandQty = 0;
  let grandValue = 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Laporan Stok per Babaran</h1>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/laporan/kartu-stok" />}>
            Kartu Stok
          </Button>
          <Button variant="outline" render={<Link href="/laporan/penjualan" />}>
            Penjualan & Laba
          </Button>
        </div>
      </div>

      {groups.size === 0 && (
        <p className="text-sm text-muted-foreground">Belum ada produk.</p>
      )}

      {[...groups.entries()].map(([categoryName, rows]) => {
        const totalQty = rows.reduce((s, r) => s + r.product.stockQty, 0);
        const totalValue = rows.reduce(
          (s, r) => s + r.product.stockQty * r.product.priceModal,
          0,
        );
        grandQty += totalQty;
        grandValue += totalValue;
        return (
          <Card key={categoryName}>
            <CardHeader>
              <CardTitle className="capitalize">{categoryName}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>Stok (pcs)</TableHead>
                    <TableHead>Nilai (modal)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ product }) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.stockQty}</TableCell>
                      <TableCell>
                        {formatRupiah(product.stockQty * product.priceModal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Subtotal: {totalQty} pcs · {formatRupiah(totalValue)}
            </CardFooter>
          </Card>
        );
      })}

      {groups.size > 0 && (
        <p className="text-lg font-semibold">
          Total: {grandQty} pcs · {formatRupiah(grandValue)}
        </p>
      )}
    </div>
  );
}
