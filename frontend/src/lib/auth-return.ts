const AUTH_RETURN_STORAGE_KEY = 'csforge.auth-return.v1'
const AUTH_RETURN_TTL_MS = 30 * 60 * 1000

type AuthReturnLocation = {
  path: string
  search: string
  hash: string
}

type StoredAuthReturnLocation = AuthReturnLocation & {
  savedAt: number
}

type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function isSafeAuthReturnLocation(value: AuthReturnLocation): boolean {
  const { path, search, hash } = value
  const invalidCharacter = /[\\\u0000-\u001f\u007f]/

  return path.startsWith('/')
    && !path.startsWith('//')
    && path !== '/login'
    && !path.includes('?')
    && !path.includes('#')
    && !invalidCharacter.test(path)
    && (search === '' || (search.startsWith('?') && !invalidCharacter.test(search)))
    && (hash === '' || (hash.startsWith('#') && !invalidCharacter.test(hash)))
}

export function storeAuthReturnLocation(
  location: AuthReturnLocation,
  storage?: SessionStorageLike,
  now = Date.now(),
): boolean {
  let targetStorage: SessionStorageLike
  try {
    targetStorage = storage ?? window.sessionStorage
  } catch {
    return false
  }

  const normalizedLocation = {
    ...location,
    hash: location.hash && !location.hash.startsWith('#') ? `#${location.hash}` : location.hash,
  }

  if (!isSafeAuthReturnLocation(normalizedLocation)) {
    clearAuthReturnLocation(targetStorage)
    return false
  }

  try {
    const value: StoredAuthReturnLocation = { ...normalizedLocation, savedAt: now }
    targetStorage.setItem(AUTH_RETURN_STORAGE_KEY, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function consumeAuthReturnLocation(storage?: SessionStorageLike, now = Date.now()): string | null {
  let raw: string | null
  try {
    const targetStorage = storage ?? window.sessionStorage
    raw = targetStorage.getItem(AUTH_RETURN_STORAGE_KEY)
    targetStorage.removeItem(AUTH_RETURN_STORAGE_KEY)
  } catch {
    return null
  }

  if (!raw) return null

  try {
    const value = JSON.parse(raw) as Partial<StoredAuthReturnLocation>
    if (typeof value.path !== 'string'
      || typeof value.search !== 'string'
      || typeof value.hash !== 'string'
      || typeof value.savedAt !== 'number'
      || !Number.isFinite(value.savedAt)
      || value.savedAt > now
      || now - value.savedAt > AUTH_RETURN_TTL_MS
      || !isSafeAuthReturnLocation(value as AuthReturnLocation)) {
      return null
    }

    return `${value.path}${value.search}${value.hash}`
  } catch {
    return null
  }
}

export function clearAuthReturnLocation(storage?: SessionStorageLike) {
  try {
    (storage ?? window.sessionStorage).removeItem(AUTH_RETURN_STORAGE_KEY)
  } catch {
    // A blocked session store must not interrupt login or logout recovery.
  }
}
