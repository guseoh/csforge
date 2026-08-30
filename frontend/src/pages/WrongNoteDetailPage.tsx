import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import { getWrongNote, getWrongNoteAttempts, retryWrongNote, saveWrongNote, type WrongNoteAttempt } from '../lib/api'

export function WrongNoteDetailPage() {
  const { questionId } = useParams({ from: '/wrong-notes/$questionId' })
  const id = Number(questionId)
  const navigate = useNavigate()
  const detail = useQuery({ queryKey: ['wrong-note', id], queryFn: () => getWrongNote(id) })
  const [note, setNote] = useState('')
  const [dirty, setDirty] = useState(false)
  const [history, setHistory] = useState<WrongNoteAttempt[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const noteMutation = useMutation({ mutationFn: (content: string) => saveWrongNote(id, content), onSuccess: (saved, content) => { if (content === note) setDirty(false); setNote(saved.content) } })
  const retryMutation = useMutation({ mutationFn: () => retryWrongNote(id), onSuccess: (quiz) => void navigate({ to: '/quiz/$quizId', params: { quizId: String(quiz.quizId) } }) })
  const saveRef = useRef(() => {})
  saveRef.current = () => { if (dirty && !noteMutation.isPending) noteMutation.mutate(note) }
  useEffect(() => { if (detail.data) setNote(detail.data.state.causeNote ?? '') }, [detail.data])
  useEffect(() => { if (!Number.isSafeInteger(id)) return; void getWrongNoteAttempts(id).then((page) => { setHistory(page.items); setNextCursor(page.nextCursor) }) }, [id])
  useEffect(() => { const handler = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); saveRef.current() } }; const flush = () => saveRef.current(); window.addEventListener('keydown', handler); window.addEventListener('pagehide', flush); return () => { flush(); window.removeEventListener('keydown', handler); window.removeEventListener('pagehide', flush) } }, [])
  useEffect(() => { if (!dirty) return; const timer = window.setTimeout(() => saveRef.current(), 800); return () => window.clearTimeout(timer) }, [note, dirty])
  if (detail.isPending) return <PageSkeleton rows={5} />
  if (detail.isError) return <ErrorState message="오답 상세를 불러오지 못했습니다." onRetry={() => void detail.refetch()} />
  const item = detail.data
  return <section className="page-section wrong-note-detail"><div className="breadcrumb"><Link to="/wrong-notes" search={{ page: 0, area: '', status: '', review: 'ALL', sort: 'RECENT' }}>Wrong notes</Link><span>›</span><span>Question {item.question.id}</span></div><div className="page-heading"><div><p className="eyebrow">{item.question.questionType} · {item.question.difficulty}</p><h1>{item.question.promptMarkdown}</h1><p className="lead">{item.concepts.map((concept) => `${concept.areaName} · ${concept.title}`).join(', ')}</p></div><button className="primary-button" onClick={() => retryMutation.mutate()} disabled={retryMutation.isPending}>이 문제 다시 풀기</button></div><div className="quiz-stat-grid wrong-note-stat-grid"><div><span>Wrong count</span><strong>{item.state.wrongCount}</strong></div><div><span>Review stage</span><strong>{item.state.reviewStage ?? '—'}</strong></div><div><span>Next due</span><strong>{item.state.dueAt ? new Date(item.state.dueAt).toLocaleDateString() : 'Mastered'}</strong></div></div><section className="detail-section"><h2>Latest wrong answer</h2><p>{item.latestWrongAttempt?.answerText ?? item.latestWrongAttempt?.selectedChoiceKey ?? 'Unanswered'}</p><p className="helper-text">{item.latestWrongAttempt?.source} · {item.latestWrongAttempt?.gradingStatus}</p></section><section className="detail-section"><h2>Answer and explanation</h2><p><strong>Correct choice:</strong> {item.answer.correctChoiceKey ?? '—'}</p><p><strong>Accepted answers:</strong> {item.answer.acceptedAnswers.join(', ') || '—'}</p><p><strong>Model answer:</strong> {item.answer.modelAnswer ?? '—'}</p><p className="markdown-content">{item.question.explanationMarkdown ?? '설명이 없습니다.'}</p></section><section className="detail-section"><h2>Why I was wrong</h2><textarea value={note} onChange={(event) => { setNote(event.target.value); setDirty(true) }} placeholder="실수 원인과 다음에 확인할 점을 적어보세요." /><p className={`save-state ${noteMutation.isError ? 'error' : noteMutation.isPending ? 'saving' : dirty ? 'saving' : 'saved'}`}>{noteMutation.isError ? '저장 실패' : noteMutation.isPending ? '저장 중…' : dirty ? '변경 사항 저장 대기 중' : '저장됨'} · Ctrl/Cmd+S</p></section><section className="detail-section"><h2>Attempt history</h2><div className="history-list">{history.map((attempt) => <div className="history-row" key={attempt.attemptId}><strong>{attempt.correct === true ? 'Correct' : 'Wrong'}</strong><span>{attempt.source} · {attempt.gradingStatus}</span><time>{new Date(attempt.updatedAt).toLocaleString()}</time></div>)}</div>{nextCursor && <button className="secondary-button" onClick={() => void getWrongNoteAttempts(id, nextCursor).then((page) => { setHistory((current) => [...current, ...page.items]); setNextCursor(page.nextCursor) })}>더 불러오기</button>}</section></section>
}
