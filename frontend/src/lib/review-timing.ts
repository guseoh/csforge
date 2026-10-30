import type { ReviewScheduleStatus, ReviewSummary } from './api'

export type ReviewTiming = 'OVERDUE' | 'DUE_NOW' | 'NEXT_24H' | 'NEXT_7D' | 'SCHEDULED' | 'MASTERED'

export function classifyReviewTiming(
  dueAt: string | null,
  status: ReviewScheduleStatus = 'SCHEDULED',
  now = Date.now(),
  startOfToday = localStartOfDay(now),
): ReviewTiming {
  if (status === 'MASTERED' || dueAt === null) return 'MASTERED'
  const due = new Date(dueAt).getTime()
  if (due < startOfToday) return 'OVERDUE'
  if (due <= now) return 'DUE_NOW'
  if (due <= now + 24 * 60 * 60 * 1000) return 'NEXT_24H'
  if (due <= now + 7 * 24 * 60 * 60 * 1000) return 'NEXT_7D'
  return 'SCHEDULED'
}

export function hasActionableReviews(summary: Pick<ReviewSummary, 'overdue' | 'dueNow'>) {
  return summary.overdue + summary.dueNow > 0
}

function localStartOfDay(now: number) {
  const date = new Date(now)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}
