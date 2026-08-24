import Link from 'next/link';
import { and, eq, isNotNull, lte } from 'drizzle-orm';
import { ArrowLedgerIcon } from '@/components/ui/icons';
import { db } from '@/server/db';
import { products } from '@/server/db/schema';
import { homeSummary } from '@/server/repositories/reports';
import { formatRupiah } from '@/lib/format';

export const dynamic = 'force-dynamic';

const AKSI = [
  { href: '/transaksi/jual', label: 'Catat Penjualan' },
  { href: '/transaksi/masuk', label: 'Stok Masuk' },
  { href: '/opname', label: 'Stock Opname' },
  { href: '/laporan', label: 'Laporan' },
] as const;

export default async function HomePage() {
  const [summary, lowStock] = await Promise.all([
    homeSummary(),
    db
      .select({
        id: products.id,
        name: products.name,
        stockQty: products.stockQty,
      })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          isNotNull(products.minStockQty),
          lte(products.stockQty, products.minStockQty),
        ),
      )
      .limit(10),
  ]);

  const tanggal = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <header className="pt-2 text-center">
        <h1 className="border-b-0 pb-0 font-heading text-3xl font-bold">Aninda Payu</h1>
        <div className="rule-double mt-3" aria-hidden />
      </header>

      <section aria-label="Ringkasan hari ini">
        <p className="mb-2 text-sm text-muted-foreground">{tanggal}</p>
        <table className="w-full text-sm">
          <tbody>
            <tr className="rule-row">
              <th scope="row" className="py-3 pr-2 text-left font-normal">
                Stok berjalan
              </th>
              <td className="tnum py-3 text-right">
                {summary.totalQty.toLocaleString('id-ID')} pcs
              </td>
            </tr>
            <tr className="rule-row">
              <th scope="row" className="py-3 pr-2 text-left font-normal">
                Nilai stok (modal)
              </th>
              <td className="tnum py-3 text-right">
                {formatRupiah(summary.totalModal)}
              </td>
            </tr>
            <tr className="rule-total">
              <th scope="row" className="py-3 pr-2 text-left font-normal">
                Penjualan hari ini
              </th>
              <td className="tnum py-3 pb-4 text-right font-semibold">
                {formatRupiah(summary.salesToday)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold">Aksi cepat</h2>
        <nav aria-label="Aksi cepat">
          {AKSI.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rule-row group flex items-center justify-between px-1 py-3.5 text-base hover:bg-muted/60"
            >
              {a.label}
              <ArrowLedgerIcon className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
            </Link>
          ))}
        </nav>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold">Stok menipis</h2>
        {lowStock.length === 0 ? (
          <p className="rule-row py-3 text-sm text-pencil-green">
            Stok aman. Tidak ada produk di bawah batas minimum.
          </p>
        ) : (
          <ul>
            {lowStock.map((p) => (
              <li key={p.id} className="rule-row py-3 text-pencil">
                <Link href={`/stok/${p.id}/edit`} className="hover:underline">
                  {p.name} — {p.stockQty} pcs
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
