export function conceptNoteDraftKey(conceptId: number) {
  return `csforge:concept:${conceptId}:note-draft`
}

export function reconcileConceptNoteSave(latestContent: string, requestedContent: string, savedContent: string) {
  if (latestContent === savedContent) return 'saved'
  if (latestContent !== requestedContent) return 'retry'
  return 'mismatch'
}
