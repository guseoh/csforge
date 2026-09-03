import type { FormEvent, ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import {
  getSearchFilterOptions,
  getSearchStatus,
  reindexSearch,
  searchDocuments,
  type SearchDocumentType,
  type SearchResultItem,
} from '../lib/search-api'
import { csvSearchValues, toggleCsvValue, type SearchSearch } from '../lib/search-search'
import { addRecentSearch, primarySearchDestination, relatedConceptDestination, segmentSearchHighlight } from '../lib/search-ui'
import '../search.css'

const DOCUMENT_TYPES: { value: SearchDocumentType; label: string }[] = [
  { value: 'CONCEPT', label: 'Concept' },
  { value: 'QUESTION', label: 'Question' },
  { value: 'PERSONAL_NOTE', label: 'Personal note' },
  { value: 'WRONG_NOTE', label: 'Wrong note' },
  { value: 'REFERENCE', label: 'Reference' },
]

const RECENT_KEY = 'csforge.search.recent.v1'

function HighlightText({ value }: { value: string }): ReactNode {
  return segmentSearchHighlight(value).map((segment, index) => segment.highlighted
    ? <mark key={index}>{segment.text}</mark>
    : <span key={index}>{segment.text}</span>)
}

function rememberQuery(query: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    const recent = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
    localStorage.setItem(RECENT_KEY, JSON.stringify(addRecentSearch(recent, query)))
  } catch {
    localStorage.setItem(RECENT_KEY, JSON.stringify([query.trim()]))
  }
}

function resultContext(item: SearchResultItem): string {
  const contexts = item.areaNames.map((area, index) => {
    const topic = item.topicTitles[index] ?? item.topicTitles[0]
    return topic ? `${area} · ${topic}` : area
  })
  if (contexts.length > 0) return contexts.join(' / ')
  return item.levels.length > 0 ? `Level ${item.levels.join(', ')}` : 'Search result'
}

