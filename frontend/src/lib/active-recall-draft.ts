const KEY_PREFIX = 'csforge:concept-recall-draft:v1:'
export const MAX_RECALL_DRAFT_LENGTH = 4000

export function recallDraftKey(contentKey: string): string {
  return KEY_PREFIX + contentKey
}

/** A separate browser-only draft. Never reads or writes personal_note or quiz state. */
export function readRecallDraft(contentKey: string): string {
  try {
    return window.localStorage.getItem(recallDraftKey(contentKey))?.slice(0, MAX_RECALL_DRAFT_LENGTH) ?? ''
  } catch {
    return ''
  }
}

export function writeRecallDraft(contentKey: string, answer: string): boolean {
  try {
    window.localStorage.setItem(recallDraftKey(contentKey), answer.slice(0, MAX_RECALL_DRAFT_LENGTH))
    return true
  } catch {
    return false
  }
}

export function clearRecallDraft(contentKey: string): boolean {
  try {
    window.localStorage.removeItem(recallDraftKey(contentKey))
    return true
  } catch {
    return false
  }
}
