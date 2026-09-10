import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { saveQuizAnswer, saveQuizPosition, type QuizSavedAnswer, type QuizSession } from './quiz-api'

export type QuizDraftAnswer = QuizSavedAnswer
export type QuizAnswerSaveState = 'saved' | 'saving' | 'error'

export const emptyQuizDraft: QuizDraftAnswer = {
  selectedChoiceKey: null,
  answerText: null,
  reviewNeeded: false,
  answeredAt: null,
}

interface QuizSessionPersistenceOptions {
  quizId: number
  session: QuizSession | undefined
  expired: boolean
}

export function useQuizSessionPersistence({ quizId, session, expired }: QuizSessionPersistenceOptions) {
  const [position, setPosition] = useState(0)
  const [drafts, setDrafts] = useState<Record<number, QuizDraftAnswer>>({})
  const [saveStates, setSaveStates] = useState<Record<number, QuizAnswerSaveState>>({})
  const [positionSaveError, setPositionSaveError] = useState(false)
  const hydratedQuizRef = useRef<number | null>(null)
  const dirtyQuestionsRef = useRef(new Set<number>())
  const draftsRef = useRef<Record<number, QuizDraftAnswer>>({})
  const sessionStatusRef = useRef<string | null>(null)
  const expiredRef = useRef(false)

  useEffect(() => {
    draftsRef.current = drafts
  }, [drafts])

  useEffect(() => {
    if (!session || hydratedQuizRef.current === quizId) return
    hydratedQuizRef.current = quizId
    dirtyQuestionsRef.current.clear()
    setPosition(Math.min(session.lastPosition, Math.max(session.questions.length - 1, 0)))
    setDrafts(Object.fromEntries(
      session.questions.map((question) => [question.questionId, draftFromQuestion(question)]),
    ))
    setSaveStates({})
  }, [quizId, session])

  const question = session?.questions[position]
  const draft = question ? drafts[question.questionId] ?? emptyQuizDraft : emptyQuizDraft
  sessionStatusRef.current = session?.status ?? null
  expiredRef.current = expired

  const positionMutation = useMutation({
    mutationFn: (nextPosition: number) => saveQuizPosition(quizId, nextPosition),
    onSuccess: () => setPositionSaveError(false),
    onError: () => setPositionSaveError(true),
  })
  const answerMutation = useMutation({
    mutationFn: ({ questionId, answer }: { questionId: number; answer: QuizDraftAnswer }) => saveQuizAnswer(
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
        const existing = current[variables.questionId] ?? emptyQuizDraft
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

  const updateDraft = useCallback((patch: Partial<QuizDraftAnswer>) => {
    if (!question || expired || session?.status !== 'IN_PROGRESS') return
    setDrafts((current) => ({
      ...current,
      [question.questionId]: {
        ...(current[question.questionId] ?? emptyQuizDraft),
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

  return {
    position,
    drafts,
    draft,
    question,
    saveStates,
    positionSaveError,
    updateDraft,
    flushCurrentAnswer,
    flushAllDirtyAnswers,
    moveTo,
  }
}

function draftFromQuestion(question: QuizSession['questions'][number]): QuizDraftAnswer {
  return question.answer ? { ...question.answer } : { ...emptyQuizDraft }
}

function sameDraft(left: QuizDraftAnswer, right: QuizDraftAnswer) {
  return left.selectedChoiceKey === right.selectedChoiceKey
    && left.answerText === right.answerText
    && left.reviewNeeded === right.reviewNeeded
}
