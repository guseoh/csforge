import type { QuizSearch } from './quiz-search'

export const SAVED_QUIZ_SETS_KEY = 'csforge.quiz.saved-sets.v1'
export const MAX_SAVED_QUIZ_SETS = 20

export type SavedQuizSet = { id: string; name: string; settings: QuizSearch }
type Store = { version: 1; sets: SavedQuizSet[] }
type JsonObject = Record<string, unknown>

function object(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function textCsv(value: unknown, valid: (part: string) => boolean): value is string {
  return typeof value === 'string' && value.length <= 6000 &&
    (value === '' || value.split(',').every(part => valid(part)))
}

function safeSettings(value: unknown): value is QuizSearch {
  if (!object(value)) return false
  const validLevel = (part: string) => ['1', '2', '3'].includes(part)
  const validConcept = (part: string) => /^[1-9]\d*$/.test(part) && Number.isSafeInteger(Number(part))
  const validArea = (part: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(part)
  return textCsv(value.areas, validArea)
    && textCsv(value.concepts, validConcept)
    && textCsv(value.levels, validLevel)
    && textCsv(value.difficulties, part => ['EASY', 'MEDIUM', 'HARD'].includes(part))
    && textCsv(value.questionTypes, part => ['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'DESCRIPTIVE', 'SCENARIO'].includes(part))
    && ['ALL', 'UNSEEN', 'WRONG', 'REVIEW_NEEDED'].includes(String(value.state))
    && typeof value.count === 'number' && Number.isInteger(value.count) && value.count >= 1 && value.count <= 50
    && (value.timeLimitSeconds === null ||
      (typeof value.timeLimitSeconds === 'number' && Number.isInteger(value.timeLimitSeconds)
        && value.timeLimitSeconds >= 60 && value.timeLimitSeconds <= 7200))
}

function normalizedName(name: string): string { return name.trim().replace(/\s+/g, ' ') }
function nameKey(name: string): string { return normalizedName(name).toLocaleLowerCase('ko-KR') }

/** Old/corrupt data is ignored, never widened into an unfiltered all-question set. */
export function decodeSavedQuizSets(raw: string | null): SavedQuizSet[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!object(parsed) || parsed.version !== 1 || !Array.isArray(parsed.sets)) return []
    const uniqueNames = new Set<string>()
    const uniqueIds = new Set<string>()
    const safe: SavedQuizSet[] = []
    for (const item of parsed.sets) {
      if (!object(item) || typeof item.id !== 'string' || item.id.length < 1 || item.id.length > 80
        || typeof item.name !== 'string' || normalizedName(item.name).length < 1
        || normalizedName(item.name).length > 50 || !safeSettings(item.settings)) continue
      const name = normalizedName(item.name)
      if (uniqueNames.has(nameKey(name)) || uniqueIds.has(item.id)) continue
      uniqueNames.add(nameKey(name))
      uniqueIds.add(item.id)
      safe.push({ id: item.id, name, settings: { ...item.settings } })
      if (safe.length === MAX_SAVED_QUIZ_SETS) break
    }
    return safe
  } catch { return [] }
}

export function encodeSavedQuizSets(sets: SavedQuizSet[]): string {
  const payload: Store = { version: 1, sets }
  return JSON.stringify(payload)
}

export function saveQuizSet(sets: SavedQuizSet[], name: string, settings: QuizSearch, id: string): SavedQuizSet[] {
  const label = normalizedName(name)
  if (label.length < 1 || label.length > 50) throw new Error('이름은 1~50자여야 합니다.')
  if (sets.length >= MAX_SAVED_QUIZ_SETS) throw new Error('최대 20개까지 저장할 수 있습니다.')
  if (sets.some(item => nameKey(item.name) === nameKey(label))) throw new Error('같은 이름의 세트가 이미 있습니다.')
  if (!safeSettings(settings)) throw new Error('유효하지 않은 Quiz 조건입니다.')
  if (!id || sets.some(item => item.id === id)) throw new Error('세트 ID가 중복됩니다.')
  return [...sets, { id, name: label, settings: { ...settings } }]
}

export function renameQuizSet(sets: SavedQuizSet[], id: string, name: string): SavedQuizSet[] {
  const label = normalizedName(name)
  if (label.length < 1 || label.length > 50) throw new Error('이름은 1~50자여야 합니다.')
  if (!sets.some(item => item.id === id)) throw new Error('존재하지 않는 세트입니다.')
  if (sets.some(item => item.id !== id && nameKey(item.name) === nameKey(label))) {
    throw new Error('같은 이름의 세트가 이미 있습니다.')
  }
  return sets.map(item => item.id === id ? { ...item, name: label } : item)
}

export function deleteQuizSet(sets: SavedQuizSet[], id: string): SavedQuizSet[] {
  return sets.filter(item => item.id !== id)
}
