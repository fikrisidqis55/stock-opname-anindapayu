export function weightedAverageCost(
  oldQty: number,
  oldCost: number,
  newQty: number,
  newCost: number,
): number {
  const totalQty = oldQty + newQty;
  if (totalQty <= 0) return 0;
  return Math.round((oldQty * oldCost + newQty * newCost) / totalQty);
}

export function opnameDiffValue(diffQty: number, priceModal: number): number {
  return diffQty * priceModal;
}

// Password rotasi owner: `AnindaDDMM!` mengikuti tanggal WIB.
// `offsetHari` -1 dipakai sebagai grace period lewat tengah malam.
export function passwordHarian(offsetHari = 0, now: Date = new Date()): string {
  const d = new Date(now.getTime() + offsetHari * 86_400_000);
  const parts = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
  }).formatToParts(d);
  const dd = parts.find((p) => p.type === 'day')?.value ?? '01';
  const mm = parts.find((p) => p.type === 'month')?.value ?? '01';
  return `Aninda${dd}${mm}!`;
}
