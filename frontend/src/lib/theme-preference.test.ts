import { describe, expect, it } from 'vitest'
import {
  applyThemePreference,
  isThemePreference,
  persistThemePreference,
  readThemePreference,
  THEME_STORAGE_KEY,
} from './theme-preference'

describe('theme preference', () => {
  function memoryStorage(initial: Record<string, string> = {}) {
    const values = new Map(Object.entries(initial))
    return {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value) },
    }
  }

  it('uses system preference when storage is missing or invalid', () => {
    expect(readThemePreference(memoryStorage())).toBe('system')
    expect(readThemePreference(memoryStorage({ [THEME_STORAGE_KEY]: 'sepia' }))).toBe('system')
    expect(readThemePreference(memoryStorage({ [THEME_STORAGE_KEY]: 'dark' }))).toBe('dark')
    expect(readThemePreference({ getItem: () => { throw new Error('storage blocked') } })).toBe('system')
    expect(isThemePreference('dark')).toBe(true)
    expect(isThemePreference('sepia')).toBe(false)
  })

  it('persists an explicit preference and applies it before returning', () => {
    let attribute: string | null = null
    const root = {
      setAttribute: (_name: string, value: string) => { attribute = value },
      removeAttribute: () => { attribute = null },
    }
    const storage = memoryStorage()

    persistThemePreference('dark', root, storage)
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(attribute).toBe('dark')

    applyThemePreference('system', root)
    expect(attribute).toBeNull()

    persistThemePreference('light', root, { setItem: () => { throw new Error('storage blocked') } })
    expect(attribute).toBe('light')
  })
})
