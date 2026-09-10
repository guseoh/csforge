import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { EmptyState, ErrorState, PageSkeleton } from '../components/AsyncStates'
import { getConcepts, getLearningArea, type LearningStatus } from '../lib/learning-api'
import { defaultLearningSearch, type LearningSearch } from '../lib/learning-search'

const PAGE_SIZE = 12

const learningStatusLabels: Record<LearningStatus, string> = {
  UNSEEN: '미학습',
  LEARNING: '학습 중',
  COMPLETED: '완료',
  REVIEW_NEEDED: '복습 필요',
}

function progressPercent(completed: number, total: number) {
  return total === 0 ? 0 : Math.round((completed / total) * 100)
}

export function AreaPage() {
  const { areaSlug } = useParams({ from: '/learning/$areaSlug' })
  const search = useSearch({ from: '/learning/$areaSlug' })
  const navigate = useNavigate({ from: '/learning/$areaSlug' })
  const updateSearch = (changes: Partial<LearningSearch>, replace = false) => navigate({
    replace,
    search: (previous) => ({ ...previous, ...changes }),
  })
  const areaQuery = useQuery({
    queryKey: ['learning-area', areaSlug],
    queryFn: () => getLearningArea(areaSlug),
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
  })

  if (areaQuery.isPending) return <PageSkeleton rows={5} />
  if (areaQuery.isError) return <ErrorState onRetry={() => void areaQuery.refetch()} />

  const area = areaQuery.data
  const page = conceptsQuery.data?.page

  return (
    <section className="page-section">
      <nav className="breadcrumb" aria-label="탐색 경로">
        <Link to="/learning" search={defaultLearningSearch}>학습</Link>
        <span>/</span>
        <strong>{area.name}</strong>
      </nav>
      <div className="page-heading">
        <div>
          <p className="eyebrow">학습 영역</p>
          <h1>{area.name}</h1>
          <p className="lead">{area.description ?? '이 영역의 개념을 탐색하세요.'}</p>
        </div>
        <Link className="text-link" to="/learning" search={defaultLearningSearch}>모든 영역</Link>
      </div>

      <div className="topic-summary-grid">
        {area.topics.length === 0 ? (
          <EmptyState message="아직 등록된 주제가 없습니다." />
        ) : area.topics.map((topic) => (
          <button
            className={`topic-card${search.topic === topic.id ? ' selected' : ''}`}
            key={topic.id}
            type="button"
            aria-pressed={search.topic === topic.id}
            onClick={() => void updateSearch({ topic: search.topic === topic.id ? undefined : topic.id, page: 0 })}
          >
            <span className="topic-card-title">{topic.title}</span>
            <span className="topic-card-meta">
              {topic.publishedConceptCount}개 개념 · {topic.completedConceptCount}개 완료
            </span>
            <span className="topic-card-meta">
              L1 {topic.level1Count} · L2 {topic.level2Count} · L3 {topic.level3Count}
            </span>
          </button>
        ))}
      </div>

      <div className="filter-panel" aria-label="개념 필터">
        <div className="filter-panel-header">
          <div><p className="eyebrow">탐색 도구</p><strong>개념 찾기</strong></div>
          <span className="helper-text">주제 카드는 빠른 이동, 아래 필터는 정밀 검색입니다.</span>
        </div>
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

      {conceptsQuery.isPending ? <PageSkeleton rows={4} /> : conceptsQuery.isError ? (
        <ErrorState onRetry={() => void conceptsQuery.refetch()} />
      ) : conceptsQuery.data.items.length === 0 ? (
        <EmptyState message="현재 필터에 맞는 공개 개념이 없습니다." />
      ) : (
        <>
          <div className="concept-list-heading">
            <h2>개념</h2>
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
      )}
      <div className="area-progress-note">
        완료 개념: {area.topics.reduce((total, topic) => total + topic.completedConceptCount, 0)} ·
        공개 개념: {area.topics.reduce((total, topic) => total + topic.publishedConceptCount, 0)} ·
        {progressPercent(
          area.topics.reduce((total, topic) => total + topic.completedConceptCount, 0),
          area.topics.reduce((total, topic) => total + topic.publishedConceptCount, 0),
        )}% 완료
      </div>
    </section>
  )
}
