export interface WrongNoteSearch { page: number; area: string; topic: string; level: string; difficulty: string; status: string; review: string; analysis: string; sort: string }

export type WrongNoteFilterKey = Exclude<keyof WrongNoteSearch, 'page' | 'area'>

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

export function withWrongNoteFilter(search: WrongNoteSearch, key: WrongNoteFilterKey, value: string): WrongNoteSearch {
  return { ...search, [key]: value, page: 0 }
}

export function withWrongNoteArea(search: WrongNoteSearch, area: string): WrongNoteSearch {
  return { ...search, area, topic: '', page: 0 }
}

export function withWrongNotePage(search: WrongNoteSearch, page: number): WrongNoteSearch {
  return { ...search, page: Number.isInteger(page) && page >= 0 ? page : 0 }
}

/** 닫힌 추가 필터에 적용된 URL 상태가 있는지 요약한다. */
export function countAdvancedWrongNoteFilters(search: WrongNoteSearch) {
  return [search.area, search.topic, search.level, search.difficulty, search.analysis === 'ALL' ? '' : search.analysis]
    .filter(Boolean)
    .length
}
