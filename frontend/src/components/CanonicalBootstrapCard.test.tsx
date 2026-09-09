import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CanonicalBootstrapResult, CanonicalBootstrapStatus } from '../lib/api'

const mocks = vi.hoisted(() => ({
  status: { data: null as CanonicalBootstrapStatus | null, isPending: false, isError: false, refetch: vi.fn() },
  mutation: { data: null as CanonicalBootstrapResult | null, isPending: false, isError: false, mutate: vi.fn() },
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => mocks.status,
  useMutation: () => mocks.mutation,
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}))

import { CanonicalBootstrapCard } from './CanonicalBootstrapCard'

function status(state: CanonicalBootstrapStatus['state']): CanonicalBootstrapStatus {
  return {
    state,
    sourceFileCount: 870,
    totalBatches: 12,
    readyBatches: state === 'READY' ? 12 : 0,
    totalItems: 3304,
    canonicalItems: { topics: 134, concepts: 721, questions: 2449 },
    currentCounts: { learningAreas: 15, topics: state === 'EMPTY' ? 0 : 10, concepts: state === 'EMPTY' ? 0 : 10, questions: 0 },
  }
}

function result(success: boolean): CanonicalBootstrapResult {
  return {
    success,
    state: success ? 'READY' : 'PARTIAL',
    sourceFileCount: 870,
    totalBatches: 12,
    completedBatches: success ? 12 : 2,
    totalItems: 3304,
    failedBatch: success ? null : 3,
    failedKind: success ? null : 'CONCEPT',
    failureMessage: success ? null : 'batch failed',
    totals: { created: success ? 3304 : 200, updated: 0, unchanged: 0, skipped: 0, errors: 0, failed: success ? 0 : 1 },
    currentCounts: { learningAreas: 15, topics: 134, concepts: 100, questions: 0 },
  }
}

describe('CanonicalBootstrapCard', () => {
  beforeEach(() => {
    mocks.status.data = null
    mocks.status.isPending = false
    mocks.status.isError = false
    mocks.status.refetch.mockReset()
    mocks.mutation.data = null
    mocks.mutation.isPending = false
    mocks.mutation.isError = false
    mocks.mutation.mutate.mockReset()
  })

  it('shows status loading and retryable status failure', () => {
    mocks.status.isPending = true
    expect(renderToStaticMarkup(<CanonicalBootstrapCard />)).toContain('기본 학습 콘텐츠 상태 확인 중')

    mocks.status.isPending = false
    mocks.status.isError = true
    const markup = renderToStaticMarkup(<CanonicalBootstrapCard />)
    expect(markup).toContain('기본 학습 콘텐츠 상태를 확인하지 못했습니다.')
    expect(markup).toContain('다시 시도')
  })

  it('shows the explicit CTA for EMPTY and PARTIAL states', () => {
    mocks.status.data = status('EMPTY')
    expect(renderToStaticMarkup(<CanonicalBootstrapCard />)).toContain('기본 학습 콘텐츠 준비')

    mocks.status.data = status('PARTIAL')
    expect(renderToStaticMarkup(<CanonicalBootstrapCard />)).toContain('일부 콘텐츠가 준비되어 있습니다.')
  })

  it('shows execution loading, failure retry, success and hides READY CTA', () => {
    mocks.status.data = status('EMPTY')
    mocks.mutation.isPending = true
    expect(renderToStaticMarkup(<CanonicalBootstrapCard />)).toContain('기본 학습 콘텐츠 준비 중')

    mocks.mutation.isPending = false
    mocks.mutation.isError = true
    expect(renderToStaticMarkup(<CanonicalBootstrapCard />)).toContain('기본 학습 콘텐츠를 준비하지 못했습니다.')

    mocks.mutation.isError = false
    mocks.mutation.data = result(true)
    expect(renderToStaticMarkup(<CanonicalBootstrapCard />)).toContain('기본 학습 콘텐츠가 준비되었습니다.')
    expect(renderToStaticMarkup(<CanonicalBootstrapCard />)).toContain('Learning 시작')

    mocks.mutation.data = null
    mocks.status.data = status('READY')
    expect(renderToStaticMarkup(<CanonicalBootstrapCard />)).not.toContain('기본 학습 콘텐츠 준비')
  })
})
