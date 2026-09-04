import { z } from 'zod'

export const quizSearchSchema = z.object({
  areas: z.string().catch(''),
  concepts: z.string().catch(''),
  levels: z.string().catch(''),
  difficulties: z.string().catch(''),
  questionTypes: z.string().catch(''),
  state: z.enum(['ALL', 'UNSEEN', 'WRONG', 'REVIEW_NEEDED']).catch('ALL'),
  count: z.coerce.number().int().min(1).max(50).catch(10),
  timeLimitSeconds: z.coerce.number().int().min(60).max(7200).nullable().catch(null),
})

export type QuizSearch = z.infer<typeof quizSearchSchema>

export type QuizQuickPreset = 'NEW' | 'WRONG' | 'ALL' | 'DEFAULT'

export const defaultQuizSearch: QuizSearch = {
  areas: '',
  concepts: '',
  levels: '',
  difficulties: '',
  questionTypes: '',
  state: 'ALL',
  count: 10,
  timeLimitSeconds: null,
}

export function quizSearchForPreset(preset: QuizQuickPreset): QuizSearch {
  if (preset === 'DEFAULT') return { ...defaultQuizSearch }
  return { ...defaultQuizSearch, state: preset === 'NEW' ? 'UNSEEN' : preset }
}

const quizSearchKeys = ['areas', 'concepts', 'levels', 'difficulties', 'questionTypes', 'state', 'count', 'timeLimitSeconds']

export function hasExplicitQuizSearch(searchString: string): boolean {
  const params = new URLSearchParams(searchString)
  return quizSearchKeys.some((key) => params.has(key))
}

export function parseQuizSearch(search: Record<string, unknown>): QuizSearch {
  return quizSearchSchema.parse(search)
}

export function csvValues(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

export function csvParam(values: readonly (string | number)[]): string {
  return values.join(',')
}

export function isDefaultQuizSearch(search: QuizSearch): boolean {
  return search.areas === defaultQuizSearch.areas
    && search.concepts === defaultQuizSearch.concepts
    && search.levels === defaultQuizSearch.levels
    && search.difficulties === defaultQuizSearch.difficulties
    && search.questionTypes === defaultQuizSearch.questionTypes
    && search.state === defaultQuizSearch.state
    && search.count === defaultQuizSearch.count
    && search.timeLimitSeconds === defaultQuizSearch.timeLimitSeconds
}

export function formatRemaining(expiresAt: string | null, now = Date.now()): string | null {
  if (!expiresAt) return null
  const remainingSeconds = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000))
  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0')
  const seconds = (remainingSeconds % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}
