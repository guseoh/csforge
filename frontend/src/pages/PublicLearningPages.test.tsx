import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AccessContext } from '../lib/access-context'
import type { PublicConcept } from '../lib/public-api'

const mocks = vi.hoisted(() => ({
  requests: [] as Promise<unknown>[],
  data: undefined as unknown,
  areaData: undefined as unknown,
  conceptPageData: undefined as unknown,
}))
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
  useParams: () => ({ conceptId: '17', areaSlug: 'java' }),
  useSearch: () => ({ level: 'all', q: '', page: 0, sort: 'curriculum' }),
  useNavigate: () => vi.fn(),
}))
vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryFn, queryKey }: { queryFn: () => Promise<unknown>; queryKey: unknown[] }) => {
    mocks.requests.push(queryFn())
    const key = queryKey[1]
    const data = key === 'area' ? mocks.areaData : key === 'concepts' ? mocks.conceptPageData : mocks.data
    return { data, isPending: false, isError: false, refetch: vi.fn() }
  },
}))
import { PublicAreaPage, PublicConceptPage, PublicLearningPage } from './PublicLearningPages'

const concept: PublicConcept = {
  id: 17, contentKey: 'java.one', slug: 'one', title: '공개 개념', summary: '공개 요약', contentMarkdown: 'Canonical body', level: 1,
  area: { id: 1, slug: 'java', name: 'Java' }, topic: { id: 2, slug: 'types', title: '타입' },
  references: [], previous: null, next: null, relatedConcepts: [],
}

describe('guest canonical pages', () => {
  beforeEach(() => {
    mocks.requests = []
    mocks.areaData = undefined
    mocks.conceptPageData = undefined
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) }))
  })
  it('reads a concept without auto-view, note, understanding, or mutation requests', async () => {
    mocks.data = concept
    const html = renderToStaticMarkup(<AccessContext.Provider value={{ authenticated: false, requestLogin: vi.fn() }}><PublicConceptPage /></AccessContext.Provider>)
    await Promise.all(mocks.requests)
    expect(html).toContain('Canonical body')
    expect(html).not.toContain('textarea')
    expect(vi.mocked(fetch).mock.calls.map(([url]) => url)).toEqual(['/api/public/concepts/17'])
    expect(vi.mocked(fetch).mock.calls[0][1]?.method ?? 'GET').toBe('GET')
  })
  it('uses the shared reader and keeps Korean emphasis and intentional literals distinct', async () => {
    mocks.data = { ...concept, contentMarkdown: '**필드(field)**를 읽고 **예시**를 확인합니다. `**예시**`와 \\*\\*예시\\*\\*도 보존합니다.' }
    const html = renderToStaticMarkup(<AccessContext.Provider value={{ authenticated: false, requestLogin: vi.fn() }}><PublicConceptPage /></AccessContext.Provider>)
    await Promise.all(mocks.requests)
    expect(html).toContain('concept-page public-reader')
    expect(html).toContain('concept-reader-header')
    expect(html).toContain('<strong>필드(field)</strong>를')
    expect(html).toContain('<strong>예시</strong>를')
    expect(html).toContain('<code>**예시**</code>와 **예시**도')
    expect(html).toContain('공개 읽기')
    expect(html).not.toContain('학습 중')
  })
  it('renders the public area filters, long topic navigation and paginated concept list', async () => {
    const longTitle = '파이프라이닝과 명령어 수준 병렬성(Pipelining and Instruction-Level Parallelism)'
    mocks.areaData = {
      id: 1, slug: 'java', name: '컴퓨터 구조', description: '공개 학습 영역',
      topics: [{ id: 17, slug: 'pipeline', title: longTitle, publishedConceptCount: 6,
        level1Count: 2, level2Count: 3, level3Count: 1, description: null }],
    }
    mocks.conceptPageData = {
      items: [{ id: 59, title: '비트·바이트·워드', summary: '주소 공간과 레지스터 폭',
        topicTitle: longTitle, level: 1 }],
      page: { page: 0, size: 30, totalElements: 1, totalPages: 1, hasPrevious: false, hasNext: false },
    }
    const html = renderToStaticMarkup(<PublicAreaPage />)
    await Promise.all(mocks.requests)
    expect(html).toContain('public-area-page')
    expect(html).toContain('public-filters')
    expect(html).toContain('public-topic-navigation')
    expect(html).toContain('public-curriculum public-concept-list')
    expect(html).toContain('public-page-navigation')
    expect(html).toContain(longTitle)
    expect(html).toContain('비트·바이트·워드')
    const requested = vi.mocked(fetch).mock.calls.map(([url]) => String(url))
    expect(requested).toContain('/api/public/learning-areas/java')
    expect(requested.some((url) => url.startsWith('/api/public/concepts?'))).toBe(true)
    expect(vi.mocked(fetch).mock.calls.every(([, init]) => (init?.method ?? 'GET') === 'GET')).toBe(true)
  })
  it('loads only canonical counts on the guest home', async () => {
    mocks.data = [{ id: 1, slug: 'java', name: 'Java', description: '언어', topicCount: 2, publishedConceptCount: 12 }]
    const html = renderToStaticMarkup(<PublicLearningPage home />)
    await Promise.all(mocks.requests)
    expect(html).toContain('학습 영역 둘러보기')
    expect(html).not.toContain('정확도')
    expect(html).not.toContain('최근 본')
    expect(vi.mocked(fetch).mock.calls.map(([url]) => url)).toEqual(['/api/public/learning-areas'])
  })
})
