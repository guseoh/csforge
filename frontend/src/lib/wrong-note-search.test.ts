import { describe, expect, it } from 'vitest'
import {
  countAdvancedWrongNoteFilters,
  defaultWrongNoteSearch,
  parseWrongNoteSearch,
  withWrongNoteArea,
  withWrongNoteFilter,
  withWrongNotePage,
} from './wrong-note-search'

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

  it('resets page when a filter changes while preserving the other filters', () => {
    const current = { ...defaultWrongNoteSearch, page: 3, area: 'java', topic: '4', review: 'DUE' }
    expect(withWrongNoteFilter(current, 'analysis', 'FAILED')).toEqual({
      ...current,
      page: 0,
      analysis: 'FAILED',
    })
  })

  it('clears topic and resets page when area changes', () => {
    const current = { ...defaultWrongNoteSearch, page: 2, area: 'java', topic: '4', difficulty: 'HARD' }
    expect(withWrongNoteArea(current, 'spring')).toEqual({
      ...current,
      page: 0,
      area: 'spring',
      topic: '',
    })
  })

  it('changes only page during pagination and preserves every filter', () => {
    const current = {
      page: 1,
      area: 'java',
      topic: '4',
      level: '2',
      difficulty: 'HARD',
      status: 'ACTIVE',
      review: 'DUE',
      analysis: 'FAILED',
      sort: 'WRONG_COUNT',
    }
    expect(withWrongNotePage(current, 2)).toEqual({ ...current, page: 2 })
    expect(withWrongNotePage(current, -1)).toEqual({ ...current, page: 0 })
  })

  it('counts selected advanced filters without changing URL state', () => {
    expect(countAdvancedWrongNoteFilters({ ...defaultWrongNoteSearch, area: 'java', topic: '4', analysis: 'FAILED' })).toBe(3)
    expect(countAdvancedWrongNoteFilters(defaultWrongNoteSearch)).toBe(0)
  })
})
