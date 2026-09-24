import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { ApiRequestError } from '../lib/http'
import { practiceRelatedConceptQuiz, type QuizConcept } from '../lib/quiz-api'

/** 관련 Concept을 다시 열거나 다른 문제를 시작할 수 있는 액션을 제공한다. */
export function RelatedConceptPracticeActions({
  questionId,
  concepts,
  linkClassName = 'text-link',
  linkLabel,
}: {
  questionId: number
  concepts: QuizConcept[]
  linkClassName?: string
  linkLabel?: (concept: QuizConcept) => string
}) {
  const navigate = useNavigate()
  const practiceMutation = useMutation({
    mutationFn: (concept: QuizConcept) => practiceRelatedConceptQuiz(questionId, concept.id),
    onSuccess: (quiz) => void navigate({ to: '/quiz/$quizId', params: { quizId: String(quiz.quizId) } }),
  })
  const noRelatedQuestions = practiceMutation.error instanceof ApiRequestError
    && practiceMutation.error.code === 'QUIZ_NO_RELATED_QUESTIONS'

  return (
    <div className="related-concept-practice-list">
      {concepts.map((concept) => {
        const failed = practiceMutation.isError && practiceMutation.variables?.id === concept.id
        return (
          <div className="related-concept-practice-action" key={concept.id}>
            <Link className={linkClassName} to="/concepts/$conceptId" params={{ conceptId: String(concept.id) }}>
              {linkLabel?.(concept) ?? concept.title}
            </Link>
            <button
              className="secondary-button related-concept-practice-button"
              type="button"
              disabled={practiceMutation.isPending}
              onClick={() => practiceMutation.mutate(concept)}
            >
              {practiceMutation.isPending ? '준비 중…' : '이 개념 다른 문제 풀기'}
            </button>
            {failed && (
              <span className="helper-text error-text" role="status">
                {noRelatedQuestions ? '이 개념에는 지금 풀 수 있는 다른 문제가 없습니다.' : '다른 문제를 시작하지 못했습니다. 다시 시도해 주세요.'}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
