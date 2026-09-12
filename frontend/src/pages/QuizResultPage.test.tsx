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

describe('QuizResultPage', () => {
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

  it('shows the actual selected and correct choice content with the explanation', () => {
    mocks.result.data = {
      quizId: 41,
      status: 'COMPLETED',
      source: 'STANDARD',
      total: 1,
      correct: 0,
      wrong: 1,
      unanswered: 0,
      selfCheckPending: 0,
      accuracy: 0,
      breakdown: [],
      questions: [{
        questionId: 9,
        position: 0,
        promptMarkdown: '다음 코드의 결과를 고르세요.',
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 'MEDIUM',
        concepts: [{ id: 3, slug: 'pass-by-value', title: 'Pass-by-value', areaSlug: 'java', areaName: 'Java', level: 1 }],
        choices: [
          { choiceKey: 'A', contentMarkdown: '`caller`의 변수도 새 객체를 가리킨다.' },
          { choiceKey: 'B', contentMarkdown: '매개변수의 **복사된 참조 값만** 재대입된다.' },
        ],
        selectedChoiceKey: 'A',
        answerText: null,
        reviewNeeded: false,
        gradingStatus: 'GRADED',
        correct: false,
        correctChoiceKey: 'B',
        acceptedAnswers: [],
        modelAnswer: null,
        explanationMarkdown: 'Java는 참조형도 **참조 값 자체를 복사**해 전달합니다.',
        answeredAt: '2026-09-12T00:00:00Z',
        gradedAt: '2026-09-12T00:00:01Z',
      }],
    }

    const markup = renderToStaticMarkup(<QuizResultPage />)

    expect(markup).toContain('선택지 A')
    expect(markup).toContain('caller')
    expect(markup).toContain('선택지 B')
    expect(markup).toContain('복사된 참조 값만')
    expect(markup).toContain('왜 이렇게 판단하나')
    expect(markup).toContain('관련 개념 다시 보기')
  })

  it('shows the model answer before self-check actions', () => {
    mocks.result.data = {
      quizId: 41,
      status: 'SUBMITTED',
      source: 'STANDARD',
      total: 1,
      correct: 0,
      wrong: 0,
      unanswered: 0,
      selfCheckPending: 1,
      accuracy: null,
      breakdown: [],
      questions: [{
        questionId: 11,
        position: 0,
        promptMarkdown: '두 상태의 차이를 설명하세요.',
        questionType: 'DESCRIPTIVE',
        difficulty: 'MEDIUM',
        concepts: [],
        choices: [],
        selectedChoiceKey: null,
        answerText: '내가 작성한 설명',
        reviewNeeded: false,
        gradingStatus: 'SELF_CHECK_REQUIRED',
        correct: null,
        correctChoiceKey: null,
        acceptedAnswers: [],
        modelAnswer: '핵심 상태 변화가 포함된 **모범 답안**',
        explanationMarkdown: '상태가 바뀌는 시점을 기준으로 비교합니다.',
        answeredAt: '2026-09-12T00:00:00Z',
        gradedAt: null,
      }],
    }

    const markup = renderToStaticMarkup(<QuizResultPage />)

    expect(markup).toContain('내가 작성한 설명')
    expect(markup).toContain('모범 답안')
    expect(markup).toContain('내 답과 모범 답안을 비교한 뒤 직접 판정하세요.')
    expect(markup).toContain('맞았어요')
    expect(markup).toContain('틀렸어요')
  })
})
