export type LearningStatus = 'UNSEEN' | 'LEARNING' | 'COMPLETED' | 'REVIEW_NEEDED'
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type ReferenceType =
  | 'OFFICIAL'
  | 'KOREAN_BLOG'
  | 'COMPANY_TECH_BLOG'
  | 'BOOK'
  | 'PAPER'
  | 'COURSE'
  | 'OTHER'

export interface LevelProgress {
  total: number
  completed: number
}

export interface AreaSummary {
  id: number
  slug: string
  name: string
  description: string | null
  topicCount: number
  publishedConceptCount: number
  completedConceptCount: number
  bookmarkedConceptCount: number
  level1: LevelProgress
  level2: LevelProgress
  level3: LevelProgress
}

export interface TopicSummary {
  id: number
  slug: string
  title: string
  description: string | null
  publishedConceptCount: number
  completedConceptCount: number
  bookmarkedConceptCount: number
  level1Count: number
  level2Count: number
  level3Count: number
  unseenCount: number
  learningCount: number
  reviewNeededCount: number
}

export interface AreaDetail {
  id: number
  slug: string
  name: string
  description: string | null
  topics: TopicSummary[]
}

export interface ConceptListItem {
  id: number
  areaSlug: string
  areaName: string
  topicId: number
  topicSlug: string
  topicTitle: string
  title: string
  summary: string | null
  level: number
  contentStatus: ContentStatus
  learningStatus: LearningStatus
  bookmarked: boolean
  lastViewedAt: string | null
}

export interface ConceptPage {
  items: ConceptListItem[]
  page: {
    page: number
    size: number
    totalElements: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

export interface ProgressState {
  learningStatus: LearningStatus
  bookmarked: boolean
  firstViewedAt: string | null
  lastViewedAt: string | null
  completedAt: string | null
}

export interface ReferenceDetail {
  id: number
  url: string
  title: string
  type: ReferenceType
  language: string | null
  depth: string | null
  recommendation: string | null
  displayOrder: number
  relationNote: string | null
}

export interface ConceptNavigation {
  id: number
  title: string
  level: number
}

export interface ConceptDetail {
  id: number
  contentKey: string
  slug: string
  title: string
  summary: string | null
  contentMarkdown: string
  level: number
  contentStatus: ContentStatus
  area: { id: number; slug: string; name: string }
  topic: { id: number; slug: string; title: string }
  progress: ProgressState
  references: ReferenceDetail[]
  personalNote: { content: string; updatedAt: string } | null
  previous: ConceptNavigation | null
  next: ConceptNavigation | null
  relatedConcepts: ConceptNavigation[]
}

export interface ProgressResponse {
  learningStatus: LearningStatus
  bookmarked: boolean
  firstViewedAt: string | null
  lastViewedAt: string | null
  completedAt: string | null
}

export interface NoteResponse {
  content: string
  updatedAt: string
}

export class ApiRequestError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
  }
}

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new ApiRequestError(body?.message ?? '요청을 처리하지 못했습니다.', response.status)
  }
  return response.json() as Promise<T>
}

export function getLearningAreas(): Promise<AreaSummary[]> {
  return request<AreaSummary[]>('/api/learning-areas')
}

export function getLearningArea(areaSlug: string): Promise<AreaDetail> {
  return request<AreaDetail>(`/api/learning-areas/${encodeURIComponent(areaSlug)}`)
}

export function getConcepts(filters: {
  area?: string
  topic?: number
  level?: number
  learningStatus?: LearningStatus
  bookmarked?: boolean
  q?: string
  page: number
  size: number
  sort: string
}): Promise<ConceptPage> {
  const params = new URLSearchParams()
  if (filters.area) params.set('area', filters.area)
  if (filters.topic) params.set('topic', String(filters.topic))
  if (filters.level) params.set('level', String(filters.level))
  if (filters.learningStatus) params.set('learningStatus', filters.learningStatus)
  if (filters.bookmarked) params.set('bookmarked', 'true')
  if (filters.q) params.set('q', filters.q)
  params.set('page', String(filters.page))
  params.set('size', String(filters.size))
  params.set('sort', filters.sort)
  return request<ConceptPage>(`/api/concepts?${params.toString()}`)
}

export function getConcept(conceptId: number): Promise<ConceptDetail> {
  return request<ConceptDetail>(`/api/concepts/${conceptId}`)
}

export function recordConceptView(conceptId: number): Promise<ProgressResponse> {
  return request<ProgressResponse>(`/api/concepts/${conceptId}/view`, { method: 'POST' })
}

export function updateConceptProgress(
  conceptId: number,
  payload: { status?: Exclude<LearningStatus, 'UNSEEN'>; bookmarked?: boolean },
): Promise<ProgressResponse> {
  return request<ProgressResponse>(`/api/concepts/${conceptId}/progress`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function savePersonalNote(conceptId: number, content: string): Promise<NoteResponse> {
  return request<NoteResponse>(`/api/concepts/${conceptId}/note`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
}
