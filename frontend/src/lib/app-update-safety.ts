export interface AppUpdateSafetySnapshot {
  quizSavePending: number
  quizSaveFailures: number
  quizSubmitting: number
  noteDirty: number
  notePending: number
  importApplying: number
}

export interface AppUpdateSafetySignal extends Partial<AppUpdateSafetySnapshot> {
  flushQuizSaves?: () => Promise<void>
}

export type AppUpdateBlocker = 'import-applying' | 'quiz-submitting' | 'quiz-save-failed'

const emptySnapshot: AppUpdateSafetySnapshot = {
  quizSavePending: 0,
  quizSaveFailures: 0,
  quizSubmitting: 0,
  noteDirty: 0,
  notePending: 0,
  importApplying: 0,
}

const signals = new Map<string, AppUpdateSafetySignal>()
const listeners = new Set<() => void>()
let snapshot = emptySnapshot

export function setAppUpdateSafetySignal(key: string, signal: AppUpdateSafetySignal) {
  signals.set(key, signal)
  refreshSnapshot()
}

export function clearAppUpdateSafetySignal(key: string) {
  if (signals.delete(key)) refreshSnapshot()
}

export function getAppUpdateSafetySnapshot() {
  return snapshot
}

export function subscribeToAppUpdateSafety(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export async function flushPendingQuizSaves() {
  const flushers = Array.from(signals.values())
    .filter((signal) => (signal.quizSavePending ?? 0) > 0 && signal.flushQuizSaves)
    .map((signal) => signal.flushQuizSaves!)
  try {
    await Promise.all(flushers.map((flush) => flush()))
    return true
  } catch {
    return false
  }
}

export function getAppUpdateBlocker(safety: AppUpdateSafetySnapshot): AppUpdateBlocker | null {
  if (safety.importApplying > 0) return 'import-applying'
  if (safety.quizSubmitting > 0) return 'quiz-submitting'
  if (safety.quizSaveFailures > 0) return 'quiz-save-failed'
  return null
}

function refreshSnapshot() {
  const next = { ...emptySnapshot }
  for (const signal of signals.values()) {
    next.quizSavePending += signal.quizSavePending ?? 0
    next.quizSaveFailures += signal.quizSaveFailures ?? 0
    next.quizSubmitting += signal.quizSubmitting ?? 0
    next.noteDirty += signal.noteDirty ?? 0
    next.notePending += signal.notePending ?? 0
    next.importApplying += signal.importApplying ?? 0
  }
  snapshot = next
  listeners.forEach((listener) => listener())
}
