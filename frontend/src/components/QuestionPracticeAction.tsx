import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { practiceQuestion } from '../lib/quiz-api'
import { useIdempotencyKey } from '../lib/use-idempotency-key'

/** 공개 문제를 한 문항 퀴즈로 시작하는 액션이다. */
export function QuestionPracticeAction({ questionId }: { questionId: number }) {
  const navigate = useNavigate()
  const creationRequest = useIdempotencyKey()
  const practiceMutation = useMutation({
    mutationFn: (id: number) => practiceQuestion(
      id,
      creationRequest.requestIdFor({ operation: 'question-practice', questionId: id }),
    ),
    onSuccess: (quiz) => {
      creationRequest.clear()
      void navigate({ to: '/quiz/$quizId', params: { quizId: String(quiz.quizId) } })
    },
  })

  return (
    <>
      <button
        className="primary-button"
        type="button"
        disabled={practiceMutation.isPending}
        onClick={() => practiceMutation.mutate(questionId)}
      >
        {practiceMutation.isPending ? '준비 중…' : '문제 풀기'}
      </button>
      {practiceMutation.isError && (
        <span className="helper-text error-text" role="status">문제를 시작하지 못했습니다. 다시 시도해 주세요.</span>
      )}
    </>
  )
}
