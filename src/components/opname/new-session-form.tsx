'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createOpnameSessionAction } from '@/actions/opname';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewSessionForm() {
  const router = useRouter();
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const res = await createOpnameSessionAction({ label });
    setSaving(false);
    if (!res.ok || !res.id) {
      toast.error(res.error ?? 'Gagal membuat sesi');
      return;
    }
    toast.success('Sesi opname dibuat');
    router.push(`/opname/${res.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-md gap-2">
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label sesi (opsional)"
      />
      <Button type="submit" disabled={saving}>
        {saving ? 'Membuat…' : 'Buat Sesi Opname'}
      </Button>
    </form>
  );
}
