import { describe, expect, it, vi } from 'vitest'
import {
  beginQuizSaveRevision,
  enqueueLatestQuizSave,
  hasPendingQuizSave,
  isLatestQuizSaveRevision,
  quizAnswerDraftKey,
  readQuizAnswerDraft,
  removeQuizAnswerDraft,
  writeQuizAnswerDraft,
} from './quiz-save-coordinator'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) },
  }
}

describe('quiz save coordinator', () => {
  it('serializes same-question saves and skips superseded revisions after a response race', async () => {
    const key = 'quiz:41:question:9:answer'
    const firstRevision = beginQuizSaveRevision(key)
    const firstRequest = deferred<string>()
    const firstSave = vi.fn(() => firstRequest.promise)
    const first = enqueueLatestQuizSave(key, firstRevision, firstSave)

    const secondRevision = beginQuizSaveRevision(key)
    const secondSave = vi.fn(async () => 'B')
    const thirdRevision = beginQuizSaveRevision(key)
    const thirdSave = vi.fn(async () => 'C')
    const second = enqueueLatestQuizSave(key, secondRevision, secondSave)
    const latest = enqueueLatestQuizSave(key, thirdRevision, thirdSave)

    expect(firstSave).toHaveBeenCalledOnce()
    expect(secondSave).not.toHaveBeenCalled()
    firstRequest.resolve('A')

    await expect(first).resolves.toEqual({ status: 'superseded', revision: firstRevision })
    await expect(second).resolves.toEqual({ status: 'superseded', revision: secondRevision })
    await expect(latest).resolves.toEqual({ status: 'saved', revision: thirdRevision, value: 'C' })
    expect(secondSave).not.toHaveBeenCalled()
    expect(thirdSave).toHaveBeenCalledOnce()
    expect(hasPendingQuizSave(key)).toBe(false)
  })

  it('shares the same pending promise when a flush meets an active revision', async () => {
    const key = 'quiz:42:question:10:answer'
    const revision = beginQuizSaveRevision(key)
    const request = deferred<string>()
    const save = vi.fn(() => request.promise)
    const autosave = enqueueLatestQuizSave(key, revision, save)
    const submitFlush = enqueueLatestQuizSave(key, revision, save)

    expect(submitFlush).toBe(autosave)
    request.resolve('latest')
    await expect(submitFlush).resolves.toEqual({ status: 'saved', revision, value: 'latest' })
    expect(save).toHaveBeenCalledOnce()
  })

  it('keeps question queues independent and lets a failed answer retry its latest revision', async () => {
    const firstKey = 'quiz:43:question:11:answer'
    const otherKey = 'quiz:43:question:12:answer'
    const failedRequest = deferred<string>()
    const firstRevision = beginQuizSaveRevision(firstKey)
    const failedSave = enqueueLatestQuizSave(firstKey, firstRevision, () => failedRequest.promise)
    const otherRevision = beginQuizSaveRevision(otherKey)
    const otherSave = enqueueLatestQuizSave(otherKey, otherRevision, async () => 'other answer')

    await expect(otherSave).resolves.toEqual({ status: 'saved', revision: otherRevision, value: 'other answer' })
    failedRequest.reject(new Error('offline'))
    await expect(failedSave).rejects.toThrow('offline')

    const retryRevision = beginQuizSaveRevision(firstKey)
    const retrySave = enqueueLatestQuizSave(firstKey, retryRevision, async () => 'latest answer')
    await expect(retrySave).resolves.toEqual({ status: 'saved', revision: retryRevision, value: 'latest answer' })
  })

  it('keeps the per-quiz draft until the latest server save is acknowledged', () => {
    const storage = memoryStorage()
    const key = quizAnswerDraftKey(12, 34)
    const revision = beginQuizSaveRevision('quiz:12:question:34:answer')
    const draft = { selectedChoiceKey: 'B', answerText: null, reviewNeeded: true, revision }

    expect(writeQuizAnswerDraft(storage, key, draft, () => new Date('2026-09-01T00:00:00.000Z'))).toBe(true)
    expect(readQuizAnswerDraft(storage, key)).toEqual({ ...draft, updatedAt: '2026-09-01T00:00:00.000Z' })
    expect(isLatestQuizSaveRevision('quiz:12:question:34:answer', revision)).toBe(true)
    expect(removeQuizAnswerDraft(storage, key)).toBe(true)
    expect(readQuizAnswerDraft(storage, key)).toBeNull()
  })

  it('ignores malformed drafts and tolerates storage failures', () => {
    const storage = {
      getItem: () => '{broken',
      setItem: () => { throw new Error('quota exceeded') },
      removeItem: () => { throw new Error('storage disabled') },
    }

    expect(readQuizAnswerDraft(storage, 'quiz:1:question:2:draft')).toBeNull()
    expect(writeQuizAnswerDraft(storage, 'quiz:1:question:2:draft', {
      selectedChoiceKey: null, answerText: 'draft', reviewNeeded: false, revision: 1,
    })).toBe(false)
    expect(removeQuizAnswerDraft(storage, 'quiz:1:question:2:draft')).toBe(false)
  })
})
