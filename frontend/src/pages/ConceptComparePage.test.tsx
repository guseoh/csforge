import { AccessContext } from '../lib/access-context'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ConceptDetail } from '../lib/learning-api'

const mocks = vi.hoisted(() => ({
  search: { left: undefined as number | undefined, right: undefined as number | undefined },
  left: { data: undefined as ConceptDetail | undefined, isPending: false, isError: false, refetch: vi.fn() },
  right: { data: undefined as ConceptDetail | undefined, isPending: false, isError: false, refetch: vi.fn() },
  picker: { data: undefined, isPending: false, isError: false, refetch: vi.fn() },
}))
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
  useSearch: () => mocks.search, useNavigate: () => vi.fn(),
}))
vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: readonly unknown[] }) =>
    queryKey[0] !== 'concept' ? mocks.picker : queryKey[1] === mocks.search.left ? mocks.left : mocks.right,
}))
vi.mock('../components/MarkdownContent', () => ({
  MarkdownContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))
import { ConceptComparePage } from './ConceptComparePage'

const concept: ConceptDetail = {
  id: 17, contentKey: 'java.one', slug: 'one', title: '값 전달', summary: '전달된 값을 복사',
  contentMarkdown: '## 실행 흐름\n본문', level: 1, contentStatus: 'PUBLISHED',
  area: { id: 1, slug: 'java', name: 'Java' }, topic: { id: 2, slug: 'types', title: '타입' },
  progress: { learningStatus: 'UNSEEN', bookmarked: false, firstViewedAt: null, lastViewedAt: null, completedAt: null },
  references: [], personalNote: null, previous: null, next: null, relatedConcepts: [],
}
describe('Concept comparison', () => {
  beforeEach(() => {
    mocks.search = { left: undefined, right: undefined }
    mocks.left = { data: undefined, isPending: false, isError: false, refetch: vi.fn() }
    mocks.right = { data: undefined, isPending: false, isError: false, refetch: vi.fn() }
  })
  it('provides empty selection without rendering columns', () => {
    const html = renderToStaticMarkup(<AccessContext.Provider value={{ authenticated: true, requestLogin: vi.fn() }}><ConceptComparePage /></AccessContext.Provider>)
    expect(html).toContain('첫 번째 개념 검색')
    expect(html).not.toContain('compare-column-header')
  })
  it('keeps the first article while selecting the second', () => {
    mocks.search.left = 17
    mocks.left.data = concept
    const html = renderToStaticMarkup(<AccessContext.Provider value={{ authenticated: true, requestLogin: vi.fn() }}><ConceptComparePage /></AccessContext.Provider>)
    expect(html).toContain('두 번째 개념을 선택하면')
    expect(html).toContain('값 전달')
  })
  it('rejects the same pair instead of implying a comparison', () => {
    mocks.search = { left: 17, right: 17 }
    mocks.left.data = concept
    const html = renderToStaticMarkup(<AccessContext.Provider value={{ authenticated: true, requestLogin: vi.fn() }}><ConceptComparePage /></AccessContext.Provider>)
    expect(html).toContain('같은 개념끼리는 비교할 수 없습니다')
    expect(html).not.toContain('compare-grid')
  })
  it('shows independent articles and actions', () => {
    mocks.search = { left: 17, right: 19 }
    mocks.left.data = concept
    mocks.right.data = { ...concept, id: 19, title: '참조 공유' }
    const html = renderToStaticMarkup(<AccessContext.Provider value={{ authenticated: true, requestLogin: vi.fn() }}><ConceptComparePage /></AccessContext.Provider>)
    expect(html).toContain('값 전달 읽기 영역')
    expect(html).toContain('참조 공유 읽기 영역')
    expect(html.match(/관련 문제 풀기/g)).toHaveLength(2)
  })
  it('keeps one side readable when the other is missing', () => {
    mocks.search = { left: 17, right: 999 }
    mocks.left.data = concept
    mocks.right.isError = true
    const html = renderToStaticMarkup(<AccessContext.Provider value={{ authenticated: true, requestLogin: vi.fn() }}><ConceptComparePage /></AccessContext.Provider>)
    expect(html).toContain('값 전달')
    expect(html).toContain('두 번째 개념이 없거나 공개되지 않았습니다')
    expect(html).toContain('다른 개념 선택')
  })
})
