import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import { useToast } from '../components/toast/ToastProvider'
import { createReviewQuiz, getReviews, getReviewSummary } from '../lib/review-api'
import type { ReviewScheduleStatus } from '../lib/wrong-note-api'
import { compactMarkdownPreview } from '../lib/markdown'
import { classifyReviewTiming, hasActionableReviews, type ReviewTiming } from '../lib/review-timing'

const timingLabels: Record<ReviewTiming, string> = {
  OVERDUE: '기한 지남',
  DUE_NOW: '지금 복습',
  NEXT_24H: '24시간 내',
  NEXT_7D: '7일 내',
  SCHEDULED: '예정됨',
  MASTERED: '정리 완료',
}

const timingClasses: Record<ReviewTiming, string> = {
  OVERDUE: 'overdue',
  DUE_NOW: 'due',
  NEXT_24H: 'next24',
  NEXT_7D: 'next7',
  SCHEDULED: 'scheduled',
  MASTERED: 'mastered',
}

const reviewWindowChoices = [
  { value: 'ALL', label: '전체' },
  { value: 'OVERDUE', label: '기한 지남' },
  { value: 'DUE', label: '지금 복습' },
  { value: 'NEXT_24H', label: '24시간 내' },
  { value: 'NEXT_7D', label: '7일 내' },
] as const

function reviewTiming(dueAt: string | null, status: ReviewScheduleStatus) {
  const timing = classifyReviewTiming(dueAt, status)
  return { label: timingLabels[timing], className: timingClasses[timing] }
}

export function ReviewPage() {
  const { showToast } = useToast()
  const search = useSearch({ from: '/review' })
  const navigate = useNavigate({ from: '/review' })
  const summary = useQuery({ queryKey: ['review-summary'], queryFn: getReviewSummary })
  const reviews = useQuery({ queryKey: ['reviews', search], queryFn: () => getReviews({ due: search.due, page: search.page, size: 20 }) })
  const create = useMutation({ mutationFn: () => createReviewQuiz(10), onSuccess: (quiz) => void navigate({ to: '/quiz/$quizId', params: { quizId: String(quiz.quizId) } }), onError: () => showToast('error', '복습 문제를 만들지 못했습니다.') })

  if (summary.isPending || reviews.isPending) return <PageSkeleton rows={5} />
  if (summary.isError || reviews.isError) return <ErrorState message="복습 일정을 불러오지 못했습니다." onRetry={() => { void summary.refetch(); void reviews.refetch() }} />

  const updateDue = (due: string) => void navigate({ search: (current) => ({ ...current, due, page: 0 }) })
  const totalSchedules = summary.data.overdue + summary.data.dueNow + summary.data.next24Hours + summary.data.next7Days + summary.data.mastered
  const hasSchedules = totalSchedules > 0
  const reviewCounts: Record<(typeof reviewWindowChoices)[number]['value'], number> = {
    ALL: totalSchedules,
    OVERDUE: summary.data.overdue,
    DUE: summary.data.dueNow,
    NEXT_24H: summary.data.next24Hours,
    NEXT_7D: summary.data.next7Days,
  }

  return (
    <section className="page-section review-page">
      <div className="page-heading">
        <div><p className="eyebrow">간격 반복</p><h1>복습</h1><p className="lead">잊기 전에 다시 풀고, 기억을 오래 남겨 보세요.</p></div>
        {hasSchedules && (
          <div className="review-start-action">
            {hasActionableReviews(summary.data)
              ? <button className="primary-button" disabled={create.isPending} onClick={() => create.mutate()}>{create.isPending ? '문제 준비 중…' : '복습 문제 10개 시작'}</button>
              : <span className="helper-text">지금 시작할 복습 문제가 없습니다.</span>}
          </div>
        )}
      </div>

      {!hasSchedules ? (
        <div className="state-card review-empty-state">
          <strong>아직 복습할 내용이 없습니다.</strong>
          <span>문제를 풀고 오답이나 복습 필요 항목이 생기면 이곳에 일정이 쌓입니다.</span>
          <Link className="primary-button" to="/quiz" search={{ areas: '', concepts: '', levels: '', difficulties: '', questionTypes: '', state: 'ALL', count: 10, timeLimitSeconds: null }}>문제 풀러 가기</Link>
        </div>
      ) : (
        <>
          <div className="review-window-toolbar" aria-label="복습 시점과 건수">
            <div className="review-window-tabs" role="group" aria-label="복습 시점">
              {reviewWindowChoices.map((choice) => (
                <button
                  className={`review-window-tab${search.due === choice.value ? ' selected' : ''}`}
                  key={choice.value}
                  type="button"
                  aria-pressed={search.due === choice.value}
                  onClick={() => updateDue(choice.value)}
                >
                  <span>{choice.label}</span>
                  <strong>{reviewCounts[choice.value]}</strong>
                </button>
              ))}
            </div>
            <span className="review-mastered-count">정리 완료 <strong>{summary.data.mastered}</strong></span>
          </div>

          {reviews.data.items.length === 0
            ? <div className="state-card"><strong>선택한 시점에 복습할 항목이 없습니다.</strong><span>다른 복습 시점을 선택해 보세요.</span></div>
            : <div className="concept-list">{reviews.data.items.map((item) => {
                const timing = reviewTiming(item.dueAt, item.status)
                return <Link className="concept-list-item review-list-item" key={item.questionId} to="/wrong-notes/$questionId" params={{ questionId: String(item.questionId) }}>
                  <div className="concept-list-main">
                    <h3>{compactMarkdownPreview(item.promptMarkdown)}</h3>
                    <p>{item.concepts.map((concept) => `${concept.areaName} · ${concept.title} · 레벨 ${concept.level}`).join(', ')}</p>
                    <div className="review-row-meta">
                      <span>단계 {item.stage} · {item.status === 'SCHEDULED' ? '진행 중' : '정리 완료'}</span>
                      <span className={`chip state-badge review-timing-${timing.className}`}>{timing.label}</span>
                    </div>
                  </div>
                  <div className="wrong-note-metrics"><strong>{item.dueAt ? new Date(item.dueAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '정리 완료'}</strong><span>{timing.label}</span></div>
                </Link>
              })}</div>}

          <div className="pagination"><button className="secondary-button" disabled={!reviews.data.page.hasPrevious} onClick={() => void navigate({ search: (current) => ({ ...current, page: Math.max(0, search.page - 1) }) })}>이전</button><span>{search.page + 1} 페이지</span><button className="secondary-button" disabled={!reviews.data.page.hasNext} onClick={() => void navigate({ search: (current) => ({ ...current, page: search.page + 1 }) })}>다음</button></div>
        </>
      )}
    </section>
  )
}
