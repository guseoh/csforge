import { useId, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  getConcepts,
  getLearningArea,
  type ConceptDetail,
  type LearningStatus,
} from '../lib/learning-api'
import { defaultLearningSearch } from '../lib/learning-search'

const learningStatusLabels: Record<LearningStatus, string> = {
  UNSEEN: '미학습',
  LEARNING: '학습 중',
  COMPLETED: '완료',
  REVIEW_NEEDED: '복습 필요',
}

function completionPercent(completed: number, total: number) {
  return total === 0 ? 0 : Math.round((completed / total) * 100)
}

export function ConceptLearningRail({ concept }: { concept: ConceptDetail }) {
  const [collapsed, setCollapsed] = useState(false)
  const railContentId = useId()
  const areaQuery = useQuery({
    queryKey: ['learning-area', concept.area.slug],
    queryFn: () => getLearningArea(concept.area.slug),
  })
  const topicConceptsQuery = useQuery({
    queryKey: ['learning-outline', 'topic', concept.topic.id],
    queryFn: () => getConcepts({
      area: concept.area.slug,
      topic: concept.topic.id,
      page: 0,
      size: 100,
      sort: 'curriculum',
    }),
  })

  const topics = areaQuery.data?.topics ?? []
  const currentTopicConcepts = topicConceptsQuery.data?.items ?? []
  const totalConcepts = topics.reduce((total, topic) => total + topic.publishedConceptCount, 0)
  const completedConcepts = topics.reduce((total, topic) => total + topic.completedConceptCount, 0)
  const progress = completionPercent(completedConcepts, totalConcepts)
  const loadingOutline = areaQuery.isPending || topicConceptsQuery.isPending

  return (
    <aside
      className="learning-rail concept-learning-rail"
      aria-label={`${concept.area.name} 학습 목차`}
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
          <Link
            className="rail-back-link"
            to="/learning/$areaSlug"
            params={{ areaSlug: concept.area.slug }}
            search={defaultLearningSearch}
            hash={`topic-${concept.topic.id}`}
          >
            ← {concept.area.name} 가이드
          </Link>

          <p className="rail-kicker">학습 가이드</p>
          <h2>{concept.area.name}</h2>

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
          <div className="concept-rail-current">
            <div className="rail-section-title-row concept-rail-current-heading">
              <p className="rail-section-title">현재 주제</p>
              <span className="rail-muted">{currentTopicConcepts.length}개</span>
            </div>
            <strong className="concept-rail-current-title">{concept.topic.title}</strong>
          </div>

          <nav className="rail-concept-list" aria-label={`${concept.topic.title} 개념`}>
            {loadingOutline && currentTopicConcepts.length === 0 ? (
              <span className="rail-muted">개념 목록 불러오는 중…</span>
            ) : currentTopicConcepts.map((item, index) => (
              <Link
                className={`rail-concept${item.id === concept.id ? ' active' : ''}`}
                key={item.id}
                to="/concepts/$conceptId"
                params={{ conceptId: String(item.id) }}
                aria-current={item.id === concept.id ? 'page' : undefined}
              >
                <span className="rail-concept-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="rail-concept-title">{item.title}</span>
                <span className={`rail-status status-${item.learningStatus.toLowerCase()}`} title={learningStatusLabels[item.learningStatus]}>
                  {item.learningStatus === 'COMPLETED' ? '✓' : item.learningStatus === 'REVIEW_NEEDED' ? '!' : item.learningStatus === 'LEARNING' ? '•' : ''}
                </span>
              </Link>
            ))}
          </nav>

          <details className="rail-topic-disclosure">
            <summary>
              <span>전체 주제 보기</span>
              <small>{topics.length}개</small>
            </summary>
            <nav aria-label="전체 학습 주제">
              <div className="rail-topic-list">
                {topics.map((topic, index) => {
                  const active = topic.id === concept.topic.id
                  const completed = topic.publishedConceptCount > 0
                    && topic.completedConceptCount === topic.publishedConceptCount

                  return (
                    <Link
                      className={`rail-topic${active ? ' active' : ''}${completed ? ' completed' : ''}`}
                      key={topic.id}
                      to="/learning/$areaSlug"
                      params={{ areaSlug: concept.area.slug }}
                      search={defaultLearningSearch}
                      hash={`topic-${topic.id}`}
                      aria-current={active ? 'location' : undefined}
                    >
                      <span className="rail-topic-copy">
                        <span className="rail-topic-state" aria-hidden="true">{completed ? '✓' : active ? '•' : ''}</span>
                        <span className="rail-topic-title">
                          <span className="rail-topic-number">{String(index + 1).padStart(2, '0')}</span>
                          <span>{topic.title}</span>
                        </span>
                      </span>
                      <small>{topic.completedConceptCount}/{topic.publishedConceptCount}</small>
                    </Link>
                  )
                })}
              </div>
            </nav>
          </details>
        </div>
      </div>
    </aside>
  )
}
