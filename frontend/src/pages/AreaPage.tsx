import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useQueries, useQuery } from '@tanstack/react-query'
import { AreaLearningRail } from '../components/AreaLearningRail'
import { EmptyState, ErrorState, PageSkeleton } from '../components/AsyncStates'
import { getConcepts, getLearningArea, type LearningStatus } from '../lib/learning-api'
import { defaultLearningSearch, type LearningSearch } from '../lib/learning-search'
import { defaultQuizSearch } from '../lib/quiz-search'

const PAGE_SIZE = 12

const learningStatusLabels: Record<LearningStatus, string> = {
  UNSEEN: '미학습',
  LEARNING: '학습 중',
  COMPLETED: '완료',
  REVIEW_NEEDED: '복습 필요',
}

export function AreaPage() {
  const { areaSlug } = useParams({ from: '/learning/$areaSlug' })
  const search = useSearch({ from: '/learning/$areaSlug' })
  const navigate = useNavigate({ from: '/learning/$areaSlug' })
  const updateSearch = (changes: Partial<LearningSearch>, replace = false) => navigate({
    replace,
    search: (previous) => ({ ...previous, ...changes }),
  })
  const hasActiveFilters = Boolean(
    search.topic
    || search.q
    || search.level !== 'all'
    || search.status !== 'ALL'
    || search.bookmarked === 'true'
    || search.sort !== 'curriculum',
  )
  const areaQuery = useQuery({
    queryKey: ['learning-area', areaSlug],
    queryFn: () => getLearningArea(areaSlug),
  })
  const outlineQueries = useQueries({
    queries: [0, 1].map((page) => ({
      queryKey: ['learning-outline', areaSlug, page],
      queryFn: () => getConcepts({ area: areaSlug, page, size: 100, sort: 'curriculum' }),
    })),
  })
  const conceptsQuery = useQuery({
    queryKey: ['concepts', areaSlug, search],
    queryFn: () => getConcepts({
      area: areaSlug,
      topic: search.topic,
      level: search.level === 'all' ? undefined : Number(search.level),
      learningStatus: search.status === 'ALL' ? undefined : search.status as LearningStatus,
      bookmarked: search.bookmarked === 'true',
      q: search.q || undefined,
      page: search.page,
      size: PAGE_SIZE,
      sort: search.sort,
    }),
    enabled: hasActiveFilters,
  })

  if (areaQuery.isPending) return <PageSkeleton rows={5} />
  if (areaQuery.isError) return <ErrorState onRetry={() => void areaQuery.refetch()} />

  const area = areaQuery.data
  const page = conceptsQuery.data?.page
  const outlineConcepts = outlineQueries.flatMap((query) => query.data?.items ?? [])
  const outlineIsPending = outlineQueries.some((query) => query.isPending)
  const outlineIsError = outlineQueries.some((query) => query.isError)
  const totalConcepts = area.topics.reduce((total, topic) => total + topic.publishedConceptCount, 0)
  const completedConcepts = area.topics.reduce((total, topic) => total + topic.completedConceptCount, 0)

  return (
    <div className="area-workspace">
      <AreaLearningRail area={area} />
      <section className="page-section area-guide-page">
        <nav className="breadcrumb" aria-label="탐색 경로">
          <Link to="/learning" search={defaultLearningSearch}>학습</Link>
          <span>/</span>
          <strong>{area.name}</strong>
        </nav>

        <header className="area-guide-header">
          <p className="eyebrow">학습 가이드</p>
          <h1>{area.name}</h1>
          <p className="lead">{area.description ?? '이 영역의 개념을 순서대로 학습하세요.'}</p>
        </header>

        <div className="guide-summary-line">
          <div className="guide-summary-stats">
            <strong>{area.topics.length}개 주제</strong>
            <strong>{totalConcepts}개 개념</strong>
            <span>{completedConcepts}개 완료</span>
          </div>
          <Link className="guide-quiz-link" to="/quiz" search={{ ...defaultQuizSearch, areas: area.slug }}>
            이 영역 문제 풀기 <span aria-hidden="true">→</span>
          </Link>
        </div>

        {!hasActiveFilters && (
          <section className="topic-index" aria-labelledby="topic-index-heading">
            <div className="topic-index-heading">
              <div>
                <p className="eyebrow">추천 학습 순서</p>
                <h2 id="topic-index-heading">주제별 개념</h2>
              </div>
              <span className="helper-text">주제를 열고 개념을 선택하면 바로 학습 노트로 이동합니다.</span>
            </div>
            <div className="topic-guide-list">
              {area.topics.length === 0 ? (
                <EmptyState message="아직 등록된 주제가 없습니다." />
              ) : outlineIsPending ? (
                <div className="topic-outline-loading">학습 순서를 불러오는 중…</div>
              ) : outlineIsError ? (
                <ErrorState onRetry={() => void Promise.all(outlineQueries.map((query) => query.refetch()))} />
              ) : area.topics.map((topic, topicIndex) => {
                const topicConcepts = outlineConcepts.filter((concept) => concept.topicId === topic.id)
                return (
                  <details
                    className="topic-outline"
                    id={`topic-${topic.id}`}
                    key={topic.id}
                    name="topic-guide"
                    open={topicIndex === 0 || topic.completedConceptCount > 0}
                  >
                    <summary className="topic-outline-heading">
                      <span className="topic-guide-index">{String(topicIndex + 1).padStart(2, '0')}</span>
                      <div>
                        <h3>{topic.title}</h3>
                        <span>{topic.publishedConceptCount}개 개념 · {topic.completedConceptCount}개 완료</span>
                      </div>
                      <span className="topic-outline-toggle" aria-hidden="true">+</span>
                    </summary>
                    <div className="topic-concept-list">
                      {topicConcepts.map((concept, conceptIndex) => (
                        <Link className="topic-concept-row" key={concept.id} to="/concepts/$conceptId" params={{ conceptId: String(concept.id) }}>
                          <span className="topic-concept-index">{String(conceptIndex + 1).padStart(2, '0')}</span>
                          <span className="topic-concept-copy">
                            <strong>{concept.title}</strong>
                            <span>{concept.summary ?? '이 개념의 핵심 내용을 읽어보세요.'}</span>
                          </span>
                          <span className={`topic-concept-status status-${concept.learningStatus.toLowerCase()}`}>
                            {learningStatusLabels[concept.learningStatus]}
                          </span>
                          <span className="topic-guide-arrow" aria-hidden="true">→</span>
                        </Link>
                      ))}
                    </div>
                  </details>
                )
              })}
            </div>
          </section>
        )}

        <details className="concept-filter-disclosure" open={hasActiveFilters}>
          <summary>
            <span><span className="eyebrow">필요할 때만</span><strong>개념 필터</strong></span>
            <span>상태·레벨·검색어로 좁히기 <span aria-hidden="true">⌄</span></span>
          </summary>
          <div className="filter-panel" aria-label="개념 필터">
            <label>
              검색
              <input
                type="search"
                value={search.q}
                placeholder="제목 또는 요약"
                onChange={(event) => void updateSearch({ q: event.target.value, page: 0 }, true)}
              />
            </label>
            <label>
              주제
              <select
                value={search.topic ?? ''}
                onChange={(event) => void updateSearch({
                  topic: event.target.value ? Number(event.target.value) : undefined,
                  page: 0,
                })}
              >
                <option value="">모든 주제</option>
                {area.topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
              </select>
            </label>
            <label>
              레벨
              <select value={search.level} onChange={(event) => void updateSearch({ level: event.target.value as LearningSearch['level'], page: 0 })}>
                <option value="all">모든 레벨</option>
                <option value="1">레벨 1</option>
                <option value="2">레벨 2</option>
                <option value="3">레벨 3</option>
              </select>
            </label>
            <label>
              진행 상태
              <select value={search.status} onChange={(event) => void updateSearch({ status: event.target.value as LearningSearch['status'], page: 0 })}>
                <option value="ALL">전체 상태</option>
                <option value="UNSEEN">미학습</option>
                <option value="LEARNING">학습 중</option>
                <option value="COMPLETED">완료</option>
                <option value="REVIEW_NEEDED">복습 필요</option>
              </select>
            </label>
            <label>
              정렬
              <select value={search.sort} onChange={(event) => void updateSearch({ sort: event.target.value as LearningSearch['sort'], page: 0 })}>
                <option value="curriculum">커리큘럼 순서</option>
                <option value="title">제목순</option>
                <option value="updated">최근 수정순</option>
                <option value="viewed">최근 학습순</option>
              </select>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={search.bookmarked === 'true'}
                onChange={(event) => void updateSearch({ bookmarked: event.target.checked ? 'true' : 'false', page: 0 })}
              />
              북마크한 개념만
            </label>
          </div>
        </details>

        {hasActiveFilters && conceptsQuery.isPending ? <PageSkeleton rows={4} /> : hasActiveFilters && conceptsQuery.isError ? (
          <ErrorState onRetry={() => void conceptsQuery.refetch()} />
        ) : hasActiveFilters && conceptsQuery.data?.items.length === 0 ? (
          <EmptyState message="현재 필터에 맞는 공개 개념이 없습니다." />
        ) : hasActiveFilters && conceptsQuery.data ? (
          <>
            <div className="concept-list-heading">
              <h2>검색된 개념</h2>
              <span className="result-count">{page?.totalElements ?? 0}개</span>
            </div>
            <div className="concept-list">
              {conceptsQuery.data.items.map((concept) => (
                <Link className="concept-list-item" key={concept.id} to="/concepts/$conceptId" params={{ conceptId: String(concept.id) }}>
                  <div className="concept-list-main">
                    <h3>{concept.title}</h3>
                    <p>{concept.summary ?? '요약이 아직 없습니다.'}</p>
                    <div className="chip-row concept-list-status">
                      <span className="chip">레벨 {concept.level}</span>
                      <span className={`chip status-${concept.learningStatus.toLowerCase()}`}>{learningStatusLabels[concept.learningStatus]}</span>
                      {concept.bookmarked && <span className="chip bookmark-chip">★ 북마크</span>}
                    </div>
                  </div>
                  <span className="concept-topic">{concept.topicTitle}</span>
                </Link>
              ))}
            </div>
            <div className="pagination" aria-label="개념 페이지네이션">
              <button className="secondary-button" type="button" disabled={!page?.hasPrevious} onClick={() => void updateSearch({ page: search.page - 1 })}>
                이전
              </button>
              <span>{(page?.page ?? 0) + 1} / {page?.totalPages || 1}</span>
              <button className="secondary-button" type="button" disabled={!page?.hasNext} onClick={() => void updateSearch({ page: search.page + 1 })}>
                다음
              </button>
            </div>
          </>
        ) : null}
      </section>
    </div>
  )
}