export function SearchPage() {
  const search = useSearch({ from: '/search' })
  const navigate = useNavigate({ from: '/search' })
  const queryClient = useQueryClient()
  const status = useQuery({
    queryKey: ['search-status'],
    queryFn: getSearchStatus,
    refetchInterval: (query) => query.state.data?.state === 'REINDEXING' ? 1500 : false,
  })
  const filters = useQuery({ queryKey: ['search-filter-options'], queryFn: getSearchFilterOptions, staleTime: 60_000 })
  const results = useQuery({
    queryKey: ['search', search],
    queryFn: () => searchDocuments({ q: search.q, types: search.types, areas: search.areas, topics: search.topics, levels: search.levels, sort: search.sort, page: search.page }),
    enabled: search.q.trim().length > 0 && status.data?.state === 'READY',
  })
  const reindex = useMutation({
    mutationFn: reindexSearch,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['search-status'] })
      await queryClient.invalidateQueries({ queryKey: ['search'] })
    },
  })

  const update = (changes: Partial<SearchSearch>) => void navigate({
    search: (current) => ({ ...current, ...changes }),
  })
  const updateFilter = (key: 'types' | 'areas' | 'topics' | 'levels', value: string) => update({
    [key]: toggleCsvValue(search[key], value),
    page: 0,
  })
  const selectedAreas = csvSearchValues(search.areas)
  const visibleTopicGroups = filters.data?.filter((area) => selectedAreas.length === 0 || selectedAreas.includes(area.areaSlug)) ?? []

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const q = String(data.get('q') ?? '').trim()
    if (!q) return
    rememberQuery(q)
    update({ q, page: 0 })
  }

  const openResult = (item: SearchResultItem) => {
    const destination = primarySearchDestination(item)
    if (!destination) return
    if (destination.kind === 'external') {
      window.open(destination.url, '_blank', 'noopener,noreferrer')
    } else if (destination.kind === 'concept') {
      void navigate({ to: '/concepts/$conceptId', params: { conceptId: String(destination.conceptId) } })
    } else {
      void navigate({ to: '/wrong-notes/$questionId', params: { questionId: String(destination.questionId) } })
    }
  }

  if (status.isPending) return <PageSkeleton rows={5} />
  if (status.isError) return <ErrorState message="Search 상태를 확인하지 못했습니다. 다른 학습 기능은 계속 사용할 수 있습니다." onRetry={() => void status.refetch()} />

  return (
    <section className="page-section search-page">
      <div className="page-heading search-heading">
        <div>
          <p className="eyebrow">Knowledge retrieval</p>
          <h1>Search</h1>
          <p className="lead">Concept, Question, 개인 메모, 오답 기록, Reference를 한 번에 검색합니다.</p>
        </div>
        <div className={`search-health search-health-${status.data.state.toLowerCase()}`}>
          <strong>{status.data.state.replace('_', ' ')}</strong>
          <span>{status.data.indexedDocuments.toLocaleString()} indexed · {status.data.pendingOutboxEvents} pending</span>
        </div>
      </div>

      <form className="search-form" onSubmit={submit}>
        <input name="q" defaultValue={search.q} key={search.q} maxLength={200} placeholder="예: volatile happens-before, DB lock, Kafka retry" aria-label="Search query" />
        <button className="primary-button" type="submit">Search</button>
      </form>

      {status.data.state === 'NOT_READY' && (
        <div className="search-recovery-card">
          <div><strong>Search index가 아직 준비되지 않았습니다.</strong><span>PostgreSQL canonical data에서 Elasticsearch index를 다시 만들 수 있습니다.</span></div>
          <button className="primary-button" type="button" disabled={reindex.isPending} onClick={() => reindex.mutate()}>{reindex.isPending ? 'Reindexing…' : 'Reindex'}</button>
        </div>
      )}
      {status.data.state === 'REINDEXING' && <div className="search-recovery-card"><div><strong>Search index를 재구성하고 있습니다.</strong><span>기존 alias는 cutover 전까지 유지되며 완료 후 새 index로 교체됩니다.</span></div></div>}
      {status.data.state === 'UNAVAILABLE' && <div className="search-recovery-card search-recovery-error"><div><strong>Elasticsearch에 연결할 수 없습니다.</strong><span>Search만 일시적으로 사용할 수 없습니다. Learning, Quiz, Review 데이터는 PostgreSQL에 그대로 유지됩니다.</span></div></div>}
      {reindex.isError && <p className="search-inline-error">Reindex 요청에 실패했습니다. Search 인프라 상태를 확인한 뒤 다시 시도하세요.</p>}

      <div className="search-layout">
        <aside className="search-filters" aria-label="Search filters">
          <div className="search-filter-heading"><strong>Filters</strong><button type="button" onClick={() => update({ types: '', areas: '', topics: '', levels: '', page: 0 })}>Clear</button></div>
          <fieldset>
            <legend>Type</legend>
            {DOCUMENT_TYPES.map((type) => <label key={type.value}><input type="checkbox" checked={csvSearchValues(search.types).includes(type.value)} onChange={() => updateFilter('types', type.value)} />{type.label}</label>)}
          </fieldset>
          <fieldset>
            <legend>Level</legend>
            {[1, 2, 3].map((level) => <label key={level}><input type="checkbox" checked={csvSearchValues(search.levels).includes(String(level))} onChange={() => updateFilter('levels', String(level))} />Level {level}</label>)}
          </fieldset>
          <fieldset>
            <legend>Area</legend>
            {filters.isPending && <span className="search-filter-muted">Loading…</span>}
            {filters.data?.map((area) => <label key={area.areaSlug}><input type="checkbox" checked={selectedAreas.includes(area.areaSlug)} onChange={() => updateFilter('areas', area.areaSlug)} />{area.areaName}</label>)}
          </fieldset>
          {visibleTopicGroups.length > 0 && (
            <fieldset>
              <legend>Topic</legend>
              {visibleTopicGroups.flatMap((area) => area.topics.map((topic) => <label key={topic.contentKey}><input type="checkbox" checked={csvSearchValues(search.topics).includes(topic.contentKey)} onChange={() => updateFilter('topics', topic.contentKey)} />{topic.title}</label>))}
            </fieldset>
          )}
        </aside>

        <div className="search-results-column">
          <div className="search-results-toolbar">
            <div>{search.q ? <span>{results.data?.totalHits.toLocaleString() ?? '—'} results {results.data ? `· ${results.data.tookMillis}ms` : ''}</span> : <span>검색어를 입력하세요.</span>}</div>
            <label>Sort<select value={search.sort} onChange={(event) => update({ sort: event.target.value as SearchSearch['sort'], page: 0 })}><option value="RELEVANCE">Relevance</option><option value="RECENT">Recent</option><option value="TITLE">Title</option></select></label>
          </div>

          {search.q && status.data.state === 'READY' && results.isPending && <PageSkeleton rows={5} />}
          {search.q && status.data.state === 'READY' && results.isError && <ErrorState message="검색 결과를 불러오지 못했습니다." onRetry={() => void results.refetch()} />}
          {!search.q && <div className="state-card"><strong>통합 검색을 시작해 보세요.</strong><span>Ctrl/Cmd + K를 누르면 어느 화면에서든 빠르게 검색할 수 있습니다.</span></div>}
          {results.data?.items.length === 0 && <div className="state-card"><strong>검색 결과가 없습니다.</strong><span>필터를 줄이거나 다른 용어로 검색해 보세요.</span></div>}
          {results.data && results.data.items.length > 0 && (
            <div className="search-result-list">
              {results.data.items.map((item) => {
                const related = relatedConceptDestination(item)
                const primary = primarySearchDestination(item)
                return (
                  <article className="search-result-card" key={`${item.documentType}:${item.sourceId}`}>
                    <div className="search-result-meta"><span className="search-type-badge">{item.documentType.replace('_', ' ')}</span><span>{resultContext(item)}</span><time dateTime={item.updatedAt}>{new Date(item.updatedAt).toLocaleDateString()}</time></div>
                    <h2><HighlightText value={item.highlightedTitle || item.title} /></h2>
                    <p className="search-snippet"><HighlightText value={item.snippet} /></p>
                    <div className="search-result-actions">
                      {primary && <button className="secondary-button" type="button" onClick={() => openResult(item)}>{primary.kind === 'external' ? 'Open source' : item.documentType === 'WRONG_NOTE' ? 'Open wrong note' : 'Open concept'}</button>}
                      {item.documentType === 'REFERENCE' && related?.kind === 'concept' && <button className="text-button" type="button" onClick={() => void navigate({ to: '/concepts/$conceptId', params: { conceptId: String(related.conceptId) } })}>Related concept</button>}
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {results.data && results.data.totalPages > 0 && (
            <div className="pagination">
              <button className="secondary-button" type="button" disabled={search.page <= 0} onClick={() => update({ page: Math.max(0, search.page - 1) })}>Previous</button>
              <span>Page {search.page + 1} / {results.data.totalPages}</span>
              <button className="secondary-button" type="button" disabled={search.page + 1 >= results.data.totalPages} onClick={() => update({ page: search.page + 1 })}>Next</button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
