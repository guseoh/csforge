import { describe, it, expect } from 'vitest'
import { topicFocusState } from './topic-focus'
import type { LearningAreaOutlineConcept } from './learning-api'
const item = (id: number, status: LearningAreaOutlineConcept['learningStatus'], topicId = 4): LearningAreaOutlineConcept => ({
  id, topicId, title: String(id), level: 1, summary: null, learningStatus: status,
})
describe('topic focus progress', () => {
  it('handles an empty and a completed Topic safely', () => {
    expect(topicFocusState([], 4)).toMatchObject({ completed: 0, next: undefined, allCompleted: false })
    expect(topicFocusState([item(1, 'COMPLETED'), item(2, 'COMPLETED')], 4))
      .toMatchObject({ completed: 2, next: undefined, allCompleted: true })
  })
  it('prefers in-progress work after a pause and keeps review distinct', () => {
    const state = topicFocusState([item(1, 'UNSEEN'), item(2, 'LEARNING'), item(3, 'REVIEW_NEEDED'), item(4, 'COMPLETED'), item(5, 'UNSEEN', 5)], 4)
    expect(state.concepts.map(c => c.id)).toEqual([1, 2, 3, 4])
    expect(state.next?.id).toBe(2)
    expect(state.review?.id).toBe(3)
    expect(state.completed).toBe(1)
  })
  it('never counts review-needed as completed', () => {
    const state = topicFocusState([item(1, 'REVIEW_NEEDED')], 4)
    expect(state.allCompleted).toBe(false)
    expect(state.next).toBeUndefined()
    expect(state.review?.id).toBe(1)
  })
})
