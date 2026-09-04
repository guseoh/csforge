import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react'

export type ToastTone = 'success' | 'error'

interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

interface ToastContextValue {
  showToast: (tone: ToastTone, message: string) => void
  dismissToast: (id: number) => void
}

const MAX_TOASTS = 3
const TOAST_DURATION_MS = 3500
const ToastContext = createContext<ToastContextValue | null>(null)

export function keepLatestToasts(toasts: readonly ToastItem[], toast: ToastItem): ToastItem[] {
  return [...toasts, toast].slice(-MAX_TOASTS)
}

function ToastRegion({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: number) => void }) {
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div className={`toast toast-${toast.tone}`} key={toast.id} role={toast.tone === 'error' ? 'alert' : undefined}>
          <span>{toast.message}</span>
          <button type="button" aria-label="알림 닫기" onClick={() => dismiss(toast.id)}>닫기</button>
        </div>
      ))}
    </div>
  )
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const nextId = useRef(0)

  const dismissToast = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((tone: ToastTone, message: string) => {
    const toast = { id: ++nextId.current, tone, message }
    setToasts((current) => keepLatestToasts(current, toast))
    const timer = setTimeout(() => dismissToast(toast.id), TOAST_DURATION_MS)
    timers.current.set(toast.id, timer)
  }, [dismissToast])

  useEffect(() => {
    const activeIds = new Set(toasts.map((toast) => toast.id))
    for (const [id, timer] of timers.current) {
      if (!activeIds.has(id)) {
        clearTimeout(timer)
        timers.current.delete(id)
      }
    }
  }, [toasts])

  useEffect(() => () => {
    for (const timer of timers.current.values()) clearTimeout(timer)
    timers.current.clear()
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastRegion toasts={toasts} dismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
