import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  search: { q: 'volatile', types: '', areas: '', topics: '', levels: '', sort: 'RELEVANCE' as const, page: 0 },
  status: { data: { state: 'READY' }, isPending: false, isError: false },
  filters: { data: [], isPending: false },
  results: { data: null as unknown },
  mutation: { isPending: false, isError: false, mutate: vi.fn() },
}))

vi.mock('@tanstack/react-router', () => ({
  useSearch: () => mocks.search,
  useNavigate: () => mocks.navigate,
}))
vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: { queryKey: unknown[] }) => {
    if (options.queryKey[0] === 'search-status') return mocks.status
    if (options.queryKey[0] === 'search-filter-options') return mocks.filters
    return mocks.results
  },
  useMutation: () => mocks.mutation,
}))

import { SearchPage } from './SearchPage'

describe('SearchPage', () => {
  beforeEach(() => {
    mocks.navigate.mockReset()
    mocks.results.data = {
      totalHits: 2,
      totalPages: 1,
      items: [{
        documentType: 'QUESTION',
        sourceId: 42,
        questionId: 42,
        title: 'volatile question',
        highlightedTitle: 'volatile question',
        snippet: 'Question preview',
        areaSlugs: ['java'],
        areaNames: ['Java'],
        topicContentKeys: ['jmm'],
        topicTitles: ['Memory model'],
        levels: [1],
        updatedAt: '2026-09-01T00:00:00Z',
        conceptId: 7,
        referenceUrl: null,
      }, {
        documentType: 'CONCEPT',
        sourceId: 7,
        questionId: null,
        title: 'Java Memory Model',
        highlightedTitle: 'Java Memory Model',
        snippet: 'Concept preview',
        areaSlugs: ['java'],
        areaNames: ['Java'],
        topicContentKeys: ['jmm'],
        topicTitles: ['Memory model'],
        levels: [1],
        updatedAt: '2026-09-01T00:00:00Z',
        conceptId: 7,
        referenceUrl: null,
      }],
    }
  })

  it('prioritizes solving a question and keeps its related concept action', () => {
    const markup = renderToStaticMarkup(<SearchPage />)

    expect(markup).toContain('문제 풀기')
    expect(markup).toContain('관련 개념 보기')
    expect(markup).toContain('개념 열기')
  })
})
