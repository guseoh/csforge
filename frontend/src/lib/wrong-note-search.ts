export interface WrongNoteSearch { page: number; area: string; status: string; review: string; sort: string }

const statuses = new Set(['', 'ACTIVE', 'MASTERED'])
const reviewFilters = new Set(['ALL', 'DUE', 'SCHEDULED', 'MASTERED', 'NONE'])
const sorts = new Set(['RECENT', 'WRONG_COUNT', 'REVIEW_DUE'])

export function parseWrongNoteSearch(search: Record<string, unknown>): WrongNoteSearch {
  const number = Number(search.page)
  const status = typeof search.status === 'string' && statuses.has(search.status) ? search.status : ''
  const review = typeof search.review === 'string' && reviewFilters.has(search.review) ? search.review : 'ALL'
  const sort = typeof search.sort === 'string' && sorts.has(search.sort) ? search.sort : 'RECENT'
  return {
    page: Number.isInteger(number) && number >= 0 ? number : 0,
    area: typeof search.area === 'string' ? search.area : '',
    status,
    review,
    sort,
  }
}
