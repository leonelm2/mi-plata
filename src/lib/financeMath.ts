/**
 * Antigravity High-Precision Financial Mathematics Engine
 * Prevents JavaScript floating-point errors (e.g. 0.1 + 0.2 = 0.30000000000000004)
 * Stores and processes amounts internally as safe integers (cents/centavos).
 */

const FACTOR = 100; // 2 decimal places precision

/**
 * Converts a float currency amount to integer centavos
 */
export function toCents(amount: number): number {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  return Math.round(amount * FACTOR);
}

/**
 * Converts integer centavos back to floating currency amount
 */
export function fromCents(cents: number): number {
  return cents / FACTOR;
}

/**
 * Safely adds currency amounts without floating point drift
 */
export function addMoney(a: number, b: number): number {
  return fromCents(toCents(a) + toCents(b));
}

/**
 * Safely subtracts currency amounts without floating point drift
 */
export function subtractMoney(a: number, b: number): number {
  return fromCents(toCents(a) - toCents(b));
}

/**
 * Safely sums an array of currency amounts
 */
export function sumMoney(amounts: number[]): number {
  const totalCents = amounts.reduce((acc, curr) => acc + toCents(curr), 0);
  return fromCents(totalCents);
}

/**
 * Safely calculates percentage (0 - 100)
 */
export function calculatePercentage(part: number, total: number): number {
  if (total <= 0) return 0;
  const partCents = toCents(part);
  const totalCents = toCents(total);
  if (totalCents === 0) return 0;
  const pct = Math.min(100, Math.max(0, (partCents / totalCents) * 100));
  return Math.round(pct * 10) / 10;
}
