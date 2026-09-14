import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import { MarkdownContent } from '../components/MarkdownContent'
import { WrongAnswerAnalysisCard } from '../components/WrongAnswerAnalysisCard'
import { useToast } from '../components/toast/ToastProvider'
import { getAuthSession } from '../lib/auth-api'
import {
  getWrongNote,
  getWrongNoteAiAnalysis,
  getWrongNoteAttempts,
  requestWrongNoteAiAnalysis,
  retryWrongNote,
  retryWrongNoteAiAnalysis,
} from '../lib/wrong-note-api'
import { wrongAnswerAnalysisPollingInterval } from '../lib/wrong-answer-analysis'
import { defaultWrongNoteSearch } from '../lib/wrong-note-search'
import { useWrongNotePersistence } from '../lib/use-wrong-note-persistence'

const questionTypeLabels = { MULTIPLE_CHOICE: '객관식', SHORT_ANSWER: '단답형', DESCRIPTIVE: '서술형', SCENARIO: '시나리오' }
const difficultyLabels = { EASY: '쉬움', MEDIUM: '보통', HARD: '어려움' }
const gradingStatusLabels: Record<string, string> = { GRADED: '채점 완료', SELF_CHECKED: '자기 채점 완료', SELF_CHECK_REQUIRED: '자기 채점 대기', UNANSWERED: '미답변' }
const sourceLabels: Record<string, string> = { STANDARD: '일반 문제', WRONG_RETRY: '오답 다시 풀기', REVIEW: '복습' }

function sourceLabel(source: string) {
  return sourceLabels[source] ?? '문제 풀이'
}

function ConceptContext({ concepts }: { concepts: { id: number; title: string; areaName: string; level: number }[] }) {
  if (concepts.length === 0) return <p className="concept-context-empty">연결된 개념이 없습니다.</p>
  return (
    <div className="concept-context-list">
      {concepts.map((concept) => (
        <Link key={concept.id} to="/concepts/$conceptId" params={{ conceptId: String(concept.id) }}>
          <span>{concept.title}</span>
          <small>{concept.areaName} · 레벨 {concept.level}</small>
        </Link>
      ))}
    </div>
  )
}

