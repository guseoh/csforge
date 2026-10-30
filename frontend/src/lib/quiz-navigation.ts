export type QuizNavigationState = 'CURRENT' | 'ANSWERED' | 'UNANSWERED' | 'REVIEW_NEEDED'

interface QuizNavigationInput {
  isCurrent: boolean
  selectedChoiceKey: string | null | undefined
  answerText: string | null | undefined
  reviewNeeded: boolean | undefined
}

/** Quiz 문항 탐색 버튼이 현재 위치와 답변 상태를 함께 표현하도록 분류한다. */
export function classifyQuizNavigation({
  isCurrent,
  selectedChoiceKey,
  answerText,
  reviewNeeded,
}: QuizNavigationInput): QuizNavigationState {
  if (isCurrent) return 'CURRENT'
  if (reviewNeeded) return 'REVIEW_NEEDED'
  if (Boolean(selectedChoiceKey || answerText?.trim())) return 'ANSWERED'
  return 'UNANSWERED'
}

export function quizNavigationLabel(state: QuizNavigationState) {
  if (state === 'CURRENT') return '현재'
  if (state === 'ANSWERED') return '답변 완료'
  if (state === 'REVIEW_NEEDED') return '복습 필요'
  return '미답변'
}
