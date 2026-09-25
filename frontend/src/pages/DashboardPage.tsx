import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EmptyState, ErrorState, PageSkeleton } from '../components/AsyncStates'
import { CanonicalBootstrapCard } from '../components/CanonicalBootstrapCard'
import { getDashboard, type Dashboard, type DashboardHeatmapDay } from '../lib/dashboard-api'
import { getConcepts } from '../lib/learning-api'
import { selectRecentConcepts } from '../lib/learning-recent'
import { createReviewQuiz } from '../lib/review-api'
import { defaultLearningSearch } from '../lib/learning-search'
import { defaultQuizSearch } from '../lib/quiz-search'
import { defaultWrongNoteSearch } from '../lib/wrong-note-search'

function percent(value: number | null) {
  return value === null ? '—' : `${Math.round(value)}%`
}

function heatmapLevel(day: DashboardHeatmapDay) {
  if (day.activityCount === 0) return 'heatmap-cell level-0'
  if (day.activityCount === 1) return 'heatmap-cell level-1'
  if (day.activityCount <= 3) return 'heatmap-cell level-2'
  return 'heatmap-cell level-3'
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function quizStatus(status: string) {
  if (status === 'COMPLETED') return '완료'
  if (status === 'SUBMITTED') return '제출됨'
  return status
}

function recentQuizPerformanceLabel(quiz: Dashboard['recentQuizzes'][number]) {
  if (quiz.pendingSelfCheckCount > 0) {
    return `확정 ${quiz.finalizedCount}문항 중 ${quiz.correctCount}개 정답 · 자기채점 ${quiz.pendingSelfCheckCount}개 대기`
  }
  return `${quiz.correctCount}/${quiz.totalCount}개 정답`
}

export function DashboardPage() {
  const navigate = useNavigate({ from: '/' })
  const queryClient = useQueryClient()
  const dashboardQuery = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard })
  const recentConceptsQuery = useQuery({
    queryKey: ['concepts', { page: 0, size: 4, sort: 'VIEWED' }],
    queryFn: () => getConcepts({ page: 0, size: 4, sort: 'VIEWED' }),
  })
  const reviewMutation = useMutation({
    mutationFn: () => createReviewQuiz(10),
    onSuccess: (quiz) => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void navigate({ to: '/quiz/$quizId', params: { quizId: String(quiz.quizId) } })
    },
  })

  if (dashboardQuery.isPending || recentConceptsQuery.isPending) return <PageSkeleton rows={5} />
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <ErrorState message="홈을 불러오지 못했습니다." onRetry={() => void dashboardQuery.refetch()} />
  }

  const dashboard = dashboardQuery.data
  const recentConcepts = recentConceptsQuery.data ? selectRecentConcepts(recentConceptsQuery.data.items).slice(0, 3) : []
  const recentConcept = recentConcepts[0] ?? null
  const progressedAreas = dashboard.areaProgress.filter((area) => area.completedConceptCount > 0)
  const untouchedAreas = dashboard.areaProgress.filter((area) => area.completedConceptCount === 0)
  const showingProgressedAreas = progressedAreas.length > 0
  const areaPool = showingProgressedAreas ? progressedAreas : untouchedAreas
  const recentAreaInPool = recentConcept ? areaPool.find((area) => area.areaSlug === recentConcept.areaSlug) : undefined
  const featuredAreas = [
    ...(recentAreaInPool ? [recentAreaInPool] : []),
    ...areaPool.filter((area) => area.areaSlug !== recentAreaInPool?.areaSlug),
  ].slice(0, 4)
  const fallbackArea = featuredAreas[0] ?? dashboard.areaProgress[0] ?? null
  const primaryKind = dashboard.activeQuiz
    ? 'quiz'
    : dashboard.today.reviewDueCount > 0
      ? 'review'
      : recentConcept
        ? 'concept'
        : fallbackArea
          ? 'area'
          : 'learning'
  const continuationLabel = dashboard.activeQuiz
    ? '진행 중인 퀴즈'
    : dashboard.today.reviewDueCount > 0
      ? '오늘 복습'
      : recentConcept
        ? '최근 본 개념'
        : fallbackArea
          ? '학습 시작'
          : '커리큘럼'
  const continuationTitle = dashboard.activeQuiz
    ? '풀던 퀴즈 이어가기'
    : dashboard.today.reviewDueCount > 0
      ? `오늘 복습할 ${dashboard.today.reviewDueCount}개 항목`
      : recentConcept
        ? recentConcept.title
        : fallbackArea
          ? fallbackArea.areaName
          : '학습 영역에서 시작하기'
  const continuationDescription = dashboard.activeQuiz
    ? `${dashboard.activeQuiz.questionCount}문항 중 ${dashboard.activeQuiz.answeredCount}문항까지 답했습니다. 마지막 저장 위치에서 바로 이어집니다.`
    : dashboard.today.reviewDueCount > 0
      ? '오늘 예정된 복습을 먼저 정리한 뒤 새 개념이나 문제로 넘어가세요.'
      : recentConcept
        ? recentConcept.summary ?? `${recentConcept.areaName} · ${recentConcept.topicTitle}에서 읽던 개념입니다.`
        : fallbackArea
          ? '진행 중인 학습이 없습니다. 이 영역의 커리큘럼에서 첫 개념을 골라 시작할 수 있습니다.'
          : '학습 콘텐츠를 준비한 뒤 학습 영역에서 첫 개념을 선택하세요.'
  const continuationMeta = dashboard.activeQuiz
    ? `시작 ${formatDate(dashboard.activeQuiz.startedAt)} · 남은 ${Math.max(0, dashboard.activeQuiz.questionCount - dashboard.activeQuiz.answeredCount)}문항`
    : dashboard.today.reviewDueCount > 0
      ? '오답 노트와 복습 일정 기준'
      : recentConcept
        ? `${recentConcept.areaName} · ${recentConcept.topicTitle} · 레벨 ${recentConcept.level}`
        : fallbackArea
          ? `${fallbackArea.publishedConceptCount}개 개념${fallbackArea.completedConceptCount > 0 ? ` · ${fallbackArea.completedConceptCount}개 완료` : ''}`
          : '학습 콘텐츠 상태를 확인하세요.'
  const showReviewFollowUp = dashboard.activeQuiz !== null && dashboard.today.reviewDueCount > 0
  const showConceptFollowUp = recentConcept !== null && primaryKind !== 'concept'
  const areaSectionTitle = showingProgressedAreas ? '진행 중인 학습 영역' : '다음 학습 영역'
  const areaSectionDescription = showingProgressedAreas
    ? '이미 시작한 영역에서 다음 개념을 이어가세요.'
    : '관심 있는 영역을 골라 커리큘럼을 시작하세요.'

  return (
    <section className="page-section dashboard-page home-page">
      <header className="home-heading">
        <div>
          <p className="eyebrow">홈</p>
          <h1>오늘의 학습</h1>
          <p className="lead">지금 이어갈 학습과 필요한 복습을 먼저 확인하세요.</p>
        </div>
        <p className="dashboard-date">{formatDate(dashboard.asOf)} 기준</p>
      </header>

      <section className={`home-continuation home-continuation-${primaryKind}`} aria-labelledby="home-continuation-title">
        <div className="home-continuation-copy">
          <p className="eyebrow">{continuationLabel}</p>
          <h2 id="home-continuation-title">{continuationTitle}</h2>
          <p>{continuationDescription}</p>
          <span className="home-continuation-meta">{continuationMeta}</span>
        </div>
        <div className="home-continuation-action">
          {dashboard.activeQuiz ? (
            <Link className="primary-button" to="/quiz/$quizId" params={{ quizId: String(dashboard.activeQuiz.quizId) }}>이어 풀기</Link>
          ) : dashboard.today.reviewDueCount > 0 ? (
            <button className="primary-button" type="button" disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate()}>{reviewMutation.isPending ? '복습 준비 중…' : '복습 시작'}</button>
          ) : recentConcept ? (
            <Link className="primary-button" to="/concepts/$conceptId" params={{ conceptId: String(recentConcept.id) }}>계속 읽기</Link>
          ) : fallbackArea ? (
            <Link className="primary-button" to="/learning/$areaSlug" params={{ areaSlug: fallbackArea.areaSlug }} search={defaultLearningSearch}>학습 시작</Link>
          ) : (
            <Link className="primary-button" to="/learning" search={defaultLearningSearch}>학습 영역 보기</Link>
          )}
        </div>
      </section>

      {reviewMutation.isError && <p className="home-inline-state error-text" role="alert">복습 문제를 시작하지 못했습니다. 다시 시도하세요.</p>}
      {recentConceptsQuery.isError && (
        <div className="home-inline-state error-text" role="alert">
          최근 본 개념을 불러오지 못했습니다.
          <button className="text-button" type="button" onClick={() => void recentConceptsQuery.refetch()}>다시 시도</button>
        </div>
      )}

      {(showReviewFollowUp || showConceptFollowUp) && (
        <section className="home-follow-up" aria-labelledby="home-follow-up-heading">
          <div className="dashboard-section-heading home-follow-up-heading">
            <div><p className="eyebrow">그다음</p><h2 id="home-follow-up-heading">이어갈 학습</h2></div>
          </div>
          <div className="home-follow-up-list">
            {showReviewFollowUp && (
              <div className="home-follow-up-row">
                <span className="home-follow-up-copy"><span>복습</span><strong>오늘 복습 {dashboard.today.reviewDueCount}개</strong><small>진행 중인 퀴즈를 마친 뒤 이어서 정리할 수 있습니다.</small></span>
                <button className="text-button" type="button" disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate()}>{reviewMutation.isPending ? '준비 중…' : '복습 시작 →'}</button>
              </div>
            )}
            {showConceptFollowUp && recentConcept && (
              <Link className="home-follow-up-row" to="/concepts/$conceptId" params={{ conceptId: String(recentConcept.id) }}>
                <span className="home-follow-up-copy"><span>최근 본 개념</span><strong>{recentConcept.title}</strong><small>{recentConcept.areaName} · {recentConcept.topicTitle}</small></span>
                <span className="home-row-action">계속 읽기 →</span>
              </Link>
            )}
          </div>
        </section>
      )}

      {dashboard.areaProgress.length === 0 && <CanonicalBootstrapCard />}

      {dashboard.areaProgress.length > 0 && (
        <section className="dashboard-section dashboard-area-section">
          <div className="dashboard-section-heading">
            <div><p className="eyebrow">커리큘럼</p><h2>{areaSectionTitle}</h2></div>
            <Link className="text-link" to="/learning" search={defaultLearningSearch}>전체 {dashboard.areaProgress.length}개 영역 보기 →</Link>
          </div>
          <p className="dashboard-section-copy">{areaSectionDescription}</p>
          <div className="dashboard-area-list">
            {featuredAreas.map((area, index) => {
              const started = area.completedConceptCount > 0
              return (
                <Link className="dashboard-area-row" key={area.areaSlug} to="/learning/$areaSlug" params={{ areaSlug: area.areaSlug }} search={defaultLearningSearch}>
                  <span className="dashboard-area-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <span className="dashboard-area-copy">
                    <strong>{area.areaName}</strong>
                    <span>{started ? `${area.completedConceptCount}/${area.publishedConceptCount}개 개념 완료` : `${area.publishedConceptCount}개 개념 · 미시작`}</span>
                  </span>
                  <span className="dashboard-area-progress">
                    {started ? (
                      <>
                        <b>{percent(area.completionPercent)}</b>
                        <span className="dashboard-progress-track" aria-hidden="true"><span style={{ width: `${Math.min(100, area.completionPercent)}%` }} /></span>
                      </>
                    ) : <span className="helper-text">미시작</span>}
                  </span>
                  <span className="dashboard-area-arrow" aria-hidden="true">→</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <div className="dashboard-lower-grid home-history-grid">
        <section className="dashboard-section">
          <div className="dashboard-section-heading"><div><p className="eyebrow">학습 이력</p><h2>최근 문제 풀이</h2></div><Link className="text-link" to="/quiz" search={defaultQuizSearch}>새 문제 →</Link></div>
          {dashboard.recentQuizzes.length === 0 ? <EmptyState message="제출된 문제가 아직 없습니다." /> : <div className="dashboard-list">{dashboard.recentQuizzes.map((quiz) => <Link className="dashboard-list-item" key={quiz.quizId} to="/quiz/$quizId/result" params={{ quizId: String(quiz.quizId) }}><div><strong>#{quiz.quizId} · {quiz.source.replace('_', ' ')}</strong><span>{quizStatus(quiz.status)} · {formatDate(quiz.startedAt)}</span></div><div className="dashboard-list-metric"><strong>{percent(quiz.accuracyPercent)}</strong><span>{recentQuizPerformanceLabel(quiz)}</span></div></Link>)}</div>}
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading"><div><p className="eyebrow">다시 보기</p><h2>약점 주제</h2></div><Link className="text-link" to="/wrong-notes" search={defaultWrongNoteSearch}>오답 노트 →</Link></div>
          {dashboard.weakTopics.length === 0 ? <EmptyState message="최근 30일에 3회 이상 시도한 약점 주제가 없습니다." /> : <div className="dashboard-list">{dashboard.weakTopics.map((topic) => <Link className="dashboard-list-item" key={topic.topicId} to="/learning/$areaSlug" params={{ areaSlug: topic.areaSlug }} search={defaultLearningSearch}><div><strong>{topic.topicTitle}</strong><span>{topic.areaName}</span></div><div className="dashboard-list-metric"><strong>{percent(topic.accuracyPercent)}</strong><span>{topic.attemptCount}회 시도 · 오답 {topic.wrongCount}</span></div></Link>)}</div>}
        </section>
      </div>

      <details className="home-stats-disclosure">
        <summary><span><span className="eyebrow">학습 통계</span><strong>오늘 기록과 장기 활동 보기</strong></span><span>펼치기 <span aria-hidden="true">⌄</span></span></summary>
        <div className="home-stats-content">
          <section className="dashboard-status-strip" aria-label="오늘의 학습 통계">
            <div className="dashboard-status-item"><span>오늘 푼 문제</span><strong>{dashboard.today.solvedCount}</strong><small>정답 {dashboard.today.correctCount} · 오답 {dashboard.today.wrongCount}</small></div>
            <div className="dashboard-status-item"><span>오늘 정확도</span><strong>{percent(dashboard.today.accuracyPercent)}</strong><small>{dashboard.today.solvedCount === 0 ? '아직 풀이 기록이 없습니다.' : '채점 완료 문항 기준'}</small></div>
            <div className="dashboard-status-item"><span>복습 대기</span><strong>{dashboard.today.reviewDueCount}</strong><small>{dashboard.today.reviewDueCount > 0 ? '지금 시작할 수 있습니다.' : '현재 대기 중인 복습이 없습니다.'}</small></div>
            <div className="dashboard-status-item"><span>연속 학습</span><strong>{dashboard.currentStreak}일</strong><small>{dashboard.currentStreak === 0 ? '오늘 다시 시작해 보세요.' : '활동이 이어지고 있습니다.'}</small></div>
          </section>
          <div className="home-heatmap-heading"><strong>최근 365일 학습 활동</strong><span>개념 열람과 문제 풀이 기록</span></div>
          <div className="heatmap-shell">
            <div className="heatmap-months" aria-hidden="true"><span>1월</span><span>3월</span><span>5월</span><span>7월</span><span>9월</span><span>11월</span></div>
            <div className="heatmap" aria-label="최근 365일 학습 활동">
              {dashboard.heatmap.map((day) => <span className={heatmapLevel(day)} key={day.date} title={`${day.date}: ${day.activityCount}회 활동`} aria-label={`${day.date}: ${day.activityCount}회 활동`} />)}
            </div>
            <div className="heatmap-legend"><span>적음</span><span className="heatmap-cell level-0" /><span className="heatmap-cell level-1" /><span className="heatmap-cell level-2" /><span className="heatmap-cell level-3" /><span>많음</span></div>
          </div>
        </div>
      </details>
    </section>
  )
}
