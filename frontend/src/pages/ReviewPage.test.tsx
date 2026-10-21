import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  search: { page: 0, due: 'ALL' },
  summary: { data: { overdue: 0, dueNow: 0, next24Hours: 0, next7Days: 0, mastered: 0 }, isPending: false, isError: false, refetch: vi.fn() },
  reviews: {
    data: { items: [] as Array<{
      questionId: number; promptMarkdown: string; concepts: Array<{ id: number; title: string; areaName: string; level: number }>;
      status: 'SCHEDULED' | 'MASTERED'; stage: number; dueAt: string | null; lastReviewedAt: string | null
    }>, page: { page: 0, totalPages: 1, hasPrevious: false, hasNext: false } },
    isPending: false, isError: false, refetch: vi.fn(),
  },
  mutation: { isPending: false, isError: false, mutate: vi.fn() },
  navigate: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
  useSearch: () => mocks.search,
  useNavigate: () => mocks.navigate,
}))
vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: readonly unknown[] }) => queryKey[0] === 'review-summary' ? mocks.summary : mocks.reviews,
  useMutation: () => mocks.mutation,
}))
vi.mock('../components/toast/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}))
vi.mock('../lib/use-idempotency-key', () => ({
  useIdempotencyKey: () => ({ requestIdFor: () => 'idempotency', clear: vi.fn() }),
}))

import { ReviewPage } from './ReviewPage'

describe('ReviewPage timing and recovery', () => {
  beforeEach(() => {
    mocks.search = { page: 0, due: 'ALL' }
    mocks.summary.data = { overdue: 0, dueNow: 0, next24Hours: 0, next7Days: 0, mastered: 0 }
    mocks.summary.isPending = false
    mocks.summary.isError = false
    mocks.reviews.isPending = false
    mocks.reviews.isError = false
    mocks.reviews.data = { items: [], page: { page: 0, totalPages: 1, hasPrevious: false, hasNext: false } }
    mocks.mutation.isPending = false
    mocks.navigate.mockReset()
  })

  it('shows no-schedule recovery without inventing a due review', () => {
    const html = renderToStaticMarkup(<ReviewPage />)
    expect(html).toContain('아직 복습할 내용이 없습니다.')
    expect(html).toContain('문제 풀러 가기')
    expect(html).not.toContain('복습 시작</button>')
  })

  it('distinguishes upcoming schedules from actionable reviews', () => {
    mocks.summary.data = { overdue: 0, dueNow: 0, next24Hours: 3, next7Days: 2, mastered: 1 }
    const html = renderToStaticMarkup(<ReviewPage />)
    expect(html).toContain('지금 시작할 복습은 0개')
    expect(html).toContain('예정 문항은 현재 복습 시작 대상에 포함되지 않습니다.')
    expect(html).not.toContain('복습 시작</button>')
    expect(html).toContain('정리 완료')
  })

  it('allows starting a review when only overdue items exist', () => {
    mocks.summary.data = { overdue: 2, dueNow: 0, next24Hours: 0, next7Days: 0, mastered: 0 }
    const html = renderToStaticMarkup(<ReviewPage />)
    expect(html).toContain('지금 시작 가능한 복습 2개')
    expect(html).toContain('기한 지남 2개 · 지금 도래 0개')
    expect(html).toContain('복습 시작</button>')
  })

  it('offers a clear return path for an empty date filter', () => {
    mocks.search = { page: 0, due: 'OVERDUE' }
    mocks.summary.data = { overdue: 0, dueNow: 1, next24Hours: 0, next7Days: 0, mastered: 0 }
    const html = renderToStaticMarkup(<ReviewPage />)
    expect(html).toContain('선택한 시점에 복습할 항목이 없습니다.')
    expect(html).toContain('전체 일정 보기')
  })

  it('keeps distinct status labels for overdue, due and mastered rows', () => {
    mocks.summary.data = { overdue: 1, dueNow: 1, next24Hours: 0, next7Days: 0, mastered: 1 }
    mocks.reviews.data.items = [
      { questionId: 1, promptMarkdown: '오래된 복습', concepts: [], status: 'SCHEDULED', stage: 1, dueAt: '2001-01-01T00:00:00Z', lastReviewedAt: null },
      { questionId: 2, promptMarkdown: '완료된 복습', concepts: [], status: 'MASTERED', stage: 3, dueAt: null, lastReviewedAt: null },
    ]
    const html = renderToStaticMarkup(<ReviewPage />)
    expect(html).toContain('기한 지남')
    expect(html).toContain('정리 완료')
    expect(html).toContain('오래된 복습')
    expect(html).toContain('완료된 복습')
  })
})
