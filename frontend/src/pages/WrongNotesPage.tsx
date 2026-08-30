import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import { getWrongNotes, type QuestionDifficulty, type WrongNoteStatus } from '../lib/api'

export function WrongNotesPage() {
  const search = useSearch({ from: '/wrong-notes' })
  const navigate = useNavigate({ from: '/wrong-notes' })
  const query = useQuery({ queryKey: ['wrong-notes', search], queryFn: () => getWrongNotes({ page: search.page, size: 20, area: search.area || undefined, status: (search.status || undefined) as WrongNoteStatus | undefined, review: search.review, sort: search.sort }) })
  if (query.isPending) return <PageSkeleton rows={5} />
  if (query.isError) return <ErrorState message="오답 노트를 불러오지 못했습니다." onRetry={() => void query.refetch()} />
  const update = (key: string, value: string) => void navigate({ search: (current) => ({ ...current, [key]: value, page: 0 }) })
  return (
    <section className="page-section">
      <div className="page-heading"><div><p className="eyebrow">Learning loop</p><h1>Wrong notes</h1><p className="lead">틀린 문제와 다음 복습 일정을 한 곳에서 관리하세요.</p></div><span className="result-count">{query.data.page.totalElements} items</span></div>
      <div className="filter-panel wrong-note-filters">
        <label>Area<input value={search.area} onChange={(event) => update('area', event.target.value)} placeholder="area slug" /></label>
        <label>Status<select value={search.status} onChange={(event) => update('status', event.target.value)}><option value="">All</option><option value="ACTIVE">Active</option><option value="MASTERED">Mastered</option></select></label>
        <label>Review<select value={search.review} onChange={(event) => update('review', event.target.value)}><option value="ALL">All</option><option value="DUE">Due</option><option value="SCHEDULED">Scheduled</option><option value="MASTERED">Mastered</option><option value="NONE">No schedule</option></select></label>
        <label>Sort<select value={search.sort} onChange={(event) => update('sort', event.target.value)}><option value="RECENT">Recent</option><option value="WRONG_COUNT">Wrong count</option><option value="REVIEW_DUE">Review due</option></select></label>
      </div>
      {query.data.items.length === 0 ? <div className="state-card"><strong>아직 오답 노트가 없습니다.</strong><span>Quiz를 제출하면 틀린 문제가 여기에 쌓입니다.</span></div> : <div className="concept-list">{query.data.items.map((item) => <Link className="concept-list-item" key={item.questionId} to="/wrong-notes/$questionId" params={{ questionId: String(item.questionId) }}><div className="concept-list-main"><div className="chip-row"><span className="chip">{item.questionType}</span><span className="chip">{item.difficulty}</span><span className="chip status-review_needed">{item.reviewStage ? `Stage ${item.reviewStage}` : item.status}</span></div><h3>{item.promptMarkdown}</h3><p>{item.concepts.map((concept) => `${concept.areaName} · ${concept.title}`).join(', ')}</p></div><div className="wrong-note-metrics"><strong>{item.wrongCount} wrong</strong><span>{item.dueAt ? `Due ${new Date(item.dueAt).toLocaleDateString()}` : 'No due date'}</span></div></Link>)}</div>}
      <div className="pagination"><button className="secondary-button" disabled={!query.data.page.hasPrevious} onClick={() => update('page', String(Math.max(0, search.page - 1)))}>Previous</button><span>Page {search.page + 1} / {Math.max(1, query.data.page.totalPages)}</span><button className="secondary-button" disabled={!query.data.page.hasNext} onClick={() => update('page', String(search.page + 1))}>Next</button></div>
    </section>
  )
}
