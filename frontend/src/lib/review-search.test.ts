import { describe, expect, it } from 'vitest'
import { parseReviewSearch } from './review-search'

describe('review URL search state', () => {
  it('parses supported due-window URL values', () => {
    expect(parseReviewSearch({ page: '3', due: 'NEXT_7D' })).toEqual({ page: 3, due: 'NEXT_7D' })
  })

  it('falls back to safe defaults for invalid values', () => {
    expect(parseReviewSearch({ page: 'NaN', due: 'UNKNOWN' })).toEqual({ page: 0, due: 'ALL' })
  })
})
