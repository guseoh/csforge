import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import { useToast } from '../components/toast/ToastProvider'
import { createReviewQuiz, getReviews, getReviewSummary, type ReviewScheduleStatus } from '../lib/api'
import { compactMarkdownPreview } from '../lib/markdown'
import { classifyReviewTiming, hasActionableReviews, type ReviewTiming } from '../lib/review-timing'

const timingLabels: Record<ReviewTiming, string> = {
  OVERDUE: 'Overdue',
  DUE_NOW: 'Due now',
  NEXT_24H: 'Next 24h',
  NEXT_7D: 'Next 7d',
  SCHEDULED: 'Scheduled · Later',
  MASTERED: 'Mastered',
}

const timingClasses: Record<ReviewTiming, string> = {
  OVERDUE: 'overdue',
  DUE_NOW: 'due',
  NEXT_24H: 'next24',
  NEXT_7D: 'next7',
  SCHEDULED: 'scheduled',
  MASTERED: 'mastered',
}

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
  const create = useMutation({ mutationFn: () => createReviewQuiz(10), onSuccess: (quiz) => void navigate({ to: '/quiz/$quizId', params: { quizId: String(quiz.quizId) } }), onError: () => showToast('error', 'Review Quiz를 만들지 못했습니다.') })

  if (summary.isPending || reviews.isPending) return <PageSkeleton rows={5} />
  if (summary.isError || reviews.isError) return <ErrorState message="복습 일정을 불러오지 못했습니다." onRetry={() => { void summary.refetch(); void reviews.refetch() }} />

  const updateDue = (due: string) => void navigate({ search: (current) => ({ ...current, due, page: 0 }) })
  return (
    <section className="page-section">
      <div className="page-heading">
        <div><p className="eyebrow">Spaced review</p><h1>Review</h1><p className="lead">오래된 일정부터 짧은 Review Quiz로 회수하세요.</p></div>
        <div className="review-start-action">
          {hasActionableReviews(summary.data)
            ? <button className="primary-button" disabled={create.isPending} onClick={() => create.mutate()}>{create.isPending ? 'Quiz 준비 중…' : 'Due 문제 10개 시작'}</button>
            : <span className="helper-text">지금 시작할 복습 문제가 없습니다.</span>}
        </div>
      </div>

      <div className="review-summary-grid">
        <div className="review-summary-overdue"><span>Overdue</span><strong>{summary.data.overdue}</strong></div>
        <div className="review-summary-due"><span>Due now</span><strong>{summary.data.dueNow}</strong></div>
        <div><span>Next 24h</span><strong>{summary.data.next24Hours}</strong></div>
        <div><span>Next 7d</span><strong>{summary.data.next7Days}</strong></div>
        <div className="review-summary-mastered"><span>Mastered</span><strong>{summary.data.mastered}</strong></div>
      </div>

      <div className="filter-panel review-filters">
        <div className="filter-panel-header"><div><p className="eyebrow">Review window</p><strong>복습 시점</strong></div><span className="helper-text">DUE는 Overdue를 포함한 현재 실행 가능한 일정입니다.</span></div>
        <label>Window
          <select value={search.due} onChange={(event) => updateDue(event.target.value)}>
            <option value="ALL">All</option>
            <option value="OVERDUE">Overdue</option>
            <option value="DUE">Due · actionable</option>
            <option value="NEXT_24H">Next 24 hours</option>
            <option value="NEXT_7D">Next 7 days</option>
          </select>
        </label>
      </div>

      {reviews.data.items.length === 0
        ? <div className="state-card"><strong>예정된 복습이 없습니다.</strong><span>오답 노트나 Quiz의 review needed를 통해 일정을 만들 수 있습니다.</span></div>
        : <div className="concept-list">{reviews.data.items.map((item) => {
            const timing = reviewTiming(item.dueAt, item.status)
            return <Link className="concept-list-item review-list-item" key={item.questionId} to="/wrong-notes/$questionId" params={{ questionId: String(item.questionId) }}>
              <div className="concept-list-main"><h3>{compactMarkdownPreview(item.promptMarkdown)}</h3><p>{item.concepts.map((concept) => `${concept.areaName} · ${concept.title} · L${concept.level}`).join(', ')}</p><div className="chip-row concept-list-status"><span className="chip state-badge state-scheduled">Stage {item.stage}</span><span className={`chip state-badge review-timing-${timing.className}`}>{timing.label}</span><span className="chip">{item.status}</span></div></div>
              <div className="wrong-note-metrics"><strong>{item.dueAt ? new Date(item.dueAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : 'Mastered'}</strong><span>{timing.label}</span></div>
            </Link>
          })}</div>}

      <div className="pagination"><button className="secondary-button" disabled={!reviews.data.page.hasPrevious} onClick={() => void navigate({ search: (current) => ({ ...current, page: Math.max(0, search.page - 1) }) })}>이전</button><span>Page {search.page + 1}</span><button className="secondary-button" disabled={!reviews.data.page.hasNext} onClick={() => void navigate({ search: (current) => ({ ...current, page: search.page + 1 }) })}>다음</button></div>
    </section>
  )
}
