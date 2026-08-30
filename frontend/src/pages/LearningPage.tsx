import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { EmptyState, ErrorState, PageSkeleton } from '../components/AsyncStates'
import { getLearningAreas, type AreaSummary } from '../lib/api'
import { defaultLearningSearch } from '../lib/learning-search'

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
      <div className="card-heading">
        <div>
          <p className="eyebrow">{area.topicCount} topics</p>
          <h2>{area.name}</h2>
        </div>
        <span className="completion-badge">{completionPercent(area)}%</span>
      </div>
      <p className="card-description">{area.description ?? '아직 설명이 없습니다.'}</p>
      <div className="area-metrics">
        <span>{area.publishedConceptCount} concepts</span>
        <span>{area.bookmarkedConceptCount} bookmarks</span>
      </div>
      <div className="level-progress-list">
        <LevelProgress label="L1" progress={area.level1} />
        <LevelProgress label="L2" progress={area.level2} />
        <LevelProgress label="L3" progress={area.level3} />
      </div>
    </Link>
  )
}

export function LearningPage() {
  const areasQuery = useQuery({ queryKey: ['learning-areas'], queryFn: getLearningAreas })

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
          <p className="eyebrow">Curriculum</p>
          <h1>Learning areas</h1>
          <p className="lead">오늘 공부할 영역을 고르고, 개념을 차근차근 쌓아가세요.</p>
        </div>
        <span className="result-count">{areasQuery.data.length} areas</span>
      </div>
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
