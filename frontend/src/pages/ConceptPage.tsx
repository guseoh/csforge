import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EmptyState, ErrorState, PageSkeleton } from '../components/AsyncStates'
import { ConceptLearningRail } from '../components/ConceptLearningRail'
import { BookmarkCategoryPicker } from '../components/BookmarkCategoryPicker'
import { ConceptReferences } from '../components/ConceptReferences'
import { InterviewRecallSection } from '../components/InterviewRecallSection'
import { ActiveRecallSection } from '../components/ActiveRecallSection'
import { MarkdownContent } from '../components/MarkdownContent'
import { useToast } from '../components/toast/ToastProvider'
import { extractInterviewSection } from '../lib/interview-section'
import {
  getConcept,
  getConceptUnderstanding,
  recordConceptView,
  updateConceptProgress,
  type ConceptDetail as ConceptDetailModel,
  type ConceptAssessmentStatus,
  type LearningStatus,
} from '../lib/learning-api'
import { defaultLearningSearch } from '../lib/learning-search'
import { defaultQuizSearch } from '../lib/quiz-search'
import { useConceptNotePersistence } from '../lib/use-concept-note-persistence'

type TocHeading = {
  id: string
  label: string
  level: 2 | 3
}

const learningStatusLabels: Record<LearningStatus, string> = {
  UNSEEN: '미학습',
  LEARNING: '학습 중',
  COMPLETED: '학습 완료',
  REVIEW_NEEDED: '복습 필요',
}


type ArticleTocProps = {
  headings: TocHeading[]
  activeId: string
  onNavigate: (id: string) => void
}

function useConceptArticleToc(conceptId: number, contentMarkdown: string) {
  const [headings, setHeadings] = useState<TocHeading[]>([])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const articleHeadings = Array.from(
      document.querySelectorAll<HTMLElement>('.concept-reading-content h2, .concept-reading-content h3'),
    )
    const extraSectionCandidates: { element: HTMLElement | null; heading: TocHeading }[] = [
      { element: document.getElementById('active-recall'), heading: { id: 'active-recall', label: '스스로 설명해 보기', level: 2 } },
      { element: document.getElementById('interview'), heading: { id: 'interview', label: '면접에서 이렇게 나옵니다', level: 2 } },
      { element: document.getElementById('learning-actions'), heading: { id: 'learning-actions', label: '학습 마무리', level: 2 } },
      { element: document.getElementById('personal-note'), heading: { id: 'personal-note', label: '학습 노트', level: 2 } },
      { element: document.getElementById('references'), heading: { id: 'references', label: '함께 볼 자료', level: 2 } },
    ]
    const extras = extraSectionCandidates.filter(
      (item): item is { element: HTMLElement; heading: TocHeading } => item.element !== null,
    )
    const mapped = articleHeadings.map((heading, index): TocHeading => {
      const id = 'concept-' + conceptId + '-section-' + (index + 1)
      heading.id = id
      heading.tabIndex = -1
      return {
        id,
        label: heading.textContent?.trim() || '섹션 ' + (index + 1),
        level: heading.tagName === 'H3' ? 3 : 2,
      }
    })
    const targets = [...articleHeadings, ...extras.map((item) => item.element)]
    const items = [...mapped, ...extras.map((item) => item.heading)]
    extras.forEach((item) => { item.element.tabIndex = -1 })
    setHeadings(items)

    let pendingFrame = 0
    const syncActiveSection = () => {
      pendingFrame = 0
      let current = targets[0]?.id ?? ''
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= 132) current = target.id
        else break
      }
      setActiveId(current)
    }
    const scheduleSync = () => {
      if (!pendingFrame) pendingFrame = window.requestAnimationFrame(syncActiveSection)
    }
    const syncHash = () => {
      const hash = window.location.hash.slice(1)
      if (targets.some((target) => target.id === hash)) {
        setActiveId(hash)
        document.getElementById(hash)?.scrollIntoView({ block: 'start' })
      } else {
        scheduleSync()
      }
    }
    window.addEventListener('scroll', scheduleSync, { passive: true })
    window.addEventListener('resize', scheduleSync)
    window.addEventListener('hashchange', syncHash)
    const initialFrame = window.requestAnimationFrame(syncHash)

    return () => {
      window.cancelAnimationFrame(initialFrame)
      if (pendingFrame) window.cancelAnimationFrame(pendingFrame)
      window.removeEventListener('scroll', scheduleSync)
      window.removeEventListener('resize', scheduleSync)
      window.removeEventListener('hashchange', syncHash)
    }
  }, [conceptId, contentMarkdown])

  const navigateToHeading = (id: string) => {
    setActiveId(id)
    window.requestAnimationFrame(() => document.getElementById(id)?.focus({ preventScroll: true }))
  }

  return { headings, activeId, navigateToHeading }
}

