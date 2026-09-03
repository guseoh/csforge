import { describe, expect, it } from 'vitest'
import { wrongAnswerAnalysisPollingInterval } from './wrong-answer-analysis'

describe('wrongAnswerAnalysisPollingInterval', () => {
  it('polls only while durable work is pending or processing', () => {
    expect(wrongAnswerAnalysisPollingInterval('PENDING')).toBe(2000)
    expect(wrongAnswerAnalysisPollingInterval('PROCESSING')).toBe(2000)
    expect(wrongAnswerAnalysisPollingInterval('NOT_REQUESTED')).toBe(false)
    expect(wrongAnswerAnalysisPollingInterval('COMPLETED')).toBe(false)
    expect(wrongAnswerAnalysisPollingInterval('FAILED')).toBe(false)
    expect(wrongAnswerAnalysisPollingInterval('PROVIDER_NOT_CONFIGURED')).toBe(false)
    expect(wrongAnswerAnalysisPollingInterval(undefined)).toBe(false)
  })
})
