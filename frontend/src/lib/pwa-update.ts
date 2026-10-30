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
