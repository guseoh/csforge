import { request } from './http'
import type { ConceptDetail, ConceptListItem, ConceptPage } from './learning-api'

export interface PublicArea {
  id: number
  slug: string
  name: string
  description: string | null
  topicCount: number
  publishedConceptCount: number
}

export interface PublicTopic {
  id: number
  slug: string
  title: string
  description: string | null
  publishedConceptCount: number
  level1Count: number
  level2Count: number
  level3Count: number
}

export type PublicAreaDetail = Pick<PublicArea, 'id' | 'slug' | 'name' | 'description'> & { topics: PublicTopic[] }
export type PublicConcept = Omit<ConceptDetail, 'progress' | 'personalNote' | 'contentStatus'>
export type PublicConceptItem = Omit<ConceptListItem, 'learningStatus' | 'bookmarked' | 'lastViewedAt' | 'contentStatus'>
export type PublicConceptPage = { items: PublicConceptItem[]; page: ConceptPage['page'] }

export const getPublicAreas = () => request<PublicArea[]>('/api/public/learning-areas')
export const getPublicArea = (slug: string) => request<PublicAreaDetail>(`/api/public/learning-areas/${encodeURIComponent(slug)}`)
export const getPublicConcept = (id: number) => request<PublicConcept>(`/api/public/concepts/${id}`)

export function getPublicConcepts(filters: { area?: string; topic?: number; level?: number; q?: string; page: number; size: number; sort: string }) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  return request<PublicConceptPage>(`/api/public/concepts?${params}`)
}
