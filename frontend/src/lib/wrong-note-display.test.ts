import { describe, expect, it } from 'vitest'
import { wrongNoteAttemptAnswer, wrongNoteAttemptOutcome, wrongNoteReviewLabel } from './wrong-note-display'

describe('Wrong Note display semantics', () => {
  it('distinguishes no schedule, scheduled date and mastery', () => {
    expect(wrongNoteReviewLabel(null, null)).toBe('복습 일정 없음')
    expect(wrongNoteReviewLabel('SCHEDULED', null)).toBe('복습 날짜 확인 필요')
    expect(wrongNoteReviewLabel('SCHEDULED', '2026-10-22T00:00:00Z')).toContain('복습 예정')
    expect(wrongNoteReviewLabel('MASTERED', null)).toBe('복습 완료')
  })

  it('keeps unresolved self-check distinct from finalized wrong answers', () => {
    expect(wrongNoteAttemptOutcome({ gradingStatus: 'SELF_CHECK_REQUIRED', correct: false })).toBe('자기채점 대기')
    expect(wrongNoteAttemptOutcome({ gradingStatus: 'GRADED', correct: false })).toBe('오답')
    expect(wrongNoteAttemptOutcome({ gradingStatus: 'SELF_CHECKED', correct: true })).toBe('정답')
    expect(wrongNoteAttemptOutcome({ gradingStatus: 'UNANSWERED', correct: false })).toBe('미답변')
  })

  it('shows the historical answer rather than only grading status', () => {
    expect(wrongNoteAttemptAnswer({ selectedChoiceKey: 'B', answerText: null })).toBe('선택한 답: B')
    expect(wrongNoteAttemptAnswer({ selectedChoiceKey: null, answerText: '내 근거' })).toBe('작성한 답: 내 근거')
    expect(wrongNoteAttemptAnswer({ selectedChoiceKey: null, answerText: ' ' })).toBe('답안 미입력')
  })
})
