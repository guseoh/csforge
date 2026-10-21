import { z } from 'zod'

export const insightsSearchSchema = z.object({
  insightsOpen: z.enum(['0', '1']).catch('0'),
  insightsRange: z.enum(['7d', '30d']).catch('7d'),
  insightsArea: z.string().catch(''),
})

export type InsightsSearch = z.infer<typeof insightsSearchSchema>
export const defaultInsightsSearch: InsightsSearch = {
  insightsOpen: '0',
  insightsRange: '7d',
  insightsArea: '',
}

export function parseInsightsSearch(input: Record<string, unknown>): InsightsSearch {
  return insightsSearchSchema.parse(input)
}
