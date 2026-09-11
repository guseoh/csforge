import { Link } from '@tanstack/react-router'
import type { AreaDetail } from '../lib/learning-api'
import { defaultLearningSearch } from '../lib/learning-search'

function completionPercent(completed: number, total: number) {
  return total === 0 ? 0 : Math.round((completed / total) * 100)
}

export function AreaLearningRail({ area }: { area: AreaDetail }) {
  const totalConcepts = area.topics.reduce((total, topic) => total + topic.publishedConceptCount, 0)
  const completedConcepts = area.topics.reduce((total, topic) => total + topic.completedConceptCount, 0)
  const progress = completionPercent(completedConcepts, totalConcepts)

  return (
    <aside className="learning-rail area-learning-rail" aria-label={`${area.name} 학습 목차`}>
      <Link className="rail-back-link" to="/learning" search={defaultLearningSearch}>
        ← 모든 학습 영역
      </Link>
      <p className="rail-kicker">학습 가이드</p>
      <h2>{area.name}</h2>

      <div className="rail-progress">
        <div className="rail-progress-label">
          <span>전체 진행률</span>
          <strong>{progress}%</strong>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="rail-progress-copy">{completedConcepts}/{totalConcepts}개 개념 완료</p>
      </div>

      <nav aria-label={`${area.name} 주제`}>
        <p className="rail-section-title">주제</p>
        <div className="rail-topic-list">
          {area.topics.map((topic, index) => (
            <a className="rail-topic" href={`#topic-${topic.id}`} key={topic.id}>
              <span>{String(index + 1).padStart(2, '0')} · {topic.title}</span>
              <small>{topic.completedConceptCount}/{topic.publishedConceptCount}</small>
            </a>
          ))}
        </div>
      </nav>
    </aside>
  )
}
