import { describe, expect, it } from 'vitest'
import { keepLatestToasts } from './ToastProvider'

describe('toast queue', () => {
  it('keeps at most the latest three messages', () => {
    const first = { id: 1, tone: 'success' as const, message: 'one' }
    const second = { id: 2, tone: 'success' as const, message: 'two' }
    const third = { id: 3, tone: 'error' as const, message: 'three' }
    const fourth = { id: 4, tone: 'success' as const, message: 'four' }
    expect(keepLatestToasts([first, second, third], fourth).map((toast) => toast.id)).toEqual([2, 3, 4])
  })
})
