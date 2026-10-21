import { Link, useParams } from '@tanstack/react-router'
import { useQueries, useQuery } from '@tanstack/react-query'
import { EmptyState, ErrorState, PageSkeleton } from '../components/AsyncStates'
import { getLearningArea, getLearningAreaOutline } from '../lib/learning-api'
import { getActiveQuiz, getQuizAvailability } from '../lib/quiz-api'
import { defaultLearningSearch } from '../lib/learning-search'
import { csvParam, defaultQuizSearch } from '../lib/quiz-search'
import { topicFocusState } from '../lib/topic-focus'

const statusLabels = {
  UNSEEN: '미학습', LEARNING: '학습 중', COMPLETED: '학습 완료', REVIEW_NEEDED: '복습 필요',
} as const

/** Resume comes from persisted ConceptProgress, not a parallel session record. */
export function TopicFocusPage() {
  const { areaSlug, topicId: param } = useParams({ from: '/learning/$areaSlug/topics/$topicId/focus' })
  const topicId = Number(param)
  const valid = Number.isSafeInteger(topicId) && topicId > 0
  const areaQuery = useQuery({ queryKey: ['learning-area', areaSlug], queryFn: () => getLearningArea(areaSlug), enabled: valid })
  const first = useQuery({
    queryKey: ['learning-outline', areaSlug, 0],
    queryFn: () => getLearningAreaOutline(areaSlug, 0),
    enabled: valid && !!areaQuery.data,
  })
  const pages = first.data?.page.totalPages ?? 1
  const remaining = useQueries({
    queries: Array.from({ length: Math.max(0, pages - 1) }, (_, index) => ({
      queryKey: ['learning-outline', areaSlug, index + 1],
      queryFn: () => getLearningAreaOutline(areaSlug, index + 1),
      enabled: valid && !!areaQuery.data,
    })),
  })
  const loaded = first.isSuccess && remaining.every((query) => query.isSuccess)
  const allConcepts = loaded ? [first.data, ...remaining.map(q => q.data)].flatMap(page => page?.items ?? []) : []
  const topic = areaQuery.data?.topics.find(item => item.id === topicId)
  const state = topicFocusState(allConcepts, topicId)
  const conceptIds = state.concepts.map(item => item.id)
  // Exactly the selected Topic's current published concepts; never allow an empty filter to mean "all questions".
  const idSignature = csvParam(conceptIds)
  const availability = useQuery({
    queryKey: ['quiz-availability', 'topic-focus', areaSlug, topicId, idSignature],
    queryFn: () => getQuizAvailability({
      areas: [areaSlug], concepts: conceptIds, levels: [], difficulties: [], questionTypes: [], state: 'ALL',
    }),
    enabled: !!topic && loaded && conceptIds.length > 0,
  })
  const active = useQuery({ queryKey: ['quiz-active'], queryFn: getActiveQuiz })
  const quizSearch = { ...defaultQuizSearch, areas: areaSlug, concepts: idSignature }
  const back = <Link to="/learning/$areaSlug" params={{ areaSlug }} search={defaultLearningSearch}>영역으로 돌아가기</Link>

  if (!valid) return <ErrorState message="유효하지 않은 Topic 번호입니다." />
  if (areaQuery.isPending || first.isPending || remaining.some(query => query.isPending)) return <PageSkeleton rows={5} />
  if (areaQuery.isError || first.isError || remaining.some(query => query.isError)) return (
    <ErrorState message="Topic 학습 경로를 불러오지 못했습니다." onRetry={() => {
      if (areaQuery.isError) void areaQuery.refetch()
      if (first.isError) void first.refetch()
      remaining.filter(q => q.isError).forEach(q => { void q.refetch() })
    }} />
  )
  if (!topic) return <section className="page-section topic-focus-page">
    <EmptyState message="해당 학습 영역에 공개된 Topic이 없습니다." />{back}
  </section>

  return <section className="page-section topic-focus-page">
    <nav className="breadcrumb" aria-label="학습 위치">{back}<span>/</span><strong>{topic.title}</strong></nav>
    <header className="topic-focus-header">
      <p className="eyebrow">{areaQuery.data?.name} · Topic 집중 학습</p>
      <h1>{topic.title}</h1>
      <p className="lead">{topic.description || '커리큘럼 순서로 개념을 읽고, 문제 풀이로 마무리합니다.'}</p>
      <p className="helper-text">별도 학습 세션을 만들지 않습니다. 서버에 보관된 학습 진행 상태로 언제든 이어갑니다.</p>
    </header>
    <section className="topic-focus-overview" aria-label="학습 진도">
      <strong>{state.completed}/{state.concepts.length}개 학습 완료</strong>
      <span>학습 중 {state.concepts.filter(c => c.learningStatus === 'LEARNING').length}개 · 복습 필요 {state.concepts.filter(c => c.learningStatus === 'REVIEW_NEEDED').length}개</span>
    </section>
    {state.concepts.length === 0 ? <EmptyState message="이 Topic에 공개된 개념이 없습니다. 다른 Topic을 선택하세요." /> : <>
      {state.next ? <div className="topic-focus-next">
        <div><p className="eyebrow">다음 읽기</p><h2>{state.next.title}</h2>
          <p>{state.next.learningStatus === 'LEARNING' ? '학습 중이던 개념을 이어서 읽으세요.' : '다음 미학습 개념부터 시작하세요.'}</p></div>
        <Link className="primary-button" to="/concepts/$conceptId" params={{ conceptId: String(state.next.id) }}>이어 읽기</Link>
      </div> : state.allCompleted ? <p className="topic-focus-notice" role="status">모든 개념의 읽기를 완료했습니다. 이제 이 Topic의 문제로 확인하세요.</p>
        : <p className="topic-focus-notice">미학습 개념이 없습니다. 복습 필요 개념을 확인한 뒤 문제로 넘어가세요.</p>}
      {state.review && <p className="topic-focus-review">복습할 개념: <Link to="/concepts/$conceptId" params={{ conceptId: String(state.review.id) }}>{state.review.title}</Link></p>}
      <ol className="topic-focus-list" aria-label="Topic 개념 순서">
        {state.concepts.map(concept => <li key={concept.id}>
          <Link to="/concepts/$conceptId" params={{ conceptId: String(concept.id) }}>
            <strong>{concept.title}</strong><span>레벨 {concept.level} · {statusLabels[concept.learningStatus]}</span>
          </Link>
        </li>)}
      </ol>
    </>}
    <section className="topic-focus-finish" aria-labelledby="topic-focus-quiz">
      <h2 id="topic-focus-quiz">이 Topic 문제로 마무리</h2>
      <p>선택한 Topic에 연결된 공개 문제만 대상으로 합니다. 실제 출제 가능 수는 Quiz 서버에서 확인합니다.</p>
      {state.concepts.length === 0 ? <p>문제 범위로 사용할 개념이 없습니다.</p> :
        availability.isPending ? <p role="status">출제 가능 문제 확인 중…</p> :
          availability.isError ? <div role="alert">문항 수를 조회하지 못했습니다.
            <button className="text-button" type="button" onClick={() => void availability.refetch()}>다시 시도</button></div> :
          <p role="status">출제 가능 {availability.data?.availableCount ?? 0}문항
            {availability.data?.availableCount === 0 ? ' · 현재 연결된 공개 문제가 없습니다.' : ''}</p>}
      {state.concepts.length > 0 && (availability.data?.availableCount ?? 0) > 0 &&
        <Link className="primary-button" to="/quiz" search={quizSearch}>이 Topic 문제 풀기</Link>}
      {active.isError ? <div role="alert">진행 중인 Quiz를 확인하지 못했습니다.
        <button type="button" className="text-button" onClick={() => void active.refetch()}>다시 확인</button></div> :
        active.data ? <div className="topic-focus-active">
          <p>진행 중인 Quiz가 있습니다 ({active.data.answeredCount}/{active.data.questionCount}문항).
            기존 Quiz를 이어가거나 위에서 새 Quiz 조건을 설정할 수 있습니다.</p>
          <Link className="secondary-button" to="/quiz/$quizId" params={{ quizId: String(active.data.quizId) }}>진행 중인 Quiz 이어 풀기</Link>
        </div> : null}
    </section>
  </section>
}
