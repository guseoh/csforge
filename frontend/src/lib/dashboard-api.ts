import { request } from './http'
import type { QuizCreated, QuizSessionStatus } from './quiz-api'

export interface DashboardToday {
  solvedCount: number
  correctCount: number
  wrongCount: number
  accuracyPercent: number
  reviewDueCount: number
}

export interface DashboardHeatmapDay {
  date: string
  conceptsViewed: number
  questionsSolved: number
  activityCount: number
}

export interface DashboardLevelProgress {
  level: number
  completed: number
  total: number
  completionPercent: number
}

export interface DashboardAreaProgress {
  areaSlug: string
  areaName: string
  completedConceptCount: number
  publishedConceptCount: number
  completionPercent: number
  levels: DashboardLevelProgress[]
}

export interface DashboardWeakTopic {
  topicId: number
  topicContentKey: string
  topicTitle: string
  areaSlug: string
  areaName: string
  attemptCount: number
  correctCount: number
  wrongCount: number
  accuracyPercent: number
}

export interface DashboardRecentQuiz {
  quizId: number
  source: QuizCreated['source']
  status: QuizSessionStatus
  startedAt: string
  submittedAt: string | null
  completedAt: string | null
  totalCount: number
  finalizedCount: number
  correctCount: number
  wrongCount: number
  pendingSelfCheckCount: number
  accuracyPercent: number
}

export interface DashboardActiveQuiz {
  quizId: number
  questionCount: number
  answeredCount: number
  lastPosition: number
  startedAt: string
  expiresAt: string | null
}

export interface Dashboard {
  asOf: string
  studyDate: string
  zoneId: string
  today: DashboardToday
  currentStreak: number
  heatmap: DashboardHeatmapDay[]
  areaProgress: DashboardAreaProgress[]
  weakTopics: DashboardWeakTopic[]
  recentQuizzes: DashboardRecentQuiz[]
  activeQuiz: DashboardActiveQuiz | null
}

export function getDashboard(): Promise<Dashboard> {
  return request('/api/dashboard')
}
