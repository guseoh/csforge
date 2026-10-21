import { z } from 'zod'

export const bookmarksSearchSchema = z.object({
  category: z.coerce.number().int().positive().optional().catch(undefined),
  page: z.coerce.number().int().min(0).catch(0),
})

export type BookmarksSearch = z.infer<typeof bookmarksSearchSchema>
export const defaultBookmarksSearch: BookmarksSearch = { page: 0 }
export function parseBookmarksSearch(search: Record<string, unknown>): BookmarksSearch {
  return bookmarksSearchSchema.parse(search)
}
