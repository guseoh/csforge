import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearAppUpdateSafetySignal,
  flushPendingQuizSaves,
  getAppUpdateBlocker,
  getAppUpdateSafetySnapshot,
  setAppUpdateSafetySignal,
} from './app-update-safety'

afterEach(() => {
  clearAppUpdateSafetySignal('test-quiz')
  clearAppUpdateSafetySignal('test-import')
  clearAppUpdateSafetySignal('test-note')
})

describe('app update safety', () => {
  it('blocks updates for failed quiz saves, quiz submission, and import apply', () => {
    setAppUpdateSafetySignal('test-quiz', { quizSaveFailures: 1 })
    expect(getAppUpdateBlocker(getAppUpdateSafetySnapshot())).toBe('quiz-save-failed')

    setAppUpdateSafetySignal('test-quiz', { quizSubmitting: 1 })
    expect(getAppUpdateBlocker(getAppUpdateSafetySnapshot())).toBe('quiz-submitting')

    setAppUpdateSafetySignal('test-import', { importApplying: 1 })
    expect(getAppUpdateBlocker(getAppUpdateSafetySnapshot())).toBe('import-applying')
  })

  it('flushes pending quiz saves before applying and permits locally recoverable note drafts', async () => {
    const flush = vi.fn(async () => {})
    setAppUpdateSafetySignal('test-quiz', { quizSavePending: 2, flushQuizSaves: flush })
    setAppUpdateSafetySignal('test-note', { noteDirty: 1, notePending: 1 })

    expect(getAppUpdateBlocker(getAppUpdateSafetySnapshot())).toBeNull()
    await expect(flushPendingQuizSaves()).resolves.toBe(true)
    expect(flush).toHaveBeenCalledOnce()
    expect(getAppUpdateSafetySnapshot()).toMatchObject({ noteDirty: 1, notePending: 1 })
  })

  it('keeps update blocked when a quiz save flush fails', async () => {
    setAppUpdateSafetySignal('test-quiz', {
      quizSavePending: 1,
      flushQuizSaves: async () => { throw new Error('save failed') },
    })

    await expect(flushPendingQuizSaves()).resolves.toBe(false)
  })
})
