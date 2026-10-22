import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { LearningInsights } from '../lib/insights-api'


const mocks = vi.hoisted(() => ({
  search: { insightsOpen: '0', insightsRange: '7d', insightsArea: '' },
  query: { data: null as LearningInsights | null, isPending: false, isError: false, refetch: vi.fn() },
  navigate: vi.fn(),
  queryConfig: { enabled: false },
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
  useSearch: () => mocks.search,
  useNavigate: () => mocks.navigate,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: (config: { enabled: boolean }) => {
    mocks.queryConfig.enabled = config.enabled
    return mocks.query
  },
}))

import { LearningInsightsSection, LearningInsightsResults } from './LearningInsightsSection'

function sample(overrides: Partial<LearningInsights> = {}): LearningInsights {
  return {
    asOf: '2026-09-03T14:30:00Z',
    studyDate: '2026-09-03', zoneId: 'Asia/Seoul', range: '7d', area: null,
    current: {
      from: '2026-08-28', through: '2026-09-03', finalizedAttempts: 0,
      correctAttempts: 0, wrongAttempts: 0, uniqueQuestions: 0, pendingSelfCheck: 0,
      viewedConcepts: 0, accuracyPercent: null,
    },
    previous: {
      from: '2026-08-21', through: '2026-08-27', finalizedAttempts: 0,
      correctAttempts: 0, wrongAttempts: 0, uniqueQuestions: 0, pendingSelfCheck: 0,
      viewedConcepts: 0, accuracyPercent: null,
    },
    comparable: false,
    comparisonReason: '각 기간에 서로 다른 확정 문제 3개 이상이 필요하므로 추세를 판단하기 어렵습니다.',
    overdueCount: 0, dueNowCount: 0, weakConcepts: [], ...overrides,
  }
}

beforeEach(() => {
  mocks.search = { insightsOpen: '0', insightsRange: '7d', insightsArea: '' }
  mocks.query.data = null
  mocks.query.isPending = false
  mocks.query.isError = false
  mocks.query.refetch.mockReset()
  mocks.navigate.mockReset()
})

describe('LearningInsightsSection', () => {
  it('keeps insights lazy until explicitly opened via URL-backed controls', () => {
    const html = renderToStaticMarkup(<LearningInsightsSection areas={[]} />)
    expect(html).toContain('7·30일 학습 진단')
    expect(html).toContain('학습 진단 펼치기')
    expect(mocks.queryConfig.enabled).toBe(false)
    expect(html).not.toContain('insights-filters')
  })

  it('keeps pending/error/empty states recoverable without hiding Dashboard', () => {
    mocks.search.insightsOpen = '1'
    mocks.query.isPending = true
    expect(renderToStaticMarkup(<LearningInsightsSection areas={[]} />)).toContain('진단 근거 불러오는 중')
    expect(mocks.queryConfig.enabled).toBe(true)
    mocks.query.isPending = false
    mocks.query.isError = true
    expect(renderToStaticMarkup(<LearningInsightsSection areas={[]} />)).toContain('다시 시도')
    mocks.query.isError = false
    mocks.query.data = sample()
    const html = renderToStaticMarkup(<LearningInsightsSection areas={[]} />)
    expect(html).toContain('추세 판단 어려움')
    expect(html).toContain('오답 개념이 없습니다')
    expect(html).toContain('고유 문제')
  })
})

describe('LearningInsightsResults', () => {
  it('distinguishes repeated attempts, distinct questions, due windows and uncertain comparison', () => {
    const current = sample().current
    const data = sample({
      current: { ...current, finalizedAttempts: 12, correctAttempts: 3, wrongAttempts: 9,
        uniqueQuestions: 3, pendingSelfCheck: 2, viewedConcepts: 4, accuracyPercent: 25 },
      previous: { ...sample().previous, finalizedAttempts: 1, uniqueQuestions: 1, accuracyPercent: 100 },
      weakConcepts: [{
        conceptId: 17, title: '값 전달과 참조', areaSlug: 'java', areaName: 'Java',
        wrongAttempts: 9, dueQuestions: 2, lastWrongAt: '2026-09-03T12:00:00Z',
        distinctQuestions: 3, correctQuestions: 1, evidenceAccuracyPercent: 33.33,
        assessmentStatus: 'NEEDS_PRACTICE',
      }],
      overdueCount: 1, dueNowCount: 2,
    })
    const html = renderToStaticMarkup(<LearningInsightsResults data={data} />)
    expect(html).toContain('풀이 활동')
    expect(html).toContain('12회')
    expect(html).toContain('고유 문제')
    expect(html).toContain('3개')
    expect(html).toContain('자기채점 대기')
    expect(html).toContain('추세 판단 어려움')
    expect(html).toContain('값 전달과 참조')
    expect(html).toContain('연결 문제 2개')
    expect(html).toContain('개념 읽기')
    expect(html).toContain('문제 다시 풀기')
    expect(html).toContain('지연 1개')
    expect(html).not.toContain('정답률 차이:')
  })

  it('distinguishes current partial day and previous full 30-day period', () => {
    const html = renderToStaticMarkup(<LearningInsightsResults data={sample({ range: '30d' })} />)
    expect(html).toContain('이전 30일(완료된 기간)')
    expect(html).toContain('실제 관찰 시간은 같지 않습니다')
  })

  it('labels well-supported differences as percentage points rather than confirmed growth', () => {
    const current = sample().current
    const previous = sample().previous
    const data = sample({
      comparable: true,
      comparisonReason: '기간별 풀이 활동의 차이이며 인과적 학습 성장 판정은 아닙니다.',
      current: { ...current, uniqueQuestions: 5, finalizedAttempts: 7, accuracyPercent: 60 },
      previous: { ...previous, uniqueQuestions: 4, finalizedAttempts: 6, accuracyPercent: 40 },
    })
    const html = renderToStaticMarkup(<LearningInsightsResults data={data} />)
    expect(html).toContain('20.0%p')
    expect(html).toContain('아직 끝나지 않은 오늘')
    expect(html).toContain('이전 7일(완료된 기간)')
    expect(html).toContain('인과적 학습 성장 판정은 아닙니다')
  })
})
