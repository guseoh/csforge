import { request } from './http'

export type BookmarkCategory = { id: number; name: string; displayOrder: number }
export type BookmarkAssignment = { categoryId: number | null }

export function getBookmarkCategories(): Promise<BookmarkCategory[]> {
  return request<BookmarkCategory[]>('/api/bookmark-categories')
}
export function renameBookmarkCategory(id: number, name: string): Promise<BookmarkCategory> {
  return request<BookmarkCategory>(`/api/bookmark-categories/${id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }),
  })
}
export function getBookmarkAssignment(conceptId: number): Promise<BookmarkAssignment> {
  return request<BookmarkAssignment>(`/api/concepts/${conceptId}/bookmark-category`)
}
export function setBookmarkAssignment(conceptId: number, categoryId: number | null): Promise<BookmarkAssignment> {
  return request<BookmarkAssignment>(`/api/concepts/${conceptId}/bookmark-category`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoryId }),
  })
}
