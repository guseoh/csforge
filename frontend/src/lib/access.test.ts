import { describe, expect, it } from 'vitest'
import { isPublicPage } from './access'

describe('public page boundary', () => {
  it.each(['/', '/login', '/learning', '/learning/java', '/concepts/17', '/compare', '/search'])('allows canonical reading at %s', (path) => {
    expect(isPublicPage(path)).toBe(true)
  })
  it.each(['/quiz', '/quiz/1/result', '/review', '/wrong-notes', '/bookmarks', '/settings/import', '/learning/java/topics/1/focus', '/concepts/17/note'])('gates private features at %s', (path) => {
    expect(isPublicPage(path)).toBe(false)
  })
})
