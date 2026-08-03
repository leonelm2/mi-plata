/**
 * Format a number as Argentine Peso currency.
 */
export function formatCurrency(amount: number, currency = 'ARS'): string {
  if (currency === 'ARS') {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string (YYYY-MM-DD) as a readable date in Spanish.
 */
export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format a date string as short form (e.g. "3 ago")
 */
export function formatDateShort(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Get the start of the current month as YYYY-MM-DD
 */
export function startOfMonthStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Return the YYYY-MM prefix of a date string
 */
export function getYearMonth(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/**
 * Return the current YYYY-MM
 */
export function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Return the previous YYYY-MM
 */
export function previousYearMonth(): string {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get the week number within the current month (1-5)
 */
export function weekOfMonth(dateStr: string): number {
  const [, , day] = dateStr.split('-').map(Number);
  const [year, month] = dateStr.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const offset = firstDay.getDay(); // 0=Sunday
  return Math.ceil((day + offset) / 7);
}

