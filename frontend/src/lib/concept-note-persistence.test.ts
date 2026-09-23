import { describe, expect, it } from 'vitest'
import {
  conceptNoteDraftKey,
  reconcileConceptNoteSave,
} from './concept-note-persistence'

describe('Concept note persistence decisions', () => {
  it('uses a Concept-scoped local draft key', () => {
    expect(conceptNoteDraftKey(1)).not.toBe(conceptNoteDraftKey(2))
  })

  it('keeps a newer edit dirty after an older save and retries it', () => {
    expect(reconcileConceptNoteSave('newer', 'older', 'older')).toBe('retry')
    expect(reconcileConceptNoteSave('latest', 'latest', 'latest')).toBe('saved')
    expect(reconcileConceptNoteSave('latest', 'latest', 'different response')).toBe('mismatch')
  })
})
