import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { EmptyState, ErrorState, PageSkeleton } from '../components/AsyncStates'
import { CanonicalBootstrapCard } from '../components/CanonicalBootstrapCard'
import { getConcepts, getLearningAreas, type AreaSummary, type ConceptListItem } from '../lib/learning-api'
import { defaultLearningSearch } from '../lib/learning-search'
import { selectRecentConcepts } from '../lib/learning-recent'
import { defaultQuizSearch } from '../lib/quiz-search'

function completionPercent(area: AreaSummary) {
  if (area.publishedConceptCount === 0) return 0
  return Math.round((area.completedConceptCount / area.publishedConceptCount) * 100)
}

function AreaRow({ area, index }: { area: AreaSummary; index: number }) {
  const completion = completionPercent(area)

  return (
    <article className="area-row">
      <Link className="area-row-main" to="/learning/$areaSlug" params={{ areaSlug: area.slug }} search={defaultLearningSearch}>
        <span className="area-row-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <span className="area-row-copy">
          <span className="area-row-title"><h2>{area.name}</h2><span>{area.topicCount}개 주제</span></span>
          <p>{area.description ?? '이 영역의 핵심 개념을 순서대로 학습하세요.'}</p>
          <span className="area-row-context">{area.publishedConceptCount}개 개념 · {area.publishedQuestionCount}개 문제{area.finalizedAttemptCount > 0 ? ` · 정확도 ${Math.round(area.accuracyPercent)}%` : ''}</span>
        </span>
      </Link>
      <span className="area-row-progress" aria-label={`학습 진행률 ${completion}%`}>
        <span className="area-row-progress-label"><span>{area.completedConceptCount}/{area.publishedConceptCount}개 완료</span><strong>{completion}%</strong></span>
        <span className="progress-track" aria-hidden="true"><span style={{ width: `${completion}%` }} /></span>
      </span>
      <Link className="area-row-quiz" to="/quiz" search={{ ...defaultQuizSearch, areas: area.slug }}>문제 풀기 <span aria-hidden="true">→</span></Link>
    </article>
  )
}

function RecentConceptRow({ concept, index }: { concept: ConceptListItem; index: number }) {
  return (
    <Link className="recent-concept-row" to="/concepts/$conceptId" params={{ conceptId: String(concept.id) }}>
      <span className="recent-concept-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <span className="recent-concept-copy"><strong>{concept.title}</strong><span>{concept.areaName} · {concept.topicTitle}</span></span>
      <span className="recent-concept-meta"><span>레벨 {concept.level}</span><time dateTime={concept.lastViewedAt ?? undefined}>{concept.lastViewedAt ? new Date(concept.lastViewedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '기록 없음'}</time></span>
      <span className="recent-concept-arrow" aria-hidden="true">→</span>
    </Link>
  )
}

export function LearningPage() {
  const areasQuery = useQuery({ queryKey: ['learning-areas'], queryFn: getLearningAreas })
  const recentConceptsQuery = useQuery({
    queryKey: ['concepts', { page: 0, size: 6, sort: 'VIEWED' }],
    queryFn: () => getConcepts({ page: 0, size: 6, sort: 'VIEWED' }),
  })

  if (areasQuery.isPending) return <PageSkeleton rows={6} />
  if (areasQuery.isError) return <ErrorState onRetry={() => void areasQuery.refetch()} />

  const recentConcepts = recentConceptsQuery.data ? selectRecentConcepts(recentConceptsQuery.data.items) : []

  return (
    <section className="page-section learning-page">
      <header className="learning-index-header">
        <div>
          <p className="eyebrow">학습 색인</p>
          <h1>학습 영역</h1>
          <p className="lead">어디서 이어갈지 고르고, 주제와 개념 순서대로 학습을 계속하세요.</p>
        </div>
        <div className="learning-index-summary"><strong>{areasQuery.data.length}</strong><span>개 영역<br />커리큘럼 색인</span></div>
      </header>

      {recentConceptsQuery.isPending && <div className="recent-concepts-state">최근 본 개념 불러오는 중…</div>}
      {recentConceptsQuery.isError && (
        <div className="recent-concepts-state error-text" role="alert">
          최근 본 개념을 불러오지 못했습니다.
          <button className="text-button" type="button" onClick={() => void recentConceptsQuery.refetch()}>다시 시도</button>
        </div>
      )}
      {recentConcepts.length > 0 && (
        <section className="recent-concepts" aria-labelledby="recent-concepts-heading">
          <div className="learning-section-heading">
            <div>
              <p className="eyebrow">이어 학습하기</p>
              <h2 id="recent-concepts-heading">최근 본 개념</h2>
            </div>
            <span className="helper-text">최근 기록에서 바로 이동</span>
          </div>
          <div className="recent-concept-list">
            {recentConcepts.map((concept, index) => <RecentConceptRow key={concept.id} concept={concept} index={index} />)}
          </div>
        </section>
      )}

      <div className="learning-section-heading learning-area-heading">
        <div>
          <p className="eyebrow">전체 커리큘럼</p>
          <h2>{areasQuery.data.length}개 학습 영역</h2>
        </div>
        <span className="helper-text">영역을 선택하면 주제와 개념 순서가 이어집니다.</span>
      </div>

      {areasQuery.data.length === 0 ? (
        <EmptyState message="활성화된 학습 영역이 없습니다." />
      ) : (
        <div className="area-grid">
          {areasQuery.data.map((area, index) => <AreaRow key={area.id} area={area} index={index} />)}
        </div>
      )}
      <CanonicalBootstrapCard />
    </section>
  )
}
