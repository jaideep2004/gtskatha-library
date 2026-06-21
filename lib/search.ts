export const MIN_SEARCH_QUERY_LENGTH = 2;

export function isSearchQueryReady(value: string): boolean {
  return value.trim().length >= MIN_SEARCH_QUERY_LENGTH;
}
