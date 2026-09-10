import { request } from './http'
import type { QuizConcept, QuizCreated, QuestionDifficulty, QuestionType } from './quiz-api'
import type { ReviewScheduleStatus } from './wrong-note-api'

export interface ReviewSummary {
  overdue: number
  dueNow: number
  next24Hours: number
  next7Days: number
  mastered: number
}

export interface ReviewListItem {
  questionId: number
  promptMarkdown: string
  questionType: QuestionType
  difficulty: QuestionDifficulty
  concepts: QuizConcept[]
  status: ReviewScheduleStatus
  stage: number
  dueAt: string | null
  lastReviewedAt: string | null
}

export interface ReviewPage {
  items: ReviewListItem[]
  page: { page: number; size: number; totalElements: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }
}

export function getReviewSummary(): Promise<ReviewSummary> {
  return request('/api/reviews/summary')
}

export function getReviews(filters: { due: string; status?: ReviewScheduleStatus; area?: string; page: number; size: number }): Promise<ReviewPage> {
  const params = new URLSearchParams({ due: filters.due, page: String(filters.page), size: String(filters.size) })
  if (filters.status) params.set('status', filters.status)
  if (filters.area) params.set('area', filters.area)
  return request(`/api/reviews?${params.toString()}`)
}

export function createReviewQuiz(count = 10): Promise<QuizCreated> {
  return request('/api/reviews/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count }),
  })
}

export function scheduleReview(questionId: number): Promise<{ questionId: number; status: ReviewScheduleStatus; stage: number; dueAt: string }> {
  return request(`/api/reviews/questions/${questionId}/schedule`, { method: 'POST' })
}
