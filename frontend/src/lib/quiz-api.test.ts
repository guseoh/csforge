import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ request: vi.fn() }))

vi.mock('./http', () => ({ request: mocks.request }))

import {
  createQuiz,
  practiceQuestion,
  practiceRelatedConceptQuiz,
  retryWrongQuiz,
  retryWrongQuizQuestion,
  submitQuiz,
} from './quiz-api'
import { createReviewQuiz } from './review-api'
import { retryWrongNote } from './wrong-note-api'

const requestId = '11111111-1111-4111-8111-111111111111'
const idempotencyHeaders = { 'Idempotency-Key': requestId }

describe('Quiz creation API requests', () => {
  beforeEach(() => {
    mocks.request.mockReset()
    mocks.request.mockResolvedValue({})
  })

  it('sends the same request key through every Quiz and Review creation route', async () => {
    const payload = {
      areas: [], concepts: [1], levels: [], difficulties: [], questionTypes: [], state: 'ALL' as const,
      count: 10, timeLimitSeconds: null,
    }
    await createQuiz(payload, requestId)
    await createReviewQuiz(10, requestId)
    await retryWrongQuiz(41, requestId)
    await retryWrongQuizQuestion(41, 11, requestId)
    await practiceRelatedConceptQuiz(11, 1, requestId)
    await practiceQuestion(11, requestId)
    await retryWrongNote(11, requestId)

    for (const [, init] of mocks.request.mock.calls) {
      expect(init.headers).toMatchObject(idempotencyHeaders)
    }
    expect(mocks.request.mock.calls).toHaveLength(7)
  })

  it('leaves submit without a creation idempotency key', async () => {
    await submitQuiz(41)

    expect(mocks.request).toHaveBeenCalledWith('/api/quizzes/41/submit', { method: 'POST' })
  })
})
