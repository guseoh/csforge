import { describe, expect, it } from 'vitest'
import { canStartQuiz, effectiveQuizCount, quizAvailabilityState } from './quiz-availability'

describe('quiz availability states', () => {
  it('does not treat loading or errors as zero availability', () => {
    expect(quizAvailabilityState(undefined, 10, true, false)).toBe('LOADING')
    expect(quizAvailabilityState(undefined, 10, false, true)).toBe('ERROR')
    expect(quizAvailabilityState(0, 10, false, true)).toBe('ERROR')
  })

  it('enables start only after a successful sufficient response', () => {
    expect(quizAvailabilityState(10, 10, false, false)).toBe('READY')
    expect(canStartQuiz('READY', false)).toBe(true)
    expect(quizAvailabilityState(9, 10, false, false)).toBe('INSUFFICIENT')
    expect(canStartQuiz('INSUFFICIENT', false)).toBe(false)
  })

  it('reduces only a concept-scoped request to a positive smaller available count', () => {
    expect(effectiveQuizCount(10, 3, true)).toBe(3)
    expect(effectiveQuizCount(10, 0, true)).toBe(10)
    expect(effectiveQuizCount(3, 3, true)).toBe(3)
    expect(effectiveQuizCount(3, 10, true)).toBe(3)
    expect(effectiveQuizCount(10, 3, false)).toBe(10)
  })

  it('uses the effective count for concept availability and preserves other shortage behavior', () => {
    expect(quizAvailabilityState(3, effectiveQuizCount(10, 3, true), false, false)).toBe('READY')
    expect(quizAvailabilityState(0, effectiveQuizCount(10, 0, true), false, false)).toBe('INSUFFICIENT')
    expect(quizAvailabilityState(3, effectiveQuizCount(10, 3, false), false, false)).toBe('INSUFFICIENT')
  })
})
