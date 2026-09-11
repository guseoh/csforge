import { useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import { getWrongNotes, type WrongAnswerAnalysisStatus, type WrongNoteStatus } from '../lib/wrong-note-api'
import type { QuestionDifficulty } from '../lib/quiz-api'
import { getLearningArea, getLearningAreas } from '../lib/learning-api'
import {
  withWrongNoteArea,
  countAdvancedWrongNoteFilters,
  withWrongNoteFilter,
  withWrongNotePage,
  type WrongNoteFilterKey,
} from '../lib/wrong-note-search'
import { compactMarkdownPreview } from '../lib/markdown'
import { defaultQuizSearch } from '../lib/quiz-search'

const analysisLabels: Record<Exclude<WrongAnswerAnalysisStatus, 'PROVIDER_NOT_CONFIGURED'>, string> = {
  NOT_REQUESTED: 'AI 미요청',
  PENDING: 'AI 대기 중',
  PROCESSING: 'AI 분석 중',
  COMPLETED: 'AI 완료',
  FAILED: 'AI 실패',
}

const wrongNoteStatusLabels: Record<WrongNoteStatus, string> = { ACTIVE: '진행 중', MASTERED: '정리 완료' }
const reviewLabels = { ALL: '전체', DUE: '복습할 문제', SCHEDULED: '예약됨', MASTERED: '정리 완료', NONE: '일정 없음' }
const sortLabels = { RECENT: '최근 오답', WRONG_COUNT: '오답 많은 순', REVIEW_DUE: '복습 임박 순' }
const difficultyLabels = { EASY: '쉬움', MEDIUM: '보통', HARD: '어려움' }
const questionTypeLabels = { MULTIPLE_CHOICE: '객관식', SHORT_ANSWER: '단답형', DESCRIPTIVE: '서술형', SCENARIO: '시나리오' }

function FilterChoice({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return <button className={`filter-choice${selected ? ' selected' : ''}`} type="button" aria-pressed={selected} onClick={onClick}>{label}</button>
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
    <section className="page-section wrong-notes-page">
      <div className="page-heading"><div><p className="eyebrow">오답 복습</p><h1>오답 노트</h1><p className="lead">틀린 문제를 다시 이해하고, 다음 복습 시점까지 이어가세요.</p></div><span className="result-count">{query.data.page.totalElements}개</span></div>
      <div className="filter-panel wrong-note-filters">
        <div className="filter-panel-header">
          <div><p className="eyebrow">정리하기</p><strong>복습할 문제를 골라보세요</strong></div>
          <span className="helper-text">상태와 복습 시점을 누르면 바로 결과가 바뀝니다.</span>
        </div>
        <div className="wrong-note-primary-filters">
          <fieldset className="filter-group">
          <legend>학습 상태</legend>
          <div className="filter-choice-stack">
            <span>상태</span>
            <div className="filter-choice-row">
              <FilterChoice label="전체" selected={!search.status} onClick={() => updateFilter('status', '')} />
              <FilterChoice label="진행 중" selected={search.status === 'ACTIVE'} onClick={() => updateFilter('status', 'ACTIVE')} />
              <FilterChoice label="정리 완료" selected={search.status === 'MASTERED'} onClick={() => updateFilter('status', 'MASTERED')} />
            </div>
          </div>
          <div className="filter-choice-stack">
            <span>복습</span>
            <div className="filter-choice-row">
              {(Object.entries(reviewLabels) as [keyof typeof reviewLabels, string][]).map(([value, label]) => <FilterChoice key={value} label={label} selected={search.review === value} onClick={() => updateFilter('review', value)} />)}
            </div>
          </div>
          </fieldset>
          <fieldset className="filter-group filter-group-order">
            <legend>정렬</legend>
            <div className="filter-choice-stack">
              <span>순서</span>
              <div className="filter-choice-row filter-choice-row-vertical">
                {(Object.entries(sortLabels) as [keyof typeof sortLabels, string][]).map(([value, label]) => <FilterChoice key={value} label={label} selected={search.sort === value} onClick={() => updateFilter('sort', value)} />)}
              </div>
            </div>
          </fieldset>
          <button className="secondary-button wrong-note-filter-toggle" type="button" aria-expanded={advancedFiltersOpen} onClick={() => setAdvancedFiltersOpen((open) => !open)}>
            {advancedFiltersOpen ? '상세 필터 닫기' : '상세 필터'}{advancedFilterCount > 0 && <span className="filter-active-count">{advancedFilterCount}개</span>}
          </button>
        </div>
        {advancedFiltersOpen && <fieldset className="filter-group wrong-note-advanced-filters">
          <legend>상세 필터</legend>
          <div className="filter-group-fields">
            <label>학습 영역
              <select value={search.area} onChange={(event) => updateArea(event.target.value)} disabled={areasQuery.isPending || areasQuery.isError}>
                <option value="">모든 영역</option>
                {areasQuery.data?.map((area) => <option key={area.id} value={area.slug}>{area.name}</option>)}
              </select>
            </label>
            <label>주제
              <select value={search.topic} onChange={(event) => updateFilter('topic', event.target.value)} disabled={!search.area || topicsQuery.isPending || topicsQuery.isError}>
                <option value="">모든 주제</option>
                {topicsQuery.data?.topics.map((topic) => <option key={topic.id} value={String(topic.id)}>{topic.title}</option>)}
              </select>
            </label>
            <label>레벨
              <select value={search.level} onChange={(event) => updateFilter('level', event.target.value)}>
                <option value="">모든 레벨</option><option value="1">레벨 1</option><option value="2">레벨 2</option><option value="3">레벨 3</option>
              </select>
            </label>
            <label>난이도
              <select value={search.difficulty} onChange={(event) => updateFilter('difficulty', event.target.value)}>
                <option value="">모든 난이도</option><option value="EASY">쉬움</option><option value="MEDIUM">보통</option><option value="HARD">어려움</option>
              </select>
            </label>
            <label>AI 분석
              <select value={search.analysis} onChange={(event) => updateFilter('analysis', event.target.value)}><option value="ALL">전체</option><option value="NOT_REQUESTED">미요청</option><option value="PENDING">대기 중</option><option value="PROCESSING">분석 중</option><option value="COMPLETED">완료</option><option value="FAILED">실패</option></select>
            </label>
          </div>
        </fieldset>}
      </div>
      {query.data.items.length === 0 ? <div className="state-card wrong-note-empty"><span className="empty-state-icon" aria-hidden="true">↺</span><strong>아직 오답 노트가 없습니다.</strong><span>Quiz를 제출하면 틀린 문제가 이곳에 쌓이고, 다음 복습 시점까지 이어집니다.</span><Link className="primary-button" to="/quiz" search={defaultQuizSearch}>문제 풀러 가기 <span aria-hidden="true">→</span></Link></div> : <div className="concept-list">{query.data.items.map((item) => <article className="concept-list-item wrong-note-list-item" key={item.questionId}><div className="concept-list-main"><h3><Link className="wrong-note-question-link" to="/wrong-notes/$questionId" params={{ questionId: String(item.questionId) }}>{compactMarkdownPreview(item.promptMarkdown)}</Link></h3><ConceptContext concepts={item.concepts} /><div className="chip-row concept-list-status"><span className="chip">{questionTypeLabels[item.questionType]}</span><span className="chip">{difficultyLabels[item.difficulty]}</span><span className={`chip state-badge state-${item.status.toLowerCase()}`}>{wrongNoteStatusLabels[item.status]}</span><span className={`chip state-badge ai-state-${item.aiAnalysisStatus.toLowerCase()}`}>{analysisLabels[item.aiAnalysisStatus]}</span></div></div><div className="wrong-note-metrics"><strong>오답 {item.wrongCount}회</strong><span>{item.dueAt ? `복습 ${new Date(item.dueAt).toLocaleDateString('ko-KR')}` : '복습 일정 없음'}</span></div></article>)}</div>}
      <div className="pagination"><button className="secondary-button" disabled={!query.data.page.hasPrevious} onClick={() => updatePage(Math.max(0, search.page - 1))}>이전</button><span>{search.page + 1} / {Math.max(1, query.data.page.totalPages)}</span><button className="secondary-button" disabled={!query.data.page.hasNext} onClick={() => updatePage(search.page + 1)}>다음</button></div>
    </section>
  )
}
