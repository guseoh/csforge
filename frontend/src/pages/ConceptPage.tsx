import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EmptyState, ErrorState, PageSkeleton } from '../components/AsyncStates'
import { LearningDiagram } from '../components/LearningDiagram'
import { MarkdownContent } from '../components/MarkdownContent'
import { useToast } from '../components/toast/ToastProvider'
import {
  getConcept,
  recordConceptView,
  savePersonalNote,
  updateConceptProgress,
  type ConceptDetail as ConceptDetailModel,
  type LearningStatus,
  type ReferenceType,
} from '../lib/learning-api'
import { defaultLearningSearch } from '../lib/learning-search'
import { defaultQuizSearch } from '../lib/quiz-search'

type NoteState = 'saved' | 'saving' | 'error'

const referenceTypeLabels: Record<ReferenceType, string> = {
  OFFICIAL: '공식 문서',
  KOREAN_BLOG: '한글 기술 자료',
  COMPANY_TECH_BLOG: '기업 기술 블로그',
  BOOK: '도서',
  PAPER: '논문',
  COURSE: '강의',
  OTHER: '기타',
}

const learningStatusLabels: Record<LearningStatus, string> = {
  UNSEEN: '미학습',
  LEARNING: '학습 중',
  COMPLETED: '학습 완료',
  REVIEW_NEEDED: '복습 필요',
}

