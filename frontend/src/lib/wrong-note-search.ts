export interface WrongNoteSearch { page: number; area: string; topic: string; level: string; difficulty: string; status: string; review: string; analysis: string; sort: string }

export const defaultWrongNoteSearch: WrongNoteSearch = {
  page: 0,
  area: '',
  topic: '',
  level: '',
  difficulty: '',
  status: '',
  review: 'ALL',
  analysis: 'ALL',
  sort: 'RECENT',
}

const statuses = new Set(['', 'ACTIVE', 'MASTERED'])
const levels = new Set(['', '1', '2', '3'])
const difficulties = new Set(['', 'EASY', 'MEDIUM', 'HARD'])
const reviewFilters = new Set(['ALL', 'DUE', 'SCHEDULED', 'MASTERED', 'NONE'])
const analysisFilters = new Set(['ALL', 'NOT_REQUESTED', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])
const sorts = new Set(['RECENT', 'WRONG_COUNT', 'REVIEW_DUE'])

export function parseWrongNoteSearch(search: Record<string, unknown>): WrongNoteSearch {
  const number = Number(search.page)
  const status = typeof search.status === 'string' && statuses.has(search.status) ? search.status : ''
  const level = typeof search.level === 'string' && levels.has(search.level) ? search.level : ''
  const difficulty = typeof search.difficulty === 'string' && difficulties.has(search.difficulty) ? search.difficulty : ''
  const review = typeof search.review === 'string' && reviewFilters.has(search.review) ? search.review : 'ALL'
  const analysis = typeof search.analysis === 'string' && analysisFilters.has(search.analysis) ? search.analysis : 'ALL'
  const sort = typeof search.sort === 'string' && sorts.has(search.sort) ? search.sort : 'RECENT'
  return {
    page: Number.isInteger(number) && number >= 0 ? number : 0,
    area: typeof search.area === 'string' ? search.area : '',
    topic: typeof search.topic === 'string' && /^\d+$/.test(search.topic) ? search.topic : '',
    level,
    difficulty,
    status,
    review,
    analysis,
    sort,
  }
}
