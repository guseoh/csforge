import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AreaDetail, LearningAreaOutlinePage } from '../lib/learning-api'

const mocks = vi.hoisted(() => ({
  topicId: '57',
  area: { data: undefined as AreaDetail | undefined, isPending: false, isError: false, refetch: vi.fn() },
  first: { data: undefined as LearningAreaOutlinePage | undefined, isPending: false, isError: false, isSuccess: true, refetch: vi.fn() },
  remaining: [] as Array<{ data?: LearningAreaOutlinePage; isPending: boolean; isError: boolean; isSuccess: boolean; refetch: ReturnType<typeof vi.fn> }>,
  availability: { data: { availableCount: 3 }, isPending: false, isError: false, refetch: vi.fn() },
  active: { data: null as { quizId: number; answeredCount: number; questionCount: number } | null, isPending: false, isError: false, refetch: vi.fn() },
  links: [] as Array<{ to?: string; search?: unknown }>,
  queries: [] as Array<{ key: readonly unknown[]; enabled?: boolean }>,
  outlineQueries: [] as Array<{ queryKey: readonly unknown[]; enabled?: boolean }>,
}))
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, search }: { children: ReactNode; to?: string; search?: unknown }) => {
    mocks.links.push({ to, search })
    return <a href="#">{children}</a>
  },
  useParams: () => ({ areaSlug: 'java', topicId: mocks.topicId }),
}))
vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey, enabled }: { queryKey: readonly unknown[]; enabled?: boolean }) => {
    mocks.queries.push({ key: queryKey, enabled })
    if (queryKey[0] === 'learning-area') return mocks.area
    if (queryKey[0] === 'learning-outline') return mocks.first
    if (queryKey[0] === 'quiz-active') return mocks.active
    return mocks.availability
  },
  useQueries: ({ queries }: { queries: Array<{ queryKey: readonly unknown[]; enabled?: boolean }> }) => {
    mocks.outlineQueries = queries
    return mocks.remaining
  },
}))
import { TopicFocusPage } from './TopicFocusPage'

const concept = (id: number, status: 'UNSEEN' | 'LEARNING' | 'COMPLETED' | 'REVIEW_NEEDED', topicId = 57) =>
  ({ id, title: `Concept ${id}`, summary: null, level: 1, topicId, learningStatus: status })
const page = (items: ReturnType<typeof concept>[], totalPages = 1): LearningAreaOutlinePage => ({
  items, page: { page: 0, size: 200, totalElements: items.length, totalPages, hasNext: totalPages > 1, hasPrevious: false },
})
describe('TopicFocusPage', () => {
  beforeEach(() => {
    mocks.topicId = '57'
    mocks.area = {
      data: { id: 1, name: 'Java', slug: 'java', description: null, topics: [{
        id: 57, slug: 'language', title: 'Java language', description: null, publishedConceptCount: 3,
        completedConceptCount: 1, bookmarkedConceptCount: 0, level1Count: 3, level2Count: 0, level3Count: 0,
        unseenCount: 1, learningCount: 1, reviewNeededCount: 0,
      }] },
      isPending: false, isError: false, refetch: vi.fn(),
    }
    mocks.first = { data: page([concept(11, 'COMPLETED'), concept(12, 'LEARNING'), concept(13, 'UNSEEN')]), isPending: false, isError: false, isSuccess: true, refetch: vi.fn() }
    mocks.remaining = []
    mocks.availability = { data: { availableCount: 3 }, isPending: false, isError: false, refetch: vi.fn() }
    mocks.active = { data: null, isPending: false, isError: false, refetch: vi.fn() }
    mocks.links = []
    mocks.queries = []
    mocks.outlineQueries = []
  })
  it('resumes the in-progress Concept and scopes Quiz to current Topic IDs', () => {
    const html = renderToStaticMarkup(<TopicFocusPage />)
    expect(html).toContain('1/3개 학습 완료')
    expect(html).toContain('학습 중이던 개념을 이어서 읽으세요')
    expect(html).toContain('Concept 12')
    expect(html).toContain('출제 가능 3문항')
    expect(mocks.links.find(item => item.to === '/quiz')?.search).toMatchObject({ areas: 'java', concepts: '11,12,13' })
  })
  it('handles empty Topic without allowing an unfiltered Quiz', () => {
    mocks.first.data = page([])
    const html = renderToStaticMarkup(<TopicFocusPage />)
    expect(html).toContain('이 Topic에 공개된 개념이 없습니다')
    expect(mocks.queries.find(q => q.key[0] === 'quiz-availability')?.enabled).toBe(false)
    expect(mocks.links.some(item => item.to === '/quiz')).toBe(false)
  })
  it('distinguishes fully completed and review-needed from unfinished reading', () => {
    mocks.first.data = page([concept(11, 'COMPLETED'), concept(12, 'COMPLETED')])
    expect(renderToStaticMarkup(<TopicFocusPage />)).toContain('모든 개념의 읽기를 완료했습니다')
    mocks.first.data = page([concept(11, 'REVIEW_NEEDED')])
    const html = renderToStaticMarkup(<TopicFocusPage />)
    expect(html).toContain('복습할 개념')
    expect(html).not.toContain('모든 개념의 읽기를 완료했습니다')
  })
  it('joins outline pages rather than silently dropping Concepts after page 200', () => {
    mocks.first.data = page([concept(11, 'COMPLETED')], 2)
    mocks.remaining = [{ data: page([concept(12, 'UNSEEN')]), isPending: false, isError: false, isSuccess: true, refetch: vi.fn() }]
    const html = renderToStaticMarkup(<TopicFocusPage />)
    expect(mocks.outlineQueries).toHaveLength(1)
    expect(mocks.outlineQueries[0].queryKey).toEqual(['learning-outline', 'java', 1])
    expect(mocks.links.find(x => x.to === '/quiz')?.search).toMatchObject({ concepts: '11,12' })
    expect(html).toContain('1/2개 학습 완료')
  })
  it('shows existing Quiz resume without automatically creating another session', () => {
    mocks.active.data = { quizId: 123, answeredCount: 2, questionCount: 5 }
    expect(renderToStaticMarkup(<TopicFocusPage />)).toContain('진행 중인 Quiz 이어 풀기')
  })
  it('has recoverable errors, and rejects an invalid topic route', () => {
    mocks.area.isError = true
    expect(renderToStaticMarkup(<TopicFocusPage />)).toContain('Topic 학습 경로를 불러오지 못했습니다')
    mocks.area.isError = false
    mocks.topicId = '-12'
    expect(renderToStaticMarkup(<TopicFocusPage />)).toContain('유효하지 않은 Topic 번호')
  })
  it('does not offer quiz start when published question count is zero', () => {
    mocks.availability.data.availableCount = 0
    const html = renderToStaticMarkup(<TopicFocusPage />)
    expect(html).toContain('현재 연결된 공개 문제가 없습니다')
    expect(mocks.links.some(x => x.to === '/quiz')).toBe(false)
  })
})
