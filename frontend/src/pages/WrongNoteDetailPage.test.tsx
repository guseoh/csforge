import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  session: { data: { mode: 'CLOUD' }, isPending: false, isError: false, refetch: vi.fn() },
  detail: { data: null as unknown, isPending: false, isError: false, refetch: vi.fn() },
  attempts: {
    data: { pages: [{ items: [], nextCursor: null }] },
    hasNextPage: false,
    isPending: false,
    isError: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    refetch: vi.fn(),
    fetchNextPage: vi.fn(),
  },
  navigate: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
  useNavigate: () => mocks.navigate,
  useParams: () => ({ questionId: '9' }),
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: (string | number)[] }) => queryKey[0] === 'auth-session'
    ? mocks.session
    : queryKey[0] === 'wrong-note'
      ? mocks.detail
      : { data: null, isPending: false, isError: false, refetch: vi.fn() },
  useInfiniteQuery: () => mocks.attempts,
  useMutation: () => ({ isPending: false, isError: false, mutate: vi.fn() }),
}))

vi.mock('../components/MarkdownContent', () => ({
  MarkdownContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('../components/toast/ToastProvider', () => ({ useToast: () => ({ showToast: vi.fn() }) }))

vi.mock('../lib/use-wrong-note-persistence', () => ({
  useWrongNotePersistence: () => ({
    note: '',
    dirty: false,
    updateNote: vi.fn(),
    noteMutation: { isError: false, isPending: false },
  }),
}))

import { WrongNoteDetailPage } from './WrongNoteDetailPage'

function detail(rationaleMarkdown: string | null, includeOtherRationales = true) {
  const concepts = [{ id: 3, slug: 'concept', title: '관련 개념', areaSlug: 'java', areaName: 'Java', level: 1 }]
  return {
    question: {
      id: 9,
      promptMarkdown: '다음 중 맞는 설명을 고르세요.',
      questionType: 'MULTIPLE_CHOICE',
      difficulty: 'MEDIUM',
      explanationMarkdown: '기존 전체 해설',
      choices: [
        { choiceKey: 'A', contentMarkdown: '정답 내용', rationaleMarkdown },
        { choiceKey: 'B', contentMarkdown: '내가 고른 오답 내용', rationaleMarkdown: includeOtherRationales ? '선택한 오답의 근거' : null },
        { choiceKey: 'C', contentMarkdown: '다른 선택지 내용', rationaleMarkdown: includeOtherRationales ? '나머지 선택지의 근거' : null },
      ],
    },
    concepts,
    latestWrongAttempt: {
      attemptId: 21,
      quizId: 17,
      source: 'STANDARD',
      selectedChoiceKey: 'B',
      selectedChoiceContentMarkdown: '내가 고른 오답 내용',
      answerText: null,
      gradingStatus: 'GRADED',
      correct: false,
      reviewNeeded: false,
      answeredAt: '2026-09-23T00:00:00Z',
      gradedAt: '2026-09-23T00:00:01Z',
    },
    answer: {
      correctChoiceKey: 'A',
      correctChoiceContentMarkdown: '정답 내용',
      acceptedAnswers: [],
      modelAnswer: null,
    },
    state: {
      status: 'ACTIVE',
      wrongCount: 1,
      firstWrongAt: '2026-09-23T00:00:00Z',
      lastWrongAt: '2026-09-23T00:00:00Z',
      causeNote: null,
      reviewStatus: 'SCHEDULED',
      reviewStage: 1,
      dueAt: '2026-09-24T00:00:00Z',
    },
  }
}

describe('WrongNoteDetailPage', () => {
  beforeEach(() => {
    mocks.session.data = { mode: 'CLOUD' }
    mocks.detail.data = detail('정답 선택지의 근거')
    mocks.detail.isPending = false
    mocks.detail.isError = false
    mocks.navigate.mockReset()
  })

  it('shows selected and correct rationale while disclosing the remaining choice rationale', () => {
    const markup = renderToStaticMarkup(<WrongNoteDetailPage />)

    expect(markup).toContain('이 선택지가 틀린 이유')
    expect(markup).toContain('선택한 오답의 근거')
    expect(markup).toContain('이 선택지가 맞는 이유')
    expect(markup).toContain('정답 선택지의 근거')
    expect(markup).toContain('<details class="choice-rationale-disclosure">')
    expect(markup).toContain('나머지 선택지의 근거')
    expect(markup).toContain('기존 전체 해설')
    expect(markup).toContain('왜 틀렸을까요?')
    expect(markup).toContain('관련 개념')
    expect(markup).toContain('이 문제 다시 풀기')
  })

  it('keeps null-rationale wrong notes readable without empty rationale sections', () => {
    mocks.detail.data = detail(null, false)

    const markup = renderToStaticMarkup(<WrongNoteDetailPage />)

    expect(markup).toContain('기존 전체 해설')
    expect(markup).toContain('내가 고른 오답 내용')
    expect(markup).not.toContain('choice-rationale')
    expect(markup).not.toContain('이 선택지가 맞는 이유')
  })
})
