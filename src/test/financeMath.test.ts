import { describe, it, expect } from 'vitest';
import { toCents, fromCents, addMoney, subtractMoney, sumMoney, calculatePercentage } from '../lib/financeMath';

describe('financeMath (Precision Financial Engine)', () => {
  it('prevents standard JavaScript floating point addition bugs', () => {
    // In standard JS: 0.1 + 0.2 === 0.30000000000000004
    const jsResult = 0.1 + 0.2;
    expect(jsResult).not.toBe(0.3);

    // With financeMath engine:
    const safeResult = addMoney(0.1, 0.2);
    expect(safeResult).toBe(0.3);
  });

  it('correctly handles subtraction without floating point inaccuracies', () => {
    expect(subtractMoney(10.5, 0.2)).toBe(10.3);
    expect(subtractMoney(100.05, 50.02)).toBe(50.03);
  });

  it('accurately sums large arrays of amounts', () => {
    const amounts = [12.99, 45.50, 0.01, 100.15, 30.35];
    expect(sumMoney(amounts)).toBe(189.0);
  });

  it('calculates bounded percentages correctly', () => {
    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(150, 100)).toBe(100); // capped at 100%
    expect(calculatePercentage(0, 0)).toBe(0);
    expect(calculatePercentage(33.33, 100)).toBe(33.3);
  });

  it('converts to and from cents reliably', () => {
    expect(toCents(15.99)).toBe(1599);
    expect(fromCents(1599)).toBe(15.99);
  });
});