function ConceptArticleToc({ headings, activeId, onNavigate }: ArticleTocProps) {
  if (headings.length === 0) return null
  return (
    <aside className="concept-toc concept-toc-desktop" aria-label="이 글의 목차">
      <p className="concept-toc-title">이 글에서</p>
      <nav>
        {headings.map((heading) => (
          <a
            className={(heading.level === 3 ? 'toc-level-3' : 'toc-level-2') + (activeId === heading.id ? ' active' : '')}
            href={'#' + heading.id}
            key={heading.id}
            aria-current={activeId === heading.id ? 'location' : undefined}
            onClick={() => onNavigate(heading.id)}
          >
            {heading.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

export function CompactConceptArticleToc({ headings, activeId, onNavigate }: ArticleTocProps) {
  if (headings.length === 0) return null
  return (
    <details className="concept-toc-compact">
      <summary>이 글의 목차 <span>{headings.length}개 섹션</span></summary>
      <nav aria-label="이 글의 목차">
        {headings.map((heading) => (
          <a
            className={(heading.level === 3 ? 'toc-level-3' : 'toc-level-2') + (activeId === heading.id ? ' active' : '')}
            href={'#' + heading.id}
            key={heading.id}
            aria-current={activeId === heading.id ? 'location' : undefined}
            onClick={() => onNavigate(heading.id)}
          >
            {heading.label}
          </a>
        ))}
      </nav>
    </details>
  )
}

const assessmentLabels: Record<ConceptAssessmentStatus, string> = {
  NOT_ENOUGH_EVIDENCE: '판단할 문제 근거가 아직 부족합니다',
  NEEDS_PRACTICE: '추가 문제 풀이가 필요합니다',
  DEVELOPING: '문제 풀이 근거가 쌓이고 있습니다',
  CONSISTENT: '최근 정답 근거가 비교적 일관됩니다',
}

export function ConceptUnderstandingSection({ conceptId }: { conceptId: number }) {
  const query = useQuery({
    queryKey: ['concept-understanding', conceptId],
    queryFn: () => getConceptUnderstanding(conceptId),
  })

  return (
    <section className="detail-section concept-understanding-section" aria-labelledby="concept-understanding-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">문제 풀이 근거</p>
          <h2 id="concept-understanding-title">실제 정답으로 확인하기</h2>
        </div>
      </div>
      <p className="helper-text">읽기 완료·복습 필요는 학습 행동 기록입니다. 아래 수치는 연결된 문제의 확정 채점을 기반으로 한 참고 정보이며 완전한 숙달 판정이 아닙니다.</p>
      {query.isPending ? (
        <p className="helper-text" role="status">채점 근거 불러오는 중…</p>
      ) : query.isError || !query.data ? (
        <div className="concept-understanding-error" role="alert">
          <span>채점 근거를 불러오지 못했습니다. 읽기와 노트 작성은 계속할 수 있습니다.</span>
          <button className="text-button" type="button" onClick={() => void query.refetch()}>다시 시도</button>
        </div>
      ) : (
        <div className="concept-understanding-data">
          <strong>{assessmentLabels[query.data.assessmentStatus]}</strong>
          <p>
            최근 서로 다른 문제 {query.data.evidence.uniqueQuestions}개 중 {query.data.evidence.correctQuestions}개 정답
            {query.data.assessmentStatus !== 'NOT_ENOUGH_EVIDENCE' && query.data.recentAccuracyPercent !== null
              ? ` · 최근 정답 비율 ${Math.round(query.data.recentAccuracyPercent)}%` : ''}
          </p>
          <span className="helper-text">
            전체 확정 풀이 {query.data.evidence.finalizedAttempts}회 · 자기채점 대기 {query.data.evidence.pendingSelfCheckCount}회
            {' · '}표본은 서로 다른 최근 문제 최대 10개, 최소 3개부터 추세 분류
          </span>
          <p className="helper-text">
            하나의 문제가 여러 개념과 연결될 수 있으므로 이 수치는 해당 개념만의 실력을 분리 측정한 값이 아닙니다.
          </p>
        </div>
      )}
    </section>
  )
}

function ConceptContent({ data, conceptId, tocProps }: { data: ConceptDetailModel; conceptId: number; tocProps: ArticleTocProps }) {
  const { noteContent, noteState, updateNote, flushNote } = useConceptNotePersistence(conceptId, data.personalNote?.content ?? '')
  const { bodyMarkdown, interview } = extractInterviewSection(data.contentMarkdown)
  const isCompleted = data.progress.learningStatus === 'COMPLETED'

  const completionTitle = isCompleted ? '문제로 이해를 확인해보세요.' : '읽은 내용을 학습 기록에 남기세요.'
  const completionDescription = isCompleted
    ? '학습 완료 상태입니다. 관련 문제로 바로 확인하거나, 다시 볼 필요가 있으면 복습 필요로 표시할 수 있습니다.'
    : data.progress.learningStatus === 'REVIEW_NEEDED'
      ? '다시 읽은 뒤 이해가 정리되었다면 학습 완료로 바꾸고, 아직 헷갈리면 복습 필요 상태를 유지하세요.'
      : '본문을 충분히 이해했다면 학습 완료로 표시하세요. 아직 불확실한 부분이 있다면 복습 필요로 남겨두면 됩니다.'

  return (
    <>
      <header className="concept-header concept-reader-header">
        <p className="concept-kicker">{data.topic.title}</p>
        <h1>{data.title}</h1>
        {data.summary && <p className="lead">{data.summary}</p>}
        <div className="concept-reader-meta" aria-label="개념 정보">
          <span>{data.area.name}</span>
          <span>레벨 {data.level}</span>
          <span>{learningStatusLabels[data.progress.learningStatus]}</span>
          {data.progress.bookmarked && <span>북마크됨</span>}
        </div>
      </header>

      <CompactConceptArticleToc {...tocProps} />

      <article id="concept-reading-start" className="concept-reading-content" aria-label={`${data.title} 학습 노트`}>
        <MarkdownContent dedupeLeadingHeading={data.title}>{bodyMarkdown}</MarkdownContent>
      </article>

      <ActiveRecallSection key={data.contentKey} contentKey={data.contentKey} bodyMarkdown={bodyMarkdown} />

      {interview && <InterviewRecallSection section={interview} />}

      <section className="concept-completion-section" id="learning-actions" aria-labelledby="learning-actions-title">
        <div className="concept-completion-copy">
          <p className="eyebrow">학습 마무리</p>
          <h2 id="learning-actions-title">{completionTitle}</h2>
          <p>{completionDescription}</p>
        </div>
        <div className="concept-completion-actions" aria-label="개념 학습 동작">
          <div className="concept-primary-actions">
            <ProgressActionButton
              conceptId={conceptId}
              status="COMPLETED"
              label="학습 완료"
              active={isCompleted}
              primary={!isCompleted}
            />
            <Link
              className={`${isCompleted ? 'primary-button' : 'secondary-button'} concept-quiz-action`}
              to="/quiz"
              search={{ ...defaultQuizSearch, areas: data.area.slug, concepts: String(conceptId) }}
            >
              이 개념 문제 풀기
            </Link>
          </div>
          <div className="concept-secondary-actions">
            <ProgressActionButton
              conceptId={conceptId}
              status="REVIEW_NEEDED"
              label="복습 필요"
              active={data.progress.learningStatus === 'REVIEW_NEEDED'}
            />
            <BookmarkButton conceptId={conceptId} bookmarked={data.progress.bookmarked} />
          </div>
          {data.progress.bookmarked && <BookmarkCategoryPicker conceptId={conceptId} />}
        </div>
      </section>

      <ConceptUnderstandingSection conceptId={conceptId} />

      <section className="detail-section personal-note-section" id="personal-note">
        <div className="section-heading">
          <div>
            <p className="eyebrow">내 학습 기록</p>
            <h2>개인 노트</h2>
          </div>
          <span className={`save-state ${noteState}`} role="status">
            {noteState === 'saving' ? '저장 중' : noteState === 'error' ? '저장 실패' : '저장됨'}
          </span>
        </div>
        <textarea
          className="note-editor"
          value={noteContent}
          aria-label="개인 노트"
          placeholder="헷갈린 점, 다시 볼 이유, 내 말로 정리한 내용을 남겨보세요."
          onChange={(event) => updateNote(event.target.value)}
        />
        {noteState === 'error' && <button className="text-button" type="button" onClick={flushNote}>다시 저장</button>}
        <p className="helper-text">입력 후 0.8초 뒤 자동 저장 · Ctrl/Cmd+S 즉시 저장</p>
      </section>

      <section className="detail-section reference-section" id="references">
        <div className="section-heading">
          <div>
            <p className="eyebrow">더 깊게 보기</p>
            <h2>함께 볼 자료</h2>
          </div>
          <span className="result-count">{data.references.length}</span>
        </div>
        {data.references.length === 0 ? <EmptyState message="등록된 참고 자료가 없습니다." /> : (
          <ConceptReferences references={data.references} />
        )}
      </section>

      <section className="detail-section navigation-section">
        <p className="eyebrow">이어 학습하기</p>
        <div className="concept-navigation">
          {data.previous ? <Link className="navigation-card" to="/concepts/$conceptId" params={{ conceptId: String(data.previous.id) }}><span>← 이전 개념</span><strong>{data.previous.title}</strong></Link> : <span />}
          {data.next ? <Link className="navigation-card next" to="/concepts/$conceptId" params={{ conceptId: String(data.next.id) }}><span>다음 개념 →</span><strong>{data.next.title}</strong></Link> : <span />}
        </div>
        <Link className="secondary-button" to="/compare" search={{ left: conceptId }}>이 개념 비교하기</Link>
        {data.relatedConcepts.length > 0 && (
          <div className="concept-related-list">
            <p className="eyebrow">이 주제의 관련 개념</p>
            {data.relatedConcepts.map((related) => (
              <div className="compare-area-row" key={related.id}>
                <Link to="/concepts/$conceptId" params={{ conceptId: String(related.id) }}>{related.title} <span>레벨 {related.level}</span></Link>
                <Link className="compare-source-link" to="/compare" search={{ left: conceptId, right: related.id }}>나란히 읽기</Link>
              </div>
            ))}
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
      void queryClient.invalidateQueries({ queryKey: ['learning-outline'] })
      void queryClient.invalidateQueries({ queryKey: ['bookmark-assignment', conceptId] })
    },
    onError: () => showToast('error', '북마크 저장에 실패했습니다.'),
  })
  return (
    <button className="text-button concept-bookmark-button" type="button" aria-pressed={bookmarked} disabled={mutation.isPending} onClick={() => mutation.mutate()}>
      {mutation.isPending ? '저장 중' : bookmarked ? '북마크 해제' : '북마크'}
    </button>
  )
}

function ProgressActionButton({
  conceptId,
  status,
  label,
  active = false,
  primary = false,
}: {
  conceptId: number
  status: Exclude<LearningStatus, 'UNSEEN'>
  label: string
  active?: boolean
  primary?: boolean
}) {
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
      void queryClient.invalidateQueries({ queryKey: ['learning-outline'] })
    },
    onError: () => showToast('error', '학습 상태 저장에 실패했습니다.'),
  })
  return (
    <button
      className={`${primary ? 'primary-button' : 'secondary-button'} concept-status-button${active ? ' active' : ''}`}
      type="button"
      aria-pressed={active}
      disabled={mutation.isPending || active}
      onClick={() => mutation.mutate()}
    >
      {mutation.isPending ? '저장 중' : label}
    </button>
  )
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
      void queryClient.invalidateQueries({ queryKey: ['learning-outline'] })
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
  if (conceptQuery.isError || !conceptQuery.data) return <ErrorState message="개념을 불러오지 못했습니다." onRetry={() => void conceptQuery.refetch()} />

  return <ConceptReaderLayout data={conceptQuery.data} conceptId={conceptId} />
}

function ConceptReaderLayout({ data, conceptId }: { data: ConceptDetailModel; conceptId: number }) {
  const { headings, activeId, navigateToHeading } = useConceptArticleToc(conceptId, data.contentMarkdown)
  const tocProps = { headings, activeId, onNavigate: navigateToHeading }

  return (
    <div className="concept-workspace concept-reading-workspace">
      <ConceptLearningRail concept={data} />
      <section className="page-section concept-page">
        <nav className="breadcrumb" aria-label="현재 학습 위치">
          <Link to="/learning" search={defaultLearningSearch}>학습</Link>
          <span>/</span>
          <Link
            to="/learning/$areaSlug"
            params={{ areaSlug: data.area.slug }}
            search={defaultLearningSearch}
            hash={'topic-' + data.topic.id}
          >
            {data.area.name}
          </Link>
          <span>/</span>
          <strong>{data.topic.title}</strong>
        </nav>
        <Link className="topic-focus-back-link" to="/learning/$areaSlug/topics/$topicId/focus" params={{ areaSlug: data.area.slug, topicId: String(data.topic.id) }}>
          Topic 집중 학습으로 돌아가기
        </Link>
        <ConceptContent key={conceptId} data={data} conceptId={conceptId} tocProps={tocProps} />
      </section>
      <ConceptArticleToc {...tocProps} />
    </div>
  )
}
