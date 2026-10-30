import type { ConceptListItem } from './api'

export function selectRecentConcepts(items: readonly ConceptListItem[]): ConceptListItem[] {
  return items.filter((item) => item.lastViewedAt !== null).slice(0, 6)
}
