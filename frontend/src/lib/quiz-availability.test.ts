import { describe, expect, it } from 'vitest'
import { canStartQuiz, quizAvailabilityState } from './quiz-availability'

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
})
