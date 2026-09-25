import type { SearchResultItem, SearchSuggestion } from './search-api'

export interface HighlightSegment {
  text: string
  highlighted: boolean
}

export type SearchDestination =
  | { kind: 'concept'; conceptId: number }
  | { kind: 'wrong-note'; questionId: number }
  | { kind: 'external'; url: string }

const PRE_TAG = '[[H]]'
const POST_TAG = '[[/H]]'

export function segmentSearchHighlight(value: string): HighlightSegment[] {
  if (!value) return []
  const segments: HighlightSegment[] = []
  let cursor = 0
  while (cursor < value.length) {
    const start = value.indexOf(PRE_TAG, cursor)
    if (start < 0) {
      segments.push({ text: value.slice(cursor), highlighted: false })
      break
    }
    if (start > cursor) segments.push({ text: value.slice(cursor, start), highlighted: false })
    const contentStart = start + PRE_TAG.length
    const end = value.indexOf(POST_TAG, contentStart)
    if (end < 0) {
      segments.push({ text: value.slice(start), highlighted: false })
      break
    }
    segments.push({ text: value.slice(contentStart, end), highlighted: true })
    cursor = end + POST_TAG.length
  }
  return segments.filter((segment) => segment.text.length > 0)
}

export function addRecentSearch(recent: string[], query: string, maxSize = 6): string[] {
  const normalized = query.trim()
  if (!normalized) return recent.slice(0, maxSize)
  return [normalized, ...recent.filter((item) => item.toLocaleLowerCase() !== normalized.toLocaleLowerCase())]
    .slice(0, maxSize)
}

export function primarySearchDestination(item: SearchResultItem | SearchSuggestion): SearchDestination | null {
  switch (item.documentType) {
    case 'WRONG_NOTE':
      return item.questionId == null ? null : { kind: 'wrong-note', questionId: item.questionId }
    case 'REFERENCE':
      return item.referenceUrl ? { kind: 'external', url: item.referenceUrl } : null
    case 'QUESTION':
    case 'CONCEPT':
    case 'PERSONAL_NOTE':
      return item.conceptId == null ? null : { kind: 'concept', conceptId: item.conceptId }
  }
}

export function relatedConceptDestination(item: SearchResultItem | SearchSuggestion): SearchDestination | null {
  return item.conceptId == null ? null : { kind: 'concept', conceptId: item.conceptId }
}
