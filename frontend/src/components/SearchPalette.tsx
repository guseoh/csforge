import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { getSearchSuggestions } from '../lib/search-api'
import { addRecentSearch, primarySearchDestination } from '../lib/search-ui'

const RECENT_KEY = 'csforge.search.recent.v1'

function loadRecent(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === 'string').slice(0, 6) : []
  } catch {
    return []
  }
}

function persistRecent(recent: string[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent))
}

export function SearchPalette() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>(() => loadRecent())
  const normalized = query.trim()
  const suggestions = useQuery({
    queryKey: ['search-suggestions', normalized],
    queryFn: () => getSearchSuggestions(normalized),
    enabled: open && normalized.length >= 2,
    staleTime: 15_000,
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((current) => !current)
      } else if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const visibleRecent = useMemo(() => recent.slice(0, 6), [recent])

  const submitSearch = (value: string) => {
    const nextQuery = value.trim()
    if (!nextQuery) return
    const nextRecent = addRecentSearch(recent, nextQuery)
    setRecent(nextRecent)
    persistRecent(nextRecent)
    setOpen(false)
    void navigate({
      to: '/search',
      search: { q: nextQuery, types: '', areas: '', topics: '', levels: '', sort: 'RELEVANCE', page: 0 },
    })
  }

  const openSuggestion = (index: number) => {
    const item = suggestions.data?.[index]
    if (!item) return
    const destination = primarySearchDestination(item)
    if (!destination) return
    setOpen(false)
    if (destination.kind === 'external') {
      window.open(destination.url, '_blank', 'noopener,noreferrer')
    } else if (destination.kind === 'concept') {
      void navigate({ to: '/concepts/$conceptId', params: { conceptId: String(destination.conceptId) } })
    } else {
      void navigate({ to: '/wrong-notes/$questionId', params: { questionId: String(destination.questionId) } })
    }
  }

  return (
    <>
      <button className="search-palette-trigger" type="button" onClick={() => setOpen(true)} aria-label="Open global search">
        <span>Search</span><kbd>Ctrl K</kbd>
      </button>
      {open && (
        <div className="search-palette-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section className="search-palette" role="dialog" aria-modal="true" aria-label="Global search" onMouseDown={(event) => event.stopPropagation()}>
            <form className="search-palette-form" onSubmit={(event) => { event.preventDefault(); submitSearch(query) }}>
              <input
                autoFocus
                value={query}
                maxLength={200}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search concepts, questions, notes, references…"
                aria-label="Global search query"
              />
              <button className="primary-button" type="submit" disabled={!normalized}>Search</button>
            </form>
            <div className="search-palette-body">
              {!normalized && (
                <div>
                  <p className="palette-section-title">Recent searches</p>
                  {visibleRecent.length === 0 ? <p className="palette-muted">최근 검색어가 없습니다.</p> : (
                    <div className="palette-list">
                      {visibleRecent.map((item) => <button key={item} type="button" onClick={() => submitSearch(item)}><span>{item}</span><small>Search again</small></button>)}
                    </div>
                  )}
                </div>
              )}
              {normalized.length === 1 && <p className="palette-muted">두 글자 이상 입력하면 바로가기 제안을 보여줍니다.</p>}
              {normalized.length >= 2 && suggestions.isPending && <p className="palette-muted">Suggestions loading…</p>}
              {normalized.length >= 2 && suggestions.isError && <p className="palette-muted">제안을 불러오지 못했습니다. Enter로 전체 검색은 계속 사용할 수 있습니다.</p>}
              {normalized.length >= 2 && suggestions.data && (
                <div>
                  <p className="palette-section-title">Suggestions</p>
                  <div className="palette-list">
                    {suggestions.data.length === 0 ? <p className="palette-muted">일치하는 제목 제안이 없습니다.</p> : suggestions.data.map((item, index) => (
                      <button key={`${item.documentType}:${item.sourceId}`} type="button" onClick={() => openSuggestion(index)}>
                        <span>{item.title}</span><small>{item.documentType.replace('_', ' ')}</small>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <footer className="search-palette-footer"><span>Enter · Search</span><span>Esc · Close</span></footer>
          </section>
        </div>
      )}
    </>
  )
}
