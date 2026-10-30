import { afterEach, describe, expect, it, vi } from 'vitest'
import { request } from './http'

describe('공통 HTTP 요청 계층', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('state-changing request에 쿠키 CSRF 토큰을 헤더로 전달한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: { cookie: 'XSRF-TOKEN=csrf%2Btoken' },
    })

    await request<void>('/api/concepts/1/view', { method: 'POST' })

    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect((init.headers as Headers).get('X-XSRF-TOKEN')).toBe('csrf+token')
    expect(init.credentials).toBe('same-origin')
  })
})
