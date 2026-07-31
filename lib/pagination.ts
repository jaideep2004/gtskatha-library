export const PAGE_SIZES = [5, 15, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 20;

function first(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parsePage(value?: string | string[]): number {
  const parsed = Number.parseInt(first(value) ?? '', 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

export function parsePageSize(value?: string | string[], sizes = PAGE_SIZES): number {
  const parsed = Number.parseInt(first(value) ?? '', 10);
  return (sizes as readonly number[]).includes(parsed) ? parsed : DEFAULT_PAGE_SIZE;
}
