import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  practiceQuestion: vi.fn(),
  mutation: { isPending: false, isError: false, mutate: vi.fn() },
  options: null as unknown,
}))

vi.mock('@tanstack/react-router', () => ({ useNavigate: () => mocks.navigate }))
vi.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => {
    mocks.options = options
    return mocks.mutation
  },
}))
vi.mock('../lib/quiz-api', () => ({ practiceQuestion: mocks.practiceQuestion }))

import { QuestionPracticeAction } from './QuestionPracticeAction'

describe('QuestionPracticeAction', () => {
  beforeEach(() => {
    mocks.navigate.mockReset()
    mocks.practiceQuestion.mockReset()
    mocks.mutation.isPending = false
    mocks.mutation.isError = false
    mocks.mutation.mutate.mockReset()
    mocks.options = null
  })

  it('uses push navigation so browser Back returns to the search page', async () => {
    mocks.practiceQuestion.mockResolvedValue({ quizId: 55 })
    renderToStaticMarkup(<QuestionPracticeAction questionId={42} />)

    const options = mocks.options as {
      mutationFn: (questionId: number) => Promise<unknown>
      onSuccess: (quiz: { quizId: number }) => void
    }
    await options.mutationFn(42)
    options.onSuccess({ quizId: 55 })

    expect(mocks.practiceQuestion).toHaveBeenCalledWith(42)
    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/quiz/$quizId', params: { quizId: '55' } })
  })

  it('disables duplicate requests while starting and gives a retryable error state', () => {
    mocks.mutation.isPending = true
    const pendingMarkup = renderToStaticMarkup(<QuestionPracticeAction questionId={42} />)
    expect(pendingMarkup).toContain('disabled=""')
    expect(pendingMarkup).toContain('준비 중…')

    mocks.mutation.isPending = false
    mocks.mutation.isError = true
    const failedMarkup = renderToStaticMarkup(<QuestionPracticeAction questionId={42} />)
    expect(failedMarkup).toContain('문제를 시작하지 못했습니다. 다시 시도해 주세요.')
    expect(failedMarkup).toContain('문제 풀기')
  })
})
