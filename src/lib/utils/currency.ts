/**
 * Money handling utilities. Amounts are stored/manipulated as plain numbers
 * representing whole pesos (matching the schema in the project spec).
 * All validation here exists because financial data must never be trusted
 * blindly from the client and must be re-validated before any write.
 */

export function formatCurrency(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `\u20b1${safe.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0;
}

export function isValidPrice(price: number): boolean {
  return Number.isFinite(price) && price >= 0;
}

export function isValidMoneyAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount >= 0;
}

export function calculateSubtotal(unitPrice: number, quantity: number): number {
  return roundToCents(unitPrice * quantity);
}

export function calculateTotal(items: { subtotal: number }[]): number {
  return roundToCents(items.reduce((sum, item) => sum + item.subtotal, 0));
}

export function calculateChange(amountReceived: number, total: number): number {
  return roundToCents(amountReceived - total);
}

export function hasSufficientPayment(amountReceived: number, total: number): boolean {
  return amountReceived >= total;
}

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}
