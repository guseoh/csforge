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
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, className }: { children: ReactNode; className?: string }) => <a className={className} href="#">{children}</a>,
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

function concept(id: number) {
  return {
    id,
    topicId: 57,
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
  })

  it('loads later outline pages and renders all concepts beyond the old 200-item cap', () => {
    const markup = renderToStaticMarkup(<AreaPage />)

    expect(mocks.remainingOutlineQueries).toHaveLength(1)
    expect(mocks.remainingOutlineQueries[0].queryKey).toEqual(['learning-outline', 'java', 1])
    expect(markup.match(/curriculum-concept-row/g)).toHaveLength(205)
    expect(markup).toContain('Outline 204')
  })
})
