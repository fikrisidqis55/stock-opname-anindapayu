'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { receiveStockAction } from '@/actions/transactions';
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

export type StockInProduct = { id: string; name: string; priceModal: number };

export function StockInForm({ products }: { products: StockInProduct[] }) {
  const [saving, setSaving] = useState(false);
  const [productId, setProductId] = useState('');
  const [source, setSource] = useState<'production' | 'purchase'>('production');
  const [qty, setQty] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [note, setNote] = useState('');
  const [updateModal, setUpdateModal] = useState(false);

  const selected = products.find((p) => p.id === productId);
  const costDiffers =
    selected != null && unitCost !== '' && Number(unitCost) !== selected.priceModal;

  function onProductChange(id: string) {
    setProductId(id);
    const p = products.find((x) => x.id === id);
    setUnitCost(p ? String(p.priceModal) : '');
    setUpdateModal(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const res = await receiveStockAction({
      productId,
      source,
      qty,
      unitCost,
      supplierName,
      note,
      updateModal,
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error ?? 'Gagal menyimpan stok masuk');
      return;
    }
    toast.success('Stok masuk tersimpan');
    setQty('');
    setSupplierName('');
    setNote('');
    setUpdateModal(false);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <div className="space-y-1">
        <Label>Produk</Label>
        <Select
          value={productId}
          onValueChange={(v) => onProductChange((v as string) ?? '')}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih produk" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Sumber</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="source"
              checked={source === 'production'}
              onChange={() => setSource('production')}
            />
            Produksi sendiri
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="source"
              checked={source === 'purchase'}
              onChange={() => setSource('purchase')}
            />
            Kulakan luar
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="qty">Jumlah (pcs)</Label>
          <Input
            id="qty"
            name="qty"
            type="number"
            min={1}
            required
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="unitCost">Harga modal aktual / pcs</Label>
          <Input
            id="unitCost"
            name="unitCost"
            type="number"
            min={0}
            required
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
          />
        </div>
      </div>

      {source === 'purchase' && (
        <div className="space-y-1">
          <Label htmlFor="supplierName">Nama supplier</Label>
          <Input
            id="supplierName"
            name="supplierName"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            placeholder="mis. Grosir Batik Pekalongan"
          />
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="note">Catatan (opsional)</Label>
        <Textarea
          id="note"
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {costDiffers && (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={updateModal}
            onChange={(e) => setUpdateModal(e.target.checked)}
            className="mt-0.5"
          />
          Perbarui harga modal produk ke rata-rata tertimbang (modal lama
          digabung modal baru sesuai jumlah stok)
        </label>
      )}

      <Button type="submit" disabled={saving || !productId}>
        {saving ? 'Menyimpan…' : 'Simpan Stok Masuk'}
      </Button>
    </form>
  );
}
