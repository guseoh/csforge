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
  { value: 'ALL', label: '전체', description: '모든 복습 일정' },
  { value: 'OVERDUE', label: '기한 지남', description: '가장 먼저 처리할 문제' },
  { value: 'DUE', label: '지금 복습', description: '현재 풀 수 있는 문제' },
  { value: 'NEXT_24H', label: '24시간 내', description: '곧 도래하는 일정' },
  { value: 'NEXT_7D', label: '7일 내', description: '이번 주 복습 일정' },
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
  const create = useMutation({ mutationFn: () => createReviewQuiz(10), onSuccess: (quiz) => void navigate({ to: '/quiz/$quizId', params: { quizId: String(quiz.quizId) } }), onError: () => showToast('error', '복습 Quiz를 만들지 못했습니다.') })

  if (summary.isPending || reviews.isPending) return <PageSkeleton rows={5} />
  if (summary.isError || reviews.isError) return <ErrorState message="복습 일정을 불러오지 못했습니다." onRetry={() => { void summary.refetch(); void reviews.refetch() }} />

  const updateDue = (due: string) => void navigate({ search: (current) => ({ ...current, due, page: 0 }) })
  return (
    <section className="page-section review-page">
      <div className="page-heading">
        <div><p className="eyebrow">Spaced review</p><h1>복습</h1><p className="lead">잊기 전에 다시 풀고, 기억을 오래 남겨 보세요.</p></div>
        <div className="review-start-action">
          {hasActionableReviews(summary.data)
            ? <button className="primary-button" disabled={create.isPending} onClick={() => create.mutate()}>{create.isPending ? 'Quiz 준비 중…' : '복습 문제 10개 시작'}</button>
            : <span className="helper-text">지금 시작할 복습 문제가 없습니다.</span>}
        </div>
      </div>

      <div className="review-summary-grid">
        <div className="review-summary-overdue"><span>기한 지남</span><strong>{summary.data.overdue}</strong></div>
        <div className="review-summary-due"><span>지금 복습</span><strong>{summary.data.dueNow}</strong></div>
        <div><span>24시간 내</span><strong>{summary.data.next24Hours}</strong></div>
        <div><span>7일 내</span><strong>{summary.data.next7Days}</strong></div>
        <div className="review-summary-mastered"><span>정리 완료</span><strong>{summary.data.mastered}</strong></div>
      </div>

      <div className="review-window-panel">
        <div className="filter-panel-header"><div><p className="eyebrow">Review window</p><strong>복습 시점</strong></div><span className="helper-text">필요한 일정만 골라 이어서 복습하세요.</span></div>
        <div className="review-window-choices" role="group" aria-label="복습 시점">
          {reviewWindowChoices.map((choice) => <button className={`review-window-choice${search.due === choice.value ? ' selected' : ''}`} key={choice.value} type="button" aria-pressed={search.due === choice.value} onClick={() => updateDue(choice.value)}><strong>{choice.label}</strong><span>{choice.description}</span></button>)}
        </div>
      </div>

      {reviews.data.items.length === 0
        ? <div className="state-card"><strong>예정된 복습이 없습니다.</strong><span>오답 노트나 Quiz의 review needed를 통해 일정을 만들 수 있습니다.</span></div>
        : <div className="concept-list">{reviews.data.items.map((item) => {
            const timing = reviewTiming(item.dueAt, item.status)
            return <Link className="concept-list-item review-list-item" key={item.questionId} to="/wrong-notes/$questionId" params={{ questionId: String(item.questionId) }}>
              <div className="concept-list-main"><h3>{compactMarkdownPreview(item.promptMarkdown)}</h3><p>{item.concepts.map((concept) => `${concept.areaName} · ${concept.title} · 레벨 ${concept.level}`).join(', ')}</p><div className="chip-row concept-list-status"><span className="chip state-badge state-scheduled">단계 {item.stage}</span><span className={`chip state-badge review-timing-${timing.className}`}>{timing.label}</span><span className="chip">{item.status === 'SCHEDULED' ? '진행 중' : '정리 완료'}</span></div></div>
              <div className="wrong-note-metrics"><strong>{item.dueAt ? new Date(item.dueAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '정리 완료'}</strong><span>{timing.label}</span></div>
            </Link>
          })}</div>}

      <div className="pagination"><button className="secondary-button" disabled={!reviews.data.page.hasPrevious} onClick={() => void navigate({ search: (current) => ({ ...current, page: Math.max(0, search.page - 1) }) })}>이전</button><span>{search.page + 1} 페이지</span><button className="secondary-button" disabled={!reviews.data.page.hasNext} onClick={() => void navigate({ search: (current) => ({ ...current, page: search.page + 1 }) })}>다음</button></div>
    </section>
  )
}
