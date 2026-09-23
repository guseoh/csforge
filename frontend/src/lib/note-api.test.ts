import { afterEach, describe, expect, it, vi } from 'vitest'
import { savePersonalNote } from './learning-api'
import { saveWrongNote } from './wrong-note-api'

describe('note keepalive requests', () => {
  afterEach(() => vi.unstubAllGlobals())

  it.each([
    ['Concept', () => savePersonalNote(12, 'draft', { keepalive: true }), '/api/concepts/12/note'],
    ['Wrong Note', () => saveWrongNote(34, 'draft', { keepalive: true }), '/api/wrong-notes/34/note'],
  ])('%s save retains CSRF and credentials through the shared request helper', async (_label, save, path) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ content: 'draft', updatedAt: 'now' }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('document', { cookie: 'XSRF-TOKEN=csrf%2Btoken' })

    await save()

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(path)
    expect(init.keepalive).toBe(true)
    expect(init.credentials).toBe('same-origin')
    expect((init.headers as Headers).get('X-XSRF-TOKEN')).toBe('csrf+token')
    expect((init.headers as Headers).get('Content-Type')).toBe('application/json')
  })
})
