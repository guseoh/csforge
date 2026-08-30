export interface ReviewSearch { page: number; due: string }

export function parseReviewSearch(search: Record<string, unknown>): ReviewSearch {
  const number = Number(search.page)
  return { page: Number.isInteger(number) && number >= 0 ? number : 0, due: typeof search.due === 'string' ? search.due : 'ALL' }
}
