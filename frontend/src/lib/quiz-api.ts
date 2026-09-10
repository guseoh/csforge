import { request } from './http'

export type QuestionType = 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'DESCRIPTIVE' | 'SCENARIO'
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type QuizQuestionState = 'ALL' | 'UNSEEN' | 'WRONG' | 'REVIEW_NEEDED'
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
  source: 'STANDARD' | 'WRONG_RETRY' | 'REVIEW'
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
  source: 'STANDARD' | 'WRONG_RETRY' | 'REVIEW'
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
  source: 'STANDARD' | 'WRONG_RETRY' | 'REVIEW'
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