export function WrongNoteDetailPage() {
  const { questionId } = useParams({ from: '/wrong-notes/$questionId' })
  const id = Number(questionId)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const sessionQuery = useQuery({
    queryKey: ['auth-session'],
    queryFn: getAuthSession,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
  const aiAvailable = sessionQuery.data?.mode === 'LOCAL'
  const detail = useQuery({ queryKey: ['wrong-note', id], queryFn: () => getWrongNote(id) })
  const aiAnalysis = useQuery({
    queryKey: ['wrong-note-ai-analysis', id],
    queryFn: () => getWrongNoteAiAnalysis(id),
    enabled: aiAvailable && Number.isSafeInteger(id) && id > 0,
    refetchInterval: (query) => wrongAnswerAnalysisPollingInterval(query.state.data?.status),
  })
  const attemptsQuery = useInfiniteQuery({
    queryKey: ['wrong-note-attempts', id],
    queryFn: ({ pageParam }) => getWrongNoteAttempts(id, pageParam ?? undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Number.isSafeInteger(id) && id > 0,
  })
  const { note, dirty, updateNote, noteMutation } = useWrongNotePersistence({ id, detail: detail.data })
  const retryMutation = useMutation({
    mutationFn: () => retryWrongNote(id),
    onSuccess: (quiz) => void navigate({ to: '/quiz/$quizId', params: { quizId: String(quiz.quizId) } }),
    onError: () => showToast('error', '이 문제를 다시 시작하지 못했습니다.'),
  })
  const aiRequestMutation = useMutation({
    mutationFn: () => requestWrongNoteAiAnalysis(id),
    onSuccess: () => void aiAnalysis.refetch(),
  })
  const aiRetryMutation = useMutation({
    mutationFn: () => retryWrongNoteAiAnalysis(id),
    onSuccess: () => void aiAnalysis.refetch(),
  })

  if (detail.isPending) return <PageSkeleton rows={5} />
  if (detail.isError) return <ErrorState message="오답 상세를 불러오지 못했습니다." onRetry={() => void detail.refetch()} />

  const item = detail.data
  const analysis = aiAnalysis.data
  const history = attemptsQuery.data?.pages.flatMap((page) => page.items) ?? []
  const hasAttemptHistoryData = attemptsQuery.data !== undefined
  const latestAttempt = item.latestWrongAttempt
  const latestAnswer = latestAttempt?.answerText ?? latestAttempt?.selectedChoiceKey ?? '답변하지 않음'
  const isMultipleChoice = item.question.questionType === 'MULTIPLE_CHOICE'
  const isShortAnswer = item.question.questionType === 'SHORT_ANSWER'
  const hasAcceptedAnswers = item.answer.acceptedAnswers.length > 0
  const hasModelAnswer = Boolean(item.answer.modelAnswer)

  return (
    <section className="page-section wrong-note-detail">
      <div className="breadcrumb">
        <Link to="/wrong-notes" search={defaultWrongNoteSearch}>오답 노트</Link>
        <span>›</span><span>문제 {item.question.id}</span>
      </div>

      <header className="wrong-note-detail-hero">
        <div className="wrong-note-detail-copy">
          <h1 className="wrong-note-detail-kicker">오답 복습</h1>
          <div className="wrong-note-detail-meta" aria-label="문제 정보">
            <span>{questionTypeLabels[item.question.questionType]}</span>
            <span>·</span>
            <span>{difficultyLabels[item.question.difficulty]}</span>
          </div>
          <MarkdownContent className="detail-question-prompt wrong-note-detail-prompt">{item.question.promptMarkdown}</MarkdownContent>
          <ConceptContext concepts={item.concepts} />
        </div>
        <button className="primary-button" onClick={() => retryMutation.mutate()} disabled={retryMutation.isPending}>이 문제 다시 풀기</button>
      </header>

      <div className="wrong-note-status-row" aria-label="오답 복습 상태">
        <div><span>오답</span><strong>{item.state.wrongCount}회</strong></div>
        <div><span>복습 단계</span><strong>{item.state.reviewStage ?? '—'}</strong></div>
        <div><span>다음 복습</span><strong>{item.state.dueAt ? new Date(item.state.dueAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '정리 완료'}</strong></div>
      </div>

      <section className="detail-section wrong-note-recovery-section">
        <div className="section-heading wrong-note-recovery-heading">
          <div>
            <p className="eyebrow">틀린 지점 확인</p>
            <h2>내 답과 정답 비교</h2>
          </div>
          {latestAttempt && <span className="chip state-badge state-active">{gradingStatusLabels[latestAttempt.gradingStatus] ?? latestAttempt.gradingStatus}</span>}
        </div>

        <div className="wrong-note-answer-comparison">
          <article className="wrong-note-answer-panel wrong-note-answer-user">
            <span className="wrong-note-answer-label">내 답</span>
            <p className="wrong-note-answer-value">{latestAnswer}</p>
            <small>{latestAttempt ? `${sourceLabel(latestAttempt.source)} · ${latestAttempt.answeredAt ? new Date(latestAttempt.answeredAt).toLocaleString('ko-KR') : '답변 시간 없음'}` : '최근 오답 기록이 없습니다.'}</small>
          </article>

          <article className="wrong-note-answer-panel wrong-note-answer-correct">
            <span className="wrong-note-answer-label">{isMultipleChoice || isShortAnswer ? '정답' : '모범 답안'}</span>
            {isMultipleChoice && item.answer.correctChoiceKey && <p className="wrong-note-answer-value">정답 선택지 {item.answer.correctChoiceKey}</p>}
            {isShortAnswer && hasAcceptedAnswers && <p className="wrong-note-answer-value">{item.answer.acceptedAnswers.join(', ')}</p>}
            {!isMultipleChoice && !isShortAnswer && hasModelAnswer && <MarkdownContent className="wrong-note-model-answer">{item.answer.modelAnswer!}</MarkdownContent>}
            {(isMultipleChoice || isShortAnswer) && hasModelAnswer && <MarkdownContent className="wrong-note-model-answer wrong-note-model-answer-secondary">{item.answer.modelAnswer!}</MarkdownContent>}
            {!item.answer.correctChoiceKey && !hasAcceptedAnswers && !hasModelAnswer && <p className="helper-text">등록된 정답 정보가 없습니다.</p>}
          </article>
        </div>

        {item.question.explanationMarkdown && (
          <div className="wrong-note-explanation">
            <p className="eyebrow">해설</p>
            <MarkdownContent>{item.question.explanationMarkdown}</MarkdownContent>
          </div>
        )}
      </section>

      <section className="detail-section wrong-note-reflection-section">
        <p className="eyebrow">개인 메모</p>
        <h2>왜 틀렸을까요?</h2>
        <p className="helper-text">실수 원인과 다음 풀이에서 확인할 기준을 짧게 남겨두세요.</p>
        <textarea rows={5} value={note} onChange={(event) => updateNote(event.target.value)} placeholder="실수 원인과 다음에 확인할 점을 적어보세요." />
        <p className={`save-state ${noteMutation.isError ? 'error' : noteMutation.isPending ? 'saving' : dirty ? 'saving' : 'saved'}`}>{noteMutation.isError ? '저장 실패' : noteMutation.isPending ? '저장 중…' : dirty ? '변경 사항 저장 대기 중' : '저장됨'} · Ctrl/Cmd+S</p>
      </section>

      <section className="detail-section related-learning-section wrong-note-secondary-section">
        <div className="section-heading">
          <div><p className="eyebrow">이어 학습하기</p><h2>관련 개념</h2></div>
          <span className="helper-text">필요한 개념만 다시 확인해 보세요.</span>
        </div>
        <ConceptContext concepts={item.concepts} />
      </section>

      {aiAvailable && <section className="detail-section ai-analysis-section wrong-note-secondary-section">
        <div className="section-heading"><div><p className="eyebrow">학습 보조</p><h2>AI 오답 분석</h2></div>{analysis?.status === 'COMPLETED' && <span className="chip status-completed">완료</span>}</div>
        {aiAnalysis.isPending
          ? <p className="helper-text">AI 분석 상태를 확인하는 중입니다…</p>
          : aiAnalysis.isError
            ? <ErrorState message="AI 분석 상태를 불러오지 못했습니다." onRetry={() => void aiAnalysis.refetch()} />
            : analysis
              ? (
                <WrongAnswerAnalysisCard
                  analysis={analysis}
                  requestPending={aiRequestMutation.isPending}
                  requestError={aiRequestMutation.isError}
                  retryPending={aiRetryMutation.isPending}
                  retryError={aiRetryMutation.isError}
                  onRequest={() => aiRequestMutation.mutate()}
                  onRetry={() => aiRetryMutation.mutate()}
                />
              )
              : null}
      </section>}

      <details className="detail-section wrong-note-history-disclosure">
        <summary>
          <div><p className="eyebrow">풀이 기록</p><h2>시도 이력</h2></div>
          <span className="result-count">{history.length > 0 ? `${history.length}개` : '보기'}</span>
        </summary>
        <div className="wrong-note-history-content">
          {attemptsQuery.isPending ? <div className="state-card" aria-busy="true">시도 기록을 불러오는 중입니다…</div> : attemptsQuery.isError && !hasAttemptHistoryData ? <ErrorState message="시도 기록을 불러오지 못했습니다." onRetry={() => void attemptsQuery.refetch()} /> : history.length === 0 ? <div className="state-card"><strong>아직 시도 기록이 없습니다.</strong><span>이 문제를 푼 기록이 생기면 여기에 시간순으로 쌓입니다.</span></div> : <div className="history-list">{history.map((attempt) => <div className="history-row" key={attempt.attemptId}><strong>{attempt.correct === true ? '정답' : attempt.correct === false ? '오답' : gradingStatusLabels[attempt.gradingStatus] ?? attempt.gradingStatus}</strong><span>{sourceLabel(attempt.source)} · {gradingStatusLabels[attempt.gradingStatus] ?? attempt.gradingStatus}</span><time>{new Date(attempt.updatedAt).toLocaleString('ko-KR')}</time></div>)}</div>}
          {attemptsQuery.hasNextPage && <div className="load-more-row"><button className="secondary-button" type="button" disabled={attemptsQuery.isFetchingNextPage} onClick={() => void attemptsQuery.fetchNextPage()}>{attemptsQuery.isFetchingNextPage ? '불러오는 중…' : attemptsQuery.isFetchNextPageError ? '다시 시도' : '더 불러오기'}</button>{attemptsQuery.isFetchNextPageError && <span className="helper-text error-text">추가 기록을 불러오지 못했습니다.</span>}</div>}
        </div>
      </details>
    </section>
  )
}
