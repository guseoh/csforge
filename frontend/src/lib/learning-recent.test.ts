import { describe, expect, it } from 'vitest'
import { selectRecentConcepts } from './learning-recent'

function concept(id: number, lastViewedAt: string | null) {
  return { id, areaSlug: 'java', areaName: 'Java', topicId: 1, topicSlug: 'basics', topicTitle: 'Basics', title: `Concept ${id}`, summary: null, level: 1, contentStatus: 'PUBLISHED' as const, learningStatus: 'UNSEEN' as const, bookmarked: false, lastViewedAt }
}

describe('recent learning concepts', () => {
  it('keeps the API VIEWED ordering and excludes never-viewed concepts', () => {
    expect(selectRecentConcepts([concept(3, '2026-09-03T00:00:00Z'), concept(2, null), concept(1, '2026-09-01T00:00:00Z')]).map((item) => item.id)).toEqual([3, 1])
  })

  it('caps the shortcut list at six concepts', () => {
    const items = Array.from({ length: 8 }, (_, index) => concept(index + 1, `2026-09-${String(index + 1).padStart(2, '0')}T00:00:00Z`))
    expect(selectRecentConcepts(items)).toHaveLength(6)
  })
})
