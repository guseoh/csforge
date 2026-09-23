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

const pendingSaves = new Map<number, Promise<unknown>>()

export function hasPendingConceptNoteSave(conceptId: number) {
  return pendingSaves.has(conceptId)
}

export function enqueueConceptNoteSave<T>(conceptId: number, save: () => Promise<T>): Promise<T> {
  const previous = pendingSaves.get(conceptId)
  const task = previous ? previous.catch(() => {}).then(save) : save()
  pendingSaves.set(conceptId, task)
  const clear = () => {
    if (pendingSaves.get(conceptId) === task) pendingSaves.delete(conceptId)
  }
  void task.then(clear, clear)
  return task
}
