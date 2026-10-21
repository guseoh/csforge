import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AreaSummary, ConceptListItem } from '../lib/learning-api'
import type { CanonicalBootstrapResult, CanonicalBootstrapStatus } from '../lib/import-api'

const mocks = vi.hoisted(() => ({
  areas: { data: [] as AreaSummary[], isPending: false, isError: false, refetch: vi.fn() },
  concepts: { data: { items: [] as ConceptListItem[] }, isPending: false, isError: false, refetch: vi.fn() },
  started: { data: { items: [] as ConceptListItem[] }, isPending: false, isError: false, refetch: vi.fn() },
  unseen: { data: { items: [] as ConceptListItem[] }, isPending: false, isError: false, refetch: vi.fn() },
  queryOptions: [] as Array<{ key: readonly unknown[]; enabled?: boolean }>,
  bootstrap: { data: null as CanonicalBootstrapStatus | null, isPending: false, isError: false, refetch: vi.fn() },
  mutation: { data: null as CanonicalBootstrapResult | null, isPending: false, isError: false, mutate: vi.fn() },
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey, enabled }: { queryKey: readonly unknown[]; enabled?: boolean }) => {
    mocks.queryOptions.push({ key: queryKey, enabled })
    if (queryKey[0] === 'learning-areas') return mocks.areas
    if (queryKey[0] === 'canonical-bootstrap-status') return mocks.bootstrap
    const filters = queryKey[1] as { learningStatus?: string }
    if (filters?.learningStatus === 'LEARNING') return mocks.started
    if (filters?.learningStatus === 'UNSEEN') return mocks.unseen
    return mocks.concepts
  },
  useMutation: () => mocks.mutation,
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}))

import { LearningPage } from './LearningPage'

function area(overrides: Partial<AreaSummary> = {}): AreaSummary {
  return {
    id: 1,
    slug: 'java',
    name: 'Java',
    description: null,
    topicCount: 0,
    publishedConceptCount: 0,
    completedConceptCount: 0,
    startedConceptCount: 0,
    bookmarkedConceptCount: 0,
    level1: { total: 0, completed: 0 },
    level2: { total: 0, completed: 0 },
    level3: { total: 0, completed: 0 },
    publishedQuestionCount: 0,
    finalizedAttemptCount: 0,
    correctAttemptCount: 0,
    accuracyPercent: 0,
    ...overrides,
  }
}

function bootstrapStatus(state: CanonicalBootstrapStatus['state']): CanonicalBootstrapStatus {
  return {
    state,
    sourceFileCount: 870,
    totalBatches: 12,
    readyBatches: state === 'READY' ? 12 : 0,
    totalItems: 3304,
    canonicalItems: { topics: 134, concepts: 721, questions: 2449 },
    currentCounts: { learningAreas: 15, topics: state === 'EMPTY' ? 0 : 1, concepts: 0, questions: 0 },
  }
}

function failedBootstrap(): CanonicalBootstrapResult {
  return {
    success: false,
    state: 'PARTIAL',
    sourceFileCount: 870,
    totalBatches: 12,
    completedBatches: 1,
    totalItems: 3304,
    failedBatch: 2,
    failedKind: 'CONCEPT',
    failureMessage: 'batch failed',
    totals: { created: 134, updated: 0, unchanged: 0, skipped: 0, errors: 0, failed: 1 },
    currentCounts: { learningAreas: 15, topics: 134, concepts: 0, questions: 0 },
  }
}

describe('LearningPage canonical bootstrap recovery', () => {
  beforeEach(() => {
    mocks.areas.data = [area()]
    mocks.areas.isPending = false
    mocks.areas.isError = false
    mocks.concepts.data = { items: [] }
    mocks.concepts.isPending = false
    mocks.concepts.isError = false
    mocks.started.data = { items: [] }
    mocks.started.isPending = false
    mocks.started.isError = false
    mocks.unseen.data = { items: [] }
    mocks.unseen.isPending = false
    mocks.unseen.isError = false
    mocks.queryOptions = []
    mocks.bootstrap.data = bootstrapStatus('EMPTY')
    mocks.bootstrap.isPending = false
    mocks.bootstrap.isError = false
    mocks.mutation.data = null
    mocks.mutation.isPending = false
    mocks.mutation.isError = false
    mocks.mutation.mutate.mockReset()
  })

  it('shows the bootstrap CTA for EMPTY', () => {
    expect(renderToStaticMarkup(<LearningPage />)).toContain('기본 학습 콘텐츠 준비')
  })

  it('keeps the retry UI mounted after PARTIAL failure with committed topics', () => {
    mocks.areas.data = [area({ topicCount: 1 })]
    mocks.bootstrap.data = bootstrapStatus('PARTIAL')
    mocks.mutation.data = failedBootstrap()

    const markup = renderToStaticMarkup(<LearningPage />)

    expect(markup).toContain('기본 학습 콘텐츠를 준비하지 못했습니다.')
    expect(markup).toContain('다시 시도')
  })

  it('hides the first-run bootstrap CTA for READY', () => {
    mocks.areas.data = [area({ topicCount: 1, publishedConceptCount: 1, publishedQuestionCount: 1 })]
    mocks.bootstrap.data = bootstrapStatus('READY')

    expect(renderToStaticMarkup(<LearningPage />)).not.toContain('기본 학습 콘텐츠 준비')
  })

  it('shows an area with started but incomplete learning as 0% instead of not started', () => {
    mocks.areas.data = [area({ publishedConceptCount: 1, startedConceptCount: 1 })]

    const markup = renderToStaticMarkup(<LearningPage />)

    expect(markup).toContain('0/1개 완료')
    expect(markup).toContain('0%')
    expect(markup).not.toContain('미시작')
  })
})

