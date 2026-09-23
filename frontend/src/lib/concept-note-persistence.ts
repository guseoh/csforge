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
