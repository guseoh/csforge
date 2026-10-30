import { describe, expect, it } from 'vitest'
import { isReleaseMismatch } from './release-identity'

const current = '9be62d0444ac3f8105159d320b7c9691d06fa44c'
const previous = '8fa2fa44' + '0'.repeat(32)

describe('PWA release identity', () => {
  it('identifies a stale frontend against the deployed build identity', () => {
    expect(isReleaseMismatch(previous, { sourceSha: current })).toBe(true)
    expect(isReleaseMismatch(current, { sourceSha: current })).toBe(false)
  })

  it('does not mistake offline, local or malformed responses for version drift', () => {
    expect(isReleaseMismatch('UNKNOWN', { sourceSha: current })).toBe(false)
    expect(isReleaseMismatch(current, { sourceSha: 'UNKNOWN' })).toBe(false)
    expect(isReleaseMismatch(current, null)).toBe(false)
    expect(isReleaseMismatch(current, { error: 'unavailable' })).toBe(false)
  })
})
