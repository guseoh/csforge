/** URL search is intentionally tolerant; invalid IDs never trigger API calls. */
export type CompareSearch = { left?: number; right?: number }
function id(value: unknown): number | undefined {
  if (typeof value !== 'number' && typeof value !== 'string') return undefined
  if (String(value).trim() === '') return undefined
  const number = Number(value)
  return Number.isSafeInteger(number) && number > 0 ? number : undefined
}
export function parseCompareSearch(search: Record<string, unknown>): CompareSearch {
  return { left: id(search.left), right: id(search.right) }
}
