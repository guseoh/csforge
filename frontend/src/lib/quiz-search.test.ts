import { describe, expect, it } from 'vitest'
import { formatRemaining, parseQuizSearch } from './quiz-search'

describe('quiz URL state', () => {
  it('parses setup filters and timer settings', () => {
    expect(parseQuizSearch({
      areas: 'java,spring',
      levels: '1,2',
      state: 'UNSEEN',
      count: '20',
      timeLimitSeconds: '900',
    })).toMatchObject({ areas: 'java,spring', levels: '1,2', state: 'UNSEEN', count: 20, timeLimitSeconds: 900 })
  })

  it('falls back safely and formats the recovered timer', () => {
    expect(parseQuizSearch({ state: 'WRONG', count: '999' })).toEqual({
      areas: '', concepts: '', levels: '', difficulties: '', questionTypes: '', state: 'ALL', count: 10, timeLimitSeconds: null,
    })
    expect(formatRemaining('2026-08-30T00:01:05Z', Date.parse('2026-08-30T00:00:00Z'))).toBe('01:05')
    expect(formatRemaining('2026-08-30T00:00:00Z', Date.parse('2026-08-30T00:01:00Z'))).toBe('00:00')
  })
})
