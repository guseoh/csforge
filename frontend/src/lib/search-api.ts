import { ApiRequestError } from './api'

export type SearchDocumentType = 'CONCEPT' | 'QUESTION' | 'PERSONAL_NOTE' | 'WRONG_NOTE' | 'REFERENCE'
export type SearchSort = 'RELEVANCE' | 'RECENT' | 'TITLE'
export type SearchProductState = 'READY' | 'NOT_READY' | 'UNAVAILABLE' | 'REINDEXING'

export interface SearchResultItem {
  documentType: SearchDocumentType
  sourceId: number
  title: string
  highlightedTitle: string
  snippet: string
  areaSlugs: string[]
  areaNames: string[]
  topicContentKeys: string[]
  topicTitles: string[]
  levels: number[]
  updatedAt: string
  conceptId: number | null
  questionId: number | null
  referenceUrl: string | null
}

export interface SearchPage {
  query: string
  page: number
  size: number
  totalHits: number
  totalPages: number
  tookMillis: number
  items: SearchResultItem[]
}

export interface SearchSuggestion {
  documentType: SearchDocumentType
  sourceId: number
  title: string
  conceptId: number | null
  questionId: number | null
  referenceUrl: string | null
}

export interface SearchFilterArea {
  areaSlug: string
  areaName: string
  topics: { contentKey: string; title: string }[]
}

export interface SearchStatus {
  state: SearchProductState
  indexedDocuments: number
  pendingOutboxEvents: number
}

export interface SearchReindexResult {
  startedAt: string
  completedAt: string
  baselineSequence: number
  highWaterSequence: number
  targetIndex: string
  indexedCounts: Partial<Record<SearchDocumentType, number>>
  totalIndexedCount: number
}

async function searchRequest<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new ApiRequestError(body?.message ?? 'Search 요청을 처리하지 못했습니다.', response.status)
  }
  return response.json() as Promise<T>
}

function appendCsv(params: URLSearchParams, key: string, value: string) {
  value.split(',').map((item) => item.trim()).filter(Boolean).forEach((item) => params.append(key, item))
}

export function searchDocuments(filters: {
  q: string
  types: string
  areas: string
  topics: string
  levels: string
  sort: SearchSort
  page: number
  size?: number
}): Promise<SearchPage> {
  const params = new URLSearchParams({
    q: filters.q,
    sort: filters.sort,
    page: String(filters.page),
    size: String(filters.size ?? 20),
  })
  appendCsv(params, 'type', filters.types)
  appendCsv(params, 'area', filters.areas)
  appendCsv(params, 'topic', filters.topics)
  appendCsv(params, 'level', filters.levels)
  return searchRequest<SearchPage>(`/api/search?${params.toString()}`)
}

export function getSearchSuggestions(q: string, size = 8): Promise<SearchSuggestion[]> {
  const params = new URLSearchParams({ q, size: String(size) })
  return searchRequest<SearchSuggestion[]>(`/api/search/suggestions?${params.toString()}`)
}

export function getSearchFilterOptions(): Promise<SearchFilterArea[]> {
  return searchRequest<SearchFilterArea[]>('/api/search/filter-options')
}

export function getSearchStatus(): Promise<SearchStatus> {
  return searchRequest<SearchStatus>('/api/search/status')
}

export function reindexSearch(): Promise<SearchReindexResult> {
  return searchRequest<SearchReindexResult>('/api/search/reindex', { method: 'POST' })
}
