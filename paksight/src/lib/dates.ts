export {};

export function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseDateYYYYMMDD(s?: string | null): Date | null {
  if (!s) return null;
  const m = /^\d{4}-\d{2}-\d{2}$/.test(s);
  if (!m) return null;
  const d = new Date(s + "T00:00:00Z");
  if (isNaN(d.getTime())) return null;
  return d;
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3600 * 1000);
}

export function addDays(date: Date, days: number): Date {
  return addHours(date, days * 24);
}