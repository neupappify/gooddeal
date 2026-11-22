import { formatNumber } from "@neup/numbering-system";

// Format listing prices using Nepal's readable lakh and crore grouping.
export function formatListingPrice(amount: number | null): string {
  if (amount === null) return "Price on request";
  return `NRs. ${formatNumber(amount, "Indian.readable")}`;
}
