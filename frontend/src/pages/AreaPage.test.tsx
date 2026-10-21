import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  search: { topic: undefined, q: '', level: 'all', status: 'ALL', bookmarked: 'false', sort: 'curriculum', page: 0 },
  areaQuery: { data: null as unknown, isPending: false, isError: false, refetch: vi.fn() },
  firstOutlineQuery: { data: null as unknown, isPending: false, isError: false, refetch: vi.fn() },
  conceptQuery: { data: undefined as unknown, isPending: false, isError: false },
  remainingOutlinePages: [] as unknown[],
  remainingOutlineQueries: [] as Array<{ queryKey: readonly unknown[]; queryFn: () => unknown }>,
  links: [] as Array<{ to?: string; className?: string; search?: unknown }>,
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, className, to, search }: { children: ReactNode; className?: string; to?: string; search?: unknown }) => {
    mocks.links.push({ to, className, search })
    return <a className={className} href="#">{children}</a>
  },
  useParams: () => ({ areaSlug: 'java' }),
  useSearch: () => mocks.search,
  useNavigate: () => vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: readonly unknown[] }) => {
    if (queryKey[0] === 'learning-area') return mocks.areaQuery
    if (queryKey[0] === 'learning-outline') return mocks.firstOutlineQuery
    return mocks.conceptQuery
  },
  useQueries: ({ queries }: { queries: Array<{ queryKey: readonly unknown[]; queryFn: () => unknown }> }) => {
    mocks.remainingOutlineQueries = queries
    return mocks.remainingOutlinePages
  },
}))

vi.mock('../components/AreaLearningRail', () => ({ AreaLearningRail: () => null }))

import { AreaPage } from './AreaPage'

function concept(id: number, topicId = 57) {
  return {
    id,
    topicId,
    title: `Outline ${id}`,
    summary: null,
    level: 1,
    learningStatus: 'UNSEEN' as const,
  }
}

describe('AreaPage outline loading', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      location: { hash: '' },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    mocks.search = { topic: undefined, q: '', level: 'all', status: 'ALL', bookmarked: 'false', sort: 'curriculum', page: 0 }
    mocks.areaQuery = {
      data: {
        id: 1, slug: 'java', name: 'Java', description: null,
        topics: [{
          id: 57, slug: 'java-basics', title: 'Java basics', description: null,
          publishedConceptCount: 205, completedConceptCount: 0, bookmarkedConceptCount: 0,
          level1Count: 205, level2Count: 0, level3Count: 0, unseenCount: 205,
          learningCount: 0, reviewNeededCount: 0,
        }],
      },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    }
    mocks.firstOutlineQuery = {
      data: { items: Array.from({ length: 200 }, (_, index) => concept(index)), page: { page: 0, size: 200, totalElements: 205, totalPages: 2, hasNext: true, hasPrevious: false } },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    }
    mocks.conceptQuery = { data: undefined, isPending: false, isError: false }
    mocks.remainingOutlinePages = [{
      data: { items: Array.from({ length: 5 }, (_, index) => concept(index + 200)), page: { page: 1, size: 200, totalElements: 205, totalPages: 2, hasNext: false, hasPrevious: true } },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    }]
    mocks.remainingOutlineQueries = []
    mocks.links = []
  })

  it('loads later outline pages and renders all concepts beyond the old 200-item cap', () => {
    const markup = renderToStaticMarkup(<AreaPage />)

    expect(mocks.remainingOutlineQueries).toHaveLength(1)
    expect(mocks.remainingOutlineQueries[0].queryKey).toEqual(['learning-outline', 'java', 1])
    expect(markup.match(/curriculum-concept-row/g)).toHaveLength(205)
    expect(markup).toContain('Outline 204')
    expect(markup).toContain('이 영역 문제 풀기')
    expect(mocks.links.find((link) => link.className === 'guide-quiz-link')).toMatchObject({
      to: '/quiz',
      search: { areas: 'java', concepts: '' },
    })
  })

  it('starts a quiz with every concept in the currently selected topic', () => {
    vi.stubGlobal('window', {
      location: { hash: '#topic-58' },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    const area = mocks.areaQuery.data as { topics: Array<Record<string, unknown>> }
    area.topics.push({
      id: 58, slug: 'jvm', title: 'JVM', description: null,
      publishedConceptCount: 2, completedConceptCount: 0, bookmarkedConceptCount: 0,
      level1Count: 2, level2Count: 0, level3Count: 0, unseenCount: 2,
      learningCount: 0, reviewNeededCount: 0,
    })
    mocks.firstOutlineQuery = {
      data: {
        items: [concept(501, 57), concept(601, 58), concept(602, 58)],
        page: { page: 0, size: 200, totalElements: 3, totalPages: 1, hasNext: false, hasPrevious: false },
      },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    }
    mocks.remainingOutlinePages = []

    const markup = renderToStaticMarkup(<AreaPage />)
    const topicQuizLink = mocks.links.find((link) => link.className?.includes('topic-quiz-link'))

    expect(markup).toContain('JVM')
    expect(topicQuizLink).toMatchObject({
      to: '/quiz',
      search: { concepts: '601,602', areas: '', count: 10, state: 'ALL' },
    })
  })
})

