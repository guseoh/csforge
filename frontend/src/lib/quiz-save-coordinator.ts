export type QuizSaveResult<T> =
  | { status: 'saved'; revision: number; value: T }
  | { status: 'superseded'; revision: number }

interface PendingQuizSave {
  revision: number
  promise: Promise<QuizSaveResult<unknown>>
}

export interface StoredQuizAnswerDraft {
  selectedChoiceKey: string | null
  answerText: string | null
  reviewNeeded: boolean
  revision: number
  updatedAt: string
}

export interface QuizDraftStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

let nextRevision = 0
const latestRevisionByKey = new Map<string, number>()
const pendingSaves = new Map<string, PendingQuizSave>()

export function quizAnswerDraftKey(quizId: number, questionId: number) {
  return `csforge:quiz:${quizId}:question:${questionId}:draft`
}

export function beginQuizSaveRevision(key: string) {
  const revision = ++nextRevision
  latestRevisionByKey.set(key, revision)
  return revision
}

export function isLatestQuizSaveRevision(key: string, revision: number) {
  return latestRevisionByKey.get(key) === revision
}

export function hasPendingQuizSave(key: string) {
  return pendingSaves.has(key)
}

export function enqueueLatestQuizSave<T>(
  key: string,
  revision: number,
  save: () => Promise<T>,
): Promise<QuizSaveResult<T>> {
  const existing = pendingSaves.get(key)
  if (existing?.revision === revision) {
    return existing.promise as Promise<QuizSaveResult<T>>
  }

  const run = async (): Promise<QuizSaveResult<T>> => {
    if (!isLatestQuizSaveRevision(key, revision)) return { status: 'superseded', revision }
    const value = await save()
    if (!isLatestQuizSaveRevision(key, revision)) return { status: 'superseded', revision }
    return { status: 'saved', revision, value }
  }

  const promise = existing
    ? existing.promise.catch(() => {}).then(run)
    : run()
  pendingSaves.set(key, { revision, promise: promise as Promise<QuizSaveResult<unknown>> })

  const clear = () => {
    if (pendingSaves.get(key)?.promise === promise) pendingSaves.delete(key)
  }
  void promise.then(clear, clear)
  return promise
}

export function readQuizAnswerDraft(storage: QuizDraftStorage | null, key: string): StoredQuizAnswerDraft | null {
  if (!storage) return null
  try {
    const parsed: unknown = JSON.parse(storage.getItem(key) ?? 'null')
    if (!parsed || typeof parsed !== 'object') return null
    const draft = parsed as Partial<StoredQuizAnswerDraft>
    if (
      (draft.selectedChoiceKey !== null && typeof draft.selectedChoiceKey !== 'string')
      || (draft.answerText !== null && typeof draft.answerText !== 'string')
      || typeof draft.reviewNeeded !== 'boolean'
      || !Number.isSafeInteger(draft.revision)
      || typeof draft.updatedAt !== 'string'
    ) return null
    return {
      selectedChoiceKey: draft.selectedChoiceKey ?? null,
      answerText: draft.answerText ?? null,
      reviewNeeded: draft.reviewNeeded,
      revision: draft.revision!,
      updatedAt: draft.updatedAt,
    }
  } catch {
    return null
  }
}

export function writeQuizAnswerDraft(
  storage: QuizDraftStorage | null,
  key: string,
  draft: Omit<StoredQuizAnswerDraft, 'updatedAt'>,
  now: () => Date = () => new Date(),
) {
  if (!storage) return false
  try {
    storage.setItem(key, JSON.stringify({ ...draft, updatedAt: now().toISOString() }))
    return true
  } catch {
    return false
  }
}

export function removeQuizAnswerDraft(storage: QuizDraftStorage | null, key: string) {
  if (!storage) return false
  try {
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}
