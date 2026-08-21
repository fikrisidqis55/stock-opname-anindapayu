import { describe, expect, it } from 'vitest';
import { formatRupiah } from '@/lib/format';

describe('formatRupiah', () => {
  it('format ribuan dengan titik', () => {
    expect(formatRupiah(150000)).toBe('Rp 150.000');
  });

  it('negatif diberi tanda minus', () => {
    expect(formatRupiah(-10000)).toBe('-Rp 10.000');
  });
});
