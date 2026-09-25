export type QuizAvailabilityState = 'LOADING' | 'READY' | 'INSUFFICIENT' | 'ERROR'

/** Concept 연습에 가용 문항이 더 적으면 양수 범위에서 생성 수만 줄인다. */
export function effectiveQuizCount(requestedCount: number, availableCount: number | undefined, isConceptScoped: boolean) {
  if (!isConceptScoped || availableCount === undefined || availableCount <= 0 || availableCount >= requestedCount) {
    return requestedCount
  }

  return availableCount
}

export function quizAvailabilityState(
  availableCount: number | undefined,
  requestedCount: number,
  isPending: boolean,
  isError: boolean,
): QuizAvailabilityState {
  if (isPending) return 'LOADING'
  if (isError) return 'ERROR'
  if (availableCount === undefined) return 'LOADING'
  return availableCount >= requestedCount ? 'READY' : 'INSUFFICIENT'
}

export function canStartQuiz(state: QuizAvailabilityState, isCreating: boolean) {
  return state === 'READY' && !isCreating
}
