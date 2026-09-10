import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getConcepts, getLearningArea, type LearningStatus } from '../lib/learning-api'
import { defaultLearningSearch } from '../lib/learning-search'

const statusMarks: Record<LearningStatus, string> = {
  UNSEEN: '○',
  LEARNING: '◐',
  COMPLETED: '●',
  REVIEW_NEEDED: '△',
}

interface LearningRailProps {
  areaSlug: string
  areaName: string
  currentTopicId?: number
  currentConceptId?: number
}

/** 현재 학습 영역의 Topic과 Concept 순서를 고정해 주는 데스크톱 학습 navigation이다. */
export function LearningRail({ areaSlug, areaName, currentTopicId, currentConceptId }: LearningRailProps) {
  const areaQuery = useQuery({
    queryKey: ['learning-rail-area', areaSlug],
    queryFn: () => getLearningArea(areaSlug),
  })
  const conceptsQuery = useQuery({
    queryKey: ['learning-rail-concepts', areaSlug, currentTopicId],
    queryFn: () => getConcepts({ area: areaSlug, topic: currentTopicId, page: 0, size: 50, sort: 'curriculum' }),
    enabled: currentTopicId !== undefined,
  })

  const area = areaQuery.data
  const concepts = conceptsQuery.data?.items ?? []
  const currentTopic = area?.topics.find((topic) => topic.id === currentTopicId)
  const completedConcepts = area?.topics.reduce((total, topic) => total + topic.completedConceptCount, 0) ?? 0
  const publishedConcepts = area?.topics.reduce((total, topic) => total + topic.publishedConceptCount, 0) ?? 0
  const completionPercent = publishedConcepts === 0 ? 0 : Math.round((completedConcepts / publishedConcepts) * 100)

  return (
    <aside className="learning-rail" aria-label={`${areaName} 학습 탐색`}>
      <Link className="rail-back-link" to="/learning" search={defaultLearningSearch}>← 모든 학습 영역</Link>
      <p className="rail-kicker">현재 학습 영역</p>
      <h2>{areaName}</h2>
      <div className="rail-progress" aria-label={`전체 진행률 ${completionPercent}%`}>
        <div className="rail-progress-label"><span>전체 진행률</span><strong>{completionPercent}%</strong></div>
        <div className="progress-track" aria-hidden="true"><span style={{ width: `${completionPercent}%` }} /></div>
      </div>

      <div className="rail-topic-list">
        <p className="rail-section-title">학습 주제</p>
        {areaQuery.isPending && <span className="rail-muted">학습 순서 불러오는 중…</span>}
        {area?.topics.map((topic) => (
          <Link
            key={topic.id}
            className={`rail-topic${topic.id === currentTopicId ? ' active' : ''}`}
            to="/learning/$areaSlug"
            params={{ areaSlug }}
            search={{ ...defaultLearningSearch, topic: topic.id }}
            aria-current={topic.id === currentTopicId ? 'location' : undefined}
          >
            <span>{topic.title}</span>
            <small>{topic.completedConceptCount}/{topic.publishedConceptCount}</small>
          </Link>
        ))}
      </div>

      {currentTopicId !== undefined && <div className="rail-concept-list">
        <div className="rail-section-title-row">
          <p className="rail-section-title">이 주제의 개념</p>
          {currentTopic && <span className="rail-muted">{currentTopic.publishedConceptCount}개</span>}
        </div>
        {conceptsQuery.isPending && <span className="rail-muted">Concept 순서 불러오는 중…</span>}
        {concepts.map((concept, index) => (
          <Link
            key={concept.id}
            className={`rail-concept${concept.id === currentConceptId ? ' active' : ''}`}
            to="/concepts/$conceptId"
            params={{ conceptId: String(concept.id) }}
            aria-current={concept.id === currentConceptId ? 'page' : undefined}
          >
            <span className="rail-concept-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="rail-concept-title">{concept.title}</span>
            <span className={`rail-status status-${concept.learningStatus.toLowerCase()}`} aria-label={concept.learningStatus}>{statusMarks[concept.learningStatus]}</span>
          </Link>
        ))}
      </div>}
    </aside>
  )
}
