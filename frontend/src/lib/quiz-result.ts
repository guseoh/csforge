import type { QuizQuestionResult } from './quiz-api'

/** Quiz 결과 화면에서 자기채점 후속 조치가 필요한지 판단한다. */
export function hasUnresolvedSelfCheck(selfCheckPending: number) {
  return selfCheckPending > 0
}

/** 제출 후 gradingStatus가 바뀌어도 실제 답안이 제출됐는지 판정한다. */
export function hasSubmittedAnswer(question: Pick<QuizQuestionResult, 'questionType' | 'selectedChoiceKey' | 'answerText'>) {
  if (question.questionType === 'MULTIPLE_CHOICE') {
    return question.selectedChoiceKey !== null
  }

  return Boolean(question.answerText?.trim())
}
