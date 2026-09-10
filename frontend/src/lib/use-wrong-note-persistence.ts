import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { saveWrongNote, type WrongNoteDetail } from './wrong-note-api'

interface WrongNotePersistenceOptions {
  id: number
  detail: WrongNoteDetail | undefined
}

export function useWrongNotePersistence({ id, detail }: WrongNotePersistenceOptions) {
  const [note, setNote] = useState('')
  const [dirty, setDirty] = useState(false)
  const noteRef = useRef('')
  const dirtyRef = useRef(false)
  const savingRef = useRef(false)
  const pageHidingRef = useRef(false)
  const saveRef = useRef<() => void>(() => {})
  const draftKey = `csforge:wrong-note:${id}:draft`

  const noteMutation = useMutation({
    mutationFn: (content: string) => saveWrongNote(id, content),
    onSuccess: (_saved, content) => {
      savingRef.current = false
      if (noteRef.current === content) {
        dirtyRef.current = false
        setDirty(false)
        window.localStorage.removeItem(draftKey)
        return
      }
      queueMicrotask(() => saveRef.current())
    },
    onError: (_error, content) => {
      savingRef.current = false
      if (noteRef.current !== content) queueMicrotask(() => saveRef.current())
    },
  })

  saveRef.current = () => {
    if (!dirtyRef.current || savingRef.current) return
    savingRef.current = true
    noteMutation.mutate(noteRef.current)
  }

  useEffect(() => {
    if (!detail || dirtyRef.current) return
    const serverNote = detail.state.causeNote ?? ''
    const draft = window.localStorage.getItem(draftKey)
    const initialNote = draft ?? serverNote
    noteRef.current = initialNote
    setNote(initialNote)
    const hasUnsavedDraft = draft !== null && draft !== serverNote
    dirtyRef.current = hasUnsavedDraft
    setDirty(hasUnsavedDraft)
    if (draft !== null && !hasUnsavedDraft) window.localStorage.removeItem(draftKey)
  }, [detail, draftKey])

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
      window.localStorage.setItem(draftKey, content)
      void fetch(`/api/wrong-notes/${id}/note`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ content }),
        keepalive: true,
      })
    }
    const pageshow = () => {
      pageHidingRef.current = false
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
  }, [draftKey, id])

  useEffect(() => {
    if (!dirty) return
    const timer = window.setTimeout(() => saveRef.current(), 800)
    return () => window.clearTimeout(timer)
  }, [note, dirty])

  const updateNote = (value: string) => {
    noteRef.current = value
    dirtyRef.current = true
    window.localStorage.setItem(draftKey, value)
    setNote(value)
    setDirty(true)
  }

  return { note, dirty, updateNote, noteMutation }
}
