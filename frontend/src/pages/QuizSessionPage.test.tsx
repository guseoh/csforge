import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  query: { data: null as unknown, isPending: false, isError: false, refetch: vi.fn() },
  mutation: { isPending: false, isError: false, mutate: vi.fn() },
  mutationOptions: null as unknown,
  persistence: null as unknown,
  getQuizSession: vi.fn(),
  getQuizResult: vi.fn(),
  submitQuiz: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
  useNavigate: () => mocks.navigate,
  useParams: () => ({ quizId: '41' }),
}))
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => mocks.query,
  useMutation: (options: unknown) => {
    mocks.mutationOptions = options
    return mocks.mutation
  },
}))
vi.mock('../lib/quiz-api', () => ({
  getQuizResult: mocks.getQuizResult,
  getQuizSession: mocks.getQuizSession,
  submitQuiz: mocks.submitQuiz,
}))
vi.mock('../lib/use-quiz-session-persistence', () => ({
  emptyQuizDraft: { selectedChoiceKey: null, answerText: null, reviewNeeded: false, answeredAt: null },
  useQuizSessionPersistence: () => mocks.persistence,
}))
vi.mock('../components/MarkdownContent', () => ({
  MarkdownContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import { QuizSessionPage } from './QuizSessionPage'

describe('QuizSessionPage submit recovery', () => {
  beforeEach(() => {
    mocks.navigate.mockReset()
    mocks.query = {
      data: {
        quizId: 41,
        status: 'IN_PROGRESS',
        source: 'STANDARD',
        startedAt: '2026-09-01T00:00:00Z',
        submittedAt: null,
        completedAt: null,
        expiresAt: null,
        expired: false,
        lastPosition: 0,
        answeredCount: 0,
        questions: [{
          questionId: 22,
          position: 0,
          promptMarkdown: 'A question',
          questionType: 'MULTIPLE_CHOICE',
          difficulty: 'EASY',
          concepts: [],
          choices: [{ choiceKey: 'A', contentMarkdown: 'Answer A' }],
          answer: null,
        }],
      },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    }
    mocks.mutation.isPending = false
    mocks.mutation.isError = false
    mocks.mutationOptions = null
    mocks.submitQuiz.mockReset()
    mocks.getQuizResult.mockReset()
    mocks.getQuizSession.mockReset()
    mocks.persistence = {
      position: 0,
      drafts: {},
      draft: { selectedChoiceKey: null, answerText: null, reviewNeeded: false, answeredAt: null },
      question: (mocks.query.data as { questions: unknown[] }).questions[0],
      saveStates: {},
      failedQuestionIds: [],
      savingCount: 0,
      localDraftUnavailable: false,
      positionSaveError: false,
      updateDraft: vi.fn(),
      flushAllDirtyAnswers: vi.fn(async () => undefined),
      retryQuestionSave: vi.fn(),
      clearLocalDrafts: vi.fn(),
      moveTo: vi.fn(),
    }
  })

  it('opens the result when submit committed but its response was lost', async () => {
    mocks.submitQuiz.mockRejectedValue(new Error('response lost'))
    mocks.getQuizResult.mockResolvedValue({ quizId: 41, status: 'COMPLETED' })
    renderToStaticMarkup(<QuizSessionPage />)

    const options = mocks.mutationOptions as {
      mutationFn: () => Promise<unknown>
      onError: () => Promise<void>
    }
    await expect(options.mutationFn()).rejects.toThrow('response lost')
    await options.onError()

    expect(mocks.getQuizResult).toHaveBeenCalledWith(41)
    expect(mocks.persistence && (mocks.persistence as { clearLocalDrafts: ReturnType<typeof vi.fn> }).clearLocalDrafts).toHaveBeenCalled()
    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/quiz/$quizId/result', params: { quizId: '41' } })
  })
})
