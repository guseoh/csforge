import { describe, expect, it } from 'vitest'
import { classifyQuizNavigation } from './quiz-navigation'

describe('classifyQuizNavigation', () => {
  it('prioritizes current position while preserving the current visual state', () => {
    expect(classifyQuizNavigation({ isCurrent: true, selectedChoiceKey: 'A', answerText: null, reviewNeeded: true })).toBe('CURRENT')
  })

  it('distinguishes review-needed, answered, and unanswered questions', () => {
    expect(classifyQuizNavigation({ isCurrent: false, selectedChoiceKey: null, answerText: null, reviewNeeded: true })).toBe('REVIEW_NEEDED')
    expect(classifyQuizNavigation({ isCurrent: false, selectedChoiceKey: null, answerText: '답', reviewNeeded: false })).toBe('ANSWERED')
    expect(classifyQuizNavigation({ isCurrent: false, selectedChoiceKey: null, answerText: '  ', reviewNeeded: false })).toBe('UNANSWERED')
  })
})
