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

const areaVisuals: Record<string, { glyph: string; accent: string; icon?: 'java' | 'spring' }> = {
  'computer-architecture': { glyph: '▦', accent: 'blue' },
  'data-structures-algorithms': { glyph: '</>', accent: 'violet' },
  'operating-systems': { glyph: '▣', accent: 'indigo' },
  'network-http': { glyph: '◎', accent: 'green' },
  database: { glyph: '▤', accent: 'orange' },
  java: { glyph: '☕', accent: 'red', icon: 'java' },
  spring: { glyph: '✦', accent: 'emerald', icon: 'spring' },
  'backend-engineering': { glyph: '⌘', accent: 'purple' },
  cache: { glyph: '◉', accent: 'rose' },
  'messaging-async': { glyph: '↗', accent: 'teal' },
  'infrastructure-cloud': { glyph: '◇', accent: 'slate' },
  'performance-observability-operations': { glyph: '◒', accent: 'cyan' },
  'distributed-systems': { glyph: '⌘', accent: 'purple' },
  'system-design': { glyph: '▱', accent: 'slate' },
  security: { glyph: '◆', accent: 'amber' },
}

function AreaIcon({ visual }: { visual: { glyph: string; icon?: 'java' | 'spring' } }) {
  if (visual.icon === 'java') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7 9h10v4.5A4.5 4.5 0 0 1 12.5 18h-1A4.5 4.5 0 0 1 7 13.5V9Z" />
        <path d="M17 10h1.5a2 2 0 0 1 0 4H17M8 20h9M10 5c1 1 .8 1.8 0 2.5M14 4c1.2 1.2 1 2.3 0 3.2" />
      </svg>
    )
  }
  if (visual.icon === 'spring') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 17c4.5.2 8-2.1 10.2-6.6C16.3 8.2 18.5 6 21 5c-.2 4.8-2 8.2-5.5 10.3C12.2 18.1 8.5 18.3 5 17Z" />
        <path d="M5 17c2.9-1.2 5.5-3.3 7.6-6.2M5 17c-.3 1.4-.2 2.4.3 3" />
      </svg>
    )
  }
  return <span>{visual.glyph}</span>
}

function AreaCard({ area }: { area: AreaSummary }) {
  const visual = areaVisuals[area.slug] ?? { glyph: '✦', accent: 'violet' }
  const completion = completionPercent(area)

  return (
    <article className={`area-card area-card-${visual.accent}`}>
      <Link className="area-card-main" to="/learning/$areaSlug" params={{ areaSlug: area.slug }} search={defaultLearningSearch}>
        <div className="area-card-topline">
          <span className="area-card-icon"><AreaIcon visual={visual} /></span>
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
          {area.finalizedAttemptCount > 0 && <span>정확도 {Math.round(area.accuracyPercent)}%</span>}
        </div>
        <div className="area-card-progress" aria-label={`학습 진행률 ${completion}%`}>
          <div className="area-card-progress-label">
            <span>{area.completedConceptCount}/{area.publishedConceptCount}개 완료</span>
            <strong>{completion}%</strong>
          </div>
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${completion}%` }} />
          </div>
        </div>
      </Link>
      <div className="area-card-footer">
        <span className="area-card-footer-hint">가이드를 열어 주제 순서대로 학습하세요.</span>
        <Link className="area-card-footer-link area-card-quiz-link" to="/quiz" search={{ ...defaultQuizSearch, areas: area.slug }}>문제 풀기 <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  )
}

function RecentConceptCard({ concept }: { concept: ConceptListItem }) {
  return (
    <Link className="recent-concept-card" to="/concepts/$conceptId" params={{ conceptId: String(concept.id) }}>
      <div className="card-heading">
        <h3>{concept.title}</h3>
        <span className="chip">레벨 {concept.level}</span>
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

  if (areasQuery.isPending) return <PageSkeleton rows={6} />
  if (areasQuery.isError) return <ErrorState onRetry={() => void areasQuery.refetch()} />

  const recentConcepts = recentConceptsQuery.data ? selectRecentConcepts(recentConceptsQuery.data.items) : []

  return (
    <section className="page-section learning-page">
      <header className="learning-hero">
        <span className="learning-hero-kicker">학습 가이드</span>
        <h1>CS와 백엔드 핵심을<br />주제별로 차근차근</h1>
        <p className="lead">읽고 끝나는 문서가 아니라, 개념을 이해하고 문제로 확인한 뒤 다시 복습하는 학습 흐름입니다.</p>
        <span className="result-count">{areasQuery.data.length}개 학습 영역</span>
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
          <div className="section-heading">
            <div>
              <p className="eyebrow">이어 학습하기</p>
              <h2 id="recent-concepts-heading">최근 본 개념</h2>
            </div>
          </div>
          <div className="recent-concept-grid">
            {recentConcepts.map((concept) => <RecentConceptCard key={concept.id} concept={concept} />)}
          </div>
        </section>
      )}

      <div className="learning-area-heading">
        <div>
          <p className="eyebrow">전체 커리큘럼</p>
          <h2>학습 영역</h2>
        </div>
        <span className="helper-text">영역을 선택하면 주제와 개념 순서가 이어집니다.</span>
      </div>

      {areasQuery.data.length === 0 ? (
        <EmptyState message="활성화된 학습 영역이 없습니다." />
      ) : (
        <div className="area-grid">
          {areasQuery.data.map((area) => <AreaCard key={area.id} area={area} />)}
        </div>
      )}
      <CanonicalBootstrapCard />
    </section>
  )
}
