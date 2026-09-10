import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { EmptyState, ErrorState, PageSkeleton } from '../components/AsyncStates'
import { CanonicalBootstrapCard } from '../components/CanonicalBootstrapCard'
import { getConcepts, getLearningAreas, type AreaSummary, type ConceptListItem } from '../lib/learning-api'
import { defaultLearningSearch } from '../lib/learning-search'
import { selectRecentConcepts } from '../lib/learning-recent'

function completionPercent(area: AreaSummary) {
  if (area.publishedConceptCount === 0) return 0
  return Math.round((area.completedConceptCount / area.publishedConceptCount) * 100)
}

function LevelProgress({ label, progress }: { label: string; progress: { total: number; completed: number } }) {
  const percent = progress.total === 0 ? 0 : Math.round((progress.completed / progress.total) * 100)
  return (
    <div className="level-progress">
      <span>{label}</span>
      <span>{progress.completed}/{progress.total}</span>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function AreaCard({ area }: { area: AreaSummary }) {
  return (
    <Link className="area-card" to="/learning/$areaSlug" params={{ areaSlug: area.slug }} search={defaultLearningSearch}>
      <div className="area-card-heading">
        <div>
          <h2>{area.name}</h2>
          <p className="area-card-completion">{completionPercent(area)}% 학습 완료 · {area.topicCount}개 Topic</p>
        </div>
        <span className="area-card-arrow" aria-hidden="true">→</span>
      </div>
      <div className="area-metrics">
        <span>{area.publishedConceptCount}개 Concept</span>
        <span>{area.publishedQuestionCount}개 Question</span>
        <span>{area.finalizedAttemptCount === 0 ? '정확도 —' : `정확도 ${Math.round(area.accuracyPercent)}%`}</span>
      </div>
      <p className="area-card-context">북마크 {area.bookmarkedConceptCount}개 · 레벨별 학습 흐름</p>
      <div className="level-progress-list">
        <LevelProgress label="L1" progress={area.level1} />
        <LevelProgress label="L2" progress={area.level2} />
        <LevelProgress label="L3" progress={area.level3} />
      </div>
    </Link>
  )
}

function RecentConceptCard({ concept }: { concept: ConceptListItem }) {
  return (
    <Link className="recent-concept-card" to="/concepts/$conceptId" params={{ conceptId: String(concept.id) }}>
      <div className="card-heading">
        <h3>{concept.title}</h3>
        <span className="chip">L{concept.level}</span>
      </div>
      <p>{concept.areaName} · {concept.topicTitle}</p>
      <time dateTime={concept.lastViewedAt ?? undefined}>
        {concept.lastViewedAt ? new Date(concept.lastViewedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : ''}
      </time>
    </Link>
  )
}

export function LearningPage() {
  const areasQuery = useQuery({ queryKey: ['learning-areas'], queryFn: getLearningAreas })
  const recentConceptsQuery = useQuery({
    queryKey: ['concepts', { page: 0, size: 6, sort: 'VIEWED' }],
    queryFn: () => getConcepts({ page: 0, size: 6, sort: 'VIEWED' }),
  })

  if (areasQuery.isPending) {
    return <PageSkeleton rows={6} />
  }

  if (areasQuery.isError) {
    return <ErrorState onRetry={() => void areasQuery.refetch()} />
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">학습 가이드</p>
          <h1>무엇을 공부할까요?</h1>
          <p className="lead">오늘 공부할 영역을 고르고, 개념을 차근차근 쌓아가세요.</p>
        </div>
        <span className="result-count">{areasQuery.data.length}개 영역</span>
      </div>
      {recentConceptsQuery.isPending && <div className="recent-concepts-state">최근 본 개념 불러오는 중…</div>}
      {recentConceptsQuery.isError && (
        <div className="recent-concepts-state error-text" role="alert">
          최근 본 개념을 불러오지 못했습니다.
          <button className="text-button" type="button" onClick={() => void recentConceptsQuery.refetch()}>다시 시도</button>
        </div>
      )}
      {recentConceptsQuery.data && selectRecentConcepts(recentConceptsQuery.data.items).length > 0 && (
        <section className="recent-concepts" aria-labelledby="recent-concepts-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">이어 학습하기</p>
              <h2 id="recent-concepts-heading">최근 본 개념</h2>
            </div>
          </div>
          <div className="recent-concept-grid">
            {selectRecentConcepts(recentConceptsQuery.data.items).map((concept) => <RecentConceptCard key={concept.id} concept={concept} />)}
          </div>
        </section>
      )}
      <CanonicalBootstrapCard />
      {areasQuery.data.length === 0 ? (
        <EmptyState message="활성화된 학습 영역이 없습니다." />
      ) : (
        <div className="area-grid">
          {areasQuery.data.map((area) => <AreaCard key={area.id} area={area} />)}
        </div>
      )}
    </section>
  )
}
