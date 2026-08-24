'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  applyOpnameSessionAction,
  cancelOpnameSessionAction,
  saveOpnameCountAction,
} from '@/actions/opname';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { opnameDiffValue } from '@/lib/domain';
import { formatRupiah } from '@/lib/format';

export type CountItem = {
  item: {
    id: string;
    sessionId: string;
    productId: string;
    systemQty: number;
    countedQty: number | null;
  };
  productName: string;
  categoryName: string;
  priceModal: number;
};

export function CountSheet({
  sessionId,
  status,
  items,
}: {
  sessionId: string;
  status: 'counting' | 'completed' | 'cancelled';
  items: CountItem[];
}) {
  const router = useRouter();
  const editable = status === 'counting';
  const [counts, setCounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((r) => [r.item.productId, r.item.countedQty?.toString() ?? ''])),
  );
  const [busy, setBusy] = useState(false);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const groups = useMemo(() => {
    const map = new Map<string, CountItem[]>();
    for (const row of items) {
      const list = map.get(row.categoryName) ?? [];
      list.push(row);
      map.set(row.categoryName, list);
    }
    return map;
  }, [items]);

  const countedRows = items.filter((r) => counts[r.item.productId] !== '');
  const diffs = countedRows
    .map((r) => {
      const counted = Number(counts[r.item.productId]);
      const diff = counted - r.item.systemQty;
      return { row: r, counted, diff, value: opnameDiffValue(diff, r.priceModal) };
    })
    .filter((d) => d.diff !== 0);
  const totalDiffQty = diffs.reduce((s, d) => s + d.diff, 0);
  const totalDiffValue = diffs.reduce((s, d) => s + d.value, 0);

  async function persist(productId: string, value: string) {
    const res = await saveOpnameCountAction({
      sessionId,
      productId,
      countedQty: value === '' ? null : value,
    });
    if (!res.ok) toast.error(res.error ?? 'Gagal menyimpan hitungan');
  }

  function onChange(productId: string, value: string) {
    setCounts((c) => ({ ...c, [productId]: value }));
    clearTimeout(timers.current[productId]);
    timers.current[productId] = setTimeout(() => persist(productId, value), 500);
  }

  function onBlur(productId: string) {
    clearTimeout(timers.current[productId]);
    persist(productId, counts[productId]);
  }

  async function apply() {
    setBusy(true);
    const res = await applyOpnameSessionAction(sessionId);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error ?? 'Gagal menerapkan opname');
      return;
    }
    toast.success('Penyesuaian diterapkan');
    router.push('/opname');
    router.refresh();
  }

  async function cancelSession() {
    setBusy(true);
    const res = await cancelOpnameSessionAction(sessionId);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error ?? 'Gagal membatalkan sesi');
      return;
    }
    toast.success('Sesi dibatalkan');
    router.push('/opname');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {editable && (
        <p className="rounded-md border border-soga/50 bg-soga/10 p-3 text-sm text-soga">
          Stok sistem difoto saat sesi dibuat — jangan catat penjualan / stok
          masuk selama opname.
        </p>
      )}

      {editable && (
        <p className="text-sm text-muted-foreground">
          Terhitung {countedRows.length} dari {items.length} produk
        </p>
      )}

      {[...groups.entries()].map(([categoryName, rows]) => (
        <div key={categoryName} className="rounded-lg border">
          <p className="border-b px-3 py-2 text-sm font-semibold capitalize">
            {categoryName}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Stok sistem</TableHead>
                <TableHead>{editable ? 'Jumlah fisik' : 'Jumlah terhitung'}</TableHead>
                {!editable && <TableHead>Selisih</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const value = counts[r.item.productId];
                const counted = value === '' ? null : Number(value);
                const diff = counted == null ? null : counted - r.item.systemQty;
                return (
                  <TableRow key={r.item.productId}>
                    <TableCell>{r.productName}</TableCell>
                    <TableCell>{r.item.systemQty}</TableCell>
                    <TableCell>
                      {editable ? (
                        <Input
                          type="number"
                          min={0}
                          className="w-24"
                          value={value}
                          onChange={(e) => onChange(r.item.productId, e.target.value)}
                          onBlur={() => onBlur(r.item.productId)}
                          aria-label={`Jumlah fisik ${r.productName}`}
                        />
                      ) : (
                        (r.item.countedQty ?? '—')
                      )}
                    </TableCell>
                    {!editable && (
                      <TableCell>
                        {diff == null || diff === 0 ? (
                          '—'
                        ) : (
                          <span
                            className={diff < 0 ? 'text-pencil' : 'text-pencil-green'}
                          >
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ))}

      {editable && diffs.length > 0 && (
        <div className="rounded-lg border">
          <p className="border-b px-3 py-2 text-sm font-semibold">Preview selisih</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Sistem</TableHead>
                <TableHead>Fisik</TableHead>
                <TableHead>Selisih</TableHead>
                <TableHead>Nilai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diffs.map((d) => (
                <TableRow key={d.row.item.productId}>
                  <TableCell>{d.row.productName}</TableCell>
                  <TableCell>{d.row.item.systemQty}</TableCell>
                  <TableCell>{d.counted}</TableCell>
                  <TableCell>
                    <span className={d.diff < 0 ? 'text-pencil' : 'text-pencil-green'}>
                      {d.diff > 0 ? `+${d.diff}` : d.diff}
                    </span>
                  </TableCell>
                  <TableCell>{formatRupiah(d.value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editable && (
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger render={<Button />}>Terapkan Penyesuaian</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Terapkan penyesuaian stok?</DialogTitle>
                <DialogDescription>
                  Total selisih {totalDiffQty > 0 ? `+${totalDiffQty}` : totalDiffQty} pcs
                  senilai {formatRupiah(totalDiffValue)}. Stok produk yang
                  dihitung akan disesuaikan; yang tidak dihitung tetap.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Batal</DialogClose>
                <Button onClick={apply} disabled={busy}>
                  {busy ? 'Menerapkan…' : 'Terapkan'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              Batalkan Sesi
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Batalkan sesi opname?</DialogTitle>
                <DialogDescription>
                  Semua hitungan dibuang dan stok tidak diubah.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Kembali</DialogClose>
                <Button variant="destructive" onClick={cancelSession} disabled={busy}>
                  {busy ? 'Membatalkan…' : 'Batalkan Sesi'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
