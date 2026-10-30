import { describe, expect, it } from 'vitest'
import { isStaleLazyChunkError } from './route-errors'

describe('isStaleLazyChunkError', () => {
  it('recognizes stale dynamic route chunk failures', () => {
    expect(isStaleLazyChunkError(new TypeError('Failed to fetch dynamically imported module: /assets/AreaPage-old.js'))).toBe(true)
    expect(isStaleLazyChunkError(new Error('Loading chunk 17 failed'))).toBe(true)
    expect(isStaleLazyChunkError(new Error('Request failed with status 500'))).toBe(false)
  })
})
