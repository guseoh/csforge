import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import { MarkdownContent } from '../components/MarkdownContent'
import { WrongAnswerAnalysisCard } from '../components/WrongAnswerAnalysisCard'
import { useToast } from '../components/toast/ToastProvider'
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

function ConceptContext({ concepts }: { concepts: { id: number; title: string; areaName: string; level: number }[] }) {
  if (concepts.length === 0) return <p className="concept-context-empty">연결된 Concept가 없습니다.</p>
  return (
    <div className="concept-context-list">
      {concepts.map((concept) => (
        <Link key={concept.id} to="/concepts/$conceptId" params={{ conceptId: String(concept.id) }}>
          <span>{concept.title}</span>
          <small>{concept.areaName} · L{concept.level}</small>
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
  const detail = useQuery({ queryKey: ['wrong-note', id], queryFn: () => getWrongNote(id) })
  const aiAnalysis = useQuery({
    queryKey: ['wrong-note-ai-analysis', id],
    queryFn: () => getWrongNoteAiAnalysis(id),
    enabled: Number.isSafeInteger(id),
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

  return (
    <section className="page-section wrong-note-detail">
      <div className="breadcrumb">
        <Link to="/wrong-notes" search={defaultWrongNoteSearch}>오답 노트</Link>
        <span>›</span><span>문제 {item.question.id}</span>
      </div>
      <div className="page-heading">
        <div><p className="eyebrow">{questionTypeLabels[item.question.questionType]} · {difficultyLabels[item.question.difficulty]}</p><h1>오답 문제</h1><MarkdownContent className="detail-question-prompt">{item.question.promptMarkdown}</MarkdownContent><ConceptContext concepts={item.concepts} /></div>
        <button className="primary-button" onClick={() => retryMutation.mutate()} disabled={retryMutation.isPending}>이 문제 다시 풀기</button>
      </div>
      <div className="wrong-note-summary">
        <div><span>오답 횟수</span><strong>{item.state.wrongCount}회</strong></div>
        <div><span>복습 단계</span><strong>{item.state.reviewStage ?? '—'}</strong></div>
        <div><span>다음 복습</span><strong>{item.state.dueAt ? new Date(item.state.dueAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '정리 완료'}</strong></div>
      </div>
      <section className="detail-section study-section"><div className="section-heading"><div><p className="eyebrow">최근 풀이</p><h2>최근 오답</h2></div>{item.latestWrongAttempt && <span className="chip state-badge state-active">{gradingStatusLabels[item.latestWrongAttempt.gradingStatus] ?? item.latestWrongAttempt.gradingStatus}</span>}</div><p className="latest-answer">{item.latestWrongAttempt?.answerText ?? item.latestWrongAttempt?.selectedChoiceKey ?? '답변하지 않음'}</p><p className="helper-text">{item.latestWrongAttempt ? `${item.latestWrongAttempt.source} · ${item.latestWrongAttempt.answeredAt ? new Date(item.latestWrongAttempt.answeredAt).toLocaleString('ko-KR') : '답변 시간 없음'}` : '최근 오답 기록이 없습니다.'}</p></section>
      <section className="detail-section study-section"><p className="eyebrow">정답 데이터</p><h2>정답과 해설</h2><div className="answer-facts"><p><strong>정답 선택지:</strong> {item.answer.correctChoiceKey ?? '—'}</p><p><strong>허용 답안:</strong> {item.answer.acceptedAnswers.join(', ') || '—'}</p></div>{item.answer.modelAnswer ? <MarkdownContent className="answer-block">{item.answer.modelAnswer}</MarkdownContent> : <p className="helper-text">모범 답안이 없습니다.</p>}{item.question.explanationMarkdown ? <MarkdownContent className="answer-block">{item.question.explanationMarkdown}</MarkdownContent> : <p className="helper-text">설명이 없습니다.</p>}</section>
      <section className="detail-section">
        <p className="eyebrow">개인 메모</p><h2>왜 틀렸을까요?</h2>
        <textarea value={note} onChange={(event) => updateNote(event.target.value)} placeholder="실수 원인과 다음에 확인할 점을 적어보세요." />
        <p className={`save-state ${noteMutation.isError ? 'error' : noteMutation.isPending ? 'saving' : dirty ? 'saving' : 'saved'}`}>{noteMutation.isError ? '저장 실패' : noteMutation.isPending ? '저장 중…' : dirty ? '변경 사항 저장 대기 중' : '저장됨'} · Ctrl/Cmd+S</p>
      </section>
      <section className="detail-section related-learning-section">
        <div className="section-heading"><div><p className="eyebrow">이어 학습하기</p><h2>관련 개념</h2></div><span className="helper-text">AI 없이도 바로 이동할 수 있습니다.</span></div>
        <ConceptContext concepts={item.concepts} />
      </section>
      <section className="detail-section ai-analysis-section">
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
      </section>
      <section className="detail-section">
        <div className="section-heading"><div><p className="eyebrow">풀이 기록</p><h2>시도 이력</h2></div>{history.length > 0 && <span className="result-count">{history.length}개</span>}</div>
        {attemptsQuery.isPending ? <div className="state-card" aria-busy="true">시도 기록을 불러오는 중입니다…</div> : attemptsQuery.isError && !hasAttemptHistoryData ? <ErrorState message="시도 기록을 불러오지 못했습니다." onRetry={() => void attemptsQuery.refetch()} /> : history.length === 0 ? <div className="state-card"><strong>아직 시도 기록이 없습니다.</strong><span>이 문제를 푼 기록이 생기면 여기에 시간순으로 쌓입니다.</span></div> : <div className="history-list">{history.map((attempt) => <div className="history-row" key={attempt.attemptId}><strong>{attempt.correct === true ? '정답' : attempt.correct === false ? '오답' : gradingStatusLabels[attempt.gradingStatus] ?? attempt.gradingStatus}</strong><span>{attempt.source} · {gradingStatusLabels[attempt.gradingStatus] ?? attempt.gradingStatus}</span><time>{new Date(attempt.updatedAt).toLocaleString('ko-KR')}</time></div>)}</div>}
        {attemptsQuery.hasNextPage && <div className="load-more-row"><button className="secondary-button" type="button" disabled={attemptsQuery.isFetchingNextPage} onClick={() => void attemptsQuery.fetchNextPage()}>{attemptsQuery.isFetchingNextPage ? '불러오는 중…' : attemptsQuery.isFetchNextPageError ? '다시 시도' : '더 불러오기'}</button>{attemptsQuery.isFetchNextPageError && <span className="helper-text error-text">추가 기록을 불러오지 못했습니다.</span>}</div>}
      </section>
    </section>
  )
}
