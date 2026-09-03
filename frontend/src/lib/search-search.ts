import { z } from 'zod'

export const searchSearchSchema = z.object({
  q: z.string().max(200).catch(''),
  types: z.string().catch(''),
  areas: z.string().catch(''),
  topics: z.string().catch(''),
  levels: z.string().catch(''),
  sort: z.enum(['RELEVANCE', 'RECENT', 'TITLE']).catch('RELEVANCE'),
  page: z.coerce.number().int().min(0).catch(0),
})

export type SearchSearch = z.infer<typeof searchSearchSchema>

export const defaultSearchSearch: SearchSearch = {
  q: '',
  types: '',
  areas: '',
  topics: '',
  levels: '',
  sort: 'RELEVANCE',
  page: 0,
}

export function parseSearchSearch(search: Record<string, unknown>): SearchSearch {
  return searchSearchSchema.parse(search)
}

export function csvSearchValues(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

export function toggleCsvValue(csv: string, value: string): string {
  const values = csvSearchValues(csv)
  return values.includes(value)
    ? values.filter((item) => item !== value).join(',')
    : [...values, value].join(',')
}
