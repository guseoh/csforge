import { describe, expect, it } from 'vitest'
import { parseSearchSearch, questionSuggestionSearch, toggleCsvValue } from './search-search'

describe('Search URL state', () => {
  it('applies stable defaults and bounds invalid values', () => {
    expect(parseSearchSearch({})).toEqual({
      q: '', types: '', areas: '', topics: '', levels: '', sort: 'RELEVANCE', page: 0,
    })
    expect(parseSearchSearch({ q: 'volatile', sort: 'UNKNOWN', page: '-2' })).toMatchObject({
      q: 'volatile', sort: 'RELEVANCE', page: 0,
    })
  })

  it('toggles csv filters without duplicating values', () => {
    expect(toggleCsvValue('', 'CONCEPT')).toBe('CONCEPT')
    expect(toggleCsvValue('CONCEPT,QUESTION', 'CONCEPT')).toBe('QUESTION')
    expect(toggleCsvValue('CONCEPT', 'QUESTION')).toBe('CONCEPT,QUESTION')
  })

  it('keeps QUESTION palette suggestions in full Search instead of mutating quiz state', () => {
    expect(questionSuggestionSearch('JMM question')).toEqual({
      q: 'JMM question', types: 'QUESTION', areas: '', topics: '', levels: '', sort: 'RELEVANCE', page: 0,
    })
  })
})
