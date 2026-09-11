import { useEffect } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import { MarkdownContent } from '../components/MarkdownContent'
import { ApiRequestError } from '../lib/http'
import { getQuizResult, retryWrongQuiz, selfCheckQuizQuestion, type QuizQuestionResult } from '../lib/quiz-api'
import { defaultQuizSearch } from '../lib/quiz-search'
import { hasUnresolvedSelfCheck } from '../lib/quiz-result'

function labelFor(question: QuizQuestionResult) {
  if (question.questionType === 'MULTIPLE_CHOICE') return question.correctChoiceKey ? `정답 선택지: ${question.correctChoiceKey}` : '정답 선택지 없음'
  if (question.questionType === 'SHORT_ANSWER') return question.acceptedAnswers.length > 0 ? `허용 답안: ${question.acceptedAnswers.join(', ')}` : '허용 답안 없음'
  return '모범 답안'
}

function sourceLabel(source: string) {
  return ({ STANDARD: '일반 문제', WRONG_RETRY: '오답 다시 풀기', REVIEW: '복습' } as Record<string, string>)[source] ?? source
}

function QuestionResultCard({ quizId, question }: { quizId: number; question: QuizQuestionResult }) {
  const queryClient = useQueryClient()
  const selfCheckMutation = useMutation({
    mutationFn: (correct: boolean) => selfCheckQuizQuestion(quizId, question.questionId, correct),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['quiz-result', quizId] }),
  })
  const finalized = question.gradingStatus === 'GRADED' || question.gradingStatus === 'SELF_CHECKED'
  const stateLabel = question.gradingStatus === 'SELF_CHECK_REQUIRED' ? '자기 채점 대기' : question.correct ? '정답' : question.gradingStatus === 'UNANSWERED' ? '미답변' : '오답'
  return (
    <article className={`quiz-result-question ${question.correct === true ? 'correct' : question.correct === false ? 'wrong' : 'pending'}`} data-self-check-target={question.gradingStatus === 'SELF_CHECK_REQUIRED' ? 'true' : undefined}>
      <div className="section-heading"><span className="chip">Q{question.position + 1}</span><span className={`result-status result-status-${question.correct === true ? 'correct' : question.correct === false ? 'wrong' : 'pending'}`}>{stateLabel}</span></div>
      <MarkdownContent className="quiz-prompt">{question.promptMarkdown}</MarkdownContent>
      <p className="helper-text">내 답안: {question.selectedChoiceKey ?? question.answerText ?? '제출하지 않음'}</p>
      {question.gradingStatus === 'SELF_CHECK_REQUIRED' ? <div className="self-check-actions"><span className="helper-text">모범 답안과 비교해 직접 판정하세요.</span><button className="secondary-button" type="button" disabled={selfCheckMutation.isPending} onClick={() => selfCheckMutation.mutate(true)}>맞았어요</button><button className="secondary-button" type="button" disabled={selfCheckMutation.isPending} onClick={() => selfCheckMutation.mutate(false)}>틀렸어요</button></div> : finalized && <div className="result-answer"><strong>{labelFor(question)}</strong>{question.modelAnswer && <MarkdownContent>{question.modelAnswer}</MarkdownContent>}</div>}
      {question.explanationMarkdown && <details><summary>해설 보기</summary><MarkdownContent>{question.explanationMarkdown}</MarkdownContent></details>}
      {question.concepts.length > 0 && <div className="chip-row">{question.concepts.map((concept) => <Link className="chip text-link" key={concept.id} to="/concepts/$conceptId" params={{ conceptId: String(concept.id) }}>{concept.title}</Link>)}</div>}
    </article>
  )
}

function QuizResultRecovery({ quizId, error }: { quizId: number; error: unknown }) {
  if (error instanceof ApiRequestError && error.status === 409) {
    return (
      <section className="page-section quiz-page result-recovery-page">
        <div className="state-card result-recovery-card">
          <p className="eyebrow">아직 풀이 중</p>
          <h1>문제 풀이를 먼저 마무리해 주세요.</h1>
          <p>제출이 끝난 뒤에 정답, 오답, 해설과 복습 항목을 확인할 수 있습니다.</p>
          <div className="result-recovery-actions">
            <Link className="primary-button" to="/quiz/$quizId" params={{ quizId: String(quizId) }}>계속 풀기</Link>
            <Link className="secondary-button" to="/quiz" search={defaultQuizSearch}>다른 문제 만들기</Link>
          </div>
        </div>
      </section>
    )
  }

  if (error instanceof ApiRequestError && error.status === 404) {
    return (
      <section className="page-section quiz-page result-recovery-page">
        <div className="state-card result-recovery-card">
          <p className="eyebrow">결과 없음</p>
          <h1>이 문제 풀이 기록을 찾을 수 없습니다.</h1>
          <p>삭제되었거나 존재하지 않는 Quiz일 수 있습니다. 새 문제를 시작해 주세요.</p>
          <div className="result-recovery-actions">
            <Link className="primary-button" to="/quiz" search={defaultQuizSearch}>새 문제 시작</Link>
          </div>
        </div>
      </section>
    )
  }

  return null
}

