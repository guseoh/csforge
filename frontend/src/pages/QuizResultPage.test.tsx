import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiRequestError } from '../lib/http'
import type { QuizQuestionResult } from '../lib/quiz-api'

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

function resultQuestion(overrides: Partial<QuizQuestionResult> = {}): QuizQuestionResult {
  return {
    questionId: 1,
    position: 0,
    promptMarkdown: '테스트 문항',
    questionType: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    concepts: [],
    choices: [],
    selectedChoiceKey: 'A',
    answerText: null,
    reviewNeeded: false,
    gradingStatus: 'GRADED',
    correct: false,
    correctChoiceKey: 'B',
    acceptedAnswers: [],
    modelAnswer: null,
    explanationMarkdown: null,
    answeredAt: '2026-09-12T00:00:00Z',
    gradedAt: '2026-09-12T00:00:01Z',
    ...overrides,
  }
}

function renderSubmittedResult(
  questions: QuizQuestionResult[],
  counts: { correct: number; wrong: number; unanswered: number; selfCheckPending?: number },
) {
  const selfCheckPending = counts.selfCheckPending ?? 0
  const finalizedCount = counts.correct + counts.wrong + counts.unanswered
  mocks.result.data = {
    quizId: 41,
    status: selfCheckPending > 0 ? 'SUBMITTED' : 'COMPLETED',
    source: 'STANDARD',
    total: questions.length,
    correct: counts.correct,
    wrong: counts.wrong,
    unanswered: counts.unanswered,
    selfCheckPending,
    accuracy: finalizedCount === 0 ? null : counts.correct / finalizedCount,
    breakdown: [],
    questions,
  }

  return renderToStaticMarkup(<QuizResultPage />)
}

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
          { choiceKey: 'A', contentMarkdown: '`caller`의 변수도 새 객체를 가리킨다.', rationaleMarkdown: '선택지 A의 근거' },
          { choiceKey: 'B', contentMarkdown: '매개변수의 **복사된 참조 값만** 재대입된다.', rationaleMarkdown: '정답 선택지의 근거' },
          { choiceKey: 'C', contentMarkdown: '다른 결과를 낸다.', rationaleMarkdown: '세 번째 선택지의 근거' },
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
    expect(markup).toContain('이 선택지가 틀린 이유')
    expect(markup).toContain('<span class="result-status result-status-wrong">오답</span>')
    expect(markup).toContain('선택지 A의 근거')
    expect(markup).toContain('이 선택지가 맞는 이유')
    expect(markup).toContain('정답 선택지의 근거')
    expect(markup).toContain('나머지 선택지 이유 보기')
    expect(markup).toContain('세 번째 선택지의 근거')
    expect(markup).toContain('<details class="choice-rationale-disclosure">')
    expect(markup).toContain('왜 이렇게 판단하나')
    expect(markup).toContain('관련 개념 다시 보기')
    expect(markup).toContain('이 문제 다시 풀기')
    expect(markup).toContain('이 개념 다른 문제 풀기')
    expect(markup.indexOf('왜 이렇게 판단하나')).toBeLessThan(markup.indexOf('이 문제 다시 풀기'))
  })

  it('keeps concept navigation on correct results without adding retry actions', () => {
    mocks.result.data = {
      quizId: 41,
      status: 'COMPLETED',
      source: 'STANDARD',
      total: 1,
      correct: 1,
      wrong: 0,
      unanswered: 0,
      selfCheckPending: 0,
      accuracy: 1,
      breakdown: [],
      questions: [{
        questionId: 12,
        position: 0,
        promptMarkdown: '정답 문제입니다.',
        questionType: 'SHORT_ANSWER',
        difficulty: 'EASY',
        concepts: [{ id: 4, slug: 'concept', title: '관련 Concept', areaSlug: 'java', areaName: 'Java', level: 1 }],
        choices: [],
        selectedChoiceKey: null,
        answerText: '정답',
        reviewNeeded: false,
        gradingStatus: 'GRADED',
        correct: true,
        correctChoiceKey: null,
        acceptedAnswers: ['정답'],
        modelAnswer: null,
        explanationMarkdown: '정답 해설',
        answeredAt: null,
        gradedAt: null,
      }],
    }

    const markup = renderToStaticMarkup(<QuizResultPage />)

    expect(markup).toContain('관련 Concept')
    expect(markup).not.toContain('이 문제 다시 풀기')
    expect(markup).not.toContain('이 개념 다른 문제 풀기')
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

    expect(markup).toContain('확정 0문항 중 0개 정답 · 자기채점 1개 대기')
    expect(markup).toContain('내가 작성한 설명')
    expect(markup).toContain('모범 답안')
    expect(markup).toContain('내 답과 모범 답안을 비교한 뒤 직접 판정하세요.')
    expect(markup).toContain('자기채점 대기')
    expect(markup).toContain('맞았어요')
    expect(markup).toContain('틀렸어요')
  })

  it('labels partial accuracy with the finalized denominator', () => {
    mocks.result.data = {
      quizId: 41,
      status: 'SUBMITTED',
      source: 'STANDARD',
      total: 4,
      correct: 1,
      wrong: 1,
      unanswered: 1,
      selfCheckPending: 1,
      accuracy: 1 / 3,
      breakdown: [],
      questions: [],
    }

    const markup = renderToStaticMarkup(<QuizResultPage />)

    expect(markup).toContain('<strong>33%</strong>')
    expect(markup).toContain('확정 3문항 중 1개 정답 · 자기채점 1개 대기')
    expect(markup).not.toContain('1/4개 정답')
  })

  it('keeps legacy result content readable when every choice rationale is null', () => {
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
        questionId: 13,
        position: 0,
        promptMarkdown: '기존 문제',
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 'EASY',
        concepts: [],
        choices: [
          { choiceKey: 'A', contentMarkdown: '내 답', rationaleMarkdown: null },
          { choiceKey: 'B', contentMarkdown: '정답', rationaleMarkdown: null },
        ],
        selectedChoiceKey: 'A',
        answerText: null,
        reviewNeeded: false,
        gradingStatus: 'GRADED',
        correct: false,
        correctChoiceKey: 'B',
        acceptedAnswers: [],
        modelAnswer: null,
        explanationMarkdown: '기존 핵심 해설',
        answeredAt: null,
        gradedAt: null,
      }],
    }

    const markup = renderToStaticMarkup(<QuizResultPage />)

    expect(markup).toContain('기존 핵심 해설')
    expect(markup).not.toContain('choice-rationale')
    expect(markup).not.toContain('이 선택지가 틀린 이유')
    expect(markup).not.toContain('이 선택지가 맞는 이유')
  })

  it('labels a submitted unanswered multiple-choice question as unanswered, not wrong', () => {
    const markup = renderSubmittedResult([
      resultQuestion({ selectedChoiceKey: null, gradingStatus: 'GRADED', correct: false }),
    ], { correct: 0, wrong: 0, unanswered: 1 })

    expect(markup).toContain('<span class="result-status result-status-unanswered">미답변</span>')
    expect(markup).not.toContain('<span class="result-status result-status-wrong">오답</span>')
    expect(markup).toContain('<div><span>오답</span><strong>0</strong></div>')
    expect(markup).toContain('<div><span>미답변</span><strong>1</strong></div>')
    expect(markup).toContain('미답변 다시 풀기')
  })

  it('labels a submitted blank text answer as unanswered, not wrong', () => {
    const markup = renderSubmittedResult([
      resultQuestion({ questionType: 'SHORT_ANSWER', selectedChoiceKey: null, answerText: '  ', gradingStatus: 'GRADED', correct: false }),
    ], { correct: 0, wrong: 0, unanswered: 1 })

    expect(markup).toContain('<span class="result-status result-status-unanswered">미답변</span>')
    expect(markup).not.toContain('<span class="result-status result-status-wrong">오답</span>')
    expect(markup).toContain('미답변 다시 풀기')
  })

  it('keeps answered wrong and unanswered questions separate while retrying both', () => {
    const markup = renderSubmittedResult([
      resultQuestion({ questionId: 31, position: 0 }),
      resultQuestion({ questionId: 32, position: 1, selectedChoiceKey: null }),
    ], { correct: 0, wrong: 1, unanswered: 1 })

    expect(markup).toContain('<span class="result-status result-status-wrong">오답</span>')
    expect(markup).toContain('<span class="result-status result-status-unanswered">미답변</span>')
    expect(markup.match(/class="quiz-result-question /g)).toHaveLength(2)
    expect(markup).toContain('<div><span>오답</span><strong>1</strong></div>')
    expect(markup).toContain('<div><span>미답변</span><strong>1</strong></div>')
    expect(markup).toContain('오답·미답변 다시 풀기')
  })
})
