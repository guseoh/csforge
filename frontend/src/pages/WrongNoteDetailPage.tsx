import { useEffect, useRef, useState } from 'react'
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
  saveWrongNote,
} from '../lib/api'
import { wrongAnswerAnalysisPollingInterval } from '../lib/wrong-answer-analysis'
import { defaultWrongNoteSearch } from '../lib/wrong-note-search'

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
  const [note, setNote] = useState('')
  const [dirty, setDirty] = useState(false)
  const noteRef = useRef('')
  const dirtyRef = useRef(false)
  const savingRef = useRef(false)
  const pageHidingRef = useRef(false)
  const saveRef = useRef<() => void>(() => {})
  const draftKey = `csforge:wrong-note:${id}:draft`

  const noteMutation = useMutation({
    mutationFn: (content: string) => saveWrongNote(id, content),
    onSuccess: (_saved, content) => {
      savingRef.current = false
      if (noteRef.current === content) {
        dirtyRef.current = false
        setDirty(false)
        window.localStorage.removeItem(draftKey)
        return
      }
      queueMicrotask(() => saveRef.current())
    },
    onError: (_error, content) => {
      savingRef.current = false
      if (noteRef.current !== content) queueMicrotask(() => saveRef.current())
    },
  })
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

  saveRef.current = () => {
    if (!dirtyRef.current || savingRef.current) return
    savingRef.current = true
    noteMutation.mutate(noteRef.current)
  }

  useEffect(() => {
    if (!detail.data || dirtyRef.current) return
    const serverNote = detail.data.state.causeNote ?? ''
    const draft = window.localStorage.getItem(draftKey)
    const initialNote = draft ?? serverNote
    noteRef.current = initialNote
    setNote(initialNote)
    const hasUnsavedDraft = draft !== null && draft !== serverNote
    dirtyRef.current = hasUnsavedDraft
    setDirty(hasUnsavedDraft)
    if (draft !== null && !hasUnsavedDraft) window.localStorage.removeItem(draftKey)
  }, [detail.data, draftKey])

  useEffect(() => {
    pageHidingRef.current = false
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        saveRef.current()
      }
    }
    const pagehide = () => {
      pageHidingRef.current = true
      if (!dirtyRef.current || !Number.isSafeInteger(id)) return
      const content = noteRef.current
      window.localStorage.setItem(draftKey, content)
      void fetch(`/api/wrong-notes/${id}/note`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ content }),
        keepalive: true,
      })
    }
    const pageshow = () => {
      pageHidingRef.current = false
    }
    window.addEventListener('keydown', shortcut)
    window.addEventListener('pagehide', pagehide)
    window.addEventListener('pageshow', pageshow)
    return () => {
      if (!pageHidingRef.current) saveRef.current()
      window.removeEventListener('keydown', shortcut)
      window.removeEventListener('pagehide', pagehide)
      window.removeEventListener('pageshow', pageshow)
    }
  }, [draftKey, id])

  useEffect(() => {
    if (!dirty) return
    const timer = window.setTimeout(() => saveRef.current(), 800)
    return () => window.clearTimeout(timer)
  }, [note, dirty])

  if (detail.isPending) return <PageSkeleton rows={5} />
  if (detail.isError) return <ErrorState message="오답 상세를 불러오지 못했습니다." onRetry={() => void detail.refetch()} />
  const item = detail.data
  const analysis = aiAnalysis.data
  const history = attemptsQuery.data?.pages.flatMap((page) => page.items) ?? []
  const hasAttemptHistoryData = attemptsQuery.data !== undefined

  const updateNote = (value: string) => {
    noteRef.current = value
    dirtyRef.current = true
    window.localStorage.setItem(draftKey, value)
    setNote(value)
    setDirty(true)
  }

  return (
    <section className="page-section wrong-note-detail">
      <div className="breadcrumb">
        <Link to="/wrong-notes" search={defaultWrongNoteSearch}>Wrong notes</Link>
        <span>›</span><span>Question {item.question.id}</span>
      </div>
      <div className="page-heading">
        <div><p className="eyebrow">{item.question.questionType} · {item.question.difficulty}</p><h1>Wrong Note</h1><MarkdownContent className="detail-question-prompt">{item.question.promptMarkdown}</MarkdownContent><ConceptContext concepts={item.concepts} /></div>
        <button className="primary-button" onClick={() => retryMutation.mutate()} disabled={retryMutation.isPending}>이 문제 다시 풀기</button>
      </div>
      <div className="wrong-note-summary">
        <div><span>Wrong count</span><strong>{item.state.wrongCount}</strong></div>
        <div><span>Review stage</span><strong>{item.state.reviewStage ?? '—'}</strong></div>
        <div><span>Next due</span><strong>{item.state.dueAt ? new Date(item.state.dueAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : 'Mastered'}</strong></div>
      </div>
      <section className="detail-section study-section"><div className="section-heading"><div><p className="eyebrow">Latest attempt</p><h2>최근 오답</h2></div>{item.latestWrongAttempt && <span className="chip state-badge state-active">{item.latestWrongAttempt.gradingStatus}</span>}</div><p className="latest-answer">{item.latestWrongAttempt?.answerText ?? item.latestWrongAttempt?.selectedChoiceKey ?? 'Unanswered'}</p><p className="helper-text">{item.latestWrongAttempt ? `${item.latestWrongAttempt.source} · ${item.latestWrongAttempt.answeredAt ? new Date(item.latestWrongAttempt.answeredAt).toLocaleString('ko-KR') : '답변 시간 없음'}` : '최근 오답 기록이 없습니다.'}</p></section>
      <section className="detail-section study-section"><p className="eyebrow">Canonical answer</p><h2>정답과 해설</h2><div className="answer-facts"><p><strong>Correct choice:</strong> {item.answer.correctChoiceKey ?? '—'}</p><p><strong>Accepted answers:</strong> {item.answer.acceptedAnswers.join(', ') || '—'}</p></div>{item.answer.modelAnswer ? <MarkdownContent className="answer-block">{item.answer.modelAnswer}</MarkdownContent> : <p className="helper-text">모범 답안이 없습니다.</p>}{item.question.explanationMarkdown ? <MarkdownContent className="answer-block">{item.question.explanationMarkdown}</MarkdownContent> : <p className="helper-text">설명이 없습니다.</p>}</section>
      <section className="detail-section">
        <p className="eyebrow">Personal reflection</p><h2>Why I was wrong</h2>
        <textarea value={note} onChange={(event) => updateNote(event.target.value)} placeholder="실수 원인과 다음에 확인할 점을 적어보세요." />
        <p className={`save-state ${noteMutation.isError ? 'error' : noteMutation.isPending ? 'saving' : dirty ? 'saving' : 'saved'}`}>{noteMutation.isError ? '저장 실패' : noteMutation.isPending ? '저장 중…' : dirty ? '변경 사항 저장 대기 중' : '저장됨'} · Ctrl/Cmd+S</p>
      </section>
      <section className="detail-section related-learning-section">
        <div className="section-heading"><div><p className="eyebrow">Continue learning</p><h2>관련 Concepts</h2></div><span className="helper-text">AI 없이도 바로 이동할 수 있습니다.</span></div>
        <ConceptContext concepts={item.concepts} />
      </section>
      <section className="detail-section ai-analysis-section">
        <div className="section-heading"><div><p className="eyebrow">Learning assistant</p><h2>AI 오답 분석</h2></div>{analysis?.status === 'COMPLETED' && <span className="chip status-completed">Completed</span>}</div>
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
        <div className="section-heading"><div><p className="eyebrow">History</p><h2>Attempt history</h2></div>{history.length > 0 && <span className="result-count">{history.length} loaded</span>}</div>
        {attemptsQuery.isPending ? <div className="state-card" aria-busy="true">시도 기록을 불러오는 중입니다…</div> : attemptsQuery.isError && !hasAttemptHistoryData ? <ErrorState message="시도 기록을 불러오지 못했습니다." onRetry={() => void attemptsQuery.refetch()} /> : history.length === 0 ? <div className="state-card"><strong>아직 시도 기록이 없습니다.</strong><span>이 문제를 푼 기록이 생기면 여기에 시간순으로 쌓입니다.</span></div> : <div className="history-list">{history.map((attempt) => <div className="history-row" key={attempt.attemptId}><strong>{attempt.correct === true ? 'Correct' : attempt.correct === false ? 'Wrong' : attempt.gradingStatus}</strong><span>{attempt.source} · {attempt.gradingStatus}</span><time>{new Date(attempt.updatedAt).toLocaleString('ko-KR')}</time></div>)}</div>}
        {attemptsQuery.hasNextPage && <div className="load-more-row"><button className="secondary-button" type="button" disabled={attemptsQuery.isFetchingNextPage} onClick={() => void attemptsQuery.fetchNextPage()}>{attemptsQuery.isFetchingNextPage ? '불러오는 중…' : attemptsQuery.isFetchNextPageError ? '다시 시도' : '더 불러오기'}</button>{attemptsQuery.isFetchNextPageError && <span className="helper-text error-text">추가 기록을 불러오지 못했습니다.</span>}</div>}
      </section>
    </section>
  )
}
