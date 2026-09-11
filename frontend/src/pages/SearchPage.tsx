import type { FormEvent, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import {
  getSearchFilterOptions,
  getSearchStatus,
  searchDocuments,
  type SearchDocumentType,
  type SearchResultItem,
} from '../lib/search-api'
import { compactMarkdownPreview } from '../lib/markdown'
import { csvSearchValues, toggleCsvValue, type SearchSearch } from '../lib/search-search'
import { addRecentSearch, primarySearchDestination, relatedConceptDestination, segmentSearchHighlight } from '../lib/search-ui'
import '../search.css'

const DOCUMENT_TYPES: { value: SearchDocumentType; label: string }[] = [
  { value: 'CONCEPT', label: '개념' },
  { value: 'QUESTION', label: '문제' },
  { value: 'PERSONAL_NOTE', label: '개인 메모' },
  { value: 'WRONG_NOTE', label: '오답 노트' },
  { value: 'REFERENCE', label: '참고 자료' },
]

const documentTypeLabels = Object.fromEntries(DOCUMENT_TYPES.map((type) => [type.value, type.label])) as Record<SearchDocumentType, string>
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
  return item.levels.length > 0 ? `레벨 ${item.levels.join(', ')}` : '검색 결과'
}

export function SearchPage() {
  const search = useSearch({ from: '/search' })
  const navigate = useNavigate({ from: '/search' })
  const status = useQuery({
    queryKey: ['search-status'],
    queryFn: getSearchStatus,
  })
  const filters = useQuery({ queryKey: ['search-filter-options'], queryFn: getSearchFilterOptions, staleTime: 60_000 })
  const results = useQuery({
    queryKey: ['search', search],
    queryFn: () => searchDocuments({ q: search.q, types: search.types, areas: search.areas, topics: search.topics, levels: search.levels, sort: search.sort, page: search.page }),
    enabled: search.q.trim().length > 0,
  })

  const update = (changes: Partial<SearchSearch>) => void navigate({
    search: (current) => ({ ...current, ...changes }),
  })
  const updateFilter = (key: 'types' | 'areas' | 'topics' | 'levels', value: string) => update({
    [key]: toggleCsvValue(search[key], value),
    page: 0,
  })
  const selectedTypes = csvSearchValues(search.types)
  const selectedAreas = csvSearchValues(search.areas)
  const selectedTopics = csvSearchValues(search.topics)
  const selectedLevels = csvSearchValues(search.levels)
  const activeFilterCount = selectedTypes.length + selectedAreas.length + selectedTopics.length + selectedLevels.length
  const visibleTopicGroups = filters.data?.filter((area) => selectedAreas.includes(area.areaSlug)
    || area.topics.some((topic) => selectedTopics.includes(topic.contentKey))) ?? []
  const showTopicRail = visibleTopicGroups.length > 0

  const toggleArea = (areaSlug: string) => {
    if (!selectedAreas.includes(areaSlug)) {
      updateFilter('areas', areaSlug)
      return
    }
    const area = filters.data?.find((candidate) => candidate.areaSlug === areaSlug)
    const areaTopics = new Set(area?.topics.map((topic) => topic.contentKey) ?? [])
    update({
      areas: toggleCsvValue(search.areas, areaSlug),
      topics: selectedTopics.filter((topic) => !areaTopics.has(topic)).join(','),
      page: 0,
    })
  }

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
  if (status.isError) return <ErrorState message="검색 상태를 확인하지 못했습니다. 다른 학습 기능은 계속 사용할 수 있습니다." onRetry={() => void status.refetch()} />

  return (
    <section className="page-section search-page">
      <div className="page-heading search-heading">
        <div>
          <p className="eyebrow">통합 검색</p>
          <h1>검색</h1>
          <p className="lead">개념, 문제, 개인 메모, 오답 기록, 참고 자료를 한 번에 찾습니다.</p>
        </div>
      </div>

      <form className="search-form" onSubmit={submit}>
        <input name="q" defaultValue={search.q} key={search.q} maxLength={200} placeholder="예: volatile happens-before, PostgreSQL transaction" aria-label="검색어" />
        <button className="primary-button" type="submit">검색</button>
      </form>

      <div className="search-primary-filters" aria-label="주요 검색 필터">
        <div className="search-filter-cluster">
          <span className="search-filter-label">유형</span>
          <div className="search-filter-chips">
            {DOCUMENT_TYPES.map((type) => (
              <button
                className={selectedTypes.includes(type.value) ? 'search-filter-chip active' : 'search-filter-chip'}
                key={type.value}
                type="button"
                aria-pressed={selectedTypes.includes(type.value)}
                onClick={() => updateFilter('types', type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="search-filter-cluster search-level-cluster">
          <span className="search-filter-label">레벨</span>
          <div className="search-filter-chips">
            {[1, 2, 3].map((level) => (
              <button
                className={selectedLevels.includes(String(level)) ? 'search-filter-chip active' : 'search-filter-chip'}
                key={level}
                type="button"
                aria-pressed={selectedLevels.includes(String(level))}
                onClick={() => updateFilter('levels', String(level))}
              >
                L{level}
              </button>
            ))}
          </div>
        </div>

        <details className="search-area-picker">
          <summary>
            <span>학습 영역</span>
            <strong>{selectedAreas.length > 0 ? `${selectedAreas.length}개 선택` : '전체'}</strong>
            <span aria-hidden="true">⌄</span>
          </summary>
          <div className="search-area-picker-menu">
            <div className="search-area-picker-heading">
              <strong>학습 영역</strong>
              {selectedAreas.length > 0 && <button type="button" onClick={() => update({ areas: '', topics: '', page: 0 })}>영역 초기화</button>}
            </div>
            {filters.isPending && <span className="search-filter-muted">불러오는 중…</span>}
            {filters.data?.map((area) => (
              <label className={selectedAreas.includes(area.areaSlug) ? 'search-area-option active' : 'search-area-option'} key={area.areaSlug}>
                <input type="checkbox" checked={selectedAreas.includes(area.areaSlug)} onChange={() => toggleArea(area.areaSlug)} />
                <span>{area.areaName}</span>
              </label>
            ))}
          </div>
        </details>

        {activeFilterCount > 0 && (
          <button className="search-reset-button" type="button" onClick={() => update({ types: '', areas: '', topics: '', levels: '', page: 0 })}>
            필터 {activeFilterCount}개 초기화
          </button>
        )}
      </div>

      <div className={`search-layout search-guide-layout${showTopicRail ? ' with-topic-rail' : ''}`}>
        {showTopicRail && (
          <aside className="search-topic-rail" aria-label="주제 필터">
            <div className="search-topic-rail-heading">
              <div>
                <p className="eyebrow">세부 필터</p>
                <strong>주제</strong>
              </div>
              {selectedTopics.length > 0 && <span>{selectedTopics.length}개</span>}
            </div>
            <div className="search-topic-groups">
              {visibleTopicGroups.map((area) => {
                const selectedCount = area.topics.filter((topic) => selectedTopics.includes(topic.contentKey)).length
                return (
                  <details className="search-topic-group" key={area.areaSlug} open={selectedAreas.includes(area.areaSlug) || selectedCount > 0}>
                    <summary>
                      <span>{area.areaName}</span>
                      <small>{selectedCount > 0 ? `${selectedCount}개 선택` : `${area.topics.length}개`}</small>
                    </summary>
                    <div className="search-topic-options">
                      {area.topics.map((topic) => (
                        <label className={selectedTopics.includes(topic.contentKey) ? 'active' : ''} key={topic.contentKey}>
                          <input type="checkbox" checked={selectedTopics.includes(topic.contentKey)} onChange={() => updateFilter('topics', topic.contentKey)} />
                          <span>{topic.title}</span>
                        </label>
                      ))}
                    </div>
                  </details>
                )
              })}
            </div>
          </aside>
        )}

        <div className="search-results-column">
          <div className="search-results-toolbar">
            <div>{search.q ? <span>{results.data?.totalHits.toLocaleString() ?? '—'}개 결과</span> : <span>검색어를 입력하세요.</span>}</div>
            <label>정렬<select value={search.sort} onChange={(event) => update({ sort: event.target.value as SearchSearch['sort'], page: 0 })}><option value="RELEVANCE">관련도순</option><option value="RECENT">최신순</option><option value="TITLE">제목순</option></select></label>
          </div>

          {search.q && results.isPending && <PageSkeleton rows={5} />}
          {search.q && results.isError && <ErrorState message="검색 결과를 불러오지 못했습니다." onRetry={() => void results.refetch()} />}
          {!search.q && <div className="state-card"><strong>통합 검색을 시작해 보세요.</strong><span>Ctrl/Cmd + K를 누르면 어느 화면에서든 빠르게 검색할 수 있습니다.</span></div>}
          {results.data?.items.length === 0 && <div className="state-card"><strong>검색 결과가 없습니다.</strong><span>필터를 줄이거나 다른 용어로 검색해 보세요.</span></div>}
          {results.data && results.data.items.length > 0 && (
            <div className="search-result-list">
              {results.data.items.map((item) => {
                const related = relatedConceptDestination(item)
                const primary = primarySearchDestination(item)
                const preview = compactMarkdownPreview(item.snippet, 240)
                return (
                  <article className={`search-result-card search-result-${item.documentType.toLowerCase()}`} key={`${item.documentType}:${item.sourceId}`}>
                    <div className="search-result-meta"><span className="search-type-badge">{documentTypeLabels[item.documentType]}</span><span>{resultContext(item)}</span><time dateTime={item.updatedAt}>{new Date(item.updatedAt).toLocaleDateString('ko-KR')}</time></div>
                    <h2><HighlightText value={item.highlightedTitle || item.title} /></h2>
                    <p className="search-snippet"><HighlightText value={preview} /></p>
                    <div className="search-result-actions">
                      {primary && <button className="secondary-button" type="button" onClick={() => openResult(item)}>{primary.kind === 'external' ? '자료 열기' : item.documentType === 'WRONG_NOTE' ? '오답 노트 열기' : '개념 열기'}</button>}
                      {item.documentType === 'REFERENCE' && related?.kind === 'concept' && <button className="text-button" type="button" onClick={() => void navigate({ to: '/concepts/$conceptId', params: { conceptId: String(related.conceptId) } })}>관련 개념 보기</button>}
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {results.data && results.data.totalPages > 0 && (
            <div className="pagination">
              <button className="secondary-button" type="button" disabled={search.page <= 0} onClick={() => update({ page: Math.max(0, search.page - 1) })}>이전</button>
              <span>{search.page + 1} / {results.data.totalPages}</span>
              <button className="secondary-button" type="button" disabled={search.page + 1 >= results.data.totalPages} onClick={() => update({ page: search.page + 1 })}>다음</button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
