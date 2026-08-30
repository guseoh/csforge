import { useEffect } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import { getQuizResult, retryWrongQuiz, selfCheckQuizQuestion, type QuizQuestionResult } from '../lib/api'
import { defaultQuizSearch } from '../lib/quiz-search'

function labelFor(question: QuizQuestionResult) {
  if (question.questionType === 'MULTIPLE_CHOICE') return question.correctChoiceKey ? `정답 선택지: ${question.correctChoiceKey}` : '정답 선택지 없음'
  if (question.questionType === 'SHORT_ANSWER') return question.acceptedAnswers.length > 0 ? `허용 답안: ${question.acceptedAnswers.join(', ')}` : '허용 답안 없음'
  return '모범 답안'
}

function QuestionResultCard({ quizId, question }: { quizId: number; question: QuizQuestionResult }) {
  const queryClient = useQueryClient()
  const selfCheckMutation = useMutation({
    mutationFn: (correct: boolean) => selfCheckQuizQuestion(quizId, question.questionId, correct),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['quiz-result', quizId] }),
  })
  const finalized = question.gradingStatus === 'GRADED' || question.gradingStatus === 'SELF_CHECKED'
  const stateLabel = question.gradingStatus === 'SELF_CHECK_REQUIRED' ? 'Self-check pending' : question.correct ? 'Correct' : question.gradingStatus === 'UNANSWERED' ? 'Unanswered' : 'Wrong'
  return (
    <article className={`quiz-result-question ${question.correct === true ? 'correct' : question.correct === false ? 'wrong' : 'pending'}`}>
      <div className="section-heading"><span className="chip">Q{question.position + 1}</span><strong>{stateLabel}</strong></div>
      <div className="markdown-content quiz-prompt"><ReactMarkdown remarkPlugins={[remarkGfm]}>{question.promptMarkdown}</ReactMarkdown></div>
      <p className="helper-text">내 답안: {question.selectedChoiceKey ?? question.answerText ?? '제출하지 않음'}</p>
      {question.gradingStatus === 'SELF_CHECK_REQUIRED' ? <div className="self-check-actions"><span className="helper-text">모범 답안과 비교해 직접 판정하세요.</span><button className="secondary-button" type="button" disabled={selfCheckMutation.isPending} onClick={() => selfCheckMutation.mutate(true)}>맞았어요</button><button className="secondary-button" type="button" disabled={selfCheckMutation.isPending} onClick={() => selfCheckMutation.mutate(false)}>틀렸어요</button></div> : finalized && <div className="result-answer"><strong>{labelFor(question)}</strong>{question.modelAnswer && <div className="markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{question.modelAnswer}</ReactMarkdown></div>}</div>}
      {question.explanationMarkdown && <details><summary>해설 보기</summary><div className="markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{question.explanationMarkdown}</ReactMarkdown></div></details>}
      {question.concepts.length > 0 && <div className="chip-row">{question.concepts.map((concept) => <Link className="chip text-link" key={concept.id} to="/concepts/$conceptId" params={{ conceptId: String(concept.id) }}>{concept.title}</Link>)}</div>}
    </article>
  )
}

export function QuizResultPage() {
  const { quizId: quizIdParam } = useParams({ from: '/quiz/$quizId/result' })
  const quizId = Number(quizIdParam)
  const navigate = useNavigate({ from: '/quiz/$quizId/result' })
  const resultQuery = useQuery({ queryKey: ['quiz-result', quizId], queryFn: () => getQuizResult(quizId), enabled: Number.isSafeInteger(quizId) && quizId > 0 })
  const retryMutation = useMutation({ mutationFn: () => retryWrongQuiz(quizId), onSuccess: (quiz) => void navigate({ to: '/quiz/$quizId', params: { quizId: String(quiz.quizId) } }) })

  useEffect(() => {
    document.title = 'Quiz result · CSForge'
    return () => { document.title = 'CSForge' }
  }, [])

  if (!Number.isSafeInteger(quizId) || quizId <= 0) return <ErrorState message="유효하지 않은 Quiz입니다." onRetry={() => window.history.back()} />
  if (resultQuery.isPending) return <PageSkeleton rows={5} />
  if (resultQuery.isError || !resultQuery.data) return <ErrorState message="Quiz 결과를 불러오지 못했습니다." onRetry={() => void resultQuery.refetch()} />
  const result = resultQuery.data
  const accuracyLabel = result.accuracy === null ? '—' : `${Math.round(result.accuracy * 100)}%`
  return (
    <section className="page-section quiz-page">
      <div className="page-heading"><div><p className="eyebrow">Quiz result</p><h1>Review your run.</h1><p className="lead">정답과 해설을 확인하고, 자기채점 문항을 마무리하세요.</p></div><Link className="secondary-button" to="/quiz" search={defaultQuizSearch}>새 Quiz</Link></div>
      <div className="quiz-stat-grid"><div><span>Total</span><strong>{result.total}</strong></div><div><span>Correct</span><strong>{result.correct}</strong></div><div><span>Wrong</span><strong>{result.wrong}</strong></div><div><span>Unanswered</span><strong>{result.unanswered}</strong></div><div><span>Accuracy</span><strong>{accuracyLabel}</strong></div><div><span>Self-check</span><strong>{result.selfCheckPending}</strong></div></div>
      {result.breakdown.length > 0 && <section className="detail-section"><p className="eyebrow">By topic</p><div className="quiz-breakdown-list">{result.breakdown.map((item) => <div className="quiz-breakdown" key={`${item.areaSlug}:${item.topicSlug}`}><div><strong>{item.topicTitle}</strong><span>{item.areaName}</span></div><span>{item.correct}/{item.total} correct</span></div>)}</div></section>}
      <section className="detail-section"><div className="section-heading"><p className="eyebrow">Questions</p><span className="result-count">{result.questions.length}</span></div><div className="quiz-result-list">{result.questions.map((question) => <QuestionResultCard key={question.questionId} quizId={quizId} question={question} />)}</div></section>
      <div className="quiz-result-actions"><button className="primary-button" type="button" disabled={result.selfCheckPending > 0 || result.wrong + result.unanswered === 0 || retryMutation.isPending} onClick={() => retryMutation.mutate()}>{retryMutation.isPending ? '준비 중…' : '틀린 문항만 다시 풀기'}</button>{result.selfCheckPending > 0 && <span className="helper-text">Retry 전에 self-check를 모두 완료하세요.</span>}{retryMutation.isError && <span className="helper-text error-text">Retry를 시작하지 못했습니다.</span>}</div>
    </section>
  )
}
