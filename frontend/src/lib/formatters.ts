import type { Tone } from '@/types/api';

/**
 * Format a number with space-separated thousands.
 * e.g. 350000 → "350 000 Ft"
 *      1234.56 → "1 234,56 €"
 * Uses regular spaces (not NBSP) so the font renders cleanly.
 */
function formatWithSpaces(n: number, fractionDigits: number): string {
  const fixed = Math.abs(n).toFixed(fractionDigits);
  const [intPart, decPart] = fixed.split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const sign = n < 0 ? '−' : '';
  return decPart ? `${sign}${grouped},${decPart}` : `${sign}${grouped}`;
}

export function fmtCurrency(amount: number, currency = 'HUF'): string {
  if (currency === 'EUR') return `${formatWithSpaces(amount, 2)} €`;
  return `${formatWithSpaces(amount, 0)} Ft`;
}

/**
 * Format a number for display in inputs (space-grouped, no currency symbol).
 * 350000 → "350 000"
 */
export function fmtNumber(n: number): string {
  return formatWithSpaces(n, 0);
}

export function fmtDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export function fmtMonthYear(date = new Date()): string {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function daysUntil(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function daysElapsed(): number {
  return new Date().getDate();
}

export interface PaceInfo {
  tone: Tone;
  label: string;
  projected: number;
  paceRatio: number;
  pctSpent: number;
}

export function paceInfo(
  spent: number,
  limit: number,
  elapsed: number,
  total: number,
): PaceInfo {
  if (limit <= 0) return { tone: 'neutral', label: 'No budget', projected: 0, paceRatio: 0, pctSpent: 0 };
  if (elapsed <= 0) return { tone: 'safe', label: 'On track', projected: 0, paceRatio: 0, pctSpent: 0 };

  const rate = spent / elapsed;
  const projected = rate * total;
  const pctSpent = limit > 0 ? spent / limit : 0;
  const pctElapsed = elapsed / total;
  const paceRatio = pctElapsed > 0 ? pctSpent / pctElapsed : 0;

  if (projected > limit * 1.05) {
    return { tone: 'danger', label: 'Breach predicted', projected, paceRatio, pctSpent };
  }
  if (paceRatio > 1.15) {
    return { tone: 'warn', label: 'Fast pace', projected, paceRatio, pctSpent };
  }
  return { tone: 'safe', label: 'On track', projected, paceRatio, pctSpent };
}

export function safeToSpendTone(amount: number, dailyBudget: number): Tone {
  if (dailyBudget <= 0) return 'neutral';
  const pct = amount / dailyBudget;
  if (pct >= 0.8) return 'safe';
  if (pct >= 0.5) return 'warn';
  return 'danger';
}
