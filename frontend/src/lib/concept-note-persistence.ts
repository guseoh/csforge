export function conceptNoteDraftKey(conceptId: number) {
  return `csforge:concept:${conceptId}:note-draft`
}

export function selectConceptNote(serverContent: string, draft: string | null) {
  if (draft !== null && draft !== serverContent) return { content: draft, dirty: true }
  return { content: serverContent, dirty: false }
}

export function reconcileConceptNoteSave(latestContent: string, requestedContent: string, savedContent: string) {
  if (latestContent === savedContent) return 'saved'
  if (latestContent !== requestedContent) return 'retry'
  return 'mismatch'
}

let nextRevision = 0
const latestRevisionByConcept = new Map<number, number>()
const pendingSaves = new Map<number, Promise<unknown>>()

export function beginConceptNoteRevision(conceptId: number) {
  const revision = ++nextRevision
  latestRevisionByConcept.set(conceptId, revision)
  return revision
}

export function isLatestConceptNoteRevision(conceptId: number, revision: number) {
  return latestRevisionByConcept.get(conceptId) === revision
}

export function hasPendingConceptNoteSave(conceptId: number) {
  return pendingSaves.has(conceptId)
}

export type ConceptNoteSaveResult<T> =
  | { status: 'saved'; value: T }
  | { status: 'superseded' }

export function enqueueConceptNoteSave<T>(
  conceptId: number,
  revision: number,
  save: () => Promise<T>,
): Promise<ConceptNoteSaveResult<T>> {
  const run = async (): Promise<ConceptNoteSaveResult<T>> => {
    if (!isLatestConceptNoteRevision(conceptId, revision)) return { status: 'superseded' }
    const value = await save()
    if (!isLatestConceptNoteRevision(conceptId, revision)) return { status: 'superseded' }
    return { status: 'saved', value }
  }
  const previous = pendingSaves.get(conceptId)
  const task = previous ? previous.catch(() => {}).then(run) : run()
  pendingSaves.set(conceptId, task)
  const clear = () => {
    if (pendingSaves.get(conceptId) === task) pendingSaves.delete(conceptId)
  }
  void task.then(clear, clear)
  return task
}
