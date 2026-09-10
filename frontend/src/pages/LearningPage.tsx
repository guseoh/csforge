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

const areaVisuals: Record<string, { glyph: string; accent: string }> = {
  'computer-architecture': { glyph: '▦', accent: 'blue' },
  'data-structures-algorithms': { glyph: '</>', accent: 'violet' },
  'operating-systems': { glyph: '▣', accent: 'indigo' },
  'network-http': { glyph: '◎', accent: 'green' },
  database: { glyph: '▤', accent: 'orange' },
  java: { glyph: '☕', accent: 'red' },
  spring: { glyph: '✦', accent: 'emerald' },
  'backend-engineering': { glyph: '⌘', accent: 'purple' },
  cache: { glyph: '◉', accent: 'rose' },
  'messaging-async': { glyph: '↗', accent: 'teal' },
  'infrastructure-cloud': { glyph: '◇', accent: 'slate' },
  'performance-observability-operations': { glyph: '◒', accent: 'cyan' },
  'distributed-systems': { glyph: '⌘', accent: 'purple' },
  'system-design': { glyph: '▱', accent: 'slate' },
  security: { glyph: '◆', accent: 'amber' },
}

function areaCompletionPercent(area: AreaSummary) {
  return completionPercent(area)
}

function AreaCard({ area }: { area: AreaSummary }) {
  const visual = areaVisuals[area.slug] ?? { glyph: '✦', accent: 'violet' }
  const completion = areaCompletionPercent(area)

  return (
    <article className={`area-card area-card-${visual.accent}`}>
      <Link className="area-card-main" to="/learning/$areaSlug" params={{ areaSlug: area.slug }} search={defaultLearningSearch}>
        <div className="area-card-topline">
          <span className="area-card-icon" aria-hidden="true">{visual.glyph}</span>
          <span className="area-card-tag">{area.topicCount}개 주제</span>
        </div>
        <div className="area-card-heading">
          <div>
            <h2>{area.name}</h2>
            <p className="area-card-description">{area.description ?? '이 영역의 핵심 개념을 순서대로 학습하세요.'}</p>
          </div>
          <span className="area-card-arrow" aria-hidden="true">→</span>
        </div>
        <div className="area-metrics">
          <span>{area.publishedConceptCount}개 개념</span>
          <span>{area.publishedQuestionCount}개 문제</span>
          <span>{area.finalizedAttemptCount === 0 ? '정확도 —' : `정확도 ${Math.round(area.accuracyPercent)}%`}</span>
        </div>
        <div className="area-card-progress" aria-label={`학습 진행률 ${completion}%`}>
          <div className="area-card-progress-label">
            <span>학습 진행률</span>
            <strong>{completion}%</strong>
          </div>
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${completion}%` }} />
          </div>
          <p className="area-card-context">L1 {area.level1.completed}/{area.level1.total} · L2 {area.level2.completed}/{area.level2.total} · L3 {area.level3.completed}/{area.level3.total}</p>
        </div>
      </Link>
      <div className="area-card-footer">
        <Link className="area-card-footer-link" to="/learning/$areaSlug" params={{ areaSlug: area.slug }} search={defaultLearningSearch}>개념 가이드 보기 <span aria-hidden="true">→</span></Link>
        <Link className="area-card-footer-link area-card-quiz-link" to="/quiz" search={{ ...defaultQuizSearch, areas: area.slug }}>문제 풀어보기 <span aria-hidden="true">→</span></Link>
      </div>
    </article>
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
    <section className="page-section learning-page">
      <div className="learning-hero">
        <span className="learning-hero-kicker">What you'll learn</span>
        <h1>신입이 꼭 알아야 할 CS 기초</h1>
        <p className="lead">자료구조부터 Java와 데이터베이스까지,<br />핵심 개념을 순서대로 학습하세요.</p>
        <span className="result-count">{areasQuery.data.length}개 학습 영역</span>
      </div>
      {areasQuery.data.length === 0 ? (
        <EmptyState message="활성화된 학습 영역이 없습니다." />
      ) : (
        <div className="area-grid">
          {areasQuery.data.map((area) => <AreaCard key={area.id} area={area} />)}
        </div>
      )}
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
    </section>
  )
}
