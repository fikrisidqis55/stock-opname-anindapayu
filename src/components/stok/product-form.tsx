'use client';

import { useState } from 'react';
import { UploadButton } from '@uploadthing/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createProductAction, updateProductAction } from '@/actions/products';
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
import type { OurFileRouter } from '@/app/api/uploadthing/core';

export type ProductFormInitial = {
  id?: string;
  name?: string;
  categoryId?: string;
  photoUrl?: string | null;
  priceModal?: number;
  priceEcer?: number;
  priceGrosir?: number;
  priceKulakan?: number;
  minStockQty?: number | null;
};

export function ProductForm({
  categories,
  initial,
}: {
  categories: { id: string; name: string }[];
  initial?: ProductFormInitial;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(initial?.name ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? '');
  const [priceModal, setPriceModal] = useState(String(initial?.priceModal ?? ''));
  const [priceEcer, setPriceEcer] = useState(String(initial?.priceEcer ?? ''));
  const [priceGrosir, setPriceGrosir] = useState(String(initial?.priceGrosir ?? ''));
  const [priceKulakan, setPriceKulakan] = useState(
    String(initial?.priceKulakan ?? ''),
  );
  const [minStockQty, setMinStockQty] = useState(
    initial?.minStockQty != null ? String(initial.minStockQty) : '',
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const values = {
      name,
      categoryId,
      photoUrl,
      priceModal,
      priceEcer,
      priceGrosir,
      priceKulakan,
      minStockQty,
    };
    const res = initial?.id
      ? await updateProductAction(initial.id, values)
      : await createProductAction(values);
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error ?? 'Gagal menyimpan');
      return;
    }
    toast.success('Produk disimpan');
    router.push('/stok');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Nama produk</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="mis. Kemeja Malaman M01"
        />
      </div>

      <div className="space-y-1">
        <Label>Kategori babaran</Label>
        <Select value={categoryId} onValueChange={(v) => setCategoryId((v as string) ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Foto produk (opsional)</Label>
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="Foto produk" className="h-24 w-24 rounded-md object-cover" />
        )}
        <UploadButton<OurFileRouter, 'productPhoto'>
          endpoint="productPhoto"
          onClientUploadComplete={(res) => {
            const url = res?.[0]?.ufsUrl;
            if (url) {
              setPhotoUrl(url);
              toast.success('Foto terunggah');
            }
          }}
          onUploadError={(err) => {
            toast.error(`Gagal upload: ${err.message}`);
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="priceModal">Harga modal</Label>
          <Input
            id="priceModal"
            name="priceModal"
            type="number"
            min={0}
            required
            value={priceModal}
            onChange={(e) => setPriceModal(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="priceEcer">Harga ecer</Label>
          <Input
            id="priceEcer"
            name="priceEcer"
            type="number"
            min={0}
            required
            value={priceEcer}
            onChange={(e) => setPriceEcer(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="priceGrosir">Harga grosir</Label>
          <Input
            id="priceGrosir"
            name="priceGrosir"
            type="number"
            min={0}
            required
            value={priceGrosir}
            onChange={(e) => setPriceGrosir(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="priceKulakan">Harga kulakan</Label>
          <Input
            id="priceKulakan"
            name="priceKulakan"
            type="number"
            min={0}
            required
            value={priceKulakan}
            onChange={(e) => setPriceKulakan(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="minStockQty">Stok minimum (untuk peringatan, opsional)</Label>
        <Input
          id="minStockQty"
          name="minStockQty"
          type="number"
          min={0}
          value={minStockQty}
          onChange={(e) => setMinStockQty(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={saving || !categoryId}>
        {saving ? 'Menyimpan…' : 'Simpan Produk'}
      </Button>
    </form>
  );
}
