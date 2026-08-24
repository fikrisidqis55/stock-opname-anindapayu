import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
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
import { formatRupiah } from '@/lib/format';
import { listProductsGroupedByCategory } from '@/server/repositories/products';

export const dynamic = 'force-dynamic';

export default async function StokPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const groups = await listProductsGroupedByCategory(q);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Stok</h1>
        <Button render={<Link href="/stok/baru" />}>Tambah Produk</Button>
      </div>

      <form className="max-w-sm" action="/stok" method="get">
        <Input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Cari nama produk…"
          type="search"
        />
      </form>

      {groups.size === 0 && (
        <p className="text-sm text-muted-foreground">
          Belum ada produk. Tambahkan produk pertama Anda.
        </p>
      )}

      {[...groups.entries()].map(([categoryName, rows]) => {
        const totalQty = rows.reduce((s, r) => s + r.product.stockQty, 0);
        const totalValue = rows.reduce(
          (s, r) => s + r.product.stockQty * r.product.priceModal,
          0,
        );
        return (
          <Card key={categoryName}>
            <CardHeader>
              <CardTitle className="capitalize">{categoryName}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="md:min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden sm:table-cell">Foto</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead className="hidden md:table-cell">Modal</TableHead>
                    <TableHead className="hidden md:table-cell">Ecer</TableHead>
                    <TableHead className="hidden md:table-cell">Grosir</TableHead>
                    <TableHead className="hidden md:table-cell">Kulakan</TableHead>
                    <TableHead className="sticky right-0 border-l border-border bg-card">
                      <span className="sr-only">Aksi</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ product }) => {
                    const low =
                      product.minStockQty != null &&
                      product.stockQty <= product.minStockQty;
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="hidden sm:table-cell">
                          {product.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.photoUrl}
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/stok/${product.id}/edit`}
                            className="font-medium hover:underline"
                          >
                            {product.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant={low ? 'destructive' : 'secondary'}>
                            {product.stockQty}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatRupiah(product.priceModal)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatRupiah(product.priceEcer)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatRupiah(product.priceGrosir)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatRupiah(product.priceKulakan)}
                        </TableCell>
                        <TableCell className="sticky right-0 border-l border-border bg-card group-hover:bg-muted">
                          <RowDetailDialog
                            title={product.name}
                            description={`Kategori: ${categoryName}`}
                          >
                            {product.photoUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.photoUrl}
                                alt={product.name}
                                className="h-24 w-24 rounded-md border border-border object-cover"
                              />
                            )}
                            <DetailList
                              rows={[
                                ['Stok berjalan', `${product.stockQty} pcs`],
                                [
                                  'Stok minimum',
                                  product.minStockQty != null
                                    ? `${product.minStockQty} pcs`
                                    : '—',
                                ],
                                ['Harga modal', formatRupiah(product.priceModal)],
                                ['Harga ecer', formatRupiah(product.priceEcer)],
                                ['Harga grosir', formatRupiah(product.priceGrosir)],
                                ['Harga kulakan', formatRupiah(product.priceKulakan)],
                              ]}
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                render={
                                  <Link
                                    href={`/laporan/kartu-stok?productId=${product.id}`}
                                  />
                                }
                              >
                                Kartu stok
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                render={<Link href={`/stok/${product.id}/edit`} />}
                              >
                                Ubah
                              </Button>
                            </div>
                          </RowDetailDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Total: {totalQty} pcs · Nilai {formatRupiah(totalValue)}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
