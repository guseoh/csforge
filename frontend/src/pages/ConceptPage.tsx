import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { EmptyState, ErrorState, PageSkeleton } from '../components/AsyncStates'
import {
  getConcept,
  recordConceptView,
  savePersonalNote,
  updateConceptProgress,
  type ConceptDetail as ConceptDetailModel,
  type LearningStatus,
  type ReferenceType,
} from '../lib/api'
import { defaultLearningSearch } from '../lib/learning-search'

type NoteState = 'saved' | 'saving' | 'error'

const referenceTypeLabels: Record<ReferenceType, string> = {
  OFFICIAL: 'Official',
  KOREAN_BLOG: 'Korean blog',
  COMPANY_TECH_BLOG: 'Company tech blog',
  BOOK: 'Book',
  PAPER: 'Paper',
  COURSE: 'Course',
  OTHER: 'Other',
}

function formatStatus(status: LearningStatus) {
  return status.replace('_', ' ')
}

function ConceptContent({ data, conceptId }: { data: ConceptDetailModel; conceptId: number }) {
  const queryClient = useQueryClient()
  const [noteContent, setNoteContent] = useState('')
  const noteContentRef = useRef('')
  const lastSavedContentRef = useRef('')
  const hydratedConceptRef = useRef<number | null>(null)
  const noteTimerRef = useRef<number | undefined>(undefined)
  const [noteState, setNoteState] = useState<NoteState>('saved')

  const noteMutation = useMutation({
    mutationFn: ({ content }: { content: string }) => savePersonalNote(conceptId, content),
    onMutate: ({ content }) => {
      if (noteContentRef.current === content) setNoteState('saving')
    },
    onSuccess: (saved, variables) => {
      lastSavedContentRef.current = saved.content
      if (noteContentRef.current === variables.content) setNoteState('saved')
      queryClient.setQueryData<ConceptDetailModel>(['concept', conceptId], (current) =>
        current ? { ...current, personalNote: saved } : current,
      )
    },
    onError: (_error, variables) => {
      if (noteContentRef.current === variables.content) setNoteState('error')
    },
  })

  useEffect(() => {
    if (hydratedConceptRef.current === conceptId) return
    const initialContent = data.personalNote?.content ?? ''
    hydratedConceptRef.current = conceptId
    noteContentRef.current = initialContent
    lastSavedContentRef.current = initialContent
    setNoteContent(initialContent)
    setNoteState('saved')
  }, [conceptId, data.personalNote?.content])

  const flushNote = useCallback(() => {
    if (noteTimerRef.current !== undefined) {
      window.clearTimeout(noteTimerRef.current)
      noteTimerRef.current = undefined
    }
    const content = noteContentRef.current
    if (content === lastSavedContentRef.current) {
      setNoteState('saved')
      return
    }
    noteMutation.mutate({ content })
  }, [noteMutation])

  const queueNoteSave = useCallback((content: string) => {
    noteContentRef.current = content
    setNoteContent(content)
    if (noteTimerRef.current !== undefined) window.clearTimeout(noteTimerRef.current)
    if (content === lastSavedContentRef.current) {
      setNoteState('saved')
      noteTimerRef.current = undefined
      return
    }
    setNoteState('saving')
    noteTimerRef.current = window.setTimeout(() => {
      noteTimerRef.current = undefined
      if (noteContentRef.current !== lastSavedContentRef.current) noteMutation.mutate({ content: noteContentRef.current })
    }, 800)
  }, [noteMutation])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        flushNote()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [flushNote])

  useEffect(() => () => {
    if (noteTimerRef.current !== undefined) window.clearTimeout(noteTimerRef.current)
  }, [])

  return (
    <>
      <div className="concept-header">
        <div className="chip-row">
          <span className="chip">Level {data.level}</span>
          <span className={`chip status-${data.progress.learningStatus.toLowerCase()}`}>{formatStatus(data.progress.learningStatus)}</span>
          {data.progress.bookmarked && <span className="chip bookmark-chip">★ Bookmarked</span>}
        </div>
        <h1>{data.title}</h1>
        {data.summary && <p className="lead">{data.summary}</p>}
      </div>

      <div className="concept-actions">
        <BookmarkButton conceptId={conceptId} bookmarked={data.progress.bookmarked} />
        <ProgressActionButton conceptId={conceptId} status="COMPLETED" label="완료로 표시" />
        <ProgressActionButton conceptId={conceptId} status="REVIEW_NEEDED" label="복습 필요" />
      </div>

      <article className="markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.contentMarkdown}</ReactMarkdown>
      </article>

      <section className="detail-section">
        <div className="section-heading">
          <p className="eyebrow">Personal note</p>
          <span className={`save-state ${noteState}`} role="status">
            {noteState === 'saving' ? '저장 중' : noteState === 'error' ? '저장 실패' : '저장됨'}
          </span>
        </div>
        <textarea
          className="note-editor"
          value={noteContent}
          aria-label="Personal note"
          placeholder="이 개념에서 기억하고 싶은 내용을 적어보세요."
          onChange={(event) => queueNoteSave(event.target.value)}
        />
        {noteState === 'error' && (
          <button className="text-button" type="button" onClick={flushNote}>다시 저장</button>
        )}
        <p className="helper-text">입력 후 0.8초 뒤 자동 저장됩니다. Ctrl/Cmd+S로 즉시 저장할 수 있습니다.</p>
      </section>

      <section className="detail-section">
        <div className="section-heading">
          <p className="eyebrow">References</p>
          <span className="result-count">{data.references.length}</span>
        </div>
        {data.references.length === 0 ? <EmptyState message="등록된 Reference가 없습니다." /> : (
          <div className="reference-list">
            {data.references.map((reference) => (
              <a className="reference-item" key={reference.id} href={reference.url} target="_blank" rel="noreferrer">
                <div>
                  <strong>{reference.title}</strong>
                  <span>{referenceTypeLabels[reference.type]}{reference.language ? ` · ${reference.language}` : ''}{reference.depth ? ` · ${reference.depth}` : ''}</span>
                </div>
                <span className="external-icon" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="detail-section navigation-section">
        <p className="eyebrow">Keep learning</p>
        <div className="concept-navigation">
          {data.previous ? <Link className="navigation-card" to="/concepts/$conceptId" params={{ conceptId: String(data.previous.id) }}><span>← Previous</span><strong>{data.previous.title}</strong></Link> : <span />}
          {data.next ? <Link className="navigation-card next" to="/concepts/$conceptId" params={{ conceptId: String(data.next.id) }}><span>Next →</span><strong>{data.next.title}</strong></Link> : <span />}
        </div>
        {data.relatedConcepts.length > 0 && (
          <div className="related-list">
            <p className="eyebrow">Related in this topic</p>
            {data.relatedConcepts.map((related) => <Link key={related.id} to="/concepts/$conceptId" params={{ conceptId: String(related.id) }}>{related.title} <span>L{related.level}</span></Link>)}
          </div>
        )}
      </section>
    </>
  )
}

function BookmarkButton({ conceptId, bookmarked }: { conceptId: number; bookmarked: boolean }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => updateConceptProgress(conceptId, { bookmarked: !bookmarked }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['concept', conceptId] })
      void queryClient.invalidateQueries({ queryKey: ['concepts'] })
      void queryClient.invalidateQueries({ queryKey: ['learning-areas'] })
      void queryClient.invalidateQueries({ queryKey: ['learning-area'] })
    },
  })
  return (
    <button className="secondary-button" type="button" aria-pressed={bookmarked} disabled={mutation.isPending} onClick={() => mutation.mutate()}>
      {mutation.isPending ? '저장 중…' : bookmarked ? '북마크 해제' : '북마크'}
    </button>
  )
}

