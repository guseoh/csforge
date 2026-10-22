import { z } from 'zod'

export const insightsSearchSchema = z.object({
  insightsOpen: z.enum(['0', '1']).optional().catch(undefined),
  insightsRange: z.enum(['7d', '30d']).optional().catch(undefined),
  insightsArea: z.string().optional().catch(undefined),
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
