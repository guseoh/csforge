import { useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect, type ReactNode } from 'react'
import { AuthRecoveryActions } from './AuthRecoveryActions'
import { ApiRequestError } from '../lib/http'
import { getAuthSession } from '../lib/auth-api'
import { consumeAuthReturnLocation, storeAuthReturnLocation } from '../lib/auth-return'

type AuthGateProps = {
  children: ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useQuery({
    queryKey: ['auth-session'],
    queryFn: getAuthSession,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (session.error instanceof ApiRequestError && (session.error.status === 401 || session.error.status === 403)) {
      storeAuthReturnLocation({ path: location.pathname, search: location.searchStr, hash: location.hash })
    }

    if (session.error instanceof ApiRequestError && session.error.status === 401) {
      void navigate({ to: '/login', replace: true })
    }
  }, [location.hash, location.pathname, location.searchStr, navigate, session.error])

  useEffect(() => {
    if (!session.data?.authenticated || location.pathname !== '/') return

    const returnTo = consumeAuthReturnLocation()
    const hash = location.hash && !location.hash.startsWith('#') ? `#${location.hash}` : location.hash
    if (returnTo && returnTo !== `${location.pathname}${location.searchStr}${hash}`) {
      window.location.replace(returnTo)
    }
  }, [location.hash, location.pathname, location.searchStr, session.data?.authenticated])

  if (session.isPending) {
    return <p className="route-message">접근 권한을 확인하는 중입니다…</p>
  }

  if (session.error instanceof ApiRequestError && session.error.status === 401) {
    return <p className="route-message">로그인 화면으로 이동하는 중입니다…</p>
  }

  if (session.error instanceof ApiRequestError && session.error.status === 403) {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <p className="eyebrow">접근 거부</p>
          <h1>허용된 계정이 아닙니다</h1>
          <p>이 CSForge 배포에 허용된 Google 계정으로 로그인해 주세요.</p>
          <AuthRecoveryActions />
        </div>
      </section>
    )
  }

  if (session.isError) {
    return (
      <div className="route-message error" role="alert">
        <span>인증 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.</span>
        <button className="secondary-button" type="button" disabled={session.isFetching} onClick={() => void session.refetch()}>
          {session.isFetching ? '확인 중…' : '다시 시도'}
        </button>
      </div>
    )
  }

  return <>{children}</>
}
