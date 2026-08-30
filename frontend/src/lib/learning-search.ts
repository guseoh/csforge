import { z } from 'zod'

export const learningSearchSchema = z.object({
  topic: z.coerce.number().int().positive().optional(),
  level: z.enum(['all', '1', '2', '3']).catch('all'),
  status: z.enum(['ALL', 'UNSEEN', 'LEARNING', 'COMPLETED', 'REVIEW_NEEDED']).catch('ALL'),
  bookmarked: z.enum(['true', 'false']).catch('false'),
  q: z.string().catch(''),
  page: z.coerce.number().int().min(0).catch(0),
  sort: z.enum(['curriculum', 'title', 'updated', 'viewed']).catch('curriculum'),
})

export type LearningSearch = z.infer<typeof learningSearchSchema>

export const defaultLearningSearch: LearningSearch = {
  level: 'all',
  status: 'ALL',
  bookmarked: 'false',
  q: '',
  page: 0,
  sort: 'curriculum',
}

export function parseLearningSearch(search: Record<string, unknown>): LearningSearch {
  return learningSearchSchema.parse(search)
}
