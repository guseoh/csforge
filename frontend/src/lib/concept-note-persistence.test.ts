import { describe, expect, it } from 'vitest'
import {
  conceptNoteDraftKey,
  reconcileConceptNoteSave,
  selectConceptNote,
} from './concept-note-persistence'

describe('Concept note persistence decisions', () => {
  it('restores a different local draft, including an empty draft, without mixing Concept ids', () => {
    expect(selectConceptNote('server', 'draft')).toEqual({ content: 'draft', dirty: true })
    expect(selectConceptNote('server', '')).toEqual({ content: '', dirty: true })
    expect(selectConceptNote('server', 'server')).toEqual({ content: 'server', dirty: false })
    expect(selectConceptNote('server', null)).toEqual({ content: 'server', dirty: false })
    expect(conceptNoteDraftKey(1)).not.toBe(conceptNoteDraftKey(2))
  })

  it('keeps a newer edit dirty after an older save and retries it', () => {
    expect(reconcileConceptNoteSave('newer', 'older', 'older')).toBe('retry')
    expect(reconcileConceptNoteSave('latest', 'latest', 'latest')).toBe('saved')
    expect(reconcileConceptNoteSave('latest', 'latest', 'different response')).toBe('mismatch')
  })
})
