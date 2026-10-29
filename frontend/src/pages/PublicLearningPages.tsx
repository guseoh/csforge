import { useState } from 'react'
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { EmptyState, ErrorState, PageSkeleton } from '../components/AsyncStates'
import { ConceptReferences } from '../components/ConceptReferences'
import { MarkdownContent } from '../components/MarkdownContent'
import { CompactConceptArticleToc, useConceptArticleToc } from '../components/ConceptArticleToc'
import { useAccess } from '../lib/access-context'
import { getPublicArea, getPublicAreas, getPublicConcept, getPublicConcepts } from '../lib/public-api'
import { defaultLearningSearch } from '../lib/learning-search'
import { defaultQuizSearch } from '../lib/quiz-search'

export function PublicLearningPage({ home = false }: { home?: boolean }) {
  const query = useQuery({ queryKey: ['public', 'learning-areas'], queryFn: getPublicAreas })
  if (query.isPending) return <PageSkeleton rows={5} />
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />
  const count = query.data.reduce((sum, area) => sum + area.publishedConceptCount, 0)
  return <section className="page-section learning-page">
    <header className="learning-index-header"><div>
      <p className="eyebrow">CSForge · 공개 학습</p>
      <h1>{home ? 'CS·백엔드 개념을 읽고 연결하세요' : '학습 영역'}</h1>
      <p className="lead">{query.data.length}개 영역의 공개 개념 {count.toLocaleString()}개를 주제 순서대로 탐색하세요.</p>
      {home && <Link className="primary-button" to="/learning" search={defaultLearningSearch}>학습 영역 둘러보기</Link>}
    </div></header>
    <div className="public-curriculum">
      {query.data.map((area) => <article key={area.id}>
        <h2><Link to="/learning/$areaSlug" params={{ areaSlug: area.slug }} search={defaultLearningSearch}>{area.name} →</Link></h2>
        <p>{area.description}</p><span className="helper-text">{area.topicCount}개 주제 · {area.publishedConceptCount}개 개념</span>
      </article>)}
    </div>
  </section>
}

export function PublicAreaPage() {
  const { areaSlug } = useParams({ from: '/learning/$areaSlug' })
  const search = useSearch({ from: '/learning/$areaSlug' })
  const navigate = useNavigate({ from: '/learning/$areaSlug' })
  const area = useQuery({ queryKey: ['public', 'area', areaSlug], queryFn: () => getPublicArea(areaSlug) })
  const concepts = useQuery({
    queryKey: ['public', 'concepts', areaSlug, search.topic, search.level, search.q, search.page, search.sort],
    queryFn: () => getPublicConcepts({ area: areaSlug, topic: search.topic,
      level: search.level === 'all' ? undefined : Number(search.level), q: search.q,
      page: search.page, size: 30, sort: search.sort === 'title' ? 'TITLE' : 'CURRICULUM' }),
  })
  if (area.isPending) return <PageSkeleton rows={5} />
  if (area.isError) return <ErrorState onRetry={() => void area.refetch()} />
  return <section className="page-section public-area-page">
    <nav className="breadcrumb" aria-label="탐색 경로"><Link to="/learning" search={defaultLearningSearch}>학습 영역</Link><span>/</span><strong>{area.data.name}</strong></nav>
    <h1>{area.data.name}</h1><p className="lead">{area.data.description}</p>
    <details className="public-topic-disclosure" open>
      <summary>학습 순서 · 주제 선택</summary>
      <nav className="public-topic-navigation" aria-label="주제 목차">{area.data.topics.map((t) => <Link key={t.id} to="/learning/$areaSlug" params={{ areaSlug }}
        aria-current={search.topic === t.id ? 'page' : undefined}
        search={{ ...search, topic: t.id, page: 0 }}>{t.title}</Link>)}</nav>
    </details>
    <details className="concept-filter-disclosure"><summary>개념 검색·레벨·정렬</summary>
    <form key={`${areaSlug}:${search.topic}:${search.level}:${search.q}:${search.sort}`} className="public-filters" onSubmit={(event) => {
      event.preventDefault()
      const form = new FormData(event.currentTarget)
      void navigate({ search: { ...defaultLearningSearch, q: String(form.get('q') ?? ''), topic: Number(form.get('topic')) || undefined,
        level: String(form.get('level')) as 'all' | '1' | '2' | '3', sort: String(form.get('sort')) as 'curriculum' | 'title' } })
    }}>
      <label>주제<select name="topic" defaultValue={search.topic ?? ''}><option value="">모든 주제</option>{area.data.topics.map((t) => <option key={t.id} value={t.id}>{t.title} ({t.publishedConceptCount})</option>)}</select></label>
      <label>레벨<select name="level" defaultValue={search.level}><option value="all">모든 레벨</option>{[1, 2, 3].map((l) => <option key={l} value={l}>레벨 {l}</option>)}</select></label>
      <label>개념 검색<input name="q" type="search" defaultValue={search.q} maxLength={200} /></label>
      <label>정렬<select name="sort" defaultValue={search.sort}><option value="curriculum">커리큘럼 순</option><option value="title">제목 순</option></select></label>
      <button className="secondary-button" type="submit">적용</button>
    </form></details>
    {concepts.isPending ? <PageSkeleton rows={4} /> : concepts.isError ? <ErrorState onRetry={() => void concepts.refetch()} /> : <>
      {concepts.data.items.length === 0 && <EmptyState message="조건에 맞는 공개 개념이 없습니다." />}
      <div className="public-curriculum public-concept-list">{concepts.data.items.map((c) => <article key={c.id}>
        <span className="helper-text">{c.topicTitle} · 레벨 {c.level}</span>
        <h2><Link to="/concepts/$conceptId" params={{ conceptId: String(c.id) }}>{c.title} →</Link></h2><p>{c.summary}</p>
      </article>)}</div>
      <nav className="public-page-navigation" aria-label="개념 페이지">
        <button className="secondary-button" disabled={!concepts.data.page.hasPrevious} onClick={() => void navigate({ search: { ...search, page: search.page - 1 } })}>이전</button>
        <span>{search.page + 1} / {Math.max(1, concepts.data.page.totalPages)}</span>
        <button className="secondary-button" disabled={!concepts.data.page.hasNext} onClick={() => void navigate({ search: { ...search, page: search.page + 1 } })}>다음</button>
      </nav>
    </>}
  </section>
}

