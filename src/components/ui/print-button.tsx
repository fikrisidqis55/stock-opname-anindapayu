'use client';

import { Button } from '@/components/ui/button';

// Tombol Cetak: buka dialog print browser (tata letak cetak diatur print CSS).
export function PrintButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => window.print()}
    >
      Cetak
    </Button>
  );
}
