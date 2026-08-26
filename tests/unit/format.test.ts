import { describe, expect, it } from 'vitest';
import { formatRupiah, formatRupiahSingkat } from '@/lib/format';

describe('formatRupiah', () => {
  it('format ribuan dengan titik', () => {
    expect(formatRupiah(150000)).toBe('Rp 150.000');
  });

  it('negatif diberi tanda minus', () => {
    expect(formatRupiah(-10000)).toBe('-Rp 10.000');
  });
});

describe('formatRupiahSingkat', () => {
  it('jutaan dengan satu desimal koma', () => {
    expect(formatRupiahSingkat(1_200_000)).toBe('1,2 jt');
  });

  it('ribuan tanpa desimal bila bulat', () => {
    expect(formatRupiahSingkat(450_000)).toBe('450 rb');
  });

  it('di bawah seribu tampil apa adanya', () => {
    expect(formatRupiahSingkat(900)).toBe('900');
  });
});
