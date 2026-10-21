import type { ReviewScheduleStatus, WrongNoteAttempt } from './wrong-note-api'

/** Display schedule state without treating a missing due date as mastery. */
export function wrongNoteReviewLabel(status: ReviewScheduleStatus | null, dueAt: string | null) {
  if (status === 'MASTERED') return '복습 완료'
  if (status !== 'SCHEDULED' || !dueAt) return status === 'SCHEDULED' ? '복습 날짜 확인 필요' : '복습 일정 없음'
  return `복습 예정 · ${new Date(dueAt).toLocaleDateString('ko-KR')}`
}

/** A pending self-check is not a finalized wrong or correct answer. */
export function wrongNoteAttemptOutcome(attempt: Pick<WrongNoteAttempt, 'gradingStatus' | 'correct'>) {
  if (attempt.gradingStatus === 'SELF_CHECK_REQUIRED') return '자기채점 대기'
  if (attempt.gradingStatus === 'UNANSWERED') return '미답변'
  if (attempt.correct === true) return '정답'
  if (attempt.correct === false) return '오답'
  return '판정 확인 필요'
}

export function wrongNoteAttemptAnswer(attempt: Pick<WrongNoteAttempt, 'selectedChoiceKey' | 'answerText'>) {
  if (attempt.selectedChoiceKey) return `선택한 답: ${attempt.selectedChoiceKey}`
  if (attempt.answerText?.trim()) return `작성한 답: ${attempt.answerText.trim()}`
  return '답안 미입력'
}
