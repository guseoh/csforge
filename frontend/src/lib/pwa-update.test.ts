import { describe, expect, it, vi } from 'vitest'
import { activateWaitingWorker, applyPwaUpdate, shouldShowAppUpdatePrompt } from './pwa-update'
import type { AppUpdateSafetySnapshot } from './app-update-safety'

const safeState: AppUpdateSafetySnapshot = {
  quizSavePending: 0,
  quizSaveFailures: 0,
  quizSubmitting: 0,
  noteDirty: 0,
  notePending: 0,
  importApplying: 0,
}

describe('PWA update flow', () => {
  it('shows only a ready update and lets a deferred prompt stay hidden', () => {
    expect(shouldShowAppUpdatePrompt(false, false)).toBe(false)
    expect(shouldShowAppUpdatePrompt(true, false)).toBe(true)
    expect(shouldShowAppUpdatePrompt(true, true)).toBe(false)
  })

  it('flushes a pending quiz before invoking the user-selected update callback', async () => {
    const order: string[] = []
    const activateUpdate = vi.fn(async () => { order.push('apply') })
    const result = await applyPwaUpdate({
      getSafety: () => ({ ...safeState, quizSavePending: 1, noteDirty: 1, notePending: 1 }),
      flushQuizSaves: async () => { order.push('flush'); return true },
      activateUpdate,
    })

    expect(result).toEqual({ status: 'applied' })
    expect(order).toEqual(['flush', 'apply'])
    expect(activateUpdate).toHaveBeenCalledOnce()
  })

  it('does not activate for a failed quiz save or an active import', async () => {
    const activateUpdate = vi.fn(async () => {})
    const flushQuizSaves = vi.fn(async () => true)
    const failedSave = await applyPwaUpdate({
      getSafety: () => ({ ...safeState, quizSaveFailures: 1 }),
      flushQuizSaves,
      activateUpdate,
    })
    const activeImport = await applyPwaUpdate({
      getSafety: () => ({ ...safeState, importApplying: 1 }),
      flushQuizSaves,
      activateUpdate,
    })

    expect(failedSave).toEqual({ status: 'blocked', blocker: 'quiz-save-failed' })
    expect(activeImport).toEqual({ status: 'blocked', blocker: 'import-applying' })
    expect(flushQuizSaves).not.toHaveBeenCalled()
    expect(activateUpdate).not.toHaveBeenCalled()
  })

  it('does not activate when pending quiz answers cannot be flushed', async () => {
    const activateUpdate = vi.fn(async () => {})
    const result = await applyPwaUpdate({
      getSafety: () => ({ ...safeState, quizSavePending: 1 }),
      flushQuizSaves: async () => false,
      activateUpdate,
    })

    expect(result).toEqual({ status: 'save-failed' })
    expect(activateUpdate).not.toHaveBeenCalled()
  })
})

describe('waiting service worker activation', () => {
  function workerFixture() {
    const listeners = new Set<EventListenerOrEventListenerObject>()
    const worker = {
      state: 'installed' as ServiceWorkerState,
      addEventListener: (_: string, handler: EventListenerOrEventListenerObject) => { listeners.add(handler) },
      removeEventListener: (_: string, handler: EventListenerOrEventListenerObject) => { listeners.delete(handler) },
      transition(state: ServiceWorkerState) {
        worker.state = state
        for (const handler of listeners) {
          if (typeof handler === 'function') handler(new Event('statechange'))
          else handler.handleEvent(new Event('statechange'))
        }
      },
      get listenerCount() { return listeners.size },
    }
    return worker
  }

  it('finishes after the waiting SW activates without requiring controllerchange', async () => {
    const sw = workerFixture()
    const send = vi.fn(async () => { sw.transition('activating'); sw.transition('activated') })
    await expect(activateWaitingWorker(sw, send, 200)).resolves.toBeUndefined()
    expect(send).toHaveBeenCalledOnce()
    expect(sw.listenerCount).toBe(0)
  })

  it('returns an error if the SW becomes redundant', async () => {
    const sw = workerFixture()
    await expect(activateWaitingWorker(sw, async () => { sw.transition('redundant') }, 200)).rejects.toThrow(/redundant/)
    expect(sw.listenerCount).toBe(0)
  })

  it('does not hang forever when the worker fails to activate', async () => {
    const sw = workerFixture()
    await expect(activateWaitingWorker(sw, async () => {}, 5)).rejects.toThrow(/timed out/)
    expect(sw.listenerCount).toBe(0)
  })
})
