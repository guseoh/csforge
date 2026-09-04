import { describe, expect, it } from 'vitest'
import { parseWrongNoteSearch } from './wrong-note-search'

describe('wrong-note URL search state', () => {
  it('parses supported filters from URL values', () => {
    expect(parseWrongNoteSearch({ page: '2', area: 'java', topic: '4', level: '2', difficulty: 'HARD', status: 'ACTIVE', review: 'DUE', analysis: 'COMPLETED', sort: 'WRONG_COUNT' })).toEqual({
      page: 2,
      area: 'java',
      topic: '4',
      level: '2',
      difficulty: 'HARD',
      status: 'ACTIVE',
      review: 'DUE',
      analysis: 'COMPLETED',
      sort: 'WRONG_COUNT',
    })
  })

  it('falls back to safe defaults for invalid enum and page values', () => {
    expect(parseWrongNoteSearch({ page: '-1', status: 'UNKNOWN', review: 'UNKNOWN', sort: 'UNKNOWN' })).toEqual({
      page: 0,
      area: '',
      topic: '',
      level: '',
      difficulty: '',
      status: '',
      review: 'ALL',
      analysis: 'ALL',
      sort: 'RECENT',
    })
  })
})
