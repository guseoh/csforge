import { describe, expect, it } from 'vitest'
import { chooseNextConcept, chooseReviewConcept } from './learning-next'

describe('Learning next steps', () => {
  const concepts = [
    { id: 1, learningStatus: 'COMPLETED' as const },
    { id: 2, learningStatus: 'REVIEW_NEEDED' as const },
    { id: 3, learningStatus: 'UNSEEN' as const },
    { id: 4, learningStatus: 'LEARNING' as const },
    { id: 5, learningStatus: 'UNSEEN' as const },
  ]

  it('resumes a started concept before choosing an unseen one', () => {
    expect(chooseNextConcept(concepts)?.id).toBe(4)
  })
  it('uses curriculum order among unseen concepts', () => {
    expect(chooseNextConcept(concepts.filter((item) => item.id !== 4))?.id).toBe(3)
  })
  it('does not confuse review-needed with new learning', () => {
    expect(chooseNextConcept(concepts.slice(0, 2))).toBeUndefined()
    expect(chooseReviewConcept(concepts)?.id).toBe(2)
  })
  it('handles empty, completed, and all-reviewed outlines', () => {
    expect(chooseNextConcept([])).toBeUndefined()
    expect(chooseReviewConcept([])).toBeUndefined()
    expect(chooseNextConcept([{ learningStatus: 'COMPLETED' }, { learningStatus: 'REVIEW_NEEDED' }])).toBeUndefined()
  })
})
