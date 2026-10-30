import { createContext, useContext } from 'react'

type AccessState = { authenticated: boolean; requestLogin: (destination?: string) => void }

export const AccessContext = createContext<AccessState | null>(null)

export function useAccess() {
  const access = useContext(AccessContext)
  if (!access) throw new Error('AccessContext must be provided before rendering learning pages')
  return access
}
