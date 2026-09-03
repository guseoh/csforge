import { describe, expect, it } from 'vitest'
import { addRecentSearch, primarySearchDestination, segmentSearchHighlight } from './search-ui'
import type { SearchSuggestion } from './search-api'

describe('Search UI helpers', () => {
  it('segments backend highlight markers without HTML interpretation', () => {
    expect(segmentSearchHighlight('Java [[H]]volatile[[/H]] visibility')).toEqual([
      { text: 'Java ', highlighted: false },
      { text: 'volatile', highlighted: true },
      { text: ' visibility', highlighted: false },
    ])
    expect(segmentSearchHighlight('<script>safe</script>')).toEqual([
      { text: '<script>safe</script>', highlighted: false },
    ])
  })

  it('deduplicates and bounds recent searches', () => {
    expect(addRecentSearch(['Kafka', 'JPA', 'TCP'], ' kafka ', 3)).toEqual(['kafka', 'JPA', 'TCP'])
    expect(addRecentSearch(['a', 'b', 'c'], 'd', 3)).toEqual(['d', 'a', 'b'])
  })

  it('resolves palette navigation by document type', () => {
    const concept: SearchSuggestion = { documentType: 'CONCEPT', sourceId: 1, title: 'JMM', conceptId: 7, questionId: null, referenceUrl: null }
    const wrongNote: SearchSuggestion = { documentType: 'WRONG_NOTE', sourceId: 2, title: 'Race', conceptId: 7, questionId: 11, referenceUrl: null }
    const reference: SearchSuggestion = { documentType: 'REFERENCE', sourceId: 3, title: 'JLS', conceptId: 7, questionId: null, referenceUrl: 'https://example.com' }
    expect(primarySearchDestination(concept)).toEqual({ kind: 'concept', conceptId: 7 })
    expect(primarySearchDestination(wrongNote)).toEqual({ kind: 'wrong-note', questionId: 11 })
    expect(primarySearchDestination(reference)).toEqual({ kind: 'external', url: 'https://example.com' })
  })
})
