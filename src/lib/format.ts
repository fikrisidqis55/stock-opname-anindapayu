export function formatRupiah(value: number): string {
  const abs = Math.abs(value).toLocaleString('id-ID');
  return value < 0 ? `-Rp ${abs}` : `Rp ${abs}`;
}

// Bentuk ringkas untuk label grafik: 1,2 jt / 450 rb (desimal koma id-ID).
export function formatRupiahSingkat(value: number): string {
  const round1 = (v: number) =>
    (Math.round(v * 10) / 10).toLocaleString('id-ID');
  if (value >= 1_000_000) return `${round1(value / 1_000_000)} jt`;
  if (value >= 1_000) return `${round1(value / 1_000)} rb`;
  return String(value);
}

export function formatTanggal(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatWaktu(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
