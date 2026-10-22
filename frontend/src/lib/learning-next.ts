import type { LearningStatus } from './learning-api'

interface LearningCandidate {
  learningStatus: LearningStatus
}

/** Curriculum ordering is supplied by the API; prefer started work, then the first unseen concept. */
export function chooseNextConcept<T extends LearningCandidate>(concepts: readonly T[]): T | undefined {
  return concepts.find((concept) => concept.learningStatus === 'LEARNING')
    ?? concepts.find((concept) => concept.learningStatus === 'UNSEEN')
}

export function chooseReviewConcept<T extends LearningCandidate>(concepts: readonly T[]): T | undefined {
  return concepts.find((concept) => concept.learningStatus === 'REVIEW_NEEDED')
}
