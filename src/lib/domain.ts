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