describe('LearningPage next-step navigation', () => {
  beforeEach(() => {
    mocks.areas.data = [area()]
    mocks.areas.isPending = false
    mocks.areas.isError = false
    mocks.concepts.data = { items: [] }
    mocks.concepts.isPending = false
    mocks.concepts.isError = false
    mocks.started.data = { items: [] }
    mocks.started.isPending = false
    mocks.started.isError = false
    mocks.unseen.data = { items: [] }
    mocks.unseen.isPending = false
    mocks.unseen.isError = false
    mocks.bootstrap.data = bootstrapStatus('READY')
    mocks.mutation.data = null
    mocks.mutation.isPending = false
    mocks.mutation.isError = false
    mocks.queryOptions = []
  })

  const next = (id: number, learningStatus: ConceptListItem['learningStatus']): ConceptListItem => ({
    id, learningStatus, contentStatus: 'PUBLISHED', areaSlug: 'java', areaName: 'Java',
    topicId: 2, topicSlug: 'java-basics', topicTitle: '기본 문법',
    title: '다음 개념 ' + id, summary: null, level: 1, bookmarked: false, lastViewedAt: null,
  })

  it('distinguishes a recent read from the next unfinished concept', () => {
    mocks.areas.data = [area({ publishedConceptCount: 4, startedConceptCount: 1 })]
    mocks.concepts.data = { items: [{ ...next(11, 'COMPLETED'), lastViewedAt: '2026-10-20T10:00:00Z' }] }
    mocks.started.data = { items: [next(12, 'LEARNING')] }
    mocks.unseen.data = { items: [next(13, 'UNSEEN')] }
    const html = renderToStaticMarkup(<LearningPage />)
    expect(html).toContain('최근 본 개념')
    expect(html).toContain('다음 개념 11')
    expect(html).toContain('학습 중인 개념 이어가기')
    expect(html).toContain('다음 개념 12')
    expect(html).not.toContain('다음 개념 13')
  })

  it('only shows unseen next when there is no started work', () => {
    mocks.areas.data = [area({ publishedConceptCount: 3 })]
    mocks.started.data = { items: [] }
    mocks.unseen.data = { items: [next(13, 'UNSEEN')] }
    const html = renderToStaticMarkup(<LearningPage />)
    expect(html).toContain('다음 미학습 개념 시작하기')
    expect(html).toContain('다음 개념 13')
  })

  it('does not query unfinished work for an empty curriculum', () => {
    mocks.areas.data = [area()]
    renderToStaticMarkup(<LearningPage />)
    const enabled = mocks.queryOptions.filter((entry) => (
      (entry.key[1] as { learningStatus?: string })?.learningStatus === 'LEARNING'
      || (entry.key[1] as { learningStatus?: string })?.learningStatus === 'UNSEEN'
    ))
    expect(enabled).toHaveLength(2)
    expect(enabled.every((entry) => entry.enabled === false)).toBe(true)
  })

  it('distinguishes completed from partially started areas', () => {
    mocks.areas.data = [area({ publishedConceptCount: 2, completedConceptCount: 2, startedConceptCount: 2 })]
    const html = renderToStaticMarkup(<LearningPage />)
    expect(html).toContain('area-row-study-state">완료')
    expect(html).toContain('2/2개 완료')
  })

  it('shows retry when the next learning request fails', () => {
    mocks.areas.data = [area({ publishedConceptCount: 2 })]
    mocks.started.isError = true
    const html = renderToStaticMarkup(<LearningPage />)
    expect(html).toContain('다음 학습 대상을 불러오지 못했습니다.')
    expect(html).toContain('다시 시도')
  })
})
