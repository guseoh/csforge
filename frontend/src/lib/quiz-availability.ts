export type QuizAvailabilityState = 'LOADING' | 'READY' | 'INSUFFICIENT' | 'ERROR'

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
