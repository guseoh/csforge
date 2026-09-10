import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CanonicalBootstrapStatus, Dashboard } from '../lib/api'

const mocks = vi.hoisted(() => ({
  query: { data: null as Dashboard | null, isPending: false, isError: false, refetch: vi.fn() },
  bootstrap: { data: null as CanonicalBootstrapStatus | null, isPending: false, isError: false, refetch: vi.fn() },
  navigate: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
  useNavigate: () => mocks.navigate,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: readonly unknown[] }) => queryKey[0] === 'canonical-bootstrap-status' ? mocks.bootstrap : mocks.query,
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useMutation: () => ({ isPending: false, isError: false, mutate: vi.fn() }),
}))

import { DashboardPage } from './DashboardPage'

function dashboard(overrides: Partial<Dashboard> = {}): Dashboard {
  return {
    asOf: '2026-09-03T14:30:00Z',
    studyDate: '2026-09-03',
    zoneId: 'Asia/Seoul',
    today: { solvedCount: 2, correctCount: 1, wrongCount: 1, accuracyPercent: 50, reviewDueCount: 2 },
    currentStreak: 2,
    heatmap: [{ date: '2026-09-03', conceptsViewed: 1, questionsSolved: 2, activityCount: 3 }],
    areaProgress: [],
    weakTopics: [],
    recentQuizzes: [],
    activeQuiz: null,
    ...overrides,
  }
}

function render(data: Dashboard) {
  mocks.query.data = data
  return renderToStaticMarkup(<DashboardPage />)
}

function bootstrapStatus(state: CanonicalBootstrapStatus['state']): CanonicalBootstrapStatus {
  return {
    state,
    sourceFileCount: 870,
    totalBatches: 12,
    readyBatches: state === 'READY' ? 12 : 0,
    totalItems: 3304,
    canonicalItems: { topics: 134, concepts: 721, questions: 2449 },
    currentCounts: { learningAreas: 15, topics: 0, concepts: 0, questions: 0 },
  }
}

describe('DashboardPage', () => {
  beforeEach(() => {
    mocks.query.data = null
    mocks.query.isPending = false
    mocks.query.isError = false
    mocks.bootstrap.data = null
    mocks.bootstrap.isPending = false
    mocks.bootstrap.isError = false
    mocks.navigate.mockReset()
  })

  it('renders active quiz resume and review CTA', () => {
    const markup = render(dashboard({
      activeQuiz: { quizId: 41, questionCount: 10, answeredCount: 3, lastPosition: 3, startedAt: '2026-09-03T12:00:00Z', expiresAt: null },
    }))

    expect(markup).toContain('이어 풀기 · 3/10')
    expect(markup).toContain('복습 시작')
  })

  it('renders weak-topic and review empty states when nothing is due', () => {
    const markup = render(dashboard({ today: { solvedCount: 0, correctCount: 0, wrongCount: 0, accuracyPercent: 0, reviewDueCount: 0 } }))

    expect(markup).toContain('최근 30일에 3회 이상 시도한 약점 Topic이 없습니다.')
    expect(markup).not.toContain('이어 풀기')
    expect(markup).toContain('현재 대기 중인 복습이 없습니다.')
    expect(markup).not.toContain('복습 시작 →')
  })

  it('renders weak-topic data and pending self-check count in recent quiz', () => {
    const markup = render(dashboard({
      weakTopics: [{ topicId: 7, topicContentKey: 'java-topic', topicTitle: 'JPA 기초', areaSlug: 'java', areaName: 'Java', attemptCount: 3, correctCount: 1, wrongCount: 2, accuracyPercent: 33.33 }],
      recentQuizzes: [{ quizId: 41, source: 'STANDARD', status: 'SUBMITTED', startedAt: '2026-09-03T12:00:00Z', submittedAt: '2026-09-03T12:10:00Z', completedAt: null, totalCount: 4, finalizedCount: 3, correctCount: 2, wrongCount: 1, pendingSelfCheckCount: 1, accuracyPercent: 66.67 }],
    }))

    expect(markup).toContain('JPA 기초')
    expect(markup).toContain('2/3 finalized correct')
    expect(markup).toContain('1 self-check 대기')
  })

  it('keeps the Learning start CTA when READY content has no activity', () => {
    mocks.bootstrap.data = bootstrapStatus('READY')

    const markup = render(dashboard({
      today: { solvedCount: 0, correctCount: 0, wrongCount: 0, accuracyPercent: 0, reviewDueCount: 0 },
      currentStreak: 0,
      heatmap: [{ date: '2026-09-03', conceptsViewed: 0, questionsSolved: 0, activityCount: 0 }],
    }))

    expect(markup).toContain('Learning 시작')
  })
})
