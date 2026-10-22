import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ConceptPage } from '../lib/learning-api'
const mocks = vi.hoisted(() => ({
  search: { category: undefined as number | undefined, page: 0 },
  categories: { data: [] as Array<{ id: number; name: string; displayOrder: number }> | undefined,
    isPending: false, isError: false, refetch: vi.fn() },
  concepts: { data: undefined as ConceptPage | undefined, isPending: false, isError: false, refetch: vi.fn() },
  navigate: vi.fn(),
}))
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, className }: { children: ReactNode; className?: string }) =>
    <a href="#" className={className}>{children}</a>,
  useSearch: () => mocks.search,
  useNavigate: () => mocks.navigate,
}))
vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: readonly unknown[] }) =>
    queryKey[0] === 'bookmark-categories' ? mocks.categories : mocks.concepts,
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useMutation: () => ({ mutate: vi.fn(), isPending: false }),
}))
vi.mock('../components/toast/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}))
import { BookmarksPage } from './BookmarksPage'

describe('bookmark library', () => {
  beforeEach(() => {
    mocks.search = { category: undefined, page: 0 }
    mocks.categories = { data: [
      { id: 1, name: '다시 읽기', displayOrder: 1 },
      { id: 2, name: '어려운 개념', displayOrder: 2 },
      { id: 3, name: '면접 대비', displayOrder: 3 },
    ], isPending: false, isError: false, refetch: vi.fn() }
    mocks.concepts = { data: { items: [], page: {
      page: 0, size: 12, totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false,
    } }, isPending: false, isError: false, refetch: vi.fn() }
  })

  it('preserves an all-bookmarks view as well as categories', () => {
    const html = renderToStaticMarkup(<BookmarksPage />)
    expect(html).toContain('전체 북마크')
    expect(html).toContain('다시 읽기')
    expect(html).toContain('어려운 개념')
    expect(html).toContain('면접 대비')
    expect(html).toContain('분류하지 않은 기존 북마크도 전체 목록에 남습니다')
    expect(html).toContain('이 분류에 저장된 북마크가 없습니다')
  })

  it('shows the active category and a recoverable backend error', () => {
    mocks.search.category = 2
    mocks.concepts.isError = true
    mocks.concepts.data = undefined
    const html = renderToStaticMarkup(<BookmarksPage />)
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('북마크 목록을 불러오지 못했습니다')
  })
})