export function QuizResultPage() {
  const { quizId: quizIdParam } = useParams({ from: '/quiz/$quizId/result' })
  const quizId = Number(quizIdParam)
  const navigate = useNavigate({ from: '/quiz/$quizId/result' })
  const resultQuery = useQuery({ queryKey: ['quiz-result', quizId], queryFn: () => getQuizResult(quizId), enabled: Number.isSafeInteger(quizId) && quizId > 0 })
  const retryMutation = useMutation({ mutationFn: () => retryWrongQuiz(quizId), onSuccess: (quiz) => void navigate({ to: '/quiz/$quizId', params: { quizId: String(quiz.quizId) } }) })

  useEffect(() => {
    document.title = '문제 풀이 결과 · CSForge'
    return () => { document.title = 'CSForge' }
  }, [])

  if (!Number.isSafeInteger(quizId) || quizId <= 0) return <ErrorState message="유효하지 않은 문제 풀이입니다." onRetry={() => window.history.back()} />
  if (resultQuery.isPending) return <PageSkeleton rows={5} />
  if (resultQuery.isError || !resultQuery.data) {
    const recovery = <QuizResultRecovery quizId={quizId} error={resultQuery.error} />
    if (resultQuery.error instanceof ApiRequestError && (resultQuery.error.status === 409 || resultQuery.error.status === 404)) return recovery
    return <ErrorState message="문제 풀이 결과를 불러오지 못했습니다." onRetry={() => void resultQuery.refetch()} />
  }

  const result = resultQuery.data
  const hasPendingSelfCheck = hasUnresolvedSelfCheck(result.selfCheckPending)
  const accuracyLabel = result.accuracy === null ? '—' : `${Math.round(result.accuracy * 100)}%`
  const focusFirstSelfCheck = () => {
    const target = document.querySelector<HTMLElement>('[data-self-check-target="true"]')
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => target.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus(), 0)
  }

  return (
    <section className="page-section quiz-page">
      <div className="page-heading"><div><p className="eyebrow">풀이 결과 · {sourceLabel(result.source)}</p><h1>문제 풀이 결과</h1><p className="lead">정답과 해설을 확인하고, 자기채점 문항을 마무리하세요.</p></div></div>
      <div className="quiz-result-summary">
        <div className="quiz-accuracy-card"><span>정확도</span><strong>{accuracyLabel}</strong><p>정답 {result.correct} · 오답 {result.wrong}</p></div>
        <div className="quiz-result-stat-grid">
          <div><span>전체</span><strong>{result.total}</strong></div>
          <div><span>정답</span><strong>{result.correct}</strong></div>
          <div><span>오답</span><strong>{result.wrong}</strong></div>
          <div><span>미답변</span><strong>{result.unanswered}</strong></div>
          <div className={result.selfCheckPending > 0 ? 'pending-stat' : ''}><span>자기 채점</span><strong>{result.selfCheckPending}</strong></div>
        </div>
      </div>
      {hasPendingSelfCheck && <section className="self-check-banner" aria-labelledby="self-check-banner-title">
        <div>
          <p className="eyebrow">다음 단계</p>
          <strong id="self-check-banner-title">자기채점 {result.selfCheckPending}문항이 남아 있습니다.</strong>
          <span>모든 자기채점을 완료하면 틀린 문항 다시 풀기를 시작할 수 있습니다.</span>
        </div>
        <button className="secondary-button" type="button" onClick={focusFirstSelfCheck}>자기채점 계속하기</button>
      </section>}
      {result.breakdown.length > 0 && <section className="detail-section"><p className="eyebrow">주제별 결과</p><div className="quiz-breakdown-list">{result.breakdown.map((item) => <div className="quiz-breakdown" key={`${item.areaSlug}:${item.topicSlug}`}><div><strong>{item.topicTitle}</strong><span>{item.areaName}</span></div><span>{item.correct}/{item.total}개 정답</span></div>)}</div></section>}
      <section className="detail-section"><div className="section-heading"><p className="eyebrow">문항별 결과</p><span className="result-count">{result.questions.length}개</span></div><div className="quiz-result-list">{result.questions.map((question) => <QuestionResultCard key={question.questionId} quizId={quizId} question={question} />)}</div></section>
      <div className="quiz-result-actions">
        <div className="result-next-actions">
          <button className="primary-button" type="button" disabled={hasPendingSelfCheck || result.wrong + result.unanswered === 0 || retryMutation.isPending} onClick={() => retryMutation.mutate()}>{retryMutation.isPending ? '준비 중…' : '틀린 문항만 다시 풀기'}</button>
          <Link className="secondary-button" to="/wrong-notes" search={{ page: 0, area: '', topic: '', level: '', difficulty: '', status: '', review: 'ALL', analysis: 'ALL', sort: 'RECENT' }}>오답 노트 보기</Link>
          <Link className="secondary-button" to="/review" search={{ page: 0, due: 'ALL' }}>복습 일정 보기</Link>
          <Link className="text-button" to="/quiz" search={defaultQuizSearch}>새 문제</Link>
        </div>
        {result.selfCheckPending > 0 && <span className="helper-text error-text">위 자기 채점을 모두 완료하면 다시 풀 수 있습니다.</span>}
        {result.selfCheckPending === 0 && result.wrong + result.unanswered === 0 && <span className="helper-text">다시 풀 문제는 없습니다. 관련 개념을 복습해 보세요.</span>}
        {retryMutation.isError && <span className="helper-text error-text">다시 풀기를 시작하지 못했습니다.</span>}
      </div>
    </section>
  )
}
