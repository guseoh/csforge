import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EmptyState, ErrorState, PageSkeleton } from '../components/AsyncStates'
import { CanonicalBootstrapCard } from '../components/CanonicalBootstrapCard'
import { getDashboard, type DashboardHeatmapDay } from '../lib/dashboard-api'
import { createReviewQuiz } from '../lib/review-api'
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
    return <ErrorState message="대시보드를 불러오지 못했습니다." onRetry={() => void dashboardQuery.refetch()} />
  }

  const dashboard = dashboardQuery.data
  const hasActivity = dashboard.today.solvedCount > 0
    || dashboard.recentQuizzes.length > 0
    || dashboard.weakTopics.length > 0
    || dashboard.heatmap.some((day) => day.activityCount > 0)
  const nextActionTitle = dashboard.activeQuiz
    ? '풀던 문제를 이어서 마무리하세요.'
    : dashboard.today.reviewDueCount > 0
      ? `오늘 복습할 ${dashboard.today.reviewDueCount}개 항목이 있습니다.`
      : '오늘 공부할 개념을 골라 시작하세요.'
  const nextActionDescription = dashboard.activeQuiz
    ? `${dashboard.activeQuiz.answeredCount}/${dashboard.activeQuiz.questionCount}문항까지 답했습니다. 저장된 위치에서 바로 이어집니다.`
    : dashboard.today.reviewDueCount > 0
      ? '복습할 내용을 먼저 정리한 뒤 새 개념이나 문제로 넘어가면 됩니다.'
      : hasActivity
        ? '최근 흐름을 이어가거나 다른 학습 영역을 선택할 수 있습니다.'
        : '개념을 읽고 문제로 확인한 뒤, 틀린 내용은 오답 노트와 복습으로 이어집니다.'
  const progressedAreas = dashboard.areaProgress.filter((area) => area.completedConceptCount > 0)
  const untouchedAreas = dashboard.areaProgress.filter((area) => area.completedConceptCount === 0)
  const showingProgressedAreas = progressedAreas.length > 0
  const featuredAreas = (showingProgressedAreas ? progressedAreas : untouchedAreas).slice(0, 6)
  const areaSectionTitle = showingProgressedAreas ? '진행 중인 학습 영역' : '다음 학습 영역'
  const areaSectionDescription = showingProgressedAreas
    ? '이미 시작한 영역만 모아 현재 학습 흐름을 이어갑니다.'
    : '아직 시작한 영역이 없습니다. 관심 있는 영역을 골라 첫 개념부터 시작해 보세요.'

  return (
    <section className="page-section dashboard-page">
      <header className="dashboard-next-action">
        <div className="dashboard-next-action-copy">
          <p className="eyebrow">다음 행동</p>
          <h1>{nextActionTitle}</h1>
          <p className="lead">{nextActionDescription}</p>
          <p className="dashboard-date">{formatDate(dashboard.asOf)} 기준 · 오늘의 학습 상태</p>
        </div>
        <div className="dashboard-next-action-actions">
          <div className="dashboard-action-row">
            {dashboard.activeQuiz && <Link className="primary-button" to="/quiz/$quizId" params={{ quizId: String(dashboard.activeQuiz.quizId) }}>이어 풀기 · {dashboard.activeQuiz.answeredCount}/{dashboard.activeQuiz.questionCount}</Link>}
            {dashboard.today.reviewDueCount > 0 && <button className={dashboard.activeQuiz ? 'secondary-button' : 'primary-button'} type="button" disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate()}>{reviewMutation.isPending ? '복습 준비 중…' : '복습 시작'}</button>}
            <Link className={dashboard.activeQuiz || dashboard.today.reviewDueCount > 0 ? 'secondary-button' : 'primary-button'} to="/learning" search={defaultLearningSearch}>개념 학습</Link>
            <Link className="secondary-button" to="/quiz" search={defaultQuizSearch}>새 문제</Link>
          </div>
          {reviewMutation.isError && <p className="helper-text error-text">복습 문제를 시작하지 못했습니다. 다시 시도하세요.</p>}
        </div>
      </header>

      <section className="dashboard-status-strip" aria-label="오늘의 학습 상태">
        <div className="dashboard-status-item"><span>오늘 푼 문제</span><strong>{dashboard.today.solvedCount}</strong><small>정답 {dashboard.today.correctCount} · 오답 {dashboard.today.wrongCount}</small></div>
        <div className="dashboard-status-item"><span>오늘 정확도</span><strong>{percent(dashboard.today.accuracyPercent)}</strong><small>{dashboard.today.solvedCount === 0 ? '아직 풀이 기록이 없습니다.' : '채점 완료 문항 기준'}</small></div>
        <div className="dashboard-status-item dashboard-status-item-attention"><span>복습 대기</span><strong>{dashboard.today.reviewDueCount}</strong><small>{dashboard.today.reviewDueCount > 0 ? '지금 시작할 수 있습니다.' : '현재 대기 중인 복습이 없습니다.'}</small></div>
        <div className="dashboard-status-item"><span>연속 학습</span><strong>{dashboard.currentStreak}일</strong><small>{dashboard.currentStreak === 0 ? '오늘 다시 시작해 보세요.' : '활동이 이어지고 있습니다.'}</small></div>
      </section>

      {!hasActivity && <div className="dashboard-empty"><strong>첫 학습 기록을 만들어 보세요.</strong><span>개념을 읽거나 문제를 풀면 오늘의 활동과 진행률이 이곳에 쌓입니다.</span><CanonicalBootstrapCard readyAction="learning-link" /></div>}

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

      <div className="dashboard-lower-grid">
        <section className="dashboard-section">
          <div className="dashboard-section-heading"><div><p className="eyebrow">최근 약점</p><h2>약점 주제</h2></div><Link className="text-link" to="/wrong-notes" search={defaultWrongNoteSearch}>오답 노트 →</Link></div>
          {dashboard.weakTopics.length === 0 ? <EmptyState message="최근 30일에 3회 이상 시도한 약점 주제가 없습니다." /> : <div className="dashboard-list">{dashboard.weakTopics.map((topic) => <Link className="dashboard-list-item" key={topic.topicId} to="/learning/$areaSlug" params={{ areaSlug: topic.areaSlug }} search={defaultLearningSearch}><div><strong>{topic.topicTitle}</strong><span>{topic.areaName}</span></div><div className="dashboard-list-metric"><strong>{percent(topic.accuracyPercent)}</strong><span>{topic.attemptCount}회 시도 · 오답 {topic.wrongCount}</span></div></Link>)}</div>}
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading"><div><p className="eyebrow">학습 이력</p><h2>최근 문제 풀이</h2></div><Link className="text-link" to="/quiz" search={defaultQuizSearch}>새 문제 →</Link></div>
          {dashboard.recentQuizzes.length === 0 ? <EmptyState message="제출된 문제가 아직 없습니다." /> : <div className="dashboard-list">{dashboard.recentQuizzes.map((quiz) => <Link className="dashboard-list-item" key={quiz.quizId} to="/quiz/$quizId/result" params={{ quizId: String(quiz.quizId) }}><div><strong>#{quiz.quizId} · {quiz.source.replace('_', ' ')}</strong><span>{quizStatus(quiz.status)} · {formatDate(quiz.startedAt)}</span></div><div className="dashboard-list-metric"><strong>{percent(quiz.accuracyPercent)}</strong><span>{quiz.correctCount}/{quiz.finalizedCount}개 정답{quiz.pendingSelfCheckCount > 0 ? ` · 자기 채점 ${quiz.pendingSelfCheckCount}개 대기` : ''}</span></div></Link>)}</div>}
        </section>
      </div>

      <details className="dashboard-activity-disclosure">
        <summary><span><span className="eyebrow">활동 기록</span><strong>최근 365일 학습 활동</strong></span><span>열어보기 ⌄</span></summary>
        <div className="heatmap-shell">
          <div className="heatmap-months" aria-hidden="true"><span>1월</span><span>3월</span><span>5월</span><span>7월</span><span>9월</span><span>11월</span></div>
          <div className="heatmap" aria-label="최근 365일 학습 활동">
            {dashboard.heatmap.map((day) => <span className={heatmapLevel(day)} key={day.date} title={`${day.date}: ${day.activityCount}회 활동`} aria-label={`${day.date}: ${day.activityCount}회 활동`} />)}
          </div>
          <div className="heatmap-legend"><span>적음</span><span className="heatmap-cell level-0" /><span className="heatmap-cell level-1" /><span className="heatmap-cell level-2" /><span className="heatmap-cell level-3" /><span>많음</span></div>
        </div>
      </details>
    </section>
  )
}