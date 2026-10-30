export interface ReviewSearch { page: number; due: string }

const dueWindows = new Set(['ALL', 'OVERDUE', 'DUE', 'NEXT_24H', 'NEXT_7D'])

export function parseReviewSearch(search: Record<string, unknown>): ReviewSearch {
  const number = Number(search.page)
  const due = typeof search.due === 'string' && dueWindows.has(search.due) ? search.due : 'ALL'
  return { page: Number.isInteger(number) && number >= 0 ? number : 0, due }
}
