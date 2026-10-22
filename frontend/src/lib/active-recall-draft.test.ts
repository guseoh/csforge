import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearRecallDraft, MAX_RECALL_DRAFT_LENGTH, readRecallDraft, recallDraftKey, writeRecallDraft,
} from './active-recall-draft'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('browser-only active recall drafts', () => {
  it('stores drafts separately by stable canonical contentKey without writing personal notes', () => {
    const data = new Map<string, string>()
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => { data.set(key, value) },
        removeItem: (key: string) => { data.delete(key) },
      },
    })
    expect(writeRecallDraft('java.core.value', '서로 다른 변수')).toBe(true)
    expect(writeRecallDraft('database.core.tx', '독립적인 트랜잭션')).toBe(true)
    expect(readRecallDraft('java.core.value')).toBe('서로 다른 변수')
    expect(readRecallDraft('database.core.tx')).toBe('독립적인 트랜잭션')
    expect([...data.keys()]).toEqual([recallDraftKey('java.core.value'), recallDraftKey('database.core.tx')])
    expect(clearRecallDraft('java.core.value')).toBe(true)
    expect(readRecallDraft('java.core.value')).toBe('')
    expect(readRecallDraft('database.core.tx')).toBe('독립적인 트랜잭션')
  })

  it('enforces a reasonable draft size bound', () => {
    const data = new Map<string, string>()
    vi.stubGlobal('window', { localStorage: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => { data.set(key, value) },
      removeItem: (key: string) => { data.delete(key) },
    } })
    writeRecallDraft('java', '가'.repeat(MAX_RECALL_DRAFT_LENGTH + 20))
    expect(readRecallDraft('java')).toHaveLength(MAX_RECALL_DRAFT_LENGTH)
  })

  it('degrades safely when localStorage is unavailable or forbidden', () => {
    vi.stubGlobal('window', { get localStorage() { throw new Error('storage disabled') } })
    expect(readRecallDraft('java')).toBe('')
    expect(writeRecallDraft('java', '내 생각')).toBe(false)
    expect(clearRecallDraft('java')).toBe(false)
  })
})
