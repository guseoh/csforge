import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CanonicalBootstrapStatus } from '../lib/import-api'
import type { Dashboard } from '../lib/dashboard-api'
import type { ConceptListItem, ConceptPage } from '../lib/learning-api'

function conceptPage(items: ConceptListItem[] = []): ConceptPage {
  return {
    items,
    page: { page: 0, size: 4, totalElements: items.length, totalPages: items.length > 0 ? 1 : 0, hasNext: false, hasPrevious: false },
  }
}

const mocks = vi.hoisted(() => ({
  dashboard: { data: null as Dashboard | null, isPending: false, isError: false, refetch: vi.fn() },
  recentConcepts: { data: null as ConceptPage | null, isPending: false, isError: false, refetch: vi.fn() },
  bootstrap: { data: null as CanonicalBootstrapStatus | null, isPending: false, isError: false, refetch: vi.fn() },
  navigate: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
  useNavigate: () => mocks.navigate,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: readonly unknown[] }) => {
    if (queryKey[0] === 'canonical-bootstrap-status') return mocks.bootstrap
    if (queryKey[0] === 'concepts') return mocks.recentConcepts
    return mocks.dashboard
  },
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
  mocks.dashboard.data = data
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
    mocks.dashboard.data = null
    mocks.dashboard.isPending = false
    mocks.dashboard.isError = false
    mocks.recentConcepts.data = conceptPage()
    mocks.recentConcepts.isPending = false
    mocks.recentConcepts.isError = false
    mocks.bootstrap.data = null
    mocks.bootstrap.isPending = false
    mocks.bootstrap.isError = false
    mocks.navigate.mockReset()
  })

  it('renders active quiz as the primary continuation and review as a follow-up', () => {
    const markup = render(dashboard({
      activeQuiz: { quizId: 41, questionCount: 10, answeredCount: 3, lastPosition: 3, startedAt: '2026-09-03T12:00:00Z', expiresAt: null },
    }))

    expect(markup).toContain('풀던 퀴즈 이어가기')
    expect(markup).toContain('10문항 중 3문항까지 답했습니다.')
    expect(markup).toContain('이어 풀기')
    expect(markup).toContain('오늘 복습 2개')
    expect(markup).toContain('복습 시작 →')
  })

  it('renders weak-topic and review empty states when nothing is due', () => {
    const markup = render(dashboard({ today: { solvedCount: 0, correctCount: 0, wrongCount: 0, accuracyPercent: 0, reviewDueCount: 0 } }))

    expect(markup).toContain('최근 30일에 3회 이상 시도한 약점 주제가 없습니다.')
    expect(markup).not.toContain('이어 풀기')
    expect(markup).toContain('현재 대기 중인 복습이 없습니다.')
    expect(markup).not.toContain('복습 시작 →')
  })

  it('uses the most recently viewed concept as the primary continuation when no urgent work exists', () => {
    mocks.recentConcepts.data = conceptPage([{
      id: 77,
      areaSlug: 'java',
      areaName: 'Java',
      topicId: 9,
      topicSlug: 'jvm',
      topicTitle: 'JVM',
      title: '클래스 로딩 과정',
      summary: '클래스가 JVM에 로딩되고 초기화되는 흐름을 이해합니다.',
      level: 2,
      contentStatus: 'PUBLISHED',
      learningStatus: 'LEARNING',
      bookmarked: false,
      lastViewedAt: '2026-09-03T11:00:00Z',
    }])

    const markup = render(dashboard({
      today: { solvedCount: 0, correctCount: 0, wrongCount: 0, accuracyPercent: 0, reviewDueCount: 0 },
    }))

    expect(markup).toContain('최근 본 개념')
    expect(markup).toContain('클래스 로딩 과정')
    expect(markup).toContain('Java · JVM · 레벨 2')
    expect(markup).toContain('계속 읽기')
  })

  it('explains the finalized denominator while a self-check is pending', () => {
    const markup = render(dashboard({
      weakTopics: [{ topicId: 7, topicContentKey: 'java-topic', topicTitle: 'JPA 기초', areaSlug: 'java', areaName: 'Java', attemptCount: 3, correctCount: 1, wrongCount: 2, accuracyPercent: 33.33 }],
      recentQuizzes: [{ quizId: 41, source: 'STANDARD', status: 'SUBMITTED', startedAt: '2026-09-03T12:00:00Z', submittedAt: '2026-09-03T12:10:00Z', completedAt: null, totalCount: 4, finalizedCount: 3, correctCount: 2, wrongCount: 0, unansweredCount: 1, pendingSelfCheckCount: 1, accuracyPercent: 66.67 }],
    }))

    expect(markup).toContain('JPA 기초')
    expect(markup).toContain('확정 3문항 중 2개 정답 · 자기채점 1개 대기')
  })

  it('uses total questions as the finalized denominator after self-check completes', () => {
    const markup = render(dashboard({
      recentQuizzes: [{ quizId: 42, source: 'STANDARD', status: 'COMPLETED', startedAt: '2026-09-03T12:00:00Z', submittedAt: '2026-09-03T12:10:00Z', completedAt: '2026-09-03T12:11:00Z', totalCount: 4, finalizedCount: 4, correctCount: 1, wrongCount: 1, unansweredCount: 2, pendingSelfCheckCount: 0, accuracyPercent: 25 }],
    }))

    expect(markup).toContain('25%')
    expect(markup).toContain('1/4개 정답')
  })

  it('shows no accuracy when every recent quiz question is pending self-check', () => {
    const markup = render(dashboard({
      recentQuizzes: [{ quizId: 43, source: 'STANDARD', status: 'SUBMITTED', startedAt: '2026-09-03T12:00:00Z', submittedAt: '2026-09-03T12:10:00Z', completedAt: null, totalCount: 2, finalizedCount: 0, correctCount: 0, wrongCount: 0, unansweredCount: 0, pendingSelfCheckCount: 2, accuracyPercent: null }],
    }))

    expect(markup).toContain('—')
    expect(markup).toContain('확정 0문항 중 0개 정답 · 자기채점 2개 대기')
  })

  it('keeps a curriculum start action when READY content has no activity', () => {
    mocks.bootstrap.data = bootstrapStatus('READY')

    const markup = render(dashboard({
      today: { solvedCount: 0, correctCount: 0, wrongCount: 0, accuracyPercent: 0, reviewDueCount: 0 },
      currentStreak: 0,
      heatmap: [{ date: '2026-09-03', conceptsViewed: 0, questionsSolved: 0, activityCount: 0 }],
    }))

    expect(markup).toContain('학습 영역에서 시작하기')
    expect(markup).toContain('학습 영역 보기')
  })

  it('classifies an incomplete started area as progressed while keeping completion at zero', () => {
    const markup = render(dashboard({
      today: { solvedCount: 0, correctCount: 0, wrongCount: 0, accuracyPercent: 0, reviewDueCount: 0 },
      areaProgress: [{
        areaSlug: 'java',
        areaName: 'Java',
        completedConceptCount: 0,
        startedConceptCount: 1,
        publishedConceptCount: 1,
        completionPercent: 0,
        levels: [],
      }],
    }))

    expect(markup).toContain('0/1개 개념 완료')
    expect(markup).toContain('0%')
    expect(markup).not.toContain('미시작')
  })
  it('keeps primary quiz, review and recent concept as the top three actions', () => {
    mocks.recentConcepts.data = conceptPage([{
      id: 77, areaSlug: 'java', areaName: 'Java', topicId: 9,
      topicSlug: 'jvm', topicTitle: 'JVM', title: '최근에 본 클래스 로딩',
      summary: null, level: 2, contentStatus: 'PUBLISHED',
      learningStatus: 'LEARNING', bookmarked: false, lastViewedAt: '2026-09-03T11:00:00Z',
    }])
    const html = render(dashboard({
      activeQuiz: { quizId: 41, questionCount: 10, answeredCount: 3, lastPosition: 3, startedAt: '2026-09-03T12:00:00Z', expiresAt: null },
      areaProgress: [{ areaSlug: 'java', areaName: 'Java', completedConceptCount: 1, startedConceptCount: 2, publishedConceptCount: 7, completionPercent: 14, levels: [] }],
    }))
    expect(html).toContain('풀던 퀴즈 이어가기')
    expect(html).toContain('오늘 복습 2개')
    expect(html).toContain('최근에 본 클래스 로딩')
    expect(html).not.toContain('개념 찾기 →')
  })

  it('offers an additional curriculum action without another API call when a recent concept is primary', () => {
    mocks.recentConcepts.data = conceptPage([{
      id: 7, areaSlug: 'java', areaName: 'Java', topicId: 9,
      topicSlug: 'jvm', topicTitle: 'JVM', title: '최근 개념',
      summary: null, level: 1, contentStatus: 'PUBLISHED',
      learningStatus: 'LEARNING', bookmarked: false, lastViewedAt: '2026-09-03T11:00:00Z',
    }])
    const html = render(dashboard({
      today: { solvedCount: 0, correctCount: 0, wrongCount: 0, accuracyPercent: 0, reviewDueCount: 0 },
      areaProgress: [{ areaSlug: 'java', areaName: 'Java', completedConceptCount: 0, startedConceptCount: 1, publishedConceptCount: 7, completionPercent: 0, levels: [] }],
    }))
    expect(html).toContain('최근 개념')
    expect(html).toContain('새로운 학습')
    expect(html).toContain('개념 찾기 →')
    expect(html.indexOf('계속 읽기')).toBeLessThan(html.indexOf('개념 찾기 →'))
  })

  it('does not call zero-answer accuracy 0% and does not invent a denominator', () => {
    const html = render(dashboard({
      today: { solvedCount: 0, correctCount: 0, wrongCount: 0, accuracyPercent: 0, reviewDueCount: 0 },
      areaProgress: [{ areaSlug: 'empty', areaName: '빈 영역', completedConceptCount: 0, startedConceptCount: 0, publishedConceptCount: 0, completionPercent: 0, levels: [] }],
    }))
    expect(html).toContain('확정 채점 문항이 없어 정확도를 계산하지 않습니다.')
    expect(html).toContain('공개된 개념 없음')
    expect(html).toContain('콘텐츠 없음')
    expect(html).not.toContain('NaN%')
  })

  it('does not block the main dashboard when recent-concept lookup is pending or unavailable', () => {
    mocks.recentConcepts.isPending = true
    expect(render(dashboard())).toContain('오늘의 학습')
    mocks.recentConcepts.isPending = false
    mocks.recentConcepts.isError = true
    const html = render(dashboard())
    expect(html).toContain('오늘의 학습')
    expect(html).toContain('최근 본 개념을 불러오지 못했습니다.')
    expect(html).toContain('다시 시도')
  })
})
