import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { EmptyState, ErrorState, PageSkeleton } from '../components/AsyncStates'
import { ConceptReferences } from '../components/ConceptReferences'
import { MarkdownContent } from '../components/MarkdownContent'
import { getConcept, getConcepts, type ConceptDetail } from '../lib/learning-api'
import { defaultQuizSearch } from '../lib/quiz-search'
import type { CompareSearch } from '../lib/compare-search'

type Heading = { id: string; title: string; sub: boolean }

/** Independent scroll and TOC keep each canonical article intact. Does not record learning activity. */
export function CompareColumn({ concept, side }: { concept: ConceptDetail; side: 'left' | 'right' }) {
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
      <div className="compare-column-scroll" ref={scroll} tabIndex={0} role="region" aria-label={`${concept.title} 읽기 영역`}>
        {concept.summary && <div className="compare-summary"><strong>핵심 요약</strong><p>{concept.summary}</p></div>}
        {headings.length > 0 && <details className="compare-toc">
          <summary>이 개념의 목차 ({headings.length})</summary>
          <nav aria-label={`${concept.title} 목차`}>
            {headings.map((h) => <a key={h.id} className={h.sub ? 'sub' : undefined} href={`#${h.id}`}
              onClick={(event) => { event.preventDefault(); scroll.current?.querySelector(`#${h.id}`)?.scrollIntoView({ block: 'nearest' }) }}>{h.title}</a>)}
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
  const { left, right } = useSearch({ from: '/compare' })
  const navigate = useNavigate({ from: '/compare' })
  const [term, setTerm] = useState('')
  const q = term.trim()
  const first = useQuery({ queryKey: ['concept', left], queryFn: () => getConcept(left!), enabled: left !== undefined })
  const second = useQuery({
    queryKey: ['concept', right], queryFn: () => getConcept(right!),
    enabled: left !== undefined && right !== undefined && left !== right,
  })
  const choices = useQuery({
    queryKey: ['concepts', 'compare-picker', q],
    queryFn: () => getConcepts({ q, page: 0, size: 10, sort: 'TITLE' }),
    enabled: q.length >= 2,
  })
  const duplicate = left !== undefined && right !== undefined && left === right
  const choose = (id: number) => {
    const search: CompareSearch = left === undefined ? { left: id } : { left, right: id }
    void navigate({ search })
    setTerm('')
  }
  const clearSecond = () => void navigate({ search: { left } })

  useEffect(() => {
    document.title = '개념 비교 · CSForge'
    return () => { document.title = 'CSForge' }
  }, [])

  return <section className="page-section compare-page">
    <nav className="breadcrumb" aria-label="탐색 경로"><Link to="/learning">학습</Link><span>/</span><strong>개념 비교</strong></nav>
    <header className="compare-heading">
      <p className="eyebrow">개념 비교 읽기</p><h1>두 개념 나란히 읽기</h1>
      <p className="lead">두 설명을 직접 비교해 적용 상황을 판단하세요. 본문을 기계적으로 diff하거나 AI로 판정하지 않습니다.</p>
    </header>
    <section className="compare-picker" aria-label="비교 개념 선택">
      <label htmlFor="compare-search">{left === undefined ? '첫 번째 개념 검색' : '비교할 개념 검색'}</label>
      <input id="compare-search" type="search" value={term} onChange={(event) => setTerm(event.target.value)}
        placeholder="제목 또는 요약 (2글자 이상)" />
      {q.length >= 2 && <div className="compare-choices" aria-live="polite">
        {choices.isPending ? <p role="status">검색 중…</p> : choices.isError
          ? <div role="alert">검색에 실패했습니다. <button className="text-button" type="button" onClick={() => void choices.refetch()}>재시도</button></div>
          : choices.data?.items.length ? choices.data.items.map((c) => (
            <button key={c.id} type="button" disabled={c.id === left} onClick={() => choose(c.id)}>
              <strong>{c.title}</strong><span>{c.areaName} · {c.topicTitle} · 레벨 {c.level}</span>
            </button>
          )) : <p>검색한 공개 개념이 없습니다.</p>}
      </div>}
      {first.data && right === undefined && first.data.relatedConcepts.length > 0 && <div className="compare-related">
        <p>관련 개념 선택 (기존 연결 기준)</p>
        {first.data.relatedConcepts.map((related) =>
          <button key={related.id} type="button" onClick={() => choose(related.id)}>{related.title}</button>)}
      </div>}
      {left !== undefined && <div className="compare-picker-actions">
        <button className="text-button" type="button" onClick={() => void navigate({ search: {} })}>처음부터 선택</button>
        {right !== undefined && <button className="text-button" type="button" onClick={clearSecond}>두 번째 개념 변경</button>}
        {right !== undefined && !duplicate && <button className="text-button" type="button"
          onClick={() => void navigate({ search: { left: right, right: left } })}>좌우 바꾸기</button>}
      </div>}
    </section>
    {left === undefined && <EmptyState message="먼저 한 개념을 찾아 선택하세요." />}
    {left !== undefined && first.isPending && <PageSkeleton rows={3} />}
    {left !== undefined && (first.isError || (!first.isPending && !first.data)) &&
      <ErrorState message="첫 번째 개념이 없거나 공개되지 않았습니다." onRetry={() => void first.refetch()} />}
    {duplicate && <div className="compare-notice" role="alert">같은 개념끼리는 비교할 수 없습니다. <button className="text-button" type="button" onClick={clearSecond}>다시 선택</button></div>}
    {first.data && right === undefined && <p className="compare-notice" role="status">두 번째 개념을 선택하면 나란히 볼 수 있습니다.</p>}
    {first.data && !duplicate && <div className={right === undefined ? 'compare-grid single' : 'compare-grid'}>
      <CompareColumn key={`left-${left}`} concept={first.data} side="left" />
      {right !== undefined && (second.isPending ? <PageSkeleton rows={3} /> :
        second.isError || !second.data ? <div className="compare-missing" role="alert">
          <p>두 번째 개념이 없거나 공개되지 않았습니다.</p>
          <button className="secondary-button" type="button" onClick={() => void second.refetch()}>재시도</button>
          <button className="text-button" type="button" onClick={clearSecond}>다른 개념 선택</button>
        </div> : <CompareColumn key={`right-${right}`} concept={second.data} side="right" />)}
    </div>}
  </section>
}
