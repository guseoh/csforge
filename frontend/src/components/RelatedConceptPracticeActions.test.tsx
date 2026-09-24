import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiRequestError } from '../lib/http'

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  mutation: { isPending: false, isError: false, error: null as unknown, variables: null as { id: number } | null, mutate: vi.fn() },
  options: null as null | { onSuccess?: (quiz: { quizId: number }) => void },
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, className }: { children: ReactNode; className?: string }) => <a className={className}>{children}</a>,
  useNavigate: () => mocks.navigate,
}))

vi.mock('@tanstack/react-query', () => ({
  useMutation: (options: typeof mocks.options) => {
    mocks.options = options
    return mocks.mutation
  },
}))

import { RelatedConceptPracticeActions } from './RelatedConceptPracticeActions'

const concepts = [
  { id: 3, slug: 'concept', title: '관련 개념', areaSlug: 'java', areaName: 'Java', level: 1 },
  { id: 4, slug: 'other-concept', title: '다른 개념', areaSlug: 'java', areaName: 'Java', level: 2 },
]

describe('RelatedConceptPracticeActions', () => {
  beforeEach(() => {
    mocks.navigate.mockReset()
    mocks.mutation.isPending = false
    mocks.mutation.isError = false
    mocks.mutation.error = null
    mocks.mutation.variables = null
    mocks.mutation.mutate.mockReset()
    mocks.options = null
  })

  it('offers concept navigation and disables the practice action while creating a quiz', () => {
    mocks.mutation.isPending = true

    const markup = renderToStaticMarkup(<RelatedConceptPracticeActions questionId={9} concepts={concepts} linkLabel={() => '개념 보기'} />)

    expect(markup).toContain('개념 보기')
    expect(markup.match(/disabled=""/g)).toHaveLength(2)
    expect(markup).toContain('준비 중…')
  })

  it('shows a clear empty-state message when no related questions are available', () => {
    mocks.mutation.isError = true
    mocks.mutation.error = new ApiRequestError('No other questions', 422, 'QUIZ_NO_RELATED_QUESTIONS')
    mocks.mutation.variables = concepts[0]

    const markup = renderToStaticMarkup(<RelatedConceptPracticeActions questionId={9} concepts={concepts} />)

    expect(markup).toContain('이 개념에는 지금 풀 수 있는 다른 문제가 없습니다.')
  })

  it('navigates to the created quiz after practice succeeds', () => {
    renderToStaticMarkup(<RelatedConceptPracticeActions questionId={9} concepts={concepts} />)
    mocks.options?.onSuccess?.({ quizId: 55 })

    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/quiz/$quizId', params: { quizId: '55' } })
  })
})
