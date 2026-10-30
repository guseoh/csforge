import { describe, expect, it } from 'vitest'
import {
  csvParam,
  csvValues,
  defaultQuizSearch,
  hasExplicitQuizSearch,
  isDefaultQuizSearch,
  parseQuizSearch,
  quizSearchForPreset,
} from './quiz-search'

describe('quiz URL search state', () => {
  it('parses quiz filters from URL values', () => {
    expect(parseQuizSearch({
      areas: 'java,spring',
      concepts: '1,2',
      levels: '1,2',
      difficulties: 'EASY,HARD',
      questionTypes: 'MULTIPLE_CHOICE,SHORT_ANSWER',
      state: 'UNSEEN',
      count: '20',
      timeLimitSeconds: '600',
    })).toEqual({
      areas: 'java,spring',
      concepts: '1,2',
      levels: '1,2',
      difficulties: 'EASY,HARD',
      questionTypes: 'MULTIPLE_CHOICE,SHORT_ANSWER',
      state: 'UNSEEN',
      count: 20,
      timeLimitSeconds: 600,
    })
  })

  it('falls back to safe defaults for invalid values', () => {
    expect(parseQuizSearch({ state: 'UNKNOWN', count: '999', timeLimitSeconds: '10' })).toEqual(defaultQuizSearch)
  })

  it('keeps URL serialization stable for list settings', () => {
    expect(csvValues(csvParam(['java', 'spring']))).toEqual(['java', 'spring'])
    expect(csvValues(csvParam([1, 2, 3]))).toEqual(['1', '2', '3'])
    expect(isDefaultQuizSearch(defaultQuizSearch)).toBe(true)
    expect(isDefaultQuizSearch({ ...defaultQuizSearch, levels: '2' })).toBe(false)
  })

  it('creates the three quick presets from clean default settings', () => {
    expect(quizSearchForPreset('NEW')).toEqual({ ...defaultQuizSearch, state: 'UNSEEN' })
    expect(quizSearchForPreset('WRONG')).toEqual({ ...defaultQuizSearch, state: 'WRONG' })
    expect(quizSearchForPreset('ALL')).toEqual(defaultQuizSearch)
    expect(quizSearchForPreset('DEFAULT')).toEqual(defaultQuizSearch)
  })

  it('distinguishes an explicit default URL from an empty URL', () => {
    expect(hasExplicitQuizSearch('')).toBe(false)
    expect(hasExplicitQuizSearch('?state=ALL&count=10')).toBe(true)
    expect(hasExplicitQuizSearch('?foo=bar')).toBe(false)
  })

  it('allows remembered settings only for an empty default entry', () => {
    const shouldRestoreRemembered = (searchString: string, search: typeof defaultQuizSearch) =>
      !hasExplicitQuizSearch(searchString) && isDefaultQuizSearch(search)

    expect(shouldRestoreRemembered('', defaultQuizSearch)).toBe(true)
    expect(shouldRestoreRemembered('?state=ALL&count=10', defaultQuizSearch)).toBe(false)
    expect(shouldRestoreRemembered('', { ...defaultQuizSearch, levels: '2' })).toBe(false)
  })
})
