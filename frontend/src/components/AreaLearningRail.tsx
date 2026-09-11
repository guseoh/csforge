import { useId, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { AreaDetail } from '../lib/learning-api'
import { defaultLearningSearch } from '../lib/learning-search'

function completionPercent(completed: number, total: number) {
  return total === 0 ? 0 : Math.round((completed / total) * 100)
}

interface AreaLearningRailProps {
  area: AreaDetail
  filterMode?: boolean
  activeTopicId?: number
  onTopicSelect?: (topicId: number) => void
}

export function AreaLearningRail({
  area,
  filterMode = false,
  activeTopicId,
  onTopicSelect,
}: AreaLearningRailProps) {
  const [collapsed, setCollapsed] = useState(false)
  const railContentId = useId()
  const totalConcepts = area.topics.reduce((total, topic) => total + topic.publishedConceptCount, 0)
  const completedConcepts = area.topics.reduce((total, topic) => total + topic.completedConceptCount, 0)
  const progress = completionPercent(completedConcepts, totalConcepts)

  return (
    <aside
      className="learning-rail area-learning-rail"
      aria-label={`${area.name} 학습 목차`}
      data-collapsed={collapsed}
    >
      <button
        className="rail-collapse-toggle"
        type="button"
        aria-controls={railContentId}
        aria-expanded={!collapsed}
        aria-label={collapsed ? '학습 목차 펼치기' : '학습 목차 접기'}
        onClick={() => setCollapsed((value) => !value)}
      >
        <span aria-hidden="true">{collapsed ? '→' : '←'}</span>
      </button>

      <div className="learning-rail-content" id={railContentId} hidden={collapsed}>
        <div className="learning-rail-static">
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
        </div>

        <div className="learning-rail-scroll">
          <nav aria-label={`${area.name} 주제`}>
            <p className="rail-section-title">주제</p>
            <div className="rail-topic-list">
              {area.topics.map((topic, index) => {
                const active = activeTopicId === topic.id
                const completed = topic.publishedConceptCount > 0
                  && topic.completedConceptCount === topic.publishedConceptCount
                const className = `rail-topic${active ? ' active' : ''}${completed ? ' completed' : ''}`
                const label = (
                  <>
                    <span className="rail-topic-copy">
                      <span className="rail-topic-state" aria-hidden="true">{completed ? '✓' : active ? '•' : ''}</span>
                      <span className="rail-topic-title">
                        <span className="rail-topic-number">{String(index + 1).padStart(2, '0')}</span>
                        <span>{topic.title}</span>
                      </span>
                    </span>
                    <small>{topic.completedConceptCount}/{topic.publishedConceptCount}</small>
                  </>
                )

                return filterMode ? (
                  <Link
                    className={className}
                    key={topic.id}
                    to="/learning/$areaSlug"
                    params={{ areaSlug: area.slug }}
                    search={{ ...defaultLearningSearch, topic: topic.id }}
                    aria-current={active ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                ) : (
                  <a
                    className={className}
                    href={`#topic-${topic.id}`}
                    key={topic.id}
                    aria-current={active ? 'location' : undefined}
                    onClick={() => onTopicSelect?.(topic.id)}
                  >
                    {label}
                  </a>
                )
              })}
            </div>
          </nav>
        </div>
      </div>
    </aside>
  )
}
