import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import {
  getWrongNote,
  getWrongNoteAiAnalysis,
  getWrongNoteAttempts,
  requestWrongNoteAiAnalysis,
  retryWrongNote,
  retryWrongNoteAiAnalysis,
  saveWrongNote,
  type WrongAnswerAnalysis,
  type WrongNoteAttempt,
} from '../lib/api'

export function WrongNoteDetailPage() {
  const { questionId } = useParams({ from: '/wrong-notes/$questionId' })
  const id = Number(questionId)
  const navigate = useNavigate()
  const detail = useQuery({ queryKey: ['wrong-note', id], queryFn: () => getWrongNote(id) })
  const aiAnalysis = useQuery({
    queryKey: ['wrong-note-ai-analysis', id],
    queryFn: () => getWrongNoteAiAnalysis(id),
    enabled: Number.isSafeInteger(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'PENDING' || status === 'PROCESSING' ? 2000 : false
    },
  })
  const [note, setNote] = useState('')
  const [dirty, setDirty] = useState(false)
  const [history, setHistory] = useState<WrongNoteAttempt[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
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
    if (!Number.isSafeInteger(id)) return
    void getWrongNoteAttempts(id).then((page) => {
      setHistory(page.items)
      setNextCursor(page.nextCursor)
    })
  }, [id])

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

  const renderAnalysis = (current: WrongAnswerAnalysis) => {
    if (current.status === 'PROVIDER_NOT_CONFIGURED') {
      return <div className="state-card"><strong>AI 분석을 사용할 수 없습니다.</strong><span>로컬 Ollama provider를 구성하면 명시적으로 분석을 요청할 수 있습니다.</span></div>
    }
    if (current.status === 'NOT_REQUESTED') {
      return <div className="ai-analysis-empty"><p>현재 latest wrong answer와 문제·정답·관련 개념을 바탕으로 오답 원인을 분석합니다.</p><button className="primary-button" type="button" onClick={() => aiRequestMutation.mutate()} disabled={!current.available || aiRequestMutation.isPending}>AI 분석하기</button>{aiRequestMutation.isError && <p className="save-state error">분석 요청에 실패했습니다. 잠시 후 다시 시도하세요.</p>}</div>
    }
    if (current.status === 'PENDING' || current.status === 'PROCESSING') {
      return <div className="state-card" aria-live="polite"><strong>AI 분석을 처리하고 있습니다.</strong><span>{current.status === 'PENDING' ? '분석 작업을 준비하는 중입니다.' : 'Ollama가 오답을 분석하는 중입니다.'}</span><span className="helper-text">이 화면은 자동으로 갱신됩니다.</span></div>
    }
    if (current.status === 'FAILED') {
      return <div className="state-card error-state"><strong>AI 분석에 실패했습니다.</strong><span>provider 상태를 확인한 뒤 다시 시도할 수 있습니다.</span><button className="secondary-button" type="button" onClick={() => aiRetryMutation.mutate()} disabled={!current.retryable || aiRetryMutation.isPending}>다시 시도</button>{aiRetryMutation.isError && <p className="save-state error">재시도 요청에 실패했습니다.</p>}</div>
    }
    const result = current.result
    if (!result) return <div className="state-card error-state"><strong>분석 결과가 비어 있습니다.</strong><span>다시 시도해 주세요.</span></div>
    return <div className="ai-analysis-result">
      <div><h3>왜 틀렸는가</h3><p>{result.whyWrong}</p></div>
      <div><h3>놓친 핵심</h3><ul>{result.missedConcepts.map((concept) => <li key={concept}>{concept}</li>)}</ul></div>
      <div><h3>올바른 이해</h3><p>{result.correctUnderstanding}</p></div>
      <div><h3>관련 개념</h3>{result.relatedConcepts.length === 0 ? <p className="helper-text">연결된 개념이 없습니다.</p> : <div className="related-list">{result.relatedConcepts.map((concept) => <Link key={concept.id} to="/concepts/$conceptId" params={{ conceptId: String(concept.id) }}>{concept.title}<span>{concept.areaName} · Level {concept.level}</span></Link>)}</div>}</div>
      <div><h3>확인 질문</h3><ol>{result.followUpQuestions.map((question) => <li key={question}>{question}</li>)}</ol></div>
    </div>
  }

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
        <Link to="/wrong-notes" search={{ page: 0, area: '', status: '', review: 'ALL', sort: 'RECENT' }}>Wrong notes</Link>
        <span>›</span><span>Question {item.question.id}</span>
      </div>
      <div className="page-heading">
        <div><p className="eyebrow">{item.question.questionType} · {item.question.difficulty}</p><h1>{item.question.promptMarkdown}</h1><p className="lead">{item.concepts.map((concept) => `${concept.areaName} · ${concept.title}`).join(', ')}</p></div>
        <button className="primary-button" onClick={() => retryMutation.mutate()} disabled={retryMutation.isPending}>이 문제 다시 풀기</button>
      </div>
      <div className="quiz-stat-grid wrong-note-stat-grid">
        <div><span>Wrong count</span><strong>{item.state.wrongCount}</strong></div>
        <div><span>Review stage</span><strong>{item.state.reviewStage ?? '—'}</strong></div>
        <div><span>Next due</span><strong>{item.state.dueAt ? new Date(item.state.dueAt).toLocaleDateString() : 'Mastered'}</strong></div>
      </div>
      <section className="detail-section"><h2>Latest wrong answer</h2><p>{item.latestWrongAttempt?.answerText ?? item.latestWrongAttempt?.selectedChoiceKey ?? 'Unanswered'}</p><p className="helper-text">{item.latestWrongAttempt?.source} · {item.latestWrongAttempt?.gradingStatus}</p></section>
      <section className="detail-section"><h2>Answer and explanation</h2><p><strong>Correct choice:</strong> {item.answer.correctChoiceKey ?? '—'}</p><p><strong>Accepted answers:</strong> {item.answer.acceptedAnswers.join(', ') || '—'}</p><p><strong>Model answer:</strong> {item.answer.modelAnswer ?? '—'}</p><p className="markdown-content">{item.question.explanationMarkdown ?? '설명이 없습니다.'}</p></section>
      <section className="detail-section">
        <h2>Why I was wrong</h2>
        <textarea value={note} onChange={(event) => updateNote(event.target.value)} placeholder="실수 원인과 다음에 확인할 점을 적어보세요." />
        <p className={`save-state ${noteMutation.isError ? 'error' : noteMutation.isPending ? 'saving' : dirty ? 'saving' : 'saved'}`}>{noteMutation.isError ? '저장 실패' : noteMutation.isPending ? '저장 중…' : dirty ? '변경 사항 저장 대기 중' : '저장됨'} · Ctrl/Cmd+S</p>
      </section>
      <section className="detail-section ai-analysis-section">
        <div className="section-heading"><div><p className="eyebrow">Learning assistant</p><h2>AI 오답 분석</h2></div>{analysis?.status === 'COMPLETED' && <span className="chip status-completed">Completed</span>}</div>
        {aiAnalysis.isPending ? <p className="helper-text">AI 분석 상태를 확인하는 중입니다…</p> : aiAnalysis.isError ? <ErrorState message="AI 분석 상태를 불러오지 못했습니다." onRetry={() => void aiAnalysis.refetch()} /> : analysis ? renderAnalysis(analysis) : null}
      </section>
      <section className="detail-section">
        <h2>Attempt history</h2>
        <div className="history-list">{history.map((attempt) => <div className="history-row" key={attempt.attemptId}><strong>{attempt.correct === true ? 'Correct' : 'Wrong'}</strong><span>{attempt.source} · {attempt.gradingStatus}</span><time>{new Date(attempt.updatedAt).toLocaleString()}</time></div>)}</div>
        {nextCursor && <button className="secondary-button" onClick={() => void getWrongNoteAttempts(id, nextCursor).then((page) => { setHistory((current) => [...current, ...page.items]); setNextCursor(page.nextCursor) })}>더 불러오기</button>}
      </section>
    </section>
  )
}