function extractOutline(markdown: string) {
  return markdown
    .split('\n')
    .map((line) => line.match(/^#{2,3}\s+(.+)$/)?.[1]?.trim())
    .filter((heading): heading is string => Boolean(heading))
    .filter((heading) => !/^면접에서 설명한다면$/i.test(heading))
    .slice(0, 10)
}

function ConceptContent({ data, conceptId }: { data: ConceptDetailModel; conceptId: number }) {
  const queryClient = useQueryClient()
  const [noteContent, setNoteContent] = useState('')
  const noteContentRef = useRef('')
  const lastSavedContentRef = useRef('')
  const hydratedConceptRef = useRef<number | null>(null)
  const noteTimerRef = useRef<number | undefined>(undefined)
  const [noteState, setNoteState] = useState<NoteState>('saved')
  const outline = extractOutline(data.contentMarkdown)

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
          <span className="chip">L{data.level}</span>
          <span className={`chip status-${data.progress.learningStatus.toLowerCase()}`}>{learningStatusLabels[data.progress.learningStatus]}</span>
          {data.progress.bookmarked && <span className="chip bookmark-chip">★ 북마크됨</span>}
        </div>
        <h1>{data.title}</h1>
      </div>

      <section className="lesson-overview" aria-label="학습 개요">
        <div className="lesson-objective">
          <p className="eyebrow">이번에 배울 것</p>
          <p>{data.summary ?? `${data.title}의 핵심 동작과 판단 기준을 이해합니다.`}</p>
          <div className="lesson-context">
            <span>{data.area.name}</span>
            <span>›</span>
            <span>{data.topic.title}</span>
          </div>
        </div>
        {outline.length > 0 && (
          <div className="lesson-outline">
            <p className="eyebrow">이 노트의 흐름</p>
            <ol>
              {outline.map((heading) => <li key={heading}>{heading}</li>)}
            </ol>
          </div>
        )}
      </section>

      <div className="concept-actions" aria-label="학습 동작">
        <Link className="primary-button" to="/quiz" search={{ ...defaultQuizSearch, areas: data.area.slug, concepts: String(conceptId) }}>이 개념으로 퀴즈 풀기</Link>
        <ProgressActionButton conceptId={conceptId} status="COMPLETED" label="학습 완료" secondary />
        <ProgressActionButton conceptId={conceptId} status="REVIEW_NEEDED" label="복습 필요" secondary />
        <BookmarkButton conceptId={conceptId} bookmarked={data.progress.bookmarked} />
      </div>

      <LearningDiagram contentKey={data.contentKey} />
      <MarkdownContent className="concept-reading-content" dedupeLeadingHeading={data.title}>{data.contentMarkdown}</MarkdownContent>

      <section className="detail-section">
        <div className="section-heading">
          <p className="eyebrow">개인 학습 노트</p>
          <span className={`save-state ${noteState}`} role="status">
            {noteState === 'saving' ? '저장 중' : noteState === 'error' ? '저장 실패' : '저장됨'}
          </span>
        </div>
        <textarea
          className="note-editor"
          value={noteContent}
          aria-label="개인 학습 노트"
          placeholder="이 개념에서 기억하고 싶은 내용, 헷갈린 점, 다시 볼 내용을 적어보세요."
          onChange={(event) => queueNoteSave(event.target.value)}
        />
        {noteState === 'error' && (
          <button className="text-button" type="button" onClick={flushNote}>다시 저장</button>
        )}
        <p className="helper-text">입력 후 0.8초 뒤 자동 저장됩니다. Ctrl/Cmd+S로 즉시 저장할 수 있습니다.</p>
      </section>

      <section className="detail-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">같이 보면 좋은 자료</p>
            <p className="section-description">공식 계약을 확인하거나, 개념을 다른 설명과 그림으로 다시 이해할 때 활용하세요.</p>
          </div>
          <span className="result-count">{data.references.length}</span>
        </div>
        {data.references.length === 0 ? <EmptyState message="등록된 참고 자료가 없습니다." /> : (
          <div className="reference-list">
            {data.references.map((reference) => (
              <a className="reference-item" key={reference.id} href={reference.url} target="_blank" rel="noreferrer">
                <div>
                  <strong>{reference.title}</strong>
                  <span>{referenceTypeLabels[reference.type]}{reference.language ? ` · ${reference.language}` : ''}{reference.depth ? ` · ${reference.depth}` : ''}</span>
                  {(reference.recommendation || reference.relationNote) && (
                    <p>{reference.recommendation ?? reference.relationNote}</p>
                  )}
                </div>
                <span className="external-icon" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="detail-section navigation-section">
        <p className="eyebrow">다음 학습</p>
        <div className="concept-navigation">
          {data.previous ? <Link className="navigation-card" to="/concepts/$conceptId" params={{ conceptId: String(data.previous.id) }}><span>← 이전 개념</span><strong>{data.previous.title}</strong></Link> : <span />}
          {data.next ? <Link className="navigation-card next" to="/concepts/$conceptId" params={{ conceptId: String(data.next.id) }}><span>다음 개념 →</span><strong>{data.next.title}</strong></Link> : <span />}
        </div>
        {data.relatedConcepts.length > 0 && (
          <div className="related-list">
            <p className="eyebrow">이 Topic에서 함께 보기</p>
            {data.relatedConcepts.map((related) => <Link key={related.id} to="/concepts/$conceptId" params={{ conceptId: String(related.id) }}>{related.title} <span>L{related.level}</span></Link>)}
          </div>
        )}
      </section>
    </>
  )
}

function BookmarkButton({ conceptId, bookmarked }: { conceptId: number; bookmarked: boolean }) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const mutation = useMutation({
    mutationFn: () => updateConceptProgress(conceptId, { bookmarked: !bookmarked }),
    onSuccess: () => {
      showToast('success', bookmarked ? '북마크를 해제했습니다.' : '북마크에 추가했습니다.')
      void queryClient.invalidateQueries({ queryKey: ['concept', conceptId] })
      void queryClient.invalidateQueries({ queryKey: ['concepts'] })
      void queryClient.invalidateQueries({ queryKey: ['learning-areas'] })
      void queryClient.invalidateQueries({ queryKey: ['learning-area'] })
    },
    onError: () => showToast('error', '북마크 저장에 실패했습니다.'),
  })
  return (
    <button className="secondary-button" type="button" aria-pressed={bookmarked} disabled={mutation.isPending} onClick={() => mutation.mutate()}>
      {mutation.isPending ? '저장 중…' : bookmarked ? '북마크 해제' : '북마크'}
    </button>
  )
}

function ProgressActionButton({ conceptId, status, label, secondary = false }: { conceptId: number; status: Exclude<LearningStatus, 'UNSEEN'>; label: string; secondary?: boolean }) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const mutation = useMutation({
    mutationFn: () => updateConceptProgress(conceptId, { status }),
    onSuccess: () => {
      showToast('success', status === 'COMPLETED' ? '완료 상태를 저장했습니다.' : '복습 필요 상태를 저장했습니다.')
      void queryClient.invalidateQueries({ queryKey: ['concept', conceptId] })
      void queryClient.invalidateQueries({ queryKey: ['concepts'] })
      void queryClient.invalidateQueries({ queryKey: ['learning-areas'] })
      void queryClient.invalidateQueries({ queryKey: ['learning-area'] })
    },
    onError: () => showToast('error', '학습 상태 저장에 실패했습니다.'),
  })
  return <button className={secondary ? 'secondary-button' : 'primary-button'} type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? '저장 중…' : label}</button>
}

export function ConceptPage() {
  const { conceptId: conceptIdParam } = useParams({ from: '/concepts/$conceptId' })
  const conceptId = Number(conceptIdParam)
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const viewedConceptRef = useRef<number | null>(null)
  const conceptQuery = useQuery({
    queryKey: ['concept', conceptId],
    queryFn: () => getConcept(conceptId),
    enabled: Number.isSafeInteger(conceptId) && conceptId > 0,
  })
  const viewMutation = useMutation({
    mutationFn: () => recordConceptView(conceptId),
    onSuccess: (progress) => {
      queryClient.setQueryData<ConceptDetailModel>(['concept', conceptId], (current) =>
        current ? { ...current, progress } : current,
      )
      void queryClient.invalidateQueries({ queryKey: ['learning-areas'] })
      void queryClient.invalidateQueries({ queryKey: ['concepts'] })
    },
    onError: () => showToast('error', '개념 조회 상태를 저장하지 못했습니다.'),
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

  if (!Number.isSafeInteger(conceptId) || conceptId <= 0) return <ErrorState message="유효하지 않은 개념입니다." onRetry={() => window.history.back()} />
  if (conceptQuery.isPending) return <PageSkeleton rows={6} />
  if (conceptQuery.isError) return <ErrorState message="개념을 불러오지 못했습니다." onRetry={() => void conceptQuery.refetch()} />

  const data = conceptQuery.data
  return (
    <section className="page-section concept-page">
      <nav className="breadcrumb" aria-label="현재 학습 위치">
        <Link to="/learning" search={defaultLearningSearch}>학습</Link>
        <span>/</span>
        <Link to="/learning/$areaSlug" params={{ areaSlug: data.area.slug }} search={defaultLearningSearch}>{data.area.name}</Link>
        <span>/</span>
        <strong>{data.topic.title}</strong>
      </nav>
      <ConceptContent data={data} conceptId={conceptId} />
    </section>
  )
}
