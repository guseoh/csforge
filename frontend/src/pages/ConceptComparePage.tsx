import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import { ConceptReferences } from '../components/ConceptReferences'
import { MarkdownContent } from '../components/MarkdownContent'
import { getConcept, getConcepts } from '../lib/learning-api'
import { getPublicConcept, getPublicConcepts, type PublicConcept } from '../lib/public-api'
import { useAccess } from '../lib/access-context'
import { defaultQuizSearch } from '../lib/quiz-search'
import { defaultLearningSearch } from '../lib/learning-search'
import type { CompareSearch } from '../lib/compare-search'

type Heading = { id: string; title: string; sub: boolean }

/** Natural document scrolling keeps both canonical articles readable without nested panes. Does not record learning activity. */
export function CompareColumn({ concept, side }: { concept: PublicConcept; side: 'left' | 'right' }) {
  const scroll = useRef<HTMLDivElement>(null)
  const [headings, setHeadings] = useState<Heading[]>([])
  useEffect(() => {
    const article = scroll.current?.querySelector('article')
    if (!article) return
    setHeadings(Array.from(article.querySelectorAll<HTMLHeadingElement>('h2, h3')).map((h, n) => {
      h.id = `compare-${side}-${concept.id}-heading-${n}`
      return { id: h.id, title: h.textContent?.trim() || `섹션 ${n + 1}`, sub: h.tagName === 'H3' }
    }))
  }, [side, concept.id, concept.contentMarkdown])
  return (
    <section className="compare-column" aria-labelledby={`compare-${side}-title`}>
      <header className="compare-column-header">
        <span className="eyebrow">{side === 'left' ? '첫 번째 개념' : '두 번째 개념'}</span>
        <h2 id={`compare-${side}-title`}>{concept.title}</h2>
        <p className="helper-text">{concept.area.name} · {concept.topic.title} · 레벨 {concept.level}</p>
        <nav className="compare-links" aria-label={`${concept.title} 이동`}>
          <Link className="secondary-button" to="/concepts/$conceptId" params={{ conceptId: String(concept.id) }}>개념 상세 보기</Link>
          <Link className="text-button" to="/quiz" search={{ ...defaultQuizSearch, areas: concept.area.slug, concepts: String(concept.id) }}>관련 문제 풀기</Link>
        </nav>
      </header>
      <div className="compare-column-body" ref={scroll} role="region" aria-label={`${concept.title} 읽기 영역`}>
        {concept.summary && <div className="compare-summary"><strong>핵심 요약</strong><p>{concept.summary}</p></div>}
        {headings.length > 0 && <details className="compare-toc">
          <summary>이 개념의 목차 ({headings.length})</summary>
          <nav aria-label={`${concept.title} 목차`}>
            {headings.map((h) => <a key={h.id} className={h.sub ? 'sub' : undefined} href={`#${h.id}`}
              onClick={(event) => { event.preventDefault(); scroll.current?.querySelector(`#${h.id}`)?.scrollIntoView({ block: 'start' }) }}>{h.title}</a>)}
          </nav>
        </details>}
        <article className="compare-article" aria-label={`${concept.title} 본문`}>
          <MarkdownContent dedupeLeadingHeading={concept.title}>{concept.contentMarkdown}</MarkdownContent>
        </article>
        <section className="compare-references">
          <h3>관련 자료 ({concept.references.length})</h3>
          {concept.references.length ? <ConceptReferences references={concept.references} /> : <p className="helper-text">등록된 자료가 없습니다.</p>}
        </section>
      </div>
    </section>
  )
}

