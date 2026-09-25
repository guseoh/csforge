export type ThemePreference = 'system' | 'light' | 'dark'

export const THEME_STORAGE_KEY = 'csforge.theme.v1'

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark'
}

export function readThemePreference(storage?: Pick<Storage, 'getItem'>): ThemePreference {
  try {
    const saved = (storage ?? window.localStorage).getItem(THEME_STORAGE_KEY)
    return isThemePreference(saved) ? saved : 'system'
  } catch {
    return 'system'
  }
}

export function applyThemePreference(
  preference: ThemePreference,
  root: Pick<HTMLElement, 'setAttribute' | 'removeAttribute'> = document.documentElement,
) {
  if (preference === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', preference)
  }
}

export function persistThemePreference(
  preference: ThemePreference,
  root: Pick<HTMLElement, 'setAttribute' | 'removeAttribute'> = document.documentElement,
  storage?: Pick<Storage, 'setItem'>,
) {
  applyThemePreference(preference, root)
  try {
    const targetStorage = storage ?? window.localStorage
    targetStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // The current page still follows the selected preference if storage is unavailable.
  }
}
