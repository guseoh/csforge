import type { LearningAreaOutlineConcept } from './learning-api'
import { chooseNextConcept, chooseReviewConcept } from './learning-next'

/** The server's curriculum order, not client storage, determines resumption. */
export function topicFocusState(items: readonly LearningAreaOutlineConcept[], topicId: number) {
  const concepts = items.filter((item) => item.topicId === topicId)
  const completed = concepts.filter((item) => item.learningStatus === 'COMPLETED').length
  return {
    concepts,
    completed,
    next: chooseNextConcept(concepts),
    review: chooseReviewConcept(concepts),
    allCompleted: concepts.length > 0 && completed === concepts.length,
  }
}
