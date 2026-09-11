import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiRequestError } from '../lib/http'

const mocks = vi.hoisted(() => ({
  result: { data: null as unknown, error: null as unknown, isPending: false, isError: false, refetch: vi.fn() },
  navigate: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
  useNavigate: () => mocks.navigate,
  useParams: () => ({ quizId: '41' }),
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => mocks.result,
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useMutation: () => ({ isPending: false, isError: false, mutate: vi.fn() }),
}))

import { QuizResultPage } from './QuizResultPage'

describe('QuizResultPage recovery', () => {
  beforeEach(() => {
    mocks.result.data = null
    mocks.result.error = null
    mocks.result.isPending = false
    mocks.result.isError = false
    mocks.result.refetch.mockReset()
    mocks.navigate.mockReset()
  })

  it('offers to resume an in-progress quiz when result access conflicts', () => {
    mocks.result.isError = true
    mocks.result.error = new ApiRequestError('Quiz must be submitted before its result is available', 409, 'QUIZ_INVALID_STATE')

    const markup = renderToStaticMarkup(<QuizResultPage />)

    expect(markup).toContain('아직 풀이 중')
    expect(markup).toContain('문제 풀이를 먼저 마무리해 주세요.')
    expect(markup).toContain('계속 풀기')
  })

  it('shows a new-quiz action when the quiz no longer exists', () => {
    mocks.result.isError = true
    mocks.result.error = new ApiRequestError('Quiz not found', 404, 'QUIZ_NOT_FOUND')

    const markup = renderToStaticMarkup(<QuizResultPage />)

    expect(markup).toContain('이 문제 풀이 기록을 찾을 수 없습니다.')
    expect(markup).toContain('새 문제 시작')
  })
})
