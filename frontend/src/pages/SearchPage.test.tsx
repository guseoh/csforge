import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  search: { q: 'volatile', types: '', areas: '', topics: '', levels: '', sort: 'RELEVANCE' as const, page: 0 },
  status: { data: { state: 'READY' }, isPending: false, isError: false, refetch: vi.fn() },
  filters: { data: [], isPending: false, isError: false, refetch: vi.fn() },
  results: { data: null as unknown, isPending: false, isError: false, refetch: vi.fn() },
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
    mocks.search = { q: 'volatile', types: '', areas: '', topics: '', levels: '', sort: 'RELEVANCE', page: 0 }
    mocks.status.isPending = false
    mocks.status.isError = false
    mocks.filters.isPending = false
    mocks.filters.isError = false
    mocks.results.isPending = false
    mocks.results.isError = false
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
  it('renders all five document types with safe highlighted snippets and available destinations', () => {
    const source = (type: string, id: number) => ({
      documentType: type, sourceId: id,
      questionId: type === 'WRONG_NOTE' || type === 'QUESTION' ? id : null,
      conceptId: type === 'CONCEPT' || type === 'PERSONAL_NOTE' ? id : 7,
      referenceUrl: type === 'REFERENCE' ? 'https://example.com/reference' : null,
      title: type + ' title',
      highlightedTitle: 'Java [[H]]volatile[[/H]] <script>alert(1)</script>',
      snippet: 'Why [[H]]volatile[[/H]] matters',
      areaSlugs: ['java'], areaNames: ['Java'],
      topicContentKeys: ['jmm'], topicTitles: ['Memory model'],
      levels: [1], updatedAt: '2026-09-01T00:00:00Z',
    })
    mocks.results.data = {
      totalHits: 5, totalPages: 1,
      items: ['CONCEPT','QUESTION','PERSONAL_NOTE','WRONG_NOTE','REFERENCE'].map(source),
    }
    const html = renderToStaticMarkup(<SearchPage />)
    for (const label of ['개념','문제','개인 메모','오답 노트','참고 자료']) {
      expect(html).toContain(label)
    }
    expect(html).toContain('<mark>volatile</mark>')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('관련 개념 보기')
    expect(html).toContain('오답 노트 열기')
    expect(html).toContain('자료 열기')
    expect(html).toContain('일치하는 검색 문맥')
  })

  it('offers a reset when an active filter has no matching results', () => {
    mocks.search.types = 'WRONG_NOTE'
    mocks.results.data = { totalHits: 0, totalPages: 0, items: [] }
    const html = renderToStaticMarkup(<SearchPage />)
    expect(html).toContain('검색 결과가 없습니다.')
    expect(html).toContain('필터 초기화하고 다시 보기')
    expect(html).not.toContain('1 / 0')
  })

  it('keeps search usable during supplementary status failure', () => {
    mocks.status.isError = true
    const html = renderToStaticMarkup(<SearchPage />)
    expect(html).toContain('검색 서버 상태를 확인하지 못했습니다.')
    expect(html).toContain('상태 다시 확인')
    expect(html).toContain('Java Memory Model')
  })

  it('shows filter recovery without dropping search results', () => {
    mocks.filters.isError = true
    const html = renderToStaticMarkup(<SearchPage />)
    expect(html).toContain('학습 영역 필터를 불러오지 못했습니다.')
    expect(html).toContain('다시 시도')
    expect(html).toContain('Java Memory Model')
  })

  it('does not render stale results while the current request has failed', () => {
    mocks.results.isError = true
    const html = renderToStaticMarkup(<SearchPage />)
    expect(html).toContain('검색 결과를 불러오지 못했습니다.')
    expect(html).not.toContain('Java Memory Model')
  })

  it('explains title suggestions separately from submitted full results', () => {
    const html = renderToStaticMarkup(<SearchPage />)
    expect(html).toContain('입력 중 제안은 제목 바로가기')
    expect(html).toContain('상단 검색은 제출한 검색어')
  })
})
