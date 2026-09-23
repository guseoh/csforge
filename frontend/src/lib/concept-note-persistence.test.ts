import { describe, expect, it, vi } from 'vitest'
import {
  beginConceptNoteRevision,
  conceptNoteDraftKey,
  enqueueConceptNoteSave,
  hasPendingConceptNoteSave,
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

  it('serializes saves for the same Concept', async () => {
    const revision = beginConceptNoteRevision(11)
    let finishFirst!: (content: string) => void
    const first = enqueueConceptNoteSave(
      11,
      revision,
      () => new Promise<string>((resolve) => { finishFirst = resolve }),
    )
    const secondSave = vi.fn().mockResolvedValue('same revision')
    const second = enqueueConceptNoteSave(11, revision, secondSave)

    expect(hasPendingConceptNoteSave(11)).toBe(true)
    expect(secondSave).not.toHaveBeenCalled()
    finishFirst('first')
    await expect(first).resolves.toEqual({ status: 'saved', value: 'first' })
    await expect(second).resolves.toEqual({ status: 'saved', value: 'same revision' })
    expect(secondSave).toHaveBeenCalledOnce()
    expect(hasPendingConceptNoteSave(11)).toBe(false)
  })

  it('prevents an older route instance retry from overwriting a newer edit', async () => {
    const conceptId = 12
    const oldRevision = beginConceptNoteRevision(conceptId)
    let finishOldSave!: (content: string) => void
    const oldSave = enqueueConceptNoteSave(
      conceptId,
      oldRevision,
      () => new Promise<string>((resolve) => { finishOldSave = resolve }),
    )

    const newRevision = beginConceptNoteRevision(conceptId)
    const newSaveCall = vi.fn().mockResolvedValue('newer')
    const newSave = enqueueConceptNoteSave(conceptId, newRevision, newSaveCall)
    const staleRetryCall = vi.fn().mockResolvedValue('stale')
    const staleRetry = enqueueConceptNoteSave(conceptId, oldRevision, staleRetryCall)

    finishOldSave('older')

    await expect(oldSave).resolves.toEqual({ status: 'superseded' })
    await expect(newSave).resolves.toEqual({ status: 'saved', value: 'newer' })
    await expect(staleRetry).resolves.toEqual({ status: 'superseded' })
    expect(newSaveCall).toHaveBeenCalledOnce()
    expect(staleRetryCall).not.toHaveBeenCalled()
    expect(hasPendingConceptNoteSave(conceptId)).toBe(false)
  })
})
