import { format, isValid, type Locale } from 'date-fns';

export function parseDateSafe(value?: string | null): Date | null {
  if (!value?.trim()) return null;
  const raw = value.trim();
  const d = new Date(raw.includes('T') ? raw : `${raw}T00:00:00`);
  return isValid(d) ? d : null;
}

export function formatDateSafe(
  value: string | undefined,
  pattern: string,
  options?: { locale?: Locale; fallback?: string },
): string {
  const d = parseDateSafe(value);
  if (!d) return options?.fallback ?? '未设置';
  return format(d, pattern, { locale: options?.locale });
}

export function defaultTargetDateRange(createdAt?: string): { beginTime: string; endTime: string } {
  const base = parseDateSafe(createdAt?.slice(0, 10)) ?? new Date();
  const end = new Date(base);
  end.setDate(end.getDate() + 30);
  return {
    beginTime: format(base, 'yyyy-MM-dd'),
    endTime: format(end, 'yyyy-MM-dd'),
  };
}
