import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import {
  getQuizSession,
  saveQuizAnswer,
  saveQuizPosition,
  submitQuiz,
  type QuizQuestion,
  type QuizSavedAnswer,
} from '../lib/api'
import { defaultQuizSearch, formatRemaining } from '../lib/quiz-search'

type DraftAnswer = QuizSavedAnswer
type SaveState = 'saved' | 'saving' | 'error'

const emptyDraft: DraftAnswer = {
  selectedChoiceKey: null,
  answerText: null,
  reviewNeeded: false,
  answeredAt: null,
}

function draftFromQuestion(question: QuizQuestion): DraftAnswer {
  return question.answer ? { ...question.answer } : { ...emptyDraft }
}

export function QuizSessionPage() {
  const { quizId: quizIdParam } = useParams({ from: '/quiz/$quizId' })
  const quizId = Number(quizIdParam)
  const navigate = useNavigate({ from: '/quiz/$quizId' })
  const sessionQuery = useQuery({
    queryKey: ['quiz-session', quizId],
    queryFn: () => getQuizSession(quizId),
    enabled: Number.isSafeInteger(quizId) && quizId > 0,
  })
  const [position, setPosition] = useState(0)
  const [drafts, setDrafts] = useState<Record<number, DraftAnswer>>({})
  const [saveStates, setSaveStates] = useState<Record<number, SaveState>>({})
  const [positionSaveError, setPositionSaveError] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const hydratedQuizRef = useRef<number | null>(null)
  const dirtyQuestionsRef = useRef(new Set<number>())
  const draftsRef = useRef<Record<number, DraftAnswer>>({})
  const sessionStatusRef = useRef<string | null>(null)
  const expiredRef = useRef(false)

  useEffect(() => {
    draftsRef.current = drafts
  }, [drafts])

  useEffect(() => {
    if (!sessionQuery.data || hydratedQuizRef.current === quizId) return
    hydratedQuizRef.current = quizId
    dirtyQuestionsRef.current.clear()
    setPosition(Math.min(sessionQuery.data.lastPosition, Math.max(sessionQuery.data.questions.length - 1, 0)))
    setDrafts(Object.fromEntries(
      sessionQuery.data.questions.map((question) => [question.questionId, draftFromQuestion(question)]),
    ))
    setSaveStates({})
  }, [quizId, sessionQuery.data])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const session = sessionQuery.data
  const question = session?.questions[position]
  const draft = question ? drafts[question.questionId] ?? emptyDraft : emptyDraft
  const locallyExpired = Boolean(session?.expiresAt && formatRemaining(session.expiresAt, now) === '00:00')
  const expired = Boolean(session?.expired || locallyExpired)
  sessionStatusRef.current = session?.status ?? null
  expiredRef.current = expired

  const positionMutation = useMutation({
    mutationFn: (nextPosition: number) => saveQuizPosition(quizId, nextPosition),
    onSuccess: () => setPositionSaveError(false),
    onError: () => setPositionSaveError(true),
  })
  const answerMutation = useMutation({
    mutationFn: ({ questionId, answer }: { questionId: number; answer: DraftAnswer }) => saveQuizAnswer(
      quizId,
      questionId,
      {
        selectedChoiceKey: answer.selectedChoiceKey,
        answerText: answer.answerText,
        reviewNeeded: answer.reviewNeeded,
      },
    ),
    onSuccess: (saved, variables) => {
      setDrafts((current) => {
        const existing = current[variables.questionId] ?? emptyDraft
        if (!sameDraft(existing, variables.answer)) return current
        dirtyQuestionsRef.current.delete(variables.questionId)
        setSaveStates((states) => ({ ...states, [variables.questionId]: 'saved' }))
        return { ...current, [variables.questionId]: saved }
      })
    },
    onError: (_error, variables) => {
      setSaveStates((states) => ({ ...states, [variables.questionId]: 'error' }))
    },
  })
  const saveAnswerMutate = answerMutation.mutate
  const saveAnswerMutateAsync = answerMutation.mutateAsync

  const flushAllDirtyAnswers = useCallback(async () => {
    const dirtyIds = Array.from(dirtyQuestionsRef.current)
    for (const questionId of dirtyIds) {
      const answer = draftsRef.current[questionId]
      if (!answer) continue
      setSaveStates((states) => ({ ...states, [questionId]: 'saving' }))
      await saveAnswerMutateAsync({ questionId, answer })
    }
  }, [saveAnswerMutateAsync])

  const submitMutation = useMutation({
    mutationFn: async () => {
      await flushAllDirtyAnswers()
      return submitQuiz(quizId)
    },
    onSuccess: () => void navigate({ to: '/quiz/$quizId/result', params: { quizId: String(quizId) } }),
  })

  useEffect(() => {
    if (!question || expired || session?.status !== 'IN_PROGRESS' || !dirtyQuestionsRef.current.has(question.questionId)) {
      return
    }
    const timer = window.setTimeout(() => {
      setSaveStates((states) => ({ ...states, [question.questionId]: 'saving' }))
      saveAnswerMutate({ questionId: question.questionId, answer: draft })
    }, 800)
    return () => window.clearTimeout(timer)
  }, [draft, expired, question, saveAnswerMutate, session?.status])

  useEffect(() => {
    return () => {
      if (sessionStatusRef.current !== 'IN_PROGRESS' || expiredRef.current) return
      for (const questionId of dirtyQuestionsRef.current) {
        const answer = draftsRef.current[questionId]
        if (!answer) continue
        void saveQuizAnswer(quizId, questionId, {
          selectedChoiceKey: answer.selectedChoiceKey,
          answerText: answer.answerText,
          reviewNeeded: answer.reviewNeeded,
        })
      }
    }
  }, [quizId])

  const updateDraft = useCallback((patch: Partial<DraftAnswer>) => {
    if (!question || expired || session?.status !== 'IN_PROGRESS') return
    setDrafts((current) => ({
      ...current,
      [question.questionId]: {
        ...(current[question.questionId] ?? emptyDraft),
        ...patch,
      },
    }))
    dirtyQuestionsRef.current.add(question.questionId)
    setSaveStates((states) => ({ ...states, [question.questionId]: 'saving' }))
  }, [expired, question, session?.status])

  const flushCurrentAnswer = useCallback(() => {
    if (!question || expired || session?.status !== 'IN_PROGRESS' || !dirtyQuestionsRef.current.has(question.questionId)) {
      return
    }
    setSaveStates((states) => ({ ...states, [question.questionId]: 'saving' }))
    saveAnswerMutate({ questionId: question.questionId, answer: draft })
  }, [draft, expired, question, saveAnswerMutate, session?.status])

  const moveTo = useCallback((nextPosition: number) => {
    if (!session || nextPosition < 0 || nextPosition >= session.questions.length || nextPosition === position) return
    flushCurrentAnswer()
    setPosition(nextPosition)
    positionMutation.mutate(nextPosition)
  }, [flushCurrentAnswer, position, positionMutation, session])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
      if (event.key === 'ArrowRight' || event.key === 'Enter') {
        event.preventDefault()
        moveTo(position + 1)
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        moveTo(position - 1)
      }
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault()
        updateDraft({ reviewNeeded: !draft.reviewNeeded })
      }
      if (question?.questionType === 'MULTIPLE_CHOICE' && ['1', '2', '3', '4'].includes(event.key)) {
        const choice = question.choices[Number(event.key) - 1]
        if (choice) {
          event.preventDefault()
          updateDraft({ selectedChoiceKey: choice.choiceKey, answerText: null })
        }
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [draft.reviewNeeded, moveTo, position, question, updateDraft])

  const timerLabel = useMemo(() => formatRemaining(session?.expiresAt ?? null, now), [now, session?.expiresAt])
  if (!Number.isSafeInteger(quizId) || quizId <= 0) {
    return <ErrorState message="유효하지 않은 Quiz입니다." onRetry={() => window.history.back()} />
  }
  if (sessionQuery.isPending) return <PageSkeleton rows={5} />
  if (sessionQuery.isError || !session) {
    return <ErrorState message="Quiz 세션을 불러오지 못했습니다." onRetry={() => void sessionQuery.refetch()} />
  }
  if (!question) {
    return <ErrorState message="Quiz에 문항이 없습니다." onRetry={() => void sessionQuery.refetch()} />
  }

  const answeredCount = Object.values(drafts)
    .filter((answer) => answer.selectedChoiceKey || answer.answerText?.trim())
    .length
  const saveState = saveStates[question.questionId] ?? 'saved'

  return (
    <section className="page-section quiz-page">
      <div className="quiz-session-topbar">
        <div>
          <p className="eyebrow">Quiz session · {session.source.replace('_', ' ')}</p>
          <h1>{position + 1} <span>/ {session.questions.length}</span></h1>
        </div>
        <div className="quiz-session-meta">
          <span>{answeredCount}/{session.questions.length} answered</span>
          {timerLabel && (
            <strong className={expired ? 'timer expired' : 'timer'}>{expired ? '시간 종료' : timerLabel}</strong>
          )}
          <Link className="text-link" to="/quiz" search={defaultQuizSearch}>설정으로</Link>
        </div>
      </div>

      <div className="quiz-progress">
        <span style={{ width: `${((position + 1) / session.questions.length) * 100}%` }} />
      </div>

      <div className="quiz-layout">
        <aside className="quiz-question-nav" aria-label="Question navigation">
          {session.questions.map((item, index) => (
            <button
              key={item.questionId}
              className={index === position ? 'question-nav-button current' : 'question-nav-button'}
              type="button"
              onClick={() => moveTo(index)}
            >
              {index + 1}{drafts[item.questionId]?.selectedChoiceKey || drafts[item.questionId]?.answerText?.trim() ? ' ·' : ''}
            </button>
          ))}
        </aside>

        <article className="quiz-question-card">
          <div className="chip-row">
            <span className="chip">{question.questionType.replace('_', ' ')}</span>
            <span className="chip">{question.difficulty}</span>
            {question.concepts.map((concept) => <span className="chip" key={concept.id}>{concept.title}</span>)}
          </div>
          <div className="markdown-content quiz-prompt">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.promptMarkdown}</ReactMarkdown>
          </div>

          {question.questionType === 'MULTIPLE_CHOICE' ? (
            <div className="choice-list">
              {question.choices.map((choice, index) => (
                <button
                  key={choice.choiceKey}
                  type="button"
                  className={draft.selectedChoiceKey === choice.choiceKey ? 'choice-button selected' : 'choice-button'}
                  disabled={expired || session.status !== 'IN_PROGRESS'}
                  onClick={() => updateDraft({ selectedChoiceKey: choice.choiceKey, answerText: null })}
                >
                  <span>{index + 1}</span>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{choice.contentMarkdown}</ReactMarkdown>
                </button>
              ))}
            </div>
          ) : (
            <textarea
              className="quiz-answer-editor"
              value={draft.answerText ?? ''}
              disabled={expired || session.status !== 'IN_PROGRESS'}
              placeholder="답안을 입력하면 자동 저장됩니다."
              onChange={(event) => updateDraft({ answerText: event.target.value, selectedChoiceKey: null })}
            />
          )}

          <label className="quiz-review-toggle">
            <input
              type="checkbox"
              checked={draft.reviewNeeded}
              disabled={expired || session.status !== 'IN_PROGRESS'}
              onChange={(event) => updateDraft({ reviewNeeded: event.target.checked })}
            />
            나중에 다시 볼 문항으로 표시
          </label>

          <div className="quiz-question-actions">
            <button className="secondary-button" type="button" disabled={position === 0} onClick={() => moveTo(position - 1)}>
              ← 이전
            </button>
            <span className={`save-state ${saveState}`} role="status">
              {saveState === 'saving' ? '저장 중' : saveState === 'error' ? '저장 실패' : '저장됨'}
            </span>
            {position < session.questions.length - 1 ? (
              <button className="primary-button" type="button" onClick={() => moveTo(position + 1)}>다음 →</button>
            ) : (
              <button
                className="primary-button"
                type="button"
                disabled={submitMutation.isPending}
                onClick={() => submitMutation.mutate()}
              >
                {submitMutation.isPending ? '저장 및 제출 중…' : '제출하기'}
              </button>
            )}
          </div>

          {positionSaveError && (
            <p className="helper-text error-text">재개 위치를 저장하지 못했습니다. 다음 이동 때 다시 시도합니다.</p>
          )}
          {expired && (
            <p className="helper-text error-text">시간이 종료되었습니다. 답안 변경은 막혔지만 제출은 할 수 있습니다.</p>
          )}
          {submitMutation.isError && (
            <p className="helper-text error-text">답안 저장 또는 제출에 실패했습니다. 다시 시도하세요.</p>
          )}
        </article>
      </div>
    </section>
  )
}

function sameDraft(left: DraftAnswer, right: DraftAnswer) {
  return left.selectedChoiceKey === right.selectedChoiceKey
    && left.answerText === right.answerText
    && left.reviewNeeded === right.reviewNeeded
}
