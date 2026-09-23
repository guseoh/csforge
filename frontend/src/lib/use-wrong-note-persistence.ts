import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  beginNoteSaveRevision,
  enqueueLatestNoteSave,
  hasPendingNoteSave,
  isLatestNoteSaveRevision,
  selectRecoverableNote,
} from './note-save-coordinator'
import { saveWrongNote, type WrongNoteDetail } from './wrong-note-api'

interface WrongNotePersistenceOptions {
  id: number
  detail: WrongNoteDetail | undefined
}

export function useWrongNotePersistence({ id, detail }: WrongNotePersistenceOptions) {
  const [note, setNote] = useState('')
  const [dirty, setDirty] = useState(false)
  const noteRef = useRef('')
  const savedRef = useRef('')
  const dirtyRef = useRef(false)
  const savingRef = useRef(false)
  const pageHidingRef = useRef(false)
  const revisionRef = useRef(0)
  const saveRef = useRef<() => void>(() => {})
  const draftKey = `csforge:wrong-note:${id}:draft`
  const saveKey = `wrong-note:${id}`

  const noteMutation = useMutation({
    mutationFn: ({ content, revision }: { content: string; revision: number }) =>
      enqueueLatestNoteSave(saveKey, revision, () => saveWrongNote(id, content)),
    onSuccess: (result) => {
      savingRef.current = false
      if (result.status === 'superseded') {
        if (dirtyRef.current && isLatestNoteSaveRevision(saveKey, revisionRef.current)) {
          queueMicrotask(() => saveRef.current())
        }
        return
      }

      savedRef.current = result.value.content
      if (noteRef.current === result.value.content) {
        dirtyRef.current = false
        setDirty(false)
        if (window.localStorage.getItem(draftKey) === result.value.content) window.localStorage.removeItem(draftKey)
        return
      }
      if (isLatestNoteSaveRevision(saveKey, revisionRef.current)) queueMicrotask(() => saveRef.current())
    },
    onError: (_error, variables) => {
      savingRef.current = false
      if (revisionRef.current !== variables.revision && isLatestNoteSaveRevision(saveKey, revisionRef.current)) {
        queueMicrotask(() => saveRef.current())
      }
    },
  })

  saveRef.current = () => {
    const content = noteRef.current
    const revision = revisionRef.current
    if (!dirtyRef.current || savingRef.current || revision === 0) return
    if (content === savedRef.current && !hasPendingNoteSave(saveKey)) {
      dirtyRef.current = false
      setDirty(false)
      if (window.localStorage.getItem(draftKey) === content) window.localStorage.removeItem(draftKey)
      return
    }
    savingRef.current = true
    noteMutation.mutate({ content, revision })
  }

  useEffect(() => {
    if (!detail || dirtyRef.current) return
    const serverNote = detail.state.causeNote ?? ''
    const draft = window.localStorage.getItem(draftKey)
    const initial = selectRecoverableNote(serverNote, draft, hasPendingNoteSave(saveKey))
    savedRef.current = serverNote
    noteRef.current = initial.content
    setNote(initial.content)
    dirtyRef.current = initial.dirty
    setDirty(initial.dirty)
    revisionRef.current = beginNoteSaveRevision(saveKey)
    if (draft !== null && !initial.dirty) window.localStorage.removeItem(draftKey)
  }, [detail, draftKey, saveKey])

  useEffect(() => {
    pageHidingRef.current = false
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        saveRef.current()
      }
    }
    const pagehide = () => {
      pageHidingRef.current = true
      if (!dirtyRef.current || !Number.isSafeInteger(id)) return
      const content = noteRef.current
      const revision = revisionRef.current
      window.localStorage.setItem(draftKey, content)
      if (revision !== 0 && !hasPendingNoteSave(saveKey)) {
        void enqueueLatestNoteSave(
          saveKey,
          revision,
          () => saveWrongNote(id, content, { keepalive: true }),
        ).catch(() => {})
      }
    }
    const pageshow = () => {
      pageHidingRef.current = false
      if (dirtyRef.current) saveRef.current()
    }
    window.addEventListener('keydown', shortcut)
    window.addEventListener('pagehide', pagehide)
    window.addEventListener('pageshow', pageshow)
    return () => {
      if (!pageHidingRef.current) saveRef.current()
      window.removeEventListener('keydown', shortcut)
      window.removeEventListener('pagehide', pagehide)
      window.removeEventListener('pageshow', pageshow)
    }
  }, [draftKey, id, saveKey])

  useEffect(() => {
    if (!dirty) return
    const timer = window.setTimeout(() => saveRef.current(), 800)
    return () => window.clearTimeout(timer)
  }, [note, dirty])

  const updateNote = (value: string) => {
    revisionRef.current = beginNoteSaveRevision(saveKey)
    noteRef.current = value
    dirtyRef.current = true
    window.localStorage.setItem(draftKey, value)
    setNote(value)
    setDirty(true)
  }

  return { note, dirty, updateNote, noteMutation }
}
