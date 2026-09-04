import { useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import {
  getLearningArea,
  getLearningAreas,
  getWrongNotes,
  type QuestionDifficulty,
  type WrongAnswerAnalysisStatus,
  type WrongNoteStatus,
} from '../lib/api'
import {
  withWrongNoteArea,
  countAdvancedWrongNoteFilters,
  withWrongNoteFilter,
  withWrongNotePage,
  type WrongNoteFilterKey,
} from '../lib/wrong-note-search'
import { compactMarkdownPreview } from '../lib/markdown'

const analysisLabels: Record<Exclude<WrongAnswerAnalysisStatus, 'PROVIDER_NOT_CONFIGURED'>, string> = {
  NOT_REQUESTED: 'AI 미요청',
  PENDING: 'AI 대기 중',
  PROCESSING: 'AI 분석 중',
  COMPLETED: 'AI 완료',
  FAILED: 'AI 실패',
}

function ConceptContext({ concepts }: { concepts: { id: number; title: string; areaName: string; level: number }[] }) {
  if (concepts.length === 0) return <p className="concept-context-empty">연결된 Concept가 없습니다.</p>
  return (
    <div className="concept-context-list">
      {concepts.map((concept) => (
        <Link key={concept.id} to="/concepts/$conceptId" params={{ conceptId: String(concept.id) }}>
          <span>{concept.title}</span>
          <small>{concept.areaName} · L{concept.level}</small>
        </Link>
      ))}
    </div>
  )
}

export function WrongNotesPage() {
  const search = useSearch({ from: '/wrong-notes' })
  const navigate = useNavigate({ from: '/wrong-notes' })
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false)
  const query = useQuery({
    queryKey: ['wrong-notes', search],
    queryFn: () => getWrongNotes({
      page: search.page,
      size: 20,
      area: search.area || undefined,
      topic: search.topic ? Number(search.topic) : undefined,
      level: search.level ? Number(search.level) : undefined,
      difficulty: (search.difficulty || undefined) as QuestionDifficulty | undefined,
      status: (search.status || undefined) as WrongNoteStatus | undefined,
      review: search.review,
      analysis: search.analysis as Exclude<WrongAnswerAnalysisStatus, 'PROVIDER_NOT_CONFIGURED'>,
      sort: search.sort,
    }),
  })
  const areasQuery = useQuery({ queryKey: ['learning-areas'], queryFn: getLearningAreas })
  const topicsQuery = useQuery({
    queryKey: ['learning-area', search.area],
    queryFn: () => getLearningArea(search.area),
    enabled: Boolean(search.area),
  })

  if (query.isPending) return <PageSkeleton rows={5} />
  if (query.isError) return <ErrorState message="오답 노트를 불러오지 못했습니다." onRetry={() => void query.refetch()} />

  const updateFilter = (key: WrongNoteFilterKey, value: string) => void navigate({
    search: (current) => withWrongNoteFilter(current, key, value),
  })
  const updateArea = (value: string) => void navigate({
    search: (current) => withWrongNoteArea(current, value),
  })
  const updatePage = (page: number) => void navigate({
    search: (current) => withWrongNotePage(current, page),
  })
  const advancedFilterCount = countAdvancedWrongNoteFilters(search)

  return (
    <section className="page-section">
      <div className="page-heading"><div><p className="eyebrow">Learning loop</p><h1>Wrong notes</h1><p className="lead">틀린 문제와 다음 복습 일정을 한 곳에서 관리하세요.</p></div><span className="result-count">{query.data.page.totalElements} items</span></div>
      <div className="filter-panel wrong-note-filters">
        <div className="filter-panel-header">
          <div><p className="eyebrow">Refine wrong notes</p><strong>필터</strong></div>
          <span className="helper-text">학습 맥락과 복습 상태를 나누어 좁혀 보세요.</span>
        </div>
        <div className="wrong-note-primary-filters">
          <fieldset className="filter-group">
          <legend>Learning state</legend>
          <div className="filter-group-fields">
            <label>Status
              <select value={search.status} onChange={(event) => updateFilter('status', event.target.value)}><option value="">All</option><option value="ACTIVE">Active</option><option value="MASTERED">Mastered</option></select>
            </label>
            <label>Review
              <select value={search.review} onChange={(event) => updateFilter('review', event.target.value)}><option value="ALL">All</option><option value="DUE">Due</option><option value="SCHEDULED">Scheduled</option><option value="MASTERED">Mastered</option><option value="NONE">No schedule</option></select>
            </label>
          </div>
          </fieldset>
          <fieldset className="filter-group filter-group-order">
            <legend>Ordering</legend>
            <label>Sort
              <select value={search.sort} onChange={(event) => updateFilter('sort', event.target.value)}><option value="RECENT">Recent</option><option value="WRONG_COUNT">Wrong count</option><option value="REVIEW_DUE">Review due</option></select>
            </label>
          </fieldset>
          <button className="secondary-button wrong-note-filter-toggle" type="button" aria-expanded={advancedFiltersOpen} onClick={() => setAdvancedFiltersOpen((open) => !open)}>
            {advancedFiltersOpen ? '추가 필터 닫기' : '추가 필터 열기'}{advancedFilterCount > 0 && <span className="filter-active-count">{advancedFilterCount}개 적용</span>}
          </button>
        </div>
        {advancedFiltersOpen && <fieldset className="filter-group wrong-note-advanced-filters">
          <legend>Additional filters</legend>
          <div className="filter-group-fields">
            <label>Area
              <select value={search.area} onChange={(event) => updateArea(event.target.value)} disabled={areasQuery.isPending || areasQuery.isError}>
                <option value="">All areas</option>
                {areasQuery.data?.map((area) => <option key={area.id} value={area.slug}>{area.name}</option>)}
              </select>
            </label>
            <label>Topic
              <select value={search.topic} onChange={(event) => updateFilter('topic', event.target.value)} disabled={!search.area || topicsQuery.isPending || topicsQuery.isError}>
                <option value="">All topics</option>
                {topicsQuery.data?.topics.map((topic) => <option key={topic.id} value={String(topic.id)}>{topic.title}</option>)}
              </select>
            </label>
            <label>Level
              <select value={search.level} onChange={(event) => updateFilter('level', event.target.value)}>
                <option value="">All levels</option><option value="1">Level 1</option><option value="2">Level 2</option><option value="3">Level 3</option>
              </select>
            </label>
            <label>Difficulty
              <select value={search.difficulty} onChange={(event) => updateFilter('difficulty', event.target.value)}>
                <option value="">All difficulties</option><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
              </select>
            </label>
            <label>AI analysis
              <select value={search.analysis} onChange={(event) => updateFilter('analysis', event.target.value)}><option value="ALL">All</option><option value="NOT_REQUESTED">Not requested</option><option value="PENDING">Pending</option><option value="PROCESSING">Processing</option><option value="COMPLETED">Completed</option><option value="FAILED">Failed</option></select>
            </label>
          </div>
        </fieldset>}
      </div>
      {query.data.items.length === 0 ? <div className="state-card"><strong>아직 오답 노트가 없습니다.</strong><span>Quiz를 제출하면 틀린 문제가 여기에 쌓입니다.</span></div> : <div className="concept-list">{query.data.items.map((item) => <article className="concept-list-item wrong-note-list-item" key={item.questionId}><div className="concept-list-main"><h3><Link className="wrong-note-question-link" to="/wrong-notes/$questionId" params={{ questionId: String(item.questionId) }}>{compactMarkdownPreview(item.promptMarkdown)}</Link></h3><ConceptContext concepts={item.concepts} /><div className="chip-row concept-list-status"><span className="chip">{item.questionType}</span><span className="chip">{item.difficulty}</span><span className={`chip state-badge state-${item.status.toLowerCase()}`}>{item.status === 'ACTIVE' ? 'Active wrong note' : 'Mastered'}</span><span className={`chip state-badge ai-state-${item.aiAnalysisStatus.toLowerCase()}`}>{analysisLabels[item.aiAnalysisStatus]}</span></div></div><div className="wrong-note-metrics"><strong>{item.wrongCount} wrong</strong><span>{item.dueAt ? `Due ${new Date(item.dueAt).toLocaleDateString()}` : 'No due date'}</span></div></article>)}</div>}
      <div className="pagination"><button className="secondary-button" disabled={!query.data.page.hasPrevious} onClick={() => updatePage(Math.max(0, search.page - 1))}>Previous</button><span>Page {search.page + 1} / {Math.max(1, query.data.page.totalPages)}</span><button className="secondary-button" disabled={!query.data.page.hasNext} onClick={() => updatePage(search.page + 1)}>Next</button></div>
    </section>
  )
}
