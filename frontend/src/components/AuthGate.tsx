import { useQuery } from '@tanstack/react-query'
import { useLocation } from '@tanstack/react-router'
import { useEffect, useState, type ReactNode } from 'react'
import { getAuthSession } from '../lib/auth-api'
import { consumeAuthReturnLocation } from '../lib/auth-return'
import { AccessContext } from '../lib/access-context'
import { isPublicPage } from '../lib/access'
import { LoginModal } from './LoginModal'

/** Resolves the session before mounting any page that can query personal data. */
export function AuthGate({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [destination, setDestination] = useState<string | null>(null)
  const session = useQuery({ queryKey: ['auth-session'], queryFn: getAuthSession, retry: false, staleTime: 60_000 })
  const authenticated = session.data?.authenticated === true
  const currentUrl = `${location.pathname}${location.searchStr}${location.hash ? `#${location.hash.replace(/^#/, '')}` : ''}`

  useEffect(() => {
    if (authenticated) setDestination(null)
    if (authenticated && location.pathname === '/') {
      const returnTo = consumeAuthReturnLocation()
      if (returnTo && returnTo !== currentUrl) window.location.replace(returnTo)
    }
  }, [authenticated, currentUrl, location.pathname])

  useEffect(() => {
    if (!session.isPending && !authenticated && !isPublicPage(location.pathname)) setDestination(currentUrl)
  }, [authenticated, currentUrl, location.pathname, session.isPending])

  if (session.isPending) return <p className="route-message" role="status">로그인 상태를 확인하는 중입니다…</p>

  return <AccessContext.Provider value={{ authenticated, requestLogin: (url) => setDestination(url ?? currentUrl) }}>
    {session.isError && <div className="route-message error" role="alert">
      로그인 상태를 확인하지 못했습니다. 공개 콘텐츠는 계속 읽을 수 있습니다.
      <button type="button" className="text-button" onClick={() => void session.refetch()}>다시 확인</button>
    </div>}
    {children}
    {destination !== null && !authenticated && <LoginModal destination={destination} onClose={() => {
      setDestination(null)
      if (!isPublicPage(location.pathname)) window.location.replace('/')
    }} />}
  </AccessContext.Provider>
}
