import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getBookmarkCategories, renameBookmarkCategory } from '../lib/bookmark-api'
import { getConcepts } from '../lib/learning-api'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import { useToast } from '../components/toast/ToastProvider'
import { defaultLearningSearch } from '../lib/learning-search'

const PAGE_SIZE = 12

/** Stable paged bookmark library, including bookmarks without a classification. */
export function BookmarksPage() {
  const search = useSearch({ from: '/bookmarks' })
  const navigate = useNavigate({ from: '/bookmarks' })
  const client = useQueryClient()
  const { showToast } = useToast()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const categories = useQuery({ queryKey: ['bookmark-categories'], queryFn: getBookmarkCategories })
  const concepts = useQuery({
    queryKey: ['concepts', 'bookmarks', search.category ?? null, search.page],
    queryFn: () => getConcepts({
      bookmarked: true, bookmarkCategoryId: search.category, page: search.page, size: PAGE_SIZE, sort: 'TITLE',
    }),
  })
  const rename = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => renameBookmarkCategory(id, name),
    onSuccess: () => {
      setEditingId(null)
      void client.invalidateQueries({ queryKey: ['bookmark-categories'] })
      showToast('success', '북마크 분류 이름을 변경했습니다.')
    },
    onError: () => showToast('error', '이름 변경에 실패했습니다. 중복 이름과 길이를 확인해 주세요.'),
  })
  const saveName = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (editingId === null || !draft.trim() || draft.trim().length > 60) return
    rename.mutate({ id: editingId, name: draft.trim() })
  }
  const select = (category: number | undefined) => {
    setEditingId(null)
    void navigate({ search: { category, page: 0 } })
  }
  return <section className="page-section bookmarks-page">
    <nav className="breadcrumb" aria-label="탐색 경로"><Link to="/learning" search={defaultLearningSearch}>학습</Link><span>/</span><strong>북마크</strong></nav>
    <header className="bookmarks-header">
      <p className="eyebrow">개인 학습 기록</p>
      <h1>북마크 모아보기</h1>
      <p className="lead">북마크한 개념을 분류해 다시 읽으세요. 분류하지 않은 기존 북마크도 전체 목록에 남습니다.</p>
    </header>
    <section className="bookmark-category-list" aria-label="북마크 분류 필터">
      <button type="button" className={search.category === undefined ? 'active' : ''}
        aria-pressed={search.category === undefined} onClick={() => select(undefined)}>전체 북마크</button>
      {categories.isPending ? <p role="status">분류 불러오는 중…</p>
        : categories.isError || !categories.data ?
          <div role="alert">분류를 불러오지 못했습니다.
            <button type="button" className="text-button" onClick={() => void categories.refetch()}>다시 시도</button>
          </div> : categories.data.map((category) =>
            <div key={category.id} className="bookmark-category-item">
              <button type="button" className={search.category === category.id ? 'active' : ''}
                aria-pressed={search.category === category.id}
                onClick={() => select(category.id)}>{category.name}</button>
              <button type="button" className="text-button" aria-label={`${category.name} 이름 변경`}
                onClick={() => { setEditingId(category.id); setDraft(category.name) }}>이름 변경</button>
            </div>)}
    </section>
    {editingId !== null && <form className="bookmark-rename-form" onSubmit={saveName}>
      <label htmlFor="bookmark-rename-input">분류 이름 변경 (최대 60자)</label>
      <input id="bookmark-rename-input" autoFocus required maxLength={60} value={draft}
        onChange={(event) => setDraft(event.target.value)} />
      <button className="primary-button" type="submit" disabled={rename.isPending || !draft.trim()}>저장</button>
      <button className="secondary-button" type="button" onClick={() => setEditingId(null)}>취소</button>
    </form>}
    <div className="bookmark-list-header">
      <h2>{search.category === undefined ? '저장한 개념' : categories.data?.find(c => c.id === search.category)?.name ?? '선택한 분류'}</h2>
      {concepts.data && <span>{concepts.data.page.totalElements}개</span>}
    </div>
    {concepts.isPending ? <PageSkeleton rows={4} /> : concepts.isError || !concepts.data ?
      <ErrorState message="북마크 목록을 불러오지 못했습니다." onRetry={() => void concepts.refetch()} /> :
      concepts.data.items.length === 0 ? <p className="helper-text">이 분류에 저장된 북마크가 없습니다. 개념을 북마크하고 분류를 선택하세요.</p> :
        <div className="bookmark-concept-list">
          {concepts.data.items.map((concept) => <article key={concept.id} className="bookmark-concept">
            <div><h3><Link to="/concepts/$conceptId" params={{ conceptId: String(concept.id) }}>{concept.title}</Link></h3>
              <p>{concept.summary}</p><small>{concept.areaName} · {concept.topicTitle} · 레벨 {concept.level}</small></div>
            <Link className="text-button" to="/compare" search={{ left: concept.id }}>비교하기</Link>
          </article>)}
        </div>}
    {concepts.data && concepts.data.page.totalPages > 1 && <nav className="pagination" aria-label="북마크 페이지">
      <button type="button" className="secondary-button" disabled={!concepts.data.page.hasPrevious}
        onClick={() => void navigate({ search: { ...search, page: search.page - 1 } })}>이전</button>
      <span>{search.page + 1} / {concepts.data.page.totalPages}</span>
      <button type="button" className="secondary-button" disabled={!concepts.data.page.hasNext}
        onClick={() => void navigate({ search: { ...search, page: search.page + 1 } })}>다음</button>
    </nav>}
  </section>
}
