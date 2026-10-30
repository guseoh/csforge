import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useLocation } from '@tanstack/react-router'
import { useRegisterSW } from 'virtual:pwa-register/react'
import {
  flushPendingQuizSaves,
  getAppUpdateBlocker,
  getAppUpdateSafetySnapshot,
  subscribeToAppUpdateSafety,
} from '../lib/app-update-safety'
import { applyPwaUpdate, shouldShowAppUpdatePrompt } from '../lib/pwa-update'

const updateCheckIntervalMs = 30 * 60 * 1000
const reminderDelayMs = 5 * 60 * 1000

export function AppUpdatePrompt() {
  const location = useLocation()
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined)
  const reminderTimerRef = useRef<number | undefined>(undefined)
  const [dismissed, setDismissed] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)
  const safety = useSyncExternalStore(
    subscribeToAppUpdateSafety,
    getAppUpdateSafetySnapshot,
    getAppUpdateSafetySnapshot,
  )
  const onRegisteredSW = useCallback((_scriptUrl: string, registration: ServiceWorkerRegistration | undefined) => {
    registrationRef.current = registration
  }, [])
  const { needRefresh: [updateReady], updateServiceWorker } = useRegisterSW({
    immediate: true,
    onRegisteredSW,
  })

  useEffect(() => {
    setDismissed(false)
    setApplyError(null)
  }, [location.pathname, location.searchStr, location.hash])

  useEffect(() => {
    const checkForUpdate = () => {
      setDismissed(false)
      if (document.visibilityState === 'visible') {
        void registrationRef.current?.update().catch(() => {})
      }
    }
    window.addEventListener('focus', checkForUpdate)
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void registrationRef.current?.update().catch(() => {})
    }, updateCheckIntervalMs)
    return () => {
      window.removeEventListener('focus', checkForUpdate)
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => () => {
    if (reminderTimerRef.current !== undefined) window.clearTimeout(reminderTimerRef.current)
  }, [])

  if (!shouldShowAppUpdatePrompt(updateReady, dismissed)) return null

  const blocker = getAppUpdateBlocker(safety)
  const blockerMessage = blocker === 'quiz-save-failed'
    ? '저장하지 못한 답안이 있습니다. 먼저 다시 저장해 주세요.'
    : blocker === 'quiz-submitting'
      ? 'Quiz 제출이 끝난 뒤 업데이트할 수 있습니다.'
      : blocker === 'import-applying'
        ? '콘텐츠 반영이 끝난 뒤 업데이트할 수 있습니다.'
        : null

  const applyUpdate = async () => {
    if (applying) return
    setApplyError(null)
    setApplying(true)
    try {
      const result = await applyPwaUpdate({
        getSafety: getAppUpdateSafetySnapshot,
        flushQuizSaves: flushPendingQuizSaves,
        activateUpdate: updateServiceWorker,
      })
      if (result.status === 'blocked') setApplyError(messageForBlocker(result.blocker))
      if (result.status === 'save-failed') setApplyError('저장하지 못한 답안이 있습니다. 먼저 다시 저장해 주세요.')
      if (result.status === 'activation-failed') setApplyError('업데이트를 적용하지 못했습니다. 네트워크를 확인한 뒤 다시 시도하세요.')
    } catch {
      setApplyError('업데이트를 적용하지 못했습니다. 네트워크를 확인한 뒤 다시 시도하세요.')
    } finally {
      setApplying(false)
    }
  }

  const deferUpdate = () => {
    setDismissed(true)
    if (reminderTimerRef.current !== undefined) window.clearTimeout(reminderTimerRef.current)
    reminderTimerRef.current = window.setTimeout(() => setDismissed(false), reminderDelayMs)
  }

  return (
    <aside className="app-update-prompt" aria-labelledby="app-update-heading" aria-live="polite">
      <div className="app-update-copy">
        <strong id="app-update-heading">새 버전이 준비되었습니다.</strong>
        <span>현재 작업을 저장한 뒤 업데이트할 수 있습니다.</span>
        {safety.noteDirty > 0 && <span>메모 변경 사항은 브라우저 임시 저장에 보관됩니다.</span>}
        {blockerMessage && <span className="error-text" role="alert">{blockerMessage}</span>}
        {applyError && !blockerMessage && <span className="error-text" role="alert">{applyError}</span>}
      </div>
      <div className="app-update-actions">
        <button className="primary-button" type="button" disabled={applying || Boolean(blocker)} onClick={() => void applyUpdate()}>
          {applying ? '저장 후 업데이트 중…' : '업데이트 적용'}
        </button>
        <button className="text-button" type="button" disabled={applying} onClick={deferUpdate}>나중에</button>
      </div>
    </aside>
  )
}


function messageForBlocker(blocker: NonNullable<ReturnType<typeof getAppUpdateBlocker>>) {
  if (blocker === 'quiz-save-failed') return '저장하지 못한 답안이 있습니다. 먼저 다시 저장해 주세요.'
  if (blocker === 'quiz-submitting') return 'Quiz 제출이 끝난 뒤 업데이트할 수 있습니다.'
  return '콘텐츠 반영이 끝난 뒤 업데이트할 수 있습니다.'
}
