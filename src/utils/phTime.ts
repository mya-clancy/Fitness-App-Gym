/**
 * Philippine Timezone (Asia/Manila, UTC+8) Utilities
 * Ensures all daily resets, calendar navigation, and macro progress
 * strictly follow Philippine Standard Time (PST, UTC+8).
 */

export function getPhilippineDateString(date: Date = new Date()): string {
  // 'en-CA' outputs ISO formatted YYYY-MM-DD directly
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

export function getPhilippineTimeString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  return formatter.format(date);
}

export function formatPhilippineDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isTodayInPhilippineTime(dateStr: string): boolean {
  return dateStr === getPhilippineDateString();
}

export function parseYearMonth(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const now = new Date();
  return {
    year: y || now.getFullYear(),
    month: m ? m - 1 : now.getMonth(), // 0-indexed
    day: d || now.getDate(),
  };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfWeekInMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function formatToDateString(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

