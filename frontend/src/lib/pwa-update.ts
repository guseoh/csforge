import {
  getAppUpdateBlocker,
  type AppUpdateSafetySnapshot,
} from './app-update-safety'

export function shouldShowAppUpdatePrompt(updateReady: boolean, dismissed: boolean) {
  return updateReady && !dismissed
}

export async function applyPwaUpdate(options: {
  getSafety: () => AppUpdateSafetySnapshot
  flushQuizSaves: () => Promise<boolean>
  activateUpdate: () => Promise<void>
}) {
  const initialSafety = options.getSafety()
  const initialBlocker = getAppUpdateBlocker(initialSafety)
  if (initialBlocker) return { status: 'blocked' as const, blocker: initialBlocker }

  if (initialSafety.quizSavePending > 0 && !await options.flushQuizSaves()) {
    return { status: 'save-failed' as const }
  }

  const latestBlocker = getAppUpdateBlocker(options.getSafety())
  if (latestBlocker) return { status: 'blocked' as const, blocker: latestBlocker }

  try {
    await options.activateUpdate()
    return { status: 'applied' as const }
  } catch {
    return { status: 'activation-failed' as const }
  }
}

/**
 * Workbox's waiting worker can become active without claiming already-open clients.
 * Observe the worker state rather than waiting for a controllerchange that may never fire.
 * The caller reloads only after confirmed activation and after its unsaved-work checks.
 */
export function activateWaitingWorker(
  waiting: Pick<ServiceWorker, 'state' | 'addEventListener' | 'removeEventListener'>,
  sendSkipWaiting: () => Promise<void>,
  timeoutMs = 10_000,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout> | undefined
    let completed = false
    const finish = (error?: Error) => {
      if (completed) return
      completed = true
      if (timeout !== undefined) clearTimeout(timeout)
      waiting.removeEventListener('statechange', onStateChange)
      if (error) reject(error)
      else resolve()
    }
    const onStateChange = () => {
      if (waiting.state === 'activated') finish()
      else if (waiting.state === 'redundant') finish(new Error('Waiting service worker became redundant'))
    }

    waiting.addEventListener('statechange', onStateChange)
    timeout = setTimeout(() => finish(new Error('Service worker activation timed out')), timeoutMs)
    if (waiting.state === 'activated') {
      finish()
      return
    }
    if (waiting.state === 'redundant') {
      finish(new Error('Waiting service worker became redundant'))
      return
    }
    void Promise.resolve().then(sendSkipWaiting).catch((error: unknown) => {
      finish(error instanceof Error ? error : new Error('Failed to request service worker activation'))
    })
  })
}
