const DRAFT_PREFIX = 'csforge:interview-practice:v1:'
export const MAX_INTERVIEW_DRAFT_LENGTH = 5000

/** A question fingerprint isolates drafts after canonical wording changes. */
function hashQuestion(question: string): string {
  let hash = 2166136261
  for (let index = 0; index < question.length; index += 1) {
    hash ^= question.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

export function interviewDraftKey(contentKey: string, index: number, question: string): string {
  return `${DRAFT_PREFIX}${encodeURIComponent(contentKey)}:${index}:${hashQuestion(question)}`
}

/** Tab-scoped draft; never writes to PersonalNote, Quiz or learning history. */
export function readInterviewDraft(contentKey: string, index: number, question: string): string {
  try {
    return typeof window === 'undefined' ? '' :
      window.sessionStorage.getItem(interviewDraftKey(contentKey, index, question))?.slice(0, MAX_INTERVIEW_DRAFT_LENGTH) ?? ''
  } catch {
    return ''
  }
}

export function writeInterviewDraft(contentKey: string, index: number, question: string, answer: string): boolean {
  try {
    if (typeof window === 'undefined') return false
    window.sessionStorage.setItem(interviewDraftKey(contentKey, index, question), answer.slice(0, MAX_INTERVIEW_DRAFT_LENGTH))
    return true
  } catch {
    return false
  }
}

export function clearInterviewDraft(contentKey: string, index: number, question: string): boolean {
  try {
    if (typeof window === 'undefined') return false
    window.sessionStorage.removeItem(interviewDraftKey(contentKey, index, question))
    return true
  } catch {
    return false
  }
}

/** Explicit opt-in appends only the learner's answer; never replaces existing personal notes. */
export function appendInterviewDraftToNote(existing: string, question: string, answer: string): string {
  const trimmed = answer.trim()
  if (!trimmed) return existing
  const block = `### 면접 답변 연습

**Q. ${question.trim()}**

${trimmed}`
  if (existing.includes(block)) return existing
  return existing.trim() ? `${existing.trimEnd()}

---

${block}` : block
}
