export interface WrongNoteSearch { page: number; area: string; status: string; review: string; sort: string }

export function parseWrongNoteSearch(search: Record<string, unknown>): WrongNoteSearch {
  const number = Number(search.page)
  return { page: Number.isInteger(number) && number >= 0 ? number : 0, area: typeof search.area === 'string' ? search.area : '', status: typeof search.status === 'string' ? search.status : '', review: typeof search.review === 'string' ? search.review : 'ALL', sort: typeof search.sort === 'string' ? search.sort : 'RECENT' }
}
