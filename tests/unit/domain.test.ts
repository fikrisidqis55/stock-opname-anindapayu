import { describe, expect, it } from 'vitest';
import { opnameDiffValue, passwordHarian, weightedAverageCost } from '@/lib/domain';

describe('weightedAverageCost', () => {
  it('menghitung rata-rata tertimbang modal', () => {
    // stok lama 10 @5.000 + masuk 5 @6.000 => (50.000+30.000)/15 = 5.333,33 -> 5333
    expect(weightedAverageCost(10, 5000, 5, 6000)).toBe(5333);
  });

  it('stok lama nol mengembalikan modal baru', () => {
    expect(weightedAverageCost(0, 0, 4, 7500)).toBe(7500);
  });
});

describe('opnameDiffValue', () => {
  it('selisih kurang bernilai negatif', () => {
    expect(opnameDiffValue(-2, 5000)).toBe(-10000);
  });

  it('selisih lebih bernilai positif', () => {
    expect(opnameDiffValue(3, 4000)).toBe(12000);
  });
});

describe('passwordHarian', () => {
  it('format AnindaDDMM! sesuai tanggal WIB', () => {
    const t = new Date('2026-08-24T10:00:00+07:00');
    expect(passwordHarian(0, t)).toBe('Aninda2408!');
  });

  it('konversi UTC ke WIB lewat tengah malam', () => {
    // 17:30 UTC = 00:30 WIB hari berikutnya
    const t = new Date('2026-08-24T17:30:00Z');
    expect(passwordHarian(0, t)).toBe('Aninda2508!');
  });

  it('offset -1 mengembalikan password kemarin', () => {
    const t = new Date('2026-08-24T10:00:00+07:00');
    expect(passwordHarian(-1, t)).toBe('Aninda2308!');
  });

  it('hari & bulan satu digit diberi nol di depan', () => {
    const t = new Date('2026-01-05T09:00:00+07:00');
    expect(passwordHarian(0, t)).toBe('Aninda0501!');
  });
});
