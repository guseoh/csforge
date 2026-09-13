import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, type ReactNode } from 'react'
import { ApiRequestError } from '../lib/http'
import { getAuthSession } from '../lib/auth-api'

type AuthGateProps = {
  children: ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const navigate = useNavigate()
  const session = useQuery({
    queryKey: ['auth-session'],
    queryFn: getAuthSession,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (session.error instanceof ApiRequestError && session.error.status === 401) {
      void navigate({ to: '/login', replace: true })
    }
  }, [navigate, session.error])

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
          <Link className="primary-button" to="/login">로그인 화면으로 이동</Link>
        </div>
      </section>
    )
  }

  if (session.isError) {
    return <p className="route-message error">인증 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
  }

  return <>{children}</>
}
