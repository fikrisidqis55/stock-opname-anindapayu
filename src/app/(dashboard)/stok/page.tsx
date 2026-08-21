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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Foto</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Modal</TableHead>
                    <TableHead>Ecer</TableHead>
                    <TableHead>Grosir</TableHead>
                    <TableHead>Kulakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ product }) => {
                    const low =
                      product.minStockQty != null &&
                      product.stockQty <= product.minStockQty;
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
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
                        <TableCell>{formatRupiah(product.priceModal)}</TableCell>
                        <TableCell>{formatRupiah(product.priceEcer)}</TableCell>
                        <TableCell>{formatRupiah(product.priceGrosir)}</TableCell>
                        <TableCell>{formatRupiah(product.priceKulakan)}</TableCell>
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