export function PublicConceptPage() {
  const { conceptId } = useParams({ from: '/concepts/$conceptId' })
  const { requestLogin } = useAccess()
  const [tocOpen, setTocOpen] = useState(false)
  const query = useQuery({ queryKey: ['public', 'concept', Number(conceptId)], queryFn: () => getPublicConcept(Number(conceptId)) })
  const toc = useConceptArticleToc(Number(conceptId), query.data?.contentMarkdown ?? '')
  if (query.isPending) return <PageSkeleton rows={5} />
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />
  const concept = query.data
  return <section className="page-section concept-page public-reader">
    <nav className="breadcrumb" aria-label="탐색 경로"><Link to="/learning" search={defaultLearningSearch}>학습</Link><span>/</span>
      <Link to="/learning/$areaSlug" params={{ areaSlug: concept.area.slug }} search={{ ...defaultLearningSearch, topic: concept.topic.id }}>{concept.area.name} · {concept.topic.title}</Link></nav>
    <header className="concept-reader-header"><p className="concept-kicker">{concept.topic.title}</p><h1>{concept.title}</h1>{concept.summary && <p className="lead">{concept.summary}</p>}
      <div className="concept-reader-meta" aria-label="개념 정보"><span>{concept.area.name}</span><span>레벨 {concept.level}</span><span>공개 읽기</span></div></header>
    <div className="public-reader-actions"><button className="text-button" aria-expanded={tocOpen} onClick={() => setTocOpen(!tocOpen)}>커리큘럼 {tocOpen ? '접기' : '보기'}</button>
      <Link className="text-button" to="/compare" search={{ left: concept.id }}>다른 개념과 비교</Link></div>
    {tocOpen && <nav aria-label="관련 개념">{concept.relatedConcepts.map((c) => <Link key={c.id} to="/concepts/$conceptId" params={{ conceptId: String(c.id) }}>{c.title}</Link>)}
      <Link to="/learning/$areaSlug" params={{ areaSlug: concept.area.slug }} search={defaultLearningSearch}>전체 커리큘럼 →</Link></nav>}
    <CompactConceptArticleToc headings={toc.headings} activeId={toc.activeId} onNavigate={toc.navigateToHeading} />
    <article className="concept-reading-content" aria-label={`${concept.title} 학습 본문`}><MarkdownContent dedupeLeadingHeading={concept.title}>{concept.contentMarkdown}</MarkdownContent></article>
    <section className="detail-section" id="references"><h2>함께 볼 자료</h2>{concept.references.length ? <ConceptReferences references={concept.references} /> : <p>등록된 자료가 없습니다.</p>}</section>
    <section className="detail-section"><h2>학습 기록 남기기</h2><p>소유자로 로그인하면 읽기 진도와 개인 노트를 저장할 수 있습니다.</p>
      <div className="public-reader-actions">{['학습 완료', '복습 필요', '북마크', '개인 노트', '회상 저장'].map((label) => <button className="secondary-button" key={label} onClick={() => requestLogin()}>{label}</button>)}
        <Link className="primary-button" to="/quiz" search={{ ...defaultQuizSearch, concepts: String(concept.id), areas: concept.area.slug }}>관련 문제 풀기</Link></div></section>
    <nav aria-label="이전 다음 개념">{concept.previous && <Link to="/concepts/$conceptId" params={{ conceptId: String(concept.previous.id) }}>← {concept.previous.title}</Link>}
      {concept.next && <Link to="/concepts/$conceptId" params={{ conceptId: String(concept.next.id) }}>{concept.next.title} →</Link>}</nav>
  </section>
}
