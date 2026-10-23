import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { logout, startGoogleLogin } from '../lib/auth-api'
import { storeAuthReturnLocation } from '../lib/auth-return'

export function LoginModal({ destination, onClose }: { destination: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const activeRef = useRef(true)
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    activeRef.current = true
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const dialog = dialogRef.current
    dialog?.showModal()
    dialog?.querySelector<HTMLButtonElement>('button')?.focus()
    return () => {
      activeRef.current = false
      dialog?.close()
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  const login = async (resetSession: boolean) => {
    setPending(true)
    setError('')
    try {
      if (resetSession) {
        await logout()
        await queryClient.cancelQueries()
        queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'auth-session' })
        queryClient.setQueryData(['auth-session'], { authenticated: false, mode: 'CLOUD', email: null })
      }
      if (!activeRef.current) return
      const url = new URL(destination, window.location.origin)
      if (url.origin !== window.location.origin || !storeAuthReturnLocation({ path: url.pathname, search: url.search, hash: url.hash })) {
        throw new Error('로그인 후 돌아올 위치를 저장하지 못했습니다. 브라우저 저장소 설정을 확인해 주세요.')
      }
      startGoogleLogin()
    } catch (failure) {
      if (!activeRef.current) return
      setError(failure instanceof Error ? failure.message : '로그인을 시작하지 못했습니다. 다시 시도해 주세요.')
      setPending(false)
    }
  }

  return <dialog ref={dialogRef} className="login-modal" aria-labelledby="login-modal-title" aria-describedby="login-modal-description"
    onKeyDown={(event) => {
      if (event.key !== 'Tab') return
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }}
    onCancel={(event) => { event.preventDefault(); onClose() }}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return
      const bounds = event.currentTarget.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
    }}>
    <div className="auth-card">
      <button className="text-button login-modal-close" type="button" aria-label="로그인 닫기" onClick={onClose}>×</button>
      <p className="eyebrow">CSForge</p>
      <h2 id="login-modal-title">내 학습을 이어가세요</h2>
      <p id="login-modal-description">개념과 참고 자료는 누구나 읽을 수 있습니다. 학습 기록·노트·문제 풀이는 이 공간의 소유자만 이용할 수 있습니다.</p>
      <button className="primary-button" type="button" disabled={pending} onClick={() => void login(false)}>
        {pending ? 'Google로 이동 중…' : 'Google로 로그인'}
      </button>
      <p className="auth-helper">허용된 Google 계정으로 로그인해 주세요. 접근이 거부되었다면 현재 세션을 정리하고 다시 시도하세요.</p>
      <button className="text-button" type="button" disabled={pending} onClick={() => void login(true)}>현재 계정에서 로그아웃하고 다시 로그인</button>
      {error && <p className="auth-error" role="alert">{error}</p>}
    </div>
  </dialog>
}
