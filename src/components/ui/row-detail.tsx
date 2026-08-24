'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/** Tombol "Detail" per baris tabel yang membuka dialog rincian gaya buku kas. */
export function RowDetailDialog({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Detail
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-4rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

/** Pasangan label–nilai dengan garis rulings, seperti baris buku kas. */
export function DetailList({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl>
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="rule-row flex items-baseline justify-between gap-4 py-1.5"
        >
          <dt className="shrink-0 text-muted-foreground">{label}</dt>
          <dd className="tnum text-right font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
