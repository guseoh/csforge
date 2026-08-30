import { describe, expect, it } from 'vitest'
import { csvParam, csvValues, defaultQuizSearch, isDefaultQuizSearch, parseQuizSearch } from './quiz-search'

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
})
