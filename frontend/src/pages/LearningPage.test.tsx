import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AreaSummary, CanonicalBootstrapResult, CanonicalBootstrapStatus, ConceptListItem } from '../lib/api'

const mocks = vi.hoisted(() => ({
  areas: { data: [] as AreaSummary[], isPending: false, isError: false, refetch: vi.fn() },
  concepts: { data: { items: [] as ConceptListItem[] }, isPending: false, isError: false, refetch: vi.fn() },
  bootstrap: { data: null as CanonicalBootstrapStatus | null, isPending: false, isError: false, refetch: vi.fn() },
  mutation: { data: null as CanonicalBootstrapResult | null, isPending: false, isError: false, mutate: vi.fn() },
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: readonly unknown[] }) => {
    if (queryKey[0] === 'learning-areas') return mocks.areas
    if (queryKey[0] === 'canonical-bootstrap-status') return mocks.bootstrap
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
})
