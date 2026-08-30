import { describe, expect, it, vi } from 'vitest'
import { ApiRequestError, applyImports, previewImports } from './api'

describe('content import API flow', () => {
  it('maps preview requests and multipart files', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ previewDigest: 'digest', canApply: false }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const file = new Blob(['{}'], { type: 'application/json' }) as File

    await expect(previewImports([file])).resolves.toEqual({ previewDigest: 'digest', canApply: false })

    expect(fetchMock).toHaveBeenCalledWith('/api/imports/preview', expect.objectContaining({ method: 'POST', body: expect.any(FormData) }))
    const form = fetchMock.mock.calls[0][1].body as FormData
    expect(form.getAll('files')).toHaveLength(1)
  })

  it('exposes stale apply responses for preview recovery', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'Preview is stale' }), { status: 409 })))
    const file = new Blob(['{}'], { type: 'application/json' }) as File

    await expect(applyImports([file], 'old-digest')).rejects.toEqual(expect.objectContaining({
      name: 'ApiRequestError',
      status: 409,
    } satisfies Partial<ApiRequestError>))
  })
})
