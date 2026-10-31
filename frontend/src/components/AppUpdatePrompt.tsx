import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useLocation } from '@tanstack/react-router'
import { useRegisterSW } from 'virtual:pwa-register/react'
import {
  flushPendingQuizSaves,
  getAppUpdateBlocker,
  getAppUpdateSafetySnapshot,
  subscribeToAppUpdateSafety,
} from '../lib/app-update-safety'
import { activateWaitingWorker, applyPwaUpdate, shouldShowAppUpdatePrompt } from '../lib/pwa-update'
import { isReleaseMismatch } from '../lib/release-identity'

const updateCheckIntervalMs = 30 * 60 * 1000
const reminderDelayMs = 5 * 60 * 1000

export function AppUpdatePrompt() {
  const location = useLocation()
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined)
  const reminderTimerRef = useRef<number | undefined>(undefined)
  const [dismissed, setDismissed] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [releaseMismatch, setReleaseMismatch] = useState(false)
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

  const checkReleaseIdentity = useCallback(async () => {
    if (document.visibilityState !== 'visible') return
    try {
      const response = await fetch(`/build-info.json?client=${encodeURIComponent(__CSFORGE_CLIENT_SHA__)}`, { cache: 'no-store' })
      if (!response.ok) return
      const mismatch = isReleaseMismatch(__CSFORGE_CLIENT_SHA__, await response.json())
      setReleaseMismatch(mismatch)
      if (mismatch) void registrationRef.current?.update().catch(() => {})
    } catch {
      // Offline readers can continue using the locally cached application.
    }
  }, [])

  useEffect(() => {
    setDismissed(false)
    setApplyError(null)
    void checkReleaseIdentity()
  }, [location.pathname, location.searchStr, location.hash, checkReleaseIdentity])

  useEffect(() => {
    const checkForUpdate = () => {
      setDismissed(false)
      if (document.visibilityState === 'visible') {
        void registrationRef.current?.update().catch(() => {})
        void checkReleaseIdentity()
      }
    }
    window.addEventListener('focus', checkForUpdate)
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void registrationRef.current?.update().catch(() => {})
        void checkReleaseIdentity()
      }
    }, updateCheckIntervalMs)
    return () => {
      window.removeEventListener('focus', checkForUpdate)
      window.clearInterval(interval)
    }
  }, [checkReleaseIdentity])

  useEffect(() => () => {
    if (reminderTimerRef.current !== undefined) window.clearTimeout(reminderTimerRef.current)
  }, [])

  if (!shouldShowAppUpdatePrompt(updateReady || releaseMismatch, dismissed)) return null

  const blocker = getAppUpdateBlocker(safety)
  const blockerMessage = blocker === 'quiz-save-failed'
    ? '저장하지 못한 답안이 있습니다. 먼저 다시 저장해 주세요.'
    : blocker === 'quiz-submitting'
      ? 'Quiz 제출이 끝난 뒤 업데이트할 수 있습니다.'
      : blocker === 'import-applying'
        ? '콘텐츠 반영이 끝난 뒤 업데이트할 수 있습니다.'
        : null

  // The generated SW intentionally uses clientsClaim=false, so an activated update will
  // not trigger the Workbox "controlling" event that normally reloads this tab.
  // Wait for the waiting worker to activate, then reload ONLY the accepting tab.
  const activateReadyUpdate = async () => {
    const registration = registrationRef.current ?? await navigator.serviceWorker?.getRegistration()
    const waiting = registration?.waiting
    if (!waiting) throw new Error('No waiting service worker to activate')
    await activateWaitingWorker(waiting, () => updateServiceWorker(true))
    window.location.reload()
  }

  const applyUpdate = async () => {
    if (applying) return
    setApplyError(null)
    setApplying(true)
    try {
      const result = await applyPwaUpdate({
        getSafety: getAppUpdateSafetySnapshot,
        flushQuizSaves: flushPendingQuizSaves,
        activateUpdate: activateReadyUpdate,
      })
      if (result.status === 'blocked') setApplyError(messageForBlocker(result.blocker))
      if (result.status === 'save-failed') setApplyError('저장하지 못한 답안이 있습니다. 먼저 다시 저장해 주세요.')
      if (result.status === 'activation-failed') setApplyError('자동 업데이트를 완료하지 못했습니다. 현재 작업을 저장한 뒤 새 탭에서 다시 열거나 새로고침해 주세요.')
    } catch {
      setApplyError('업데이트 적용 중 오류가 발생했습니다. 현재 작업을 저장하고 다시 시도해 주세요.')
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
        <strong id="app-update-heading">{updateReady ? '새 버전이 준비되었습니다.' : '현재 앱과 배포 버전이 다릅니다.'}</strong>
        <span>{releaseMismatch
          ? '이전 앱에서는 새로운 학습 도식이 JSON 텍스트로 표시될 수 있습니다. 저장 중인 작업을 마친 뒤 최신 버전을 적용하세요.'
          : '현재 작업을 저장한 뒤 업데이트할 수 있습니다.'}</span>
        {safety.noteDirty > 0 && <span>메모 변경 사항은 브라우저 임시 저장에 보관됩니다.</span>}
        {blockerMessage && <span className="error-text" role="alert">{blockerMessage}</span>}
        {applyError && !blockerMessage && <span className="error-text" role="alert">{applyError}</span>}
      </div>
      <div className="app-update-actions">
        {updateReady ? <button className="primary-button" type="button" disabled={applying || Boolean(blocker)} onClick={() => void applyUpdate()}>
          {applying ? '저장 후 업데이트 중…' : '업데이트 적용'}
        </button> : <button className="primary-button" type="button" onClick={() => {
          void registrationRef.current?.update().catch(() => {})
          void checkReleaseIdentity()
        }}>업데이트 다시 확인</button>}
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