describe('AreaPage #211 next action and filter behavior', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      location: { hash: '' },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    mocks.search = { topic: undefined, q: '', level: 'all', status: 'ALL', bookmarked: 'false', sort: 'curriculum', page: 0 }
    mocks.areaQuery = {
      data: {
        id: 1, slug: 'java', name: 'Java', description: null,
        topics: [{
          id: 57, slug: 'java-basics', title: 'Java basics', description: null,
          publishedConceptCount: 4, completedConceptCount: 1, bookmarkedConceptCount: 0,
          level1Count: 4, level2Count: 0, level3Count: 0, unseenCount: 1,
          learningCount: 1, reviewNeededCount: 1,
        }],
      },
      isPending: false, isError: false, refetch: vi.fn(),
    }
    mocks.firstOutlineQuery = {
      data: {
        items: [concept(1), concept(2), concept(3), concept(4)],
        page: { page: 0, size: 200, totalElements: 4, totalPages: 1, hasNext: false, hasPrevious: false },
      },
      isPending: false, isError: false, refetch: vi.fn(),
    }
    mocks.remainingOutlinePages = []
    mocks.remainingOutlineQueries = []
    mocks.conceptQuery = { data: undefined, isPending: false, isError: false }
    mocks.links = []
  })

  it('offers separate next-learning and review actions in curriculum order', () => {
    mocks.firstOutlineQuery = {
      data: {
        items: [
          { ...concept(1), learningStatus: 'COMPLETED' },
          { ...concept(2), learningStatus: 'REVIEW_NEEDED' },
          { ...concept(3), learningStatus: 'UNSEEN' },
          { ...concept(4), learningStatus: 'LEARNING' },
        ],
        page: { page: 0, size: 200, totalElements: 4, totalPages: 1, hasNext: false, hasPrevious: false },
      },
      isPending: false, isError: false, refetch: vi.fn(),
    }
    mocks.remainingOutlinePages = []
    const html = renderToStaticMarkup(<AreaPage />)
    expect(html).toContain('학습 중인 개념 이어가기')
    expect(html).toContain('복습 필요: Outline 2')
    expect(html).toContain('L1')
    expect(html).toContain('L2')
    expect(html).toContain('L3')
    expect(html).toContain('커리큘럼 순서')
  })

  it('does not request the entire outline when showing filtered results', () => {
    mocks.search = { ...mocks.search, topic: 57, level: '1' }
    renderToStaticMarkup(<AreaPage />)
    expect(mocks.remainingOutlineQueries).toHaveLength(0)
  })
})
