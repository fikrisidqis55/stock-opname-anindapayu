'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createSaleAction } from '@/actions/transactions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatRupiah } from '@/lib/format';

export type SaleProduct = {
  id: string;
  name: string;
  stockQty: number;
  priceEcer: number;
  priceGrosir: number;
  priceKulakan: number;
};

type SaleType = 'ecer' | 'grosir' | 'kulakan';
type ItemRow = { productId: string; qty: string; unitPrice: string };

function priceByType(p: SaleProduct, type: SaleType) {
  if (type === 'ecer') return p.priceEcer;
  if (type === 'grosir') return p.priceGrosir;
  return p.priceKulakan;
}

export function SaleForm({ products }: { products: SaleProduct[] }) {
  const [saving, setSaving] = useState(false);
  const [saleType, setSaleType] = useState<SaleType>('ecer');
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<ItemRow[]>([
    { productId: '', qty: '1', unitPrice: '' },
  ]);

  function onTypeChange(next: SaleType) {
    // baris yang belum dinego (masih harga tipe lama) ikut harga tipe baru
    setItems((rows) =>
      rows.map((row) => {
        const p = products.find((x) => x.id === row.productId);
        if (!p) return row;
        const stillDefault = row.unitPrice === '' || Number(row.unitPrice) === priceByType(p, saleType);
        return stillDefault ? { ...row, unitPrice: String(priceByType(p, next)) } : row;
      }),
    );
    setSaleType(next);
  }

  function onItemChange(index: number, patch: Partial<ItemRow>) {
    setItems((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function onProductChange(index: number, productId: string) {
    const p = products.find((x) => x.id === productId);
    onItemChange(index, {
      productId,
      unitPrice: p ? String(priceByType(p, saleType)) : '',
    });
  }

  function addRow() {
    setItems((rows) => [...rows, { productId: '', qty: '1', unitPrice: '' }]);
  }

  function removeRow(index: number) {
    setItems((rows) => rows.filter((_, i) => i !== index));
  }

  const total = items.reduce((sum, row) => {
    const qty = Number(row.qty) || 0;
    const price = Number(row.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const res = await createSaleAction({
      saleType,
      customerName,
      note,
      items: items.filter((row) => row.productId),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error ?? 'Gagal menyimpan penjualan');
      return;
    }
    toast.success('Penjualan tersimpan');
    setCustomerName('');
    setNote('');
    setItems([{ productId: '', qty: '1', unitPrice: '' }]);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <div className="space-y-1">
        <Label>Tipe penjualan</Label>
        <div className="flex gap-4">
          {(['ecer', 'grosir', 'kulakan'] as const).map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm capitalize">
              <input
                type="radio"
                name="saleType"
                checked={saleType === t}
                onChange={() => onTypeChange(t)}
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      {saleType === 'kulakan' && (
        <div className="space-y-1">
          <Label htmlFor="customerName">Nama bakul</Label>
          <Input
            id="customerName"
            name="customerName"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="mis. Bu Sari (Pasar Banjarsari)"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Produk</Label>
        {items.map((row, i) => {
          const p = products.find((x) => x.id === row.productId);
          return (
            <div key={i} className="grid grid-cols-[1fr_5rem_8rem_2rem] items-center gap-2">
              <Select
                value={row.productId}
                onValueChange={(v) => onProductChange(i, (v as string) ?? '')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((prod) => (
                    <SelectItem key={prod.id} value={prod.id}>
                      {prod.name} (stok {prod.stockQty})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                max={p?.stockQty}
                value={row.qty}
                onChange={(e) => onItemChange(i, { qty: e.target.value })}
                aria-label="Jumlah"
              />
              <Input
                type="number"
                min={0}
                value={row.unitPrice}
                onChange={(e) => onItemChange(i, { unitPrice: e.target.value })}
                aria-label="Harga satuan"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                disabled={items.length === 1}
                className="text-sm text-muted-foreground hover:text-destructive disabled:opacity-30"
                aria-label="Hapus baris"
              >
                ✕
              </button>
            </div>
          );
        })}
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          + Tambah produk
        </Button>
      </div>

      <div className="space-y-1">
        <Label htmlFor="note">Catatan (opsional)</Label>
        <Textarea
          id="note"
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <p className="text-lg font-semibold">Total: {formatRupiah(total)}</p>

      <Button type="submit" disabled={saving || items.every((r) => !r.productId)}>
        {saving ? 'Menyimpan…' : 'Simpan Penjualan'}
      </Button>
    </form>
  );
}
