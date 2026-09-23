import { describe, expect, it, vi } from 'vitest'
import {
  beginNoteSaveRevision,
  enqueueLatestNoteSave,
  hasPendingNoteSave,
} from './note-save-coordinator'

describe('note save coordinator', () => {
  it('serializes saves for the same note revision', async () => {
    const key = 'concept:11'
    const revision = beginNoteSaveRevision(key)
    let finishFirst!: (content: string) => void
    const first = enqueueLatestNoteSave(
      key,
      revision,
      () => new Promise<string>((resolve) => { finishFirst = resolve }),
    )
    const secondSave = vi.fn().mockResolvedValue('same revision')
    const second = enqueueLatestNoteSave(key, revision, secondSave)

    expect(hasPendingNoteSave(key)).toBe(true)
    expect(secondSave).not.toHaveBeenCalled()
    finishFirst('first')
    await expect(first).resolves.toEqual({ status: 'saved', value: 'first' })
    await expect(second).resolves.toEqual({ status: 'saved', value: 'same revision' })
    expect(secondSave).toHaveBeenCalledOnce()
    expect(hasPendingNoteSave(key)).toBe(false)
  })

  it('prevents an older route instance retry from overwriting a newer edit', async () => {
    const key = 'concept:12'
    const oldRevision = beginNoteSaveRevision(key)
    let finishOldSave!: (content: string) => void
    const oldSave = enqueueLatestNoteSave(
      key,
      oldRevision,
      () => new Promise<string>((resolve) => { finishOldSave = resolve }),
    )

    const newRevision = beginNoteSaveRevision(key)
    const newSaveCall = vi.fn().mockResolvedValue('newer')
    const newSave = enqueueLatestNoteSave(key, newRevision, newSaveCall)
    const staleRetryCall = vi.fn().mockResolvedValue('stale')
    const staleRetry = enqueueLatestNoteSave(key, oldRevision, staleRetryCall)

    finishOldSave('older')

    await expect(oldSave).resolves.toEqual({ status: 'superseded' })
    await expect(newSave).resolves.toEqual({ status: 'saved', value: 'newer' })
    await expect(staleRetry).resolves.toEqual({ status: 'superseded' })
    expect(newSaveCall).toHaveBeenCalledOnce()
    expect(staleRetryCall).not.toHaveBeenCalled()
    expect(hasPendingNoteSave(key)).toBe(false)
  })

  it('keeps independent note keys from superseding each other', async () => {
    const conceptKey = 'concept:21'
    const wrongNoteKey = 'wrong-note:21'
    const conceptRevision = beginNoteSaveRevision(conceptKey)
    const wrongRevision = beginNoteSaveRevision(wrongNoteKey)

    await expect(enqueueLatestNoteSave(conceptKey, conceptRevision, async () => 'concept'))
      .resolves.toEqual({ status: 'saved', value: 'concept' })
    await expect(enqueueLatestNoteSave(wrongNoteKey, wrongRevision, async () => 'wrong'))
      .resolves.toEqual({ status: 'saved', value: 'wrong' })
  })
})
