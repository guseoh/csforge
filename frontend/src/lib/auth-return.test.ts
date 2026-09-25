import { describe, expect, it } from 'vitest'
import {
  clearAuthReturnLocation,
  consumeAuthReturnLocation,
  storeAuthReturnLocation,
} from './auth-return'

const STORAGE_KEY = 'csforge.auth-return.v1'
const NOW = 1_800_000_000_000

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) },
    has: (key: string) => values.has(key),
    seed: (key: string, value: string) => { values.set(key, value) },
  }
}

describe('auth return location', () => {
  it('preserves path, search, and hash once', () => {
    const storage = memoryStorage()
    expect(storeAuthReturnLocation({ path: '/concepts/12', search: '?tab=notes', hash: '#references' }, storage, NOW)).toBe(true)
    expect(JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}')).toEqual({
      path: '/concepts/12', search: '?tab=notes', hash: '#references', savedAt: NOW,
    })
    expect(consumeAuthReturnLocation(storage, NOW)).toBe('/concepts/12?tab=notes#references')
    expect(consumeAuthReturnLocation(storage, NOW)).toBeNull()
  })

  it('adds the hash delimiter when the router provides a bare fragment', () => {
    const storage = memoryStorage()
    expect(storeAuthReturnLocation({ path: '/concepts/12', search: '', hash: 'references' }, storage, NOW)).toBe(true)
    expect(consumeAuthReturnLocation(storage, NOW)).toBe('/concepts/12#references')
  })

  it.each([
    'https://example.com',
    '//example.com/path',
    '///example.com/path',
    '/\\\\example.com/path',
    '/login',
  ])('rejects unsafe path %s', (path) => {
    const storage = memoryStorage()
    expect(storeAuthReturnLocation({ path, search: '', hash: '' }, storage, NOW)).toBe(false)
    expect(storage.has(STORAGE_KEY)).toBe(false)
    expect(consumeAuthReturnLocation(storage, NOW)).toBeNull()
  })

  it.each(['https://example.com', '//example.com/path', '/\\\\example.com/path', '/login'])('rejects unsafe persisted path %s', (path) => {
    const storage = memoryStorage()
    storage.seed(STORAGE_KEY, JSON.stringify({ path, search: '', hash: '', savedAt: NOW }))
    expect(consumeAuthReturnLocation(storage, NOW)).toBeNull()
    expect(storage.has(STORAGE_KEY)).toBe(false)
  })

  it('removes invalid, expired, future, and malformed values when consumed', () => {
    const storage = memoryStorage()
    const stale = { path: '/review', search: '', hash: '', savedAt: NOW - 30 * 60 * 1000 - 1 }
    storage.seed(STORAGE_KEY, JSON.stringify(stale))
    expect(consumeAuthReturnLocation(storage, NOW)).toBeNull()
    expect(storage.has(STORAGE_KEY)).toBe(false)

    storage.seed(STORAGE_KEY, JSON.stringify({ ...stale, savedAt: NOW + 1 }))
    expect(consumeAuthReturnLocation(storage, NOW)).toBeNull()

    storage.seed(STORAGE_KEY, '{invalid json')
    expect(consumeAuthReturnLocation(storage, NOW)).toBeNull()
    expect(storage.has(STORAGE_KEY)).toBe(false)
  })

  it('clears the stored location explicitly', () => {
    const storage = memoryStorage()
    storeAuthReturnLocation({ path: '/review', search: '', hash: '' }, storage, NOW)
    clearAuthReturnLocation(storage)
    expect(storage.has(STORAGE_KEY)).toBe(false)
  })
})
