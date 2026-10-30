import { useCallback, useEffect, useRef, useState } from 'react'
import { saveQuizAnswer, saveQuizPosition, type QuizSavedAnswer, type QuizSession } from './quiz-api'
import { clearAppUpdateSafetySignal, setAppUpdateSafetySignal } from './app-update-safety'
import {
  beginQuizSaveRevision,
  enqueueLatestQuizSave,
  quizAnswerDraftKey,
  readQuizAnswerDraft,
  removeQuizAnswerDraft,
  writeQuizAnswerDraft,
} from './quiz-save-coordinator'

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
  const [localDraftUnavailable, setLocalDraftUnavailable] = useState(false)
  const hydratedQuizRef = useRef<number | null>(null)
  const dirtyQuestionsRef = useRef(new Set<number>())
  const draftsRef = useRef<Record<number, QuizDraftAnswer>>({})
  const revisionsRef = useRef(new Map<number, number>())
  const saveTimerRef = useRef<number | undefined>(undefined)
  const positionRevisionRef = useRef(0)
  const sessionStatusRef = useRef(session?.status ?? null)
  const expiredRef = useRef(expired)
  const storage = getQuizDraftStorage()
  sessionStatusRef.current = session?.status ?? null
  expiredRef.current = expired

  const clearLocalDrafts = useCallback(() => {
    session?.questions.forEach((question) => {
      if (!removeQuizAnswerDraft(storage, quizAnswerDraftKey(quizId, question.questionId))) {
        setLocalDraftUnavailable(true)
      }
    })
  }, [quizId, session, storage])

  useEffect(() => {
    if (!session || hydratedQuizRef.current === quizId) return
    hydratedQuizRef.current = quizId
    dirtyQuestionsRef.current.clear()
    revisionsRef.current.clear()

    const isOpen = session.status === 'IN_PROGRESS' && !expired
    if (typeof window !== 'undefined' && !storage) setLocalDraftUnavailable(true)
    const nextDrafts: Record<number, QuizDraftAnswer> = {}
    const nextSaveStates: Record<number, QuizAnswerSaveState> = {}
    for (const question of session.questions) {
      const serverAnswer = draftFromQuestion(question)
      const draftKey = quizAnswerDraftKey(quizId, question.questionId)
      const localDraft = isOpen ? readQuizAnswerDraft(storage, draftKey) : null
      if (localDraft) {
        const restored: QuizDraftAnswer = {
          selectedChoiceKey: localDraft.selectedChoiceKey,
          answerText: localDraft.answerText,
          reviewNeeded: localDraft.reviewNeeded,
          answeredAt: serverAnswer.answeredAt,
        }
        nextDrafts[question.questionId] = restored
        dirtyQuestionsRef.current.add(question.questionId)
        revisionsRef.current.set(
          question.questionId,
          beginQuizSaveRevision(answerSaveKey(quizId, question.questionId)),
        )
        nextSaveStates[question.questionId] = 'saving'
        if (!persistLocalDraft(storage, quizId, question.questionId, restored, revisionsRef.current.get(question.questionId)!)) {
          setLocalDraftUnavailable(true)
        }
      } else {
        nextDrafts[question.questionId] = serverAnswer
        if (!isOpen) removeQuizAnswerDraft(storage, draftKey)
      }
    }

    draftsRef.current = nextDrafts
    setPosition(Math.min(session.lastPosition, Math.max(session.questions.length - 1, 0)))
    setDrafts(nextDrafts)
    setSaveStates(nextSaveStates)
    if (isOpen) setPositionSaveError(false)
  }, [expired, quizId, session, storage])

  const question = session?.questions[position]
  const draft = question ? drafts[question.questionId] ?? emptyQuizDraft : emptyQuizDraft

  const persistLatestAnswer = useCallback(async (questionId: number): Promise<boolean> => {
    if (sessionStatusRef.current !== 'IN_PROGRESS' || expiredRef.current) return false
    while (dirtyQuestionsRef.current.has(questionId)) {
      const answer = draftsRef.current[questionId]
      if (!answer) return false
      let revision = revisionsRef.current.get(questionId)
      if (revision === undefined) {
        revision = beginQuizSaveRevision(answerSaveKey(quizId, questionId))
        revisionsRef.current.set(questionId, revision)
      }
      setSaveStates((current) => ({ ...current, [questionId]: 'saving' }))
      try {
        const result = await enqueueLatestQuizSave(
          answerSaveKey(quizId, questionId),
          revision,
          () => saveQuizAnswer(quizId, questionId, {
            selectedChoiceKey: answer.selectedChoiceKey,
            answerText: answer.answerText,
            reviewNeeded: answer.reviewNeeded,
          }),
        )
        if (result.status === 'superseded') continue

        if (
          revisionsRef.current.get(questionId) !== revision
          || !sameDraft(draftsRef.current[questionId] ?? emptyQuizDraft, answer)
        ) continue

        dirtyQuestionsRef.current.delete(questionId)
        draftsRef.current = { ...draftsRef.current, [questionId]: result.value }
        setDrafts(draftsRef.current)
        setSaveStates((current) => ({ ...current, [questionId]: 'saved' }))
        if (!removeQuizAnswerDraft(storage, quizAnswerDraftKey(quizId, questionId))) {
          setLocalDraftUnavailable(true)
        }
        return true
      } catch {
        if (revisionsRef.current.get(questionId) !== revision) continue
        setSaveStates((current) => ({ ...current, [questionId]: 'error' }))
        return false
      }
    }
    return true
  }, [quizId, storage])

  const persistLatestAnswerRef = useRef(persistLatestAnswer)
  persistLatestAnswerRef.current = persistLatestAnswer

  const persistLatestPosition = useCallback((nextPosition: number) => {
    const key = `quiz:${quizId}:position`
    const revision = beginQuizSaveRevision(key)
    positionRevisionRef.current = revision
    void enqueueLatestQuizSave(key, revision, () => saveQuizPosition(quizId, nextPosition)).then((result) => {
      if (positionRevisionRef.current === revision && result.status === 'saved') setPositionSaveError(false)
    }, () => {
      if (positionRevisionRef.current === revision) setPositionSaveError(true)
    })
  }, [quizId])

  useEffect(() => {
    if (saveTimerRef.current !== undefined) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = undefined
    if (!question || expired || session?.status !== 'IN_PROGRESS' || !dirtyQuestionsRef.current.has(question.questionId)) {
      return
    }
    const questionId = question.questionId
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = undefined
      void persistLatestAnswerRef.current(questionId)
    }, 800)
    return () => {
      if (saveTimerRef.current !== undefined) window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = undefined
    }
  }, [draft, expired, question, session?.status])

  useEffect(() => () => {
    if (saveTimerRef.current !== undefined) window.clearTimeout(saveTimerRef.current)
  }, [quizId])

  const updateDraft = useCallback((patch: Partial<QuizDraftAnswer>) => {
    if (!question || expired || session?.status !== 'IN_PROGRESS') return
    const questionId = question.questionId
    const answer = {
      ...(draftsRef.current[questionId] ?? emptyQuizDraft),
      ...patch,
    }
    const revision = beginQuizSaveRevision(answerSaveKey(quizId, questionId))
    revisionsRef.current.set(questionId, revision)
    draftsRef.current = { ...draftsRef.current, [questionId]: answer }
    setDrafts(draftsRef.current)
    dirtyQuestionsRef.current.add(questionId)
    setSaveStates((current) => ({ ...current, [questionId]: 'saving' }))
    if (!persistLocalDraft(storage, quizId, questionId, answer, revision)) {
      setLocalDraftUnavailable(true)
    } else {
      setLocalDraftUnavailable(false)
    }
  }, [expired, question, quizId, session?.status, storage])

  const flushAllDirtyAnswers = useCallback(async () => {
    if (saveTimerRef.current !== undefined) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = undefined
    const outcomes = await Promise.all(
      Array.from(dirtyQuestionsRef.current, (questionId) => persistLatestAnswer(questionId)),
    )
    if (outcomes.some((saved) => !saved)) {
      throw new Error('Quiz answers could not be saved')
    }
  }, [persistLatestAnswer])

  const retryQuestionSave = useCallback((questionId: number) => {
    if (!dirtyQuestionsRef.current.has(questionId)) return
    void persistLatestAnswer(questionId)
  }, [persistLatestAnswer])

  const flushCurrentAnswer = useCallback(() => {
    if (!question || expired || session?.status !== 'IN_PROGRESS') return
    if (saveTimerRef.current !== undefined) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = undefined
    if (dirtyQuestionsRef.current.has(question.questionId)) {
      void persistLatestAnswer(question.questionId)
    }
  }, [expired, persistLatestAnswer, question, session?.status])

  const moveTo = useCallback((nextPosition: number) => {
    if (!session || nextPosition < 0 || nextPosition >= session.questions.length || nextPosition === position) return
    flushCurrentAnswer()
    setPosition(nextPosition)
    persistLatestPosition(nextPosition)
  }, [flushCurrentAnswer, persistLatestPosition, position, session])

  const failedQuestionIds = Object.entries(saveStates)
    .filter(([, state]) => state === 'error')
    .map(([id]) => Number(id))
  const savingCount = Object.values(saveStates).filter((state) => state === 'saving').length

  useEffect(() => {
    const signalKey = `quiz:${quizId}:persistence`
    setAppUpdateSafetySignal(signalKey, {
      quizSavePending: savingCount,
      quizSaveFailures: failedQuestionIds.length,
      flushQuizSaves: flushAllDirtyAnswers,
    })
    return () => clearAppUpdateSafetySignal(signalKey)
  }, [failedQuestionIds.length, flushAllDirtyAnswers, quizId, savingCount])

  return {
    position,
    drafts,
    draft,
    question,
    saveStates,
    failedQuestionIds,
    savingCount,
    localDraftUnavailable,
    positionSaveError,
    updateDraft,
    flushCurrentAnswer,
    flushAllDirtyAnswers,
    retryQuestionSave,
    clearLocalDrafts,
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

function answerSaveKey(quizId: number, questionId: number) {
  return `quiz:${quizId}:question:${questionId}:answer`
}

function persistLocalDraft(
  storage: Parameters<typeof writeQuizAnswerDraft>[0],
  quizId: number,
  questionId: number,
  answer: QuizDraftAnswer,
  revision: number,
) {
  return writeQuizAnswerDraft(storage, quizAnswerDraftKey(quizId, questionId), {
    selectedChoiceKey: answer.selectedChoiceKey,
    answerText: answer.answerText,
    reviewNeeded: answer.reviewNeeded,
    revision,
  })
}

function getQuizDraftStorage() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}
