import { describe, expect, it } from 'vitest'
import { parseWrongNoteSearch } from './wrong-note-search'

describe('wrong-note URL search state', () => {
  it('parses supported filters from URL values', () => {
    expect(parseWrongNoteSearch({ page: '2', area: 'java', status: 'ACTIVE', review: 'DUE', sort: 'WRONG_COUNT' })).toEqual({
      page: 2,
      area: 'java',
      status: 'ACTIVE',
      review: 'DUE',
      sort: 'WRONG_COUNT',
    })
  })

  it('falls back to safe defaults for invalid enum and page values', () => {
    expect(parseWrongNoteSearch({ page: '-1', status: 'UNKNOWN', review: 'UNKNOWN', sort: 'UNKNOWN' })).toEqual({
      page: 0,
      area: '',
      status: '',
      review: 'ALL',
      sort: 'RECENT',
    })
  })
})
