import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AccessContext } from '../lib/access-context'
import type { PublicConcept } from '../lib/public-api'

const mocks = vi.hoisted(() => ({ requests: [] as Promise<unknown>[], data: undefined as unknown }))
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
  useParams: () => ({ conceptId: '17', areaSlug: 'java' }),
  useSearch: () => ({ level: 'all', q: '', page: 0, sort: 'curriculum' }),
  useNavigate: () => vi.fn(),
}))
vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryFn }: { queryFn: () => Promise<unknown> }) => {
    mocks.requests.push(queryFn())
    return { data: mocks.data, isPending: false, isError: false, refetch: vi.fn() }
  },
}))
vi.mock('../components/MarkdownContent', () => ({ MarkdownContent: ({ children }: { children: ReactNode }) => <div>{children}</div> }))
import { PublicConceptPage, PublicLearningPage } from './PublicLearningPages'

const concept: PublicConcept = {
  id: 17, contentKey: 'java.one', slug: 'one', title: '공개 개념', summary: '공개 요약', contentMarkdown: 'Canonical body', level: 1,
  area: { id: 1, slug: 'java', name: 'Java' }, topic: { id: 2, slug: 'types', title: '타입' },
  references: [], previous: null, next: null, relatedConcepts: [],
}

describe('guest canonical pages', () => {
  beforeEach(() => {
    mocks.requests = []
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