function ProgressActionButton({ conceptId, status, label }: { conceptId: number; status: Exclude<LearningStatus, 'UNSEEN'>; label: string }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => updateConceptProgress(conceptId, { status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['concept', conceptId] })
      void queryClient.invalidateQueries({ queryKey: ['concepts'] })
      void queryClient.invalidateQueries({ queryKey: ['learning-areas'] })
      void queryClient.invalidateQueries({ queryKey: ['learning-area'] })
    },
  })
  return <button className="primary-button" type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? '저장 중…' : label}</button>
}

export function ConceptPage() {
  const { conceptId: conceptIdParam } = useParams({ from: '/concepts/$conceptId' })
  const conceptId = Number(conceptIdParam)
  const queryClient = useQueryClient()
  const viewedConceptRef = useRef<number | null>(null)
  const conceptQuery = useQuery({
    queryKey: ['concept', conceptId],
    queryFn: () => getConcept(conceptId),
    enabled: Number.isSafeInteger(conceptId) && conceptId > 0,
  })
  const viewMutation = useMutation({
    mutationFn: () => recordConceptView(conceptId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['learning-areas'] })
      void queryClient.invalidateQueries({ queryKey: ['concepts'] })
    },
  })

  useEffect(() => {
    if (conceptQuery.data && viewedConceptRef.current !== conceptId) {
      viewedConceptRef.current = conceptId
      viewMutation.mutate()
    }
  }, [conceptId, conceptQuery.data, viewMutation])

  useEffect(() => {
    if (conceptQuery.data) document.title = `${conceptQuery.data.title} · CSForge`
    return () => { document.title = 'CSForge' }
  }, [conceptQuery.data])

  if (!Number.isSafeInteger(conceptId) || conceptId <= 0) return <ErrorState message="유효하지 않은 Concept입니다." onRetry={() => window.history.back()} />
  if (conceptQuery.isPending) return <PageSkeleton rows={6} />
  if (conceptQuery.isError) return <ErrorState message="Concept를 불러오지 못했습니다." onRetry={() => void conceptQuery.refetch()} />

  const data = conceptQuery.data
  return (
    <section className="page-section concept-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/learning" search={defaultLearningSearch}>Learning</Link>
        <span>/</span>
        <Link to="/learning/$areaSlug" params={{ areaSlug: data.area.slug }} search={defaultLearningSearch}>{data.area.name}</Link>
        <span>/</span>
        <strong>{data.topic.title}</strong>
      </nav>
      <ConceptContent data={data} conceptId={conceptId} />
    </section>
  )
}
