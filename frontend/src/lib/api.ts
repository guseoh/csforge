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
  if (response.status === 204) return null as T
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
  params.set('sort', filters.sort.toUpperCase())
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

export type QuestionType = 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'DESCRIPTIVE' | 'SCENARIO'
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type QuizQuestionState = 'ALL' | 'UNSEEN'
export type QuizSessionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED'
export type AttemptGradingStatus = 'UNANSWERED' | 'GRADED' | 'SELF_CHECK_REQUIRED' | 'SELF_CHECKED'

export interface QuizAvailability {
  availableCount: number
}

export interface QuizCreated {
  quizId: number
  status: QuizSessionStatus
  questionCount: number
  startedAt: string
  expiresAt: string | null
  lastPosition: number
}

export interface QuizRetry {
  quizId: number
  status: QuizSessionStatus
  questionCount: number
  startedAt: string
  expiresAt: string | null
}

export interface QuizActive {
  quizId: number
  questionCount: number
  answeredCount: number
  lastPosition: number
  startedAt: string
  expiresAt: string | null
}

export interface QuizConcept {
  id: number
  slug: string
  title: string
  areaSlug: string
  areaName: string
  level: number
}

export interface QuizSavedAnswer {
  selectedChoiceKey: string | null
  answerText: string | null
  reviewNeeded: boolean
  answeredAt: string | null
}

export interface QuizQuestion {
  questionId: number
  position: number
  promptMarkdown: string
  questionType: QuestionType
  difficulty: QuestionDifficulty
  concepts: QuizConcept[]
  choices: { choiceKey: string; contentMarkdown: string }[]
  answer: QuizSavedAnswer | null
}

export interface QuizSession {
  quizId: number
  status: QuizSessionStatus
  startedAt: string
  submittedAt: string | null
  completedAt: string | null
  expiresAt: string | null
  expired: boolean
  lastPosition: number
  answeredCount: number
  questions: QuizQuestion[]
}

export interface QuizSubmission {
  quizId: number
  status: QuizSessionStatus
  submittedAt: string
  completedAt: string | null
  selfCheckPendingCount: number
}

export interface QuizQuestionResult {
  questionId: number
  position: number
  promptMarkdown: string
  questionType: QuestionType
  difficulty: QuestionDifficulty
  concepts: QuizConcept[]
  selectedChoiceKey: string | null
  answerText: string | null
  reviewNeeded: boolean
  gradingStatus: AttemptGradingStatus
  correct: boolean | null
  correctChoiceKey: string | null
  acceptedAnswers: string[]
  modelAnswer: string | null
  explanationMarkdown: string | null
  answeredAt: string | null
  gradedAt: string | null
}

export interface QuizResult {
  quizId: number
  status: QuizSessionStatus
  total: number
  correct: number
  wrong: number
  unanswered: number
  selfCheckPending: number
  accuracy: number | null
  breakdown: {
    areaSlug: string
    areaName: string
    topicSlug: string
    topicTitle: string
    total: number
    correct: number
    wrong: number
    unanswered: number
    selfCheckPending: number
  }[]
  questions: QuizQuestionResult[]
}

export interface QuizSetupPayload {
  areas: string[]
  concepts: number[]
  levels: number[]
  difficulties: QuestionDifficulty[]
  questionTypes: QuestionType[]
  state: QuizQuestionState
  count: number
  timeLimitSeconds: number | null
}

function appendList<T>(params: URLSearchParams, key: string, values: T[]) {
  values.forEach((value) => params.append(key, String(value)))
}

export function getQuizAvailability(filters: Omit<QuizSetupPayload, 'count' | 'timeLimitSeconds'>): Promise<QuizAvailability> {
  const params = new URLSearchParams({ state: filters.state })
  appendList(params, 'area', filters.areas)
  appendList(params, 'concept', filters.concepts)
  appendList(params, 'level', filters.levels)
  appendList(params, 'difficulty', filters.difficulties)
  appendList(params, 'questionType', filters.questionTypes)
  return request<QuizAvailability>(`/api/quizzes/availability?${params.toString()}`)
}

export function createQuiz(payload: QuizSetupPayload): Promise<QuizCreated> {
  return request<QuizCreated>('/api/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function getActiveQuiz(): Promise<QuizActive | null> {
  return request<QuizActive | null>('/api/quizzes/active')
}

export function getQuizSession(quizId: number): Promise<QuizSession> {
  return request<QuizSession>(`/api/quizzes/${quizId}`)
}

export function saveQuizAnswer(
  quizId: number,
  questionId: number,
  payload: { selectedChoiceKey: string | null; answerText: string | null; reviewNeeded: boolean },
): Promise<QuizSavedAnswer> {
  return request<QuizSavedAnswer>(`/api/quizzes/${quizId}/questions/${questionId}/answer`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function saveQuizPosition(quizId: number, position: number): Promise<void> {
  return request<void>(`/api/quizzes/${quizId}/position`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ position }),
  })
}

export function submitQuiz(quizId: number): Promise<QuizSubmission> {
  return request<QuizSubmission>(`/api/quizzes/${quizId}/submit`, { method: 'POST' })
}

export function getQuizResult(quizId: number): Promise<QuizResult> {
  return request<QuizResult>(`/api/quizzes/${quizId}/result`)
}

export function selfCheckQuizQuestion(quizId: number, questionId: number, correct: boolean): Promise<{ quizId: number; questionId: number; correct: boolean; sessionStatus: QuizSessionStatus }> {
  return request(`/api/quizzes/${quizId}/questions/${questionId}/self-check`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correct }),
  })
}

export function retryWrongQuiz(quizId: number): Promise<QuizRetry> {
  return request<QuizRetry>(`/api/quizzes/${quizId}/retry-wrong`, { method: 'POST' })
}
