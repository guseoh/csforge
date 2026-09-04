import { describe, expect, it } from 'vitest'
import { classifyReviewTiming, hasActionableReviews } from './review-timing'

describe('review timing semantics', () => {
  const now = Date.parse('2026-09-04T03:00:00Z')
  const startOfToday = Date.parse('2026-09-03T15:00:00Z')

  it('keeps calendar-day and future windows non-overlapping', () => {
    expect(classifyReviewTiming('2026-09-03T14:59:59Z', 'SCHEDULED', now, startOfToday)).toBe('OVERDUE')
    expect(classifyReviewTiming('2026-09-04T02:00:00Z', 'SCHEDULED', now, startOfToday)).toBe('DUE_NOW')
    expect(classifyReviewTiming('2026-09-04T20:59:59Z', 'SCHEDULED', now, startOfToday)).toBe('NEXT_24H')
    expect(classifyReviewTiming('2026-09-06T03:00:01Z', 'SCHEDULED', now, startOfToday)).toBe('NEXT_7D')
    expect(classifyReviewTiming('2026-09-12T03:00:01Z', 'SCHEDULED', now, startOfToday)).toBe('SCHEDULED')
    expect(classifyReviewTiming(null, 'MASTERED', now, startOfToday)).toBe('MASTERED')
  })

  it('keeps the Review start available when only overdue items exist', () => {
    expect(hasActionableReviews({ overdue: 2, dueNow: 0 })).toBe(true)
    expect(hasActionableReviews({ overdue: 0, dueNow: 0 })).toBe(false)
  })
})
