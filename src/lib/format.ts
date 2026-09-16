/** Format a BDT amount, e.g. 1199 → "৳1,199". */
export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString("en-IN")}`;
}
