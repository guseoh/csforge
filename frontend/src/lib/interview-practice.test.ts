import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  appendInterviewDraftToNote, clearInterviewDraft, interviewDraftKey,
  MAX_INTERVIEW_DRAFT_LENGTH, readInterviewDraft, writeInterviewDraft,
} from './interview-practice'

afterEach(() => vi.unstubAllGlobals())

function installSessionStorage() {
  const memory = new Map<string, string>()
  vi.stubGlobal('window', {
    sessionStorage: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => { memory.set(key, value) },
      removeItem: (key: string) => { memory.delete(key) },
    },
  })
  return memory
}

describe('interview answer session draft', () => {
  it('is per canonical contentKey, question index and question text (not PersonalNote)', () => {
    const memory = installSessionStorage()
    expect(writeInterviewDraft('java.core.value', 0, '변수와 값?', '내 답')).toBe(true)
    expect(writeInterviewDraft('java.core.value', 1, '변수와 값?', '다른 답')).toBe(true)
    expect(writeInterviewDraft('database.core.tx', 0, '변수와 값?', 'DB 답')).toBe(true)
    expect(readInterviewDraft('java.core.value', 0, '변수와 값?')).toBe('내 답')
    expect(readInterviewDraft('java.core.value', 1, '변수와 값?')).toBe('다른 답')
    expect(readInterviewDraft('database.core.tx', 0, '변수와 값?')).toBe('DB 답')
    expect(readInterviewDraft('java.core.value', 0, '변수와 값 바뀜?')).toBe('')
    expect([...memory.keys()]).toHaveLength(3)
    expect([...memory.keys()].every(key => key.startsWith('csforge:interview-practice:v1:'))).toBe(true)
    expect(clearInterviewDraft('java.core.value', 0, '변수와 값?')).toBe(true)
    expect(readInterviewDraft('java.core.value', 0, '변수와 값?')).toBe('')
    expect(readInterviewDraft('java.core.value', 1, '변수와 값?')).toBe('다른 답')
  })

  it('limits long Markdown/code drafts to 5000 characters and clears only its own key', () => {
    const memory = installSessionStorage()
    const text = '```java\n' + 'System.out.println(1);\n'.repeat(350) + '```'
    writeInterviewDraft('java', 0, 'Q?', text)
    expect(readInterviewDraft('java', 0, 'Q?')).toHaveLength(MAX_INTERVIEW_DRAFT_LENGTH)
    expect(memory.size).toBe(1)
    expect(interviewDraftKey('java', 0, 'Q?')).not.toBe(interviewDraftKey('java', 1, 'Q?'))
  })

  it('reports inaccessible storage rather than silently claiming the draft was saved', () => {
    vi.stubGlobal('window', { get sessionStorage() { throw new Error('denied') } })
    expect(readInterviewDraft('java', 0, 'Q?')).toBe('')
    expect(writeInterviewDraft('java', 0, 'Q?', 'answer')).toBe(false)
    expect(clearInterviewDraft('java', 0, 'Q?')).toBe(false)
  })
})

describe('explicit copy to personal note', () => {
  it('appends without overwriting an existing note and avoids duplicate clicks', () => {
    const old = '나의 기존 노트\n\n- 학습 중이던 내용'
    const merged = appendInterviewDraftToNote(old, 'Java는 값을 전달하나요?', '값을 복사해서 전달한다.\n\n```java\nint a=1;\n```')
    expect(merged.startsWith(old)).toBe(true)
    expect(merged).toContain('### 면접 답변 연습')
    expect(merged).toContain('Java는 값을 전달하나요?')
    expect(merged).toContain('int a=1;')
    expect(appendInterviewDraftToNote(merged, 'Java는 값을 전달하나요?', '값을 복사해서 전달한다.\n\n```java\nint a=1;\n```')).toBe(merged)
    const repeatedOther = appendInterviewDraftToNote(merged, '다른 질문?', '별도 답')
    expect(repeatedOther).toContain('나의 기존 노트')
    expect(repeatedOther).toContain('다른 질문?')
  })

  it('never changes notes for blank interview answers', () => {
    expect(appendInterviewDraftToNote('유지', 'Q', '  ')).toBe('유지')
    expect(appendInterviewDraftToNote('', 'Q', '답')).toContain('### 면접 답변 연습')
  })
})
