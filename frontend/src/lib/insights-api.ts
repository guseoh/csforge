import { request } from './http'

export type LearningInsightsRange = '7d' | '30d'

export interface LearningInsightsPeriod {
  from: string
  through: string
  finalizedAttempts: number
  correctAttempts: number
  wrongAttempts: number
  uniqueQuestions: number
  pendingSelfCheck: number
  viewedConcepts: number
  accuracyPercent: number | null
}

export interface WeakLearningConcept {
  conceptId: number
  title: string
  areaSlug: string
  areaName: string
  wrongAttempts: number
  dueQuestions: number
  lastWrongAt: string
  distinctQuestions: number
  correctQuestions: number
  evidenceAccuracyPercent: number | null
  assessmentStatus: 'NOT_ENOUGH_EVIDENCE' | 'NEEDS_PRACTICE' | 'DEVELOPING' | 'CONSISTENT'
}

export interface LearningInsights {
  asOf: string
  studyDate: string
  zoneId: string
  range: LearningInsightsRange
  area: string | null
  current: LearningInsightsPeriod
  previous: LearningInsightsPeriod
  comparable: boolean
  comparisonReason: string
  overdueCount: number
  dueNowCount: number
  weakConcepts: WeakLearningConcept[]
}

export function getLearningInsights(range: LearningInsightsRange, area: string): Promise<LearningInsights> {
  const params = new URLSearchParams({ range })
  if (area) params.set('area', area)
  return request<LearningInsights>(`/api/learning-insights?${params.toString()}`)
}
