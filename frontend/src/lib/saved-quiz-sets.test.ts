import { describe, expect, it } from 'vitest'
import { defaultQuizSearch } from './quiz-search'
import { decodeSavedQuizSets, deleteQuizSet, encodeSavedQuizSets, renameQuizSet, saveQuizSet } from './saved-quiz-sets'

describe('saved Quiz sets (client preferences only)', () => {
  it('can save, rename, delete, and round-trip explicit URL conditions', () => {
    const config = { ...defaultQuizSearch, concepts: '17,18', areas: 'java', count: 5 }
    const one = saveQuizSet([], ' 자바 기초 ', config, 'id-1')
    expect(one[0]).toMatchObject({ name: '자바 기초', settings: config })
    expect(decodeSavedQuizSets(encodeSavedQuizSets(one))).toEqual(one)
    expect(renameQuizSet(one, 'id-1', '면접 문제')[0].settings).toEqual(config)
    expect(deleteQuizSet(one, 'id-1')).toEqual([])
  })

  it('rejects duplicate names ignoring case and whitespace without deleting the original', () => {
    const one = saveQuizSet([], 'Java   Review', defaultQuizSearch, 'id-1')
    expect(() => saveQuizSet(one, ' java review ', defaultQuizSearch, 'id-2')).toThrow('같은 이름')
    expect(() => renameQuizSet(saveQuizSet(one, '두 번째', defaultQuizSearch, 'id-2'), 'id-2', 'JAVA REVIEW')).toThrow('같은 이름')
    expect(one[0].name).toBe('Java Review')
  })

  it('rejects unsafe or old settings rather than broadening a deleted Concept scope to all', () => {
    const good = saveQuizSet([], '내 문제', { ...defaultQuizSearch, concepts: '99999' }, 'id-1')
    const old = JSON.stringify({ version: 0, sets: good })
    expect(decodeSavedQuizSets(old)).toEqual([])
    const invalid = { version: 1, sets: [
      { id: 'unsafe', name: '잘못된 설정', settings: { ...defaultQuizSearch, concepts: 'not-a-number' } },
      ...good,
    ] }
    expect(decodeSavedQuizSets(JSON.stringify(invalid))).toEqual(good)
    expect(decodeSavedQuizSets('{broken')).toEqual([])
    expect(decodeSavedQuizSets('{"version":1,"sets":{}}')).toEqual([])
  })

  it('enforces the 20-set limit and valid bounded input', () => {
    let sets = decodeSavedQuizSets(null)
    for (let i = 0; i < 20; i++) sets = saveQuizSet(sets, String(i), defaultQuizSearch, String(i))
    expect(sets).toHaveLength(20)
    expect(() => saveQuizSet(sets, 'over', defaultQuizSearch, '21')).toThrow('20개')
    expect(() => renameQuizSet(sets, '0', '  ')).toThrow('1~50자')
    expect(() => saveQuizSet([], 'bad', { ...defaultQuizSearch, count: 500 }, 'bad')).toThrow('유효하지 않은')
  })
})
