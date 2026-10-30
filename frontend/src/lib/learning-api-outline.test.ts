import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ request: vi.fn() }))

vi.mock('./http', () => ({ request: mocks.request }))

import { getLearningAreaOutline } from './learning-api'

describe('getLearningAreaOutline', () => {
  beforeEach(() => mocks.request.mockReset())

  it('requests a bounded curriculum page from the outline endpoint', async () => {
    const page = { items: [], page: { page: 2, size: 200, totalElements: 405, totalPages: 3, hasNext: false, hasPrevious: true } }
    mocks.request.mockResolvedValue(page)

    await expect(getLearningAreaOutline('java', 2)).resolves.toBe(page)
    expect(mocks.request).toHaveBeenCalledWith('/api/learning-areas/java/outline?page=2&size=200')
  })
})
