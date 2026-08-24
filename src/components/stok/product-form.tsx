'use client';

import { useState } from 'react';
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

// Kompres foto di klien (maks 1000px, JPEG 0.8) agar payload & DB tetap kecil.
async function compressToDataUri(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 1000;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas tidak tersedia');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.8);
}

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
  const [photoBusy, setPhotoBusy] = useState(false);
  const [priceModal, setPriceModal] = useState(String(initial?.priceModal ?? ''));
  const [priceEcer, setPriceEcer] = useState(String(initial?.priceEcer ?? ''));
  const [priceGrosir, setPriceGrosir] = useState(String(initial?.priceGrosir ?? ''));
  const [priceKulakan, setPriceKulakan] = useState(
    String(initial?.priceKulakan ?? ''),
  );
  const [minStockQty, setMinStockQty] = useState(
    initial?.minStockQty != null ? String(initial.minStockQty) : '',
  );

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Berkas harus berupa gambar');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 4MB');
      return;
    }
    setPhotoBusy(true);
    try {
      setPhotoUrl(await compressToDataUri(file));
    } catch {
      toast.error('Gagal memproses foto');
    } finally {
      setPhotoBusy(false);
    }
  }

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
            <SelectValue placeholder="Pilih kategori">
              {(value: string | null) =>
                categories.find((c) => c.id === value)?.name ?? 'Pilih kategori'
              }
            </SelectValue>
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
        <Label htmlFor="photo">Foto produk (opsional)</Label>
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt="Foto produk"
            className="h-24 w-24 rounded-md border border-border object-cover"
          />
        )}
        <Input
          id="photo"
          type="file"
          accept="image/*"
          onChange={onPhotoChange}
          disabled={photoBusy}
          className="cursor-pointer"
        />
        <p className="text-xs text-muted-foreground">
          Maksimal 4MB. Foto dikompres otomatis dan ikut tersimpan bersama data produk.
        </p>
        {photoUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPhotoUrl('')}
          >
            Hapus foto
          </Button>
        )}
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
