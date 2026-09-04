import { describe, expect, it } from 'vitest'
import { hasUnresolvedSelfCheck } from './quiz-result'

describe('Quiz result self-check state', () => {
  it('requires a page-level recovery action when pending self-checks remain', () => {
    expect(hasUnresolvedSelfCheck(1)).toBe(true)
  })

  it('does not require recovery when every self-check is complete', () => {
    expect(hasUnresolvedSelfCheck(0)).toBe(false)
  })
})
