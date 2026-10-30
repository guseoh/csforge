import { request } from './http'

export type AuthSession = {
  authenticated: boolean
  mode: 'LOCAL' | 'CLOUD'
  email: string | null
}

export function getAuthSession() {
  return request<AuthSession>('/api/auth/session')
}

export function logout() {
  return request<void>('/api/auth/logout', { method: 'POST' })
}

export function startGoogleLogin() {
  window.location.assign('/oauth2/authorization/google')
}
