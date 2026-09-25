import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react'
import { persistThemePreference, readThemePreference, type ThemePreference } from '../lib/theme-preference'

interface ThemeContextValue {
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: PropsWithChildren) {
  const [preference, setPreferenceState] = useState(readThemePreference)
  const setPreference = useCallback((nextPreference: ThemePreference) => {
    persistThemePreference(nextPreference)
    setPreferenceState(nextPreference)
  }, [])

  return (
    <ThemeContext.Provider value={{ preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemePreference() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useThemePreference must be used within ThemeProvider')
  return context
}
