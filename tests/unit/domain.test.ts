import { describe, expect, it } from 'vitest';
import { opnameDiffValue, weightedAverageCost } from '@/lib/domain';

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
