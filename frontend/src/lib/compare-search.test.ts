import { describe, expect, it } from 'vitest'
import { parseCompareSearch } from './compare-search'

describe('comparison deep links', () => {
  it('accepts up to two positive identifiers', () => {
    expect(parseCompareSearch({ left: '12', right: 13 })).toEqual({ left: 12, right: 13 })
    expect(parseCompareSearch({ left: '12' })).toEqual({ left: 12, right: undefined })
  })
  it('does not fetch from malformed or unsafe IDs', () => {
    expect(parseCompareSearch({ left: '', right: '1.5' })).toEqual({ left: undefined, right: undefined })
    expect(parseCompareSearch({ left: '-1', right: '1e100' })).toEqual({ left: undefined, right: undefined })
    expect(parseCompareSearch({ left: [], right: {} })).toEqual({ left: undefined, right: undefined })
  })
})
