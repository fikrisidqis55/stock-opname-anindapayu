'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { addCategoryAction, renameCategoryAction } from '@/actions/settings';
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

type Category = { id: string; name: string };

function RenameDialog({ category }: { category: Category }) {
  const router = useRouter();
  const [name, setName] = useState(category.name);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const res = await renameCategoryAction(category.id, { name });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error ?? 'Gagal mengubah nama');
      return;
    }
    toast.success('Kategori diperbarui');
    router.refresh();
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Ubah Nama
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah nama kategori</DialogTitle>
          <DialogDescription>
            Nama lama: {category.name}. Perubahan memengaruhi tampilan daftar
            produk dan laporan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kategori"
            required
          />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Batal
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CategoryManager({ items }: { items: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const res = await addCategoryAction({ name });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error ?? 'Gagal menambah kategori');
      return;
    }
    toast.success('Kategori ditambahkan');
    setName('');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex max-w-md gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kategori babaran baru"
        />
        <Button type="submit" disabled={saving}>
          {saving ? 'Menambah…' : 'Tambah'}
        </Button>
      </form>

      <ul className="divide-y rounded-lg border">
        {items.length === 0 && (
          <li className="p-4 text-sm text-muted-foreground">Belum ada kategori.</li>
        )}
        {items.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 p-4">
            <span className="capitalize">{c.name}</span>
            <RenameDialog category={c} />
          </li>
        ))}
      </ul>
    </div>
  );
}
