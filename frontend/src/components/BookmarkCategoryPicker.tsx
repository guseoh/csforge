import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getBookmarkCategories, getBookmarkAssignment, setBookmarkAssignment } from '../lib/bookmark-api'
import { useToast } from './toast/ToastProvider'
import { defaultBookmarksSearch } from '../lib/bookmarks-search'

/** Optional classification: bookmark status still comes from ConceptProgress. */
export function BookmarkCategoryPicker({ conceptId }: { conceptId: number }) {
  const client = useQueryClient()
  const { showToast } = useToast()
  const categories = useQuery({ queryKey: ['bookmark-categories'], queryFn: getBookmarkCategories })
  const assignment = useQuery({
    queryKey: ['bookmark-assignment', conceptId],
    queryFn: () => getBookmarkAssignment(conceptId),
  })
  const mutation = useMutation({
    mutationFn: (id: number | null) => setBookmarkAssignment(conceptId, id),
    onSuccess: (data) => {
      client.setQueryData(['bookmark-assignment', conceptId], data)
      void client.invalidateQueries({ queryKey: ['concepts'] })
      showToast('success', '북마크 분류를 저장했습니다.')
    },
    onError: () => {
      void assignment.refetch()
      showToast('error', '분류를 저장하지 못했습니다. 다시 시도해 주세요.')
    },
  })

  return <div className="bookmark-category-picker">
    <label htmlFor={`bookmark-category-${conceptId}`}>북마크 분류</label>
    {categories.isPending || assignment.isPending ? <p className="helper-text" role="status">분류 불러오는 중…</p>
      : categories.isError || assignment.isError || !categories.data || !assignment.data ?
        <div role="alert" className="bookmark-category-error">
          분류를 불러오지 못했습니다.
          <button type="button" className="text-button" onClick={() => {
            void categories.refetch()
            void assignment.refetch()
          }}>다시 시도</button>
        </div>
        : <select id={`bookmark-category-${conceptId}`} value={assignment.data.categoryId ?? ''}
          disabled={mutation.isPending}
          onChange={(event) => mutation.mutate(event.target.value ? Number(event.target.value) : null)}>
          <option value="">분류 없음</option>
          {categories.data.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>}
    <Link to="/bookmarks" search={defaultBookmarksSearch}>북마크 모아보기</Link>
    {mutation.isPending && <span role="status" className="helper-text">저장 중…</span>}
  </div>
}
