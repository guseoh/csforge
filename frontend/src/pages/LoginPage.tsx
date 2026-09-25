import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AuthRecoveryActions } from '../components/AuthRecoveryActions'
import { startGoogleLogin, getAuthSession } from '../lib/auth-api'
import { consumeAuthReturnLocation } from '../lib/auth-return'
import { ApiRequestError } from '../lib/http'

export function LoginPage() {
  const navigate = useNavigate({ from: '/login' })
  const session = useQuery({
    queryKey: ['auth-session'],
    queryFn: getAuthSession,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (session.data?.authenticated) {
      const returnTo = consumeAuthReturnLocation()
      if (returnTo) {
        window.location.replace(returnTo)
      } else {
        void navigate({ to: '/', replace: true })
      }
    }
  }, [navigate, session.data])

  if (session.isPending) {
    return <p className="route-message">로그인 상태를 확인하는 중입니다…</p>
  }

  if (session.error instanceof ApiRequestError && session.error.status === 403) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <p className="eyebrow">CSForge</p>
          <h1>접근이 거부되었습니다</h1>
          <p>이 배포에 허용된 Google 계정만 사용할 수 있습니다.</p>
          <AuthRecoveryActions />
        </section>
      </main>
    )
  }

  if (session.isError && !(session.error instanceof ApiRequestError && session.error.status === 401)) {
    return (
      <div className="route-message error" role="alert">
        <span>로그인 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.</span>
        <button className="secondary-button" type="button" disabled={session.isFetching} onClick={() => void session.refetch()}>
          {session.isFetching ? '확인 중…' : '다시 시도'}
        </button>
      </div>
    )
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">CSForge</p>
        <h1>계속하려면 로그인하세요</h1>
        <p>클라우드 배포에서는 허용된 한 개의 Google 계정만 접근할 수 있습니다.</p>
        <button className="primary-button" type="button" onClick={startGoogleLogin}>
          Google로 로그인
        </button>
      </section>
    </main>
  )
}