export function ConceptComparePage() {
  const { authenticated } = useAccess()
  const scope = authenticated ? 'private' : 'public'
  const loadConcept = authenticated ? getConcept : getPublicConcept
  const loadConcepts = authenticated ? getConcepts : getPublicConcepts
  const { left, right } = useSearch({ from: '/compare' })
  const navigate = useNavigate({ from: '/compare' })
  const [term, setTerm] = useState('')
  const [activeSide, setActiveSide] = useState<'left' | 'right'>(left === undefined ? 'left' : 'right')
  const pickerInput = useRef<HTMLInputElement>(null)
  const q = term.trim()
  const targetSide = left === undefined ? 'left' : activeSide
  const first = useQuery({ queryKey: ['concept', left, scope], queryFn: () => loadConcept(left!), enabled: left !== undefined })
  const second = useQuery({
    queryKey: ['concept', right, scope], queryFn: () => loadConcept(right!),
    enabled: left !== undefined && right !== undefined && left !== right,
  })
  const choices = useQuery({
    queryKey: ['concepts', 'compare-picker', q, scope],
    queryFn: () => loadConcepts({ q, page: 0, size: 10, sort: 'TITLE' }),
    enabled: q.length >= 2,
  })
  const duplicate = left !== undefined && right !== undefined && left === right
  const choose = (id: number) => {
    const search: CompareSearch = targetSide === 'left'
      ? { left: id, ...(right !== undefined && right !== id ? { right } : {}) }
      : left === undefined ? { left: id } : { left, right: id }
    if (id === (targetSide === 'left' ? right : left)) return
    void navigate({ search })
    setActiveSide('right')
    setTerm('')
  }
  const focusSide = (side: 'left' | 'right') => {
    setActiveSide(side)
    pickerInput.current?.focus()
  }
  const clearSecond = () => {
    setActiveSide('right')
    void navigate({ search: { left } })
  }

  useEffect(() => {
    document.title = '개념 비교 · CSForge'
    return () => { document.title = 'CSForge' }
  }, [])

  return <section className="page-section compare-page">
    <nav className="breadcrumb" aria-label="탐색 경로"><Link to="/learning" search={defaultLearningSearch}>학습</Link><span>/</span><strong>개념 비교</strong></nav>
    <header className="compare-heading">
      <p className="eyebrow">개념 비교</p>
      <h1>두 개념 나란히 읽기</h1>
      <p className="lead">내용과 실행 흐름을 직접 비교해 보세요. 원문을 수정하거나 자동으로 차이점을 판정하지 않습니다.</p>
    </header>
    <section className="compare-selector" aria-label="비교 개념 선택">
      <div className="compare-slots" role="group" aria-label="변경할 개념 선택">
        <button type="button" className={`compare-slot${targetSide === 'left' ? ' selected' : ''}`}
          aria-pressed={targetSide === 'left'} onClick={() => focusSide('left')}>
          <span>01 · 첫 번째 개념</span>
          <strong>{first.data?.title ?? (left === undefined ? '개념을 선택하세요' : '개념을 불러오는 중')}</strong>
          <small>클릭해서 변경</small>
        </button>
        <button type="button" className={`compare-slot${targetSide === 'right' ? ' selected' : ''}`}
          aria-pressed={targetSide === 'right'} disabled={left === undefined}
          onClick={() => focusSide('right')}>
          <span>02 · 두 번째 개념</span>
          <strong>{second.data?.title ?? (right === undefined ? '비교할 개념을 선택하세요' : '개념을 불러오는 중')}</strong>
          <small>클릭해서 변경</small>
        </button>
      </div>
      <div className="compare-picker">
        <label htmlFor="compare-search">{targetSide === 'left' ? '첫 번째 개념 검색' : '두 번째 개념 검색'}</label>
        <input ref={pickerInput} id="compare-search" type="search" value={term} onChange={(event) => setTerm(event.target.value)}
          placeholder="제목 또는 요약으로 검색 (2글자 이상)" autoComplete="off" />
        {q.length >= 2 && <div className="compare-choices" aria-live="polite">
          {choices.isPending ? <p role="status">검색 중…</p> : choices.isError
            ? <div role="alert">검색에 실패했습니다. <button className="text-button" type="button" onClick={() => void choices.refetch()}>재시도</button></div>
            : choices.data?.items.length ? choices.data.items.map((c) => (
              <button key={c.id} type="button" disabled={c.id === left || c.id === right} onClick={() => choose(c.id)}>
                <strong>{c.title}</strong><span>{c.areaName} · {c.topicTitle} · 레벨 {c.level}</span>
              </button>
            )) : <p>검색한 개념이 없습니다.</p>}
        </div>}
        {first.data && right === undefined && targetSide === 'right' && first.data.relatedConcepts.length > 0 && <div className="compare-related">
          <p>관련 개념에서 바로 선택</p>
          {first.data.relatedConcepts.map((related) =>
            <button key={related.id} type="button" disabled={related.id === left}
              onClick={() => choose(related.id)}>{related.title}</button>)}
        </div>}
        {left !== undefined && <div className="compare-picker-actions">
          <button className="text-button" type="button" onClick={() => {
            setActiveSide('left')
            setTerm('')
            void navigate({ search: {} })
          }}>선택 초기화</button>
          {right !== undefined && <button className="text-button" type="button" onClick={clearSecond}>두 번째 개념 제거</button>}
          {right !== undefined && !duplicate && <button className="text-button" type="button"
            onClick={() => void navigate({ search: { left: right, right: left } })}>좌우 바꾸기</button>}
        </div>}
      </div>
    </section>
    {left === undefined && <div className="compare-grid">
      <div className="compare-placeholder" role="status">
        <strong>첫 번째 개념</strong><p>위 검색에서 먼저 읽을 개념을 선택하세요.</p>
      </div>
      <div className="compare-placeholder">
        <strong>두 번째 개념</strong><p>첫 번째 개념을 선택한 뒤 비교할 개념을 고를 수 있습니다.</p>
      </div>
    </div>}
    {left !== undefined && first.isPending && <PageSkeleton rows={3} />}
    {left !== undefined && (first.isError || (!first.isPending && !first.data)) &&
      <ErrorState message="첫 번째 개념이 없거나 공개되지 않았습니다." onRetry={() => void first.refetch()} />}
    {duplicate && <div className="compare-notice" role="alert">같은 개념끼리는 비교할 수 없습니다. <button className="text-button" type="button" onClick={clearSecond}>다시 선택</button></div>}
    {first.data && !duplicate && <div className="compare-grid">
      <CompareColumn key={`left-${left}`} concept={first.data} side="left" />
      {right === undefined ? <div className="compare-placeholder" role="status">
        <strong>두 번째 개념을 선택하세요</strong>
        <p>관련 개념을 선택하거나 제목으로 검색하면 두 본문이 나란히 표시됩니다.</p>
        <button className="secondary-button" type="button" onClick={() => focusSide('right')}>비교할 개념 찾기</button>
      </div> : second.isPending ? <PageSkeleton rows={3} /> :
        second.isError || !second.data ? <div className="compare-missing" role="alert">
          <p>두 번째 개념이 없거나 공개되지 않았습니다.</p>
          <button className="secondary-button" type="button" onClick={() => void second.refetch()}>재시도</button>
          <button className="text-button" type="button" onClick={clearSecond}>다른 개념 선택</button>
        </div> : <CompareColumn key={`right-${right}`} concept={second.data} side="right" />}
    </div>}
  </section>
}
