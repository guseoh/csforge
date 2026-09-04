import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EmptyState, ErrorState, PageSkeleton } from '../components/AsyncStates'
import { createReviewQuiz, getDashboard, type DashboardHeatmapDay } from '../lib/api'
import { defaultLearningSearch } from '../lib/learning-search'
import { defaultQuizSearch } from '../lib/quiz-search'
import { defaultWrongNoteSearch } from '../lib/wrong-note-search'


function percent(value: number) {
  return `${Math.round(value)}%`
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

export function DashboardPage() {
  const navigate = useNavigate({ from: '/' })
  const queryClient = useQueryClient()
  const dashboardQuery = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard })
  const reviewMutation = useMutation({
    mutationFn: () => createReviewQuiz(10),
    onSuccess: (quiz) => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void navigate({ to: '/quiz/$quizId', params: { quizId: String(quiz.quizId) } })
    },
  })

  if (dashboardQuery.isPending) return <PageSkeleton rows={6} />
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <ErrorState message="Dashboard를 불러오지 못했습니다." onRetry={() => void dashboardQuery.refetch()} />
  }

  const dashboard = dashboardQuery.data
  const hasActivity = dashboard.today.solvedCount > 0
    || dashboard.recentQuizzes.length > 0
    || dashboard.weakTopics.length > 0
    || dashboard.heatmap.some((day) => day.activityCount > 0)

  return (
    <section className="page-section dashboard-page">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Daily study cockpit</p>
          <h1>오늘의 학습 흐름</h1>
          <p className="lead">{dashboard.studyDate} · {dashboard.zoneId} 기준으로 쌓인 학습 기록입니다.</p>
        </div>
        <span className="dashboard-as-of">As of {formatDate(dashboard.asOf)}</span>
      </div>

      <div className="dashboard-kpi-grid">
        <div className="dashboard-kpi"><span>오늘 푼 문제</span><strong>{dashboard.today.solvedCount}</strong><small>{dashboard.today.correctCount} correct · {dashboard.today.wrongCount} wrong</small></div>
        <div className="dashboard-kpi"><span>오늘 정확도</span><strong>{percent(dashboard.today.accuracyPercent)}</strong><small>{dashboard.today.solvedCount === 0 ? '아직 풀이 기록이 없습니다.' : 'finalized attempts 기준'}</small></div>
        <div className="dashboard-kpi dashboard-kpi-action"><span>복습 대기</span><strong>{dashboard.today.reviewDueCount}</strong><small>{dashboard.today.reviewDueCount > 0 ? '지금 시작할 수 있습니다.' : '현재 대기 중인 복습이 없습니다.'}</small></div>
        <div className="dashboard-kpi"><span>연속 학습</span><strong>{dashboard.currentStreak}일</strong><small>{dashboard.currentStreak === 0 ? '오늘 다시 시작해 보세요.' : '활동이 이어지고 있습니다.'}</small></div>
      </div>

      <div className="dashboard-action-row">
        {dashboard.activeQuiz && <Link className="primary-button" to="/quiz/$quizId" params={{ quizId: String(dashboard.activeQuiz.quizId) }}>이어 풀기 · {dashboard.activeQuiz.answeredCount}/{dashboard.activeQuiz.questionCount}</Link>}
        {dashboard.today.reviewDueCount > 0 && <button className={dashboard.activeQuiz ? 'secondary-button' : 'primary-button'} type="button" disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate()}>{reviewMutation.isPending ? '복습 준비 중…' : '복습 시작'}</button>}
        <Link className="secondary-button" to="/learning" search={defaultLearningSearch}>Learning 탐색</Link>
        <Link className="secondary-button" to="/quiz" search={defaultQuizSearch}>새 Quiz</Link>
      </div>
      {reviewMutation.isError && <p className="helper-text error-text">복습 Quiz를 시작하지 못했습니다. 다시 시도하세요.</p>}

      {!hasActivity && <div className="dashboard-empty"><strong>첫 학습을 시작해 보세요.</strong><span>Concept를 읽거나 Quiz를 풀면 이곳에 오늘의 활동과 진행률이 쌓입니다.</span><Link className="primary-button" to="/learning" search={defaultLearningSearch}>Learning 시작</Link></div>}

      <section className="dashboard-section">
        <div className="section-heading"><div><p className="eyebrow">Activity map</p><h2>최근 365일 활동</h2></div><span className="helper-text">Concept 열람 + 푼 문제</span></div>
        <div className="heatmap-shell">
          <div className="heatmap-months" aria-hidden="true"><span>1월</span><span>3월</span><span>5월</span><span>7월</span><span>9월</span><span>11월</span></div>
          <div className="heatmap" aria-label="최근 365일 학습 활동">
            {dashboard.heatmap.map((day) => <span className={heatmapLevel(day)} key={day.date} title={`${day.date}: ${day.activityCount} activity`} aria-label={`${day.date}: ${day.activityCount} activity`} />)}
          </div>
          <div className="heatmap-legend"><span>Less</span><span className="heatmap-cell level-0" /><span className="heatmap-cell level-1" /><span className="heatmap-cell level-2" /><span className="heatmap-cell level-3" /><span>More</span></div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading"><div><p className="eyebrow">Curriculum progress</p><h2>Learning area progress</h2></div><Link className="text-link" to="/learning" search={defaultLearningSearch}>전체 보기 →</Link></div>
        <div className="dashboard-area-grid">
          {dashboard.areaProgress.map((area) => <Link className="dashboard-area-card" key={area.areaSlug} to="/learning/$areaSlug" params={{ areaSlug: area.areaSlug }} search={defaultLearningSearch}>
            <div className="card-heading"><strong>{area.areaName}</strong><span>{percent(area.completionPercent)}</span></div>
            <p>{area.completedConceptCount}/{area.publishedConceptCount} concepts completed</p>
            <div className="dashboard-progress-track"><span style={{ width: `${Math.min(100, area.completionPercent)}%` }} /></div>
            <div className="dashboard-levels">{area.levels.map((level) => <span key={level.level}>L{level.level} {level.completed}/{level.total}</span>)}</div>
          </Link>)}
        </div>
      </section>

      <div className="dashboard-two-column">
        <section className="dashboard-section">
          <div className="section-heading"><div><p className="eyebrow">Recent weakness</p><h2>Weak topics</h2></div><Link className="text-link" to="/wrong-notes" search={defaultWrongNoteSearch}>오답 노트 →</Link></div>
          {dashboard.weakTopics.length === 0 ? <EmptyState message="최근 30일에 3회 이상 시도한 약점 Topic이 없습니다." /> : <div className="dashboard-list">{dashboard.weakTopics.map((topic) => <Link className="dashboard-list-item" key={topic.topicId} to="/learning/$areaSlug" params={{ areaSlug: topic.areaSlug }} search={defaultLearningSearch}><div><strong>{topic.topicTitle}</strong><span>{topic.areaName}</span></div><div className="dashboard-list-metric"><strong>{percent(topic.accuracyPercent)}</strong><span>{topic.attemptCount} attempts · {topic.wrongCount} wrong</span></div></Link>)}</div>}
        </section>

        <section className="dashboard-section">
          <div className="section-heading"><div><p className="eyebrow">Study history</p><h2>Recent quizzes</h2></div><Link className="text-link" to="/quiz" search={defaultQuizSearch}>새 Quiz →</Link></div>
          {dashboard.recentQuizzes.length === 0 ? <EmptyState message="제출된 Quiz가 아직 없습니다." /> : <div className="dashboard-list">{dashboard.recentQuizzes.map((quiz) => <Link className="dashboard-list-item" key={quiz.quizId} to="/quiz/$quizId/result" params={{ quizId: String(quiz.quizId) }}><div><strong>#{quiz.quizId} · {quiz.source.replace('_', ' ')}</strong><span>{quizStatus(quiz.status)} · {formatDate(quiz.startedAt)}</span></div><div className="dashboard-list-metric"><strong>{percent(quiz.accuracyPercent)}</strong><span>{quiz.correctCount}/{quiz.finalizedCount} finalized correct{quiz.pendingSelfCheckCount > 0 ? ` · ${quiz.pendingSelfCheckCount} self-check 대기` : ''}</span></div></Link>)}</div>}
        </section>
      </div>
    </section>
  )
}

