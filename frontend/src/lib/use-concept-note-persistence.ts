import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { savePersonalNote, type ConceptDetail } from './learning-api'
import { conceptNoteDraftKey, enqueueConceptNoteSave, hasPendingConceptNoteSave, reconcileConceptNoteSave, selectConceptNote } from './concept-note-persistence'

type NoteState = 'saved' | 'saving' | 'error'

export function useConceptNotePersistence(conceptId: number, serverContent: string) {
  const queryClient = useQueryClient()
  const draftKey = conceptNoteDraftKey(conceptId)
  const [initial] = useState(() => selectConceptNote(serverContent, typeof window === 'undefined' ? null : window.localStorage.getItem(draftKey)))
  const [noteContent, setNoteContent] = useState(initial.content)
  const [noteState, setNoteState] = useState<NoteState>(initial.dirty ? 'saving' : 'saved')
  const noteRef = useRef(initial.content)
  const savedRef = useRef(serverContent)
  const dirtyRef = useRef(initial.dirty)
  const savingRef = useRef(false)
  const mountedRef = useRef(true)
  const pageHidingRef = useRef(false)
  const timerRef = useRef<number | undefined>(undefined)
  const saveRef = useRef<() => void>(() => {})
  const scheduleRef = useRef<() => void>(() => {})
  const initializedRef = useRef(false)

  saveRef.current = () => {
    const content = noteRef.current
    if (!dirtyRef.current || savingRef.current) return
    if (content === savedRef.current) {
      dirtyRef.current = false
      if (window.localStorage.getItem(draftKey) === content) window.localStorage.removeItem(draftKey)
      if (mountedRef.current) setNoteState('saved')
      return
    }

    savingRef.current = true
    if (mountedRef.current) setNoteState('saving')
    let retry = false
    void enqueueConceptNoteSave(conceptId, () => savePersonalNote(conceptId, content)).then((saved) => {
      savedRef.current = saved.content
      queryClient.setQueryData<ConceptDetail>(['concept', conceptId], (current) =>
        current ? { ...current, personalNote: saved } : current,
      )
      const outcome = reconcileConceptNoteSave(noteRef.current, content, saved.content)
      if (outcome === 'saved') {
        dirtyRef.current = false
        if (window.localStorage.getItem(draftKey) === saved.content) window.localStorage.removeItem(draftKey)
        if (mountedRef.current) setNoteState('saved')
      } else if (outcome === 'retry') {
        retry = true
      } else if (mountedRef.current) {
        setNoteState('error')
      }
    }, () => {
      if (noteRef.current !== content) retry = true
      else if (mountedRef.current) setNoteState('error')
    }).finally(() => {
      savingRef.current = false
      if (retry) queueMicrotask(() => saveRef.current())
    })
  }

  scheduleRef.current = () => {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      timerRef.current = undefined
      saveRef.current()
    }, 800)
  }

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    if (initial.dirty) scheduleRef.current()
    else if (window.localStorage.getItem(draftKey) === serverContent) window.localStorage.removeItem(draftKey)
  }, [draftKey, initial.dirty, serverContent])

  useEffect(() => {
    if (dirtyRef.current || savingRef.current) return
    savedRef.current = serverContent
    if (noteRef.current === serverContent) return
    noteRef.current = serverContent
    setNoteContent(serverContent)
    setNoteState('saved')
  }, [serverContent])

  useEffect(() => {
    mountedRef.current = true
    pageHidingRef.current = false
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        flushNote()
      }
    }
    const pagehide = () => {
      pageHidingRef.current = true
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current)
      timerRef.current = undefined
      if (!dirtyRef.current) return
      const content = noteRef.current
      window.localStorage.setItem(draftKey, content)
      if (!hasPendingConceptNoteSave(conceptId)) {
        void enqueueConceptNoteSave(conceptId, () => savePersonalNote(conceptId, content, { keepalive: true })).catch(() => {})
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
      mountedRef.current = false
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current)
      if (!pageHidingRef.current) saveRef.current()
      window.removeEventListener('keydown', shortcut)
      window.removeEventListener('pagehide', pagehide)
      window.removeEventListener('pageshow', pageshow)
    }
  }, [conceptId, draftKey])

  const flushNote = () => {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current)
    timerRef.current = undefined
    saveRef.current()
  }

  const updateNote = (content: string) => {
    noteRef.current = content
    window.localStorage.setItem(draftKey, content)
    setNoteContent(content)
    if (content === savedRef.current && !savingRef.current) {
      dirtyRef.current = false
      window.localStorage.removeItem(draftKey)
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current)
      timerRef.current = undefined
      setNoteState('saved')
      return
    }
    dirtyRef.current = true
    setNoteState('saving')
    scheduleRef.current()
  }

  return { noteContent, noteState, updateNote, flushNote }
}
