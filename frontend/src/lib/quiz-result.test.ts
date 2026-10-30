import { describe, expect, it } from 'vitest'
import { hasSubmittedAnswer, hasUnresolvedSelfCheck } from './quiz-result'

describe('Quiz result self-check state', () => {
  it('requires a page-level recovery action when pending self-checks remain', () => {
    expect(hasUnresolvedSelfCheck(1)).toBe(true)
  })

  it('does not require recovery when every self-check is complete', () => {
    expect(hasUnresolvedSelfCheck(0)).toBe(false)
  })
})

describe('Quiz result submitted answer detection', () => {
  it('uses a selected choice for multiple-choice answers', () => {
    expect(hasSubmittedAnswer({ questionType: 'MULTIPLE_CHOICE', selectedChoiceKey: 'A', answerText: null })).toBe(true)
    expect(hasSubmittedAnswer({ questionType: 'MULTIPLE_CHOICE', selectedChoiceKey: null, answerText: null })).toBe(false)
  })

  it('requires nonblank text for text-answer questions', () => {
    expect(hasSubmittedAnswer({ questionType: 'SHORT_ANSWER', selectedChoiceKey: null, answerText: '답안' })).toBe(true)
    expect(hasSubmittedAnswer({ questionType: 'SHORT_ANSWER', selectedChoiceKey: null, answerText: ' \n ' })).toBe(false)
    expect(hasSubmittedAnswer({ questionType: 'DESCRIPTIVE', selectedChoiceKey: null, answerText: null })).toBe(false)
  })
})
