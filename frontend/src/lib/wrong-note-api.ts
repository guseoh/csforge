import { request } from './http'
import type {
  AttemptGradingStatus,
  QuestionDifficulty,
  QuestionType,
  QuizConcept,
  QuizCreated,
} from './quiz-api'

export type WrongNoteStatus = 'ACTIVE' | 'MASTERED'
export type ReviewScheduleStatus = 'SCHEDULED' | 'MASTERED'

export interface WrongNoteListItem {
  questionId: number
  promptMarkdown: string
  questionType: QuestionType
  difficulty: QuestionDifficulty
  concepts: QuizConcept[]
  wrongCount: number
  lastWrongAt: string
  status: WrongNoteStatus
  aiAnalysisStatus: Exclude<WrongAnswerAnalysisStatus, 'PROVIDER_NOT_CONFIGURED'>
  reviewStatus: ReviewScheduleStatus | null
  reviewStage: number | null
  dueAt: string | null
}

export interface WrongNotePage {
  items: WrongNoteListItem[]
  page: { page: number; size: number; totalElements: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }
}

export interface WrongNoteDetail {
  question: { id: number; promptMarkdown: string; questionType: QuestionType; difficulty: QuestionDifficulty; explanationMarkdown: string | null }
  concepts: QuizConcept[]
  latestWrongAttempt: {
    attemptId: number
    quizId: number
    source: string
    selectedChoiceKey: string | null
    answerText: string | null
    gradingStatus: AttemptGradingStatus
    correct: boolean | null
    reviewNeeded: boolean
    answeredAt: string | null
    gradedAt: string | null
  } | null
  answer: { correctChoiceKey: string | null; acceptedAnswers: string[]; modelAnswer: string | null }
  state: {
    status: WrongNoteStatus
    wrongCount: number
    firstWrongAt: string
    lastWrongAt: string
    causeNote: string | null
    reviewStatus: ReviewScheduleStatus | null
    reviewStage: number | null
    dueAt: string | null
  }
}

export interface WrongNoteAttempt {
  attemptId: number
  quizId: number
  source: string
  selectedChoiceKey: string | null
  answerText: string | null
  gradingStatus: AttemptGradingStatus
  correct: boolean | null
  reviewNeeded: boolean
  answeredAt: string | null
  gradedAt: string | null
  updatedAt: string
}

export interface WrongNoteAttemptPage {
  items: WrongNoteAttempt[]
  nextCursor: string | null
}

export type WrongAnswerAnalysisStatus =
  | 'NOT_REQUESTED'
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'PROVIDER_NOT_CONFIGURED'

export interface WrongAnswerAnalysisRelatedConcept extends QuizConcept {
  contentKey: string
}

export interface WrongAnswerAnalysisResult {
  whyWrong: string
  missedConcepts: string[]
  correctUnderstanding: string
  relatedConceptKeys: string[]
  relatedConcepts: WrongAnswerAnalysisRelatedConcept[]
  followUpQuestions: string[]
}

export interface WrongAnswerAnalysis {
  questionId: number
  attemptId: number | null
  status: WrongAnswerAnalysisStatus
  available: boolean
  providerConfigured: boolean
  retryable: boolean
  result: WrongAnswerAnalysisResult | null
  requestedAt: string | null
  startedAt: string | null
  completedAt: string | null
  failedAt: string | null
  errorCode: string | null
  errorMessage: string | null
}

export function getWrongNotes(filters: {
  area?: string
  topic?: number
  level?: number
  difficulty?: QuestionDifficulty
  status?: WrongNoteStatus
  review?: string
  analysis?: Exclude<WrongAnswerAnalysisStatus, 'PROVIDER_NOT_CONFIGURED'>
  sort?: string
  page: number
  size: number
}): Promise<WrongNotePage> {
  const params = new URLSearchParams({
    page: String(filters.page),
    size: String(filters.size),
    review: filters.review ?? 'ALL',
    analysis: filters.analysis ?? 'ALL',
    sort: filters.sort ?? 'RECENT',
  })
  if (filters.area) params.set('area', filters.area)
  if (filters.topic) params.set('topic', String(filters.topic))
  if (filters.level) params.set('level', String(filters.level))
  if (filters.difficulty) params.set('difficulty', filters.difficulty)
  if (filters.status) params.set('status', filters.status)
  return request<WrongNotePage>(`/api/wrong-notes?${params.toString()}`)
}

export function getWrongNote(questionId: number): Promise<WrongNoteDetail> {
  return request(`/api/wrong-notes/${questionId}`)
}

export function getWrongNoteAttempts(questionId: number, cursor?: string): Promise<WrongNoteAttemptPage> {
  const params = new URLSearchParams({ size: '20' })
  if (cursor) params.set('cursor', cursor)
  return request(`/api/wrong-notes/${questionId}/attempts?${params.toString()}`)
}

export function saveWrongNote(questionId: number, content: string): Promise<{ content: string; updatedAt: string }> {
  return request(`/api/wrong-notes/${questionId}/note`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
}

export function retryWrongNote(questionId: number): Promise<QuizCreated> {
  return request(`/api/wrong-notes/${questionId}/retry`, { method: 'POST' })
}

export function getWrongNoteAiAnalysis(questionId: number): Promise<WrongAnswerAnalysis> {
  return request(`/api/wrong-notes/${questionId}/ai-analysis`)
}

export function requestWrongNoteAiAnalysis(questionId: number): Promise<WrongAnswerAnalysis> {
  return request(`/api/wrong-notes/${questionId}/ai-analysis`, { method: 'POST' })
}

export function retryWrongNoteAiAnalysis(questionId: number): Promise<WrongAnswerAnalysis> {
  return request(`/api/wrong-notes/${questionId}/ai-analysis/retry`, { method: 'POST' })
}
