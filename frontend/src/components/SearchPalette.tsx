import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { getSearchSuggestions } from '../lib/search-api'
import { addRecentSearch, primarySearchDestination } from '../lib/search-ui'

const RECENT_KEY = 'csforge.search.recent.v1'
const SUGGESTION_DEBOUNCE_MS = 180

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
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [recent, setRecent] = useState<string[]>(() => loadRecent())
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)
  const normalized = query.trim()
  const visibleRecent = useMemo(() => recent.slice(0, 6), [recent])

  const suggestions = useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: () => getSearchSuggestions(debouncedQuery),
    enabled: open && debouncedQuery.length >= 2,
    staleTime: 15_000,
  })

  const openPalette = () => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setOpen(true)
  }

  const closePalette = () => setOpen(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (open) closePalette()
        else openPalette()
      } else if (event.key === 'Escape' && open) {
        event.preventDefault()
        closePalette()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      return
    }
    if (wasOpenRef.current) {
      setQuery('')
      setDebouncedQuery('')
      setActiveIndex(-1)
      previousFocusRef.current?.focus()
      wasOpenRef.current = false
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(-1)
    if (!open || normalized.length < 2) {
      setDebouncedQuery('')
      return
    }
    const timeout = window.setTimeout(() => setDebouncedQuery(normalized), SUGGESTION_DEBOUNCE_MS)
    return () => window.clearTimeout(timeout)
  }, [open, normalized])

  useEffect(() => {
    setActiveIndex(-1)
  }, [suggestions.data])

  const submitSearch = (value: string) => {
    const nextQuery = value.trim()
    if (!nextQuery) return
    const nextRecent = addRecentSearch(recent, nextQuery)
    setRecent(nextRecent)
    persistRecent(nextRecent)
    closePalette()
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
    closePalette()
    if (destination.kind === 'external') {
      window.open(destination.url, '_blank', 'noopener,noreferrer')
    } else if (destination.kind === 'concept') {
      void navigate({ to: '/concepts/$conceptId', params: { conceptId: String(destination.conceptId) } })
    } else {
      void navigate({ to: '/wrong-notes/$questionId', params: { questionId: String(destination.questionId) } })
    }
  }

  const actionableCount = normalized.length === 0
    ? visibleRecent.length
    : normalized.length >= 2 ? suggestions.data?.length ?? 0 : 0

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && actionableCount > 0) {
      event.preventDefault()
      setActiveIndex((current) => current < actionableCount - 1 ? current + 1 : 0)
    } else if (event.key === 'ArrowUp' && actionableCount > 0) {
      event.preventDefault()
      setActiveIndex((current) => current > 0 ? current - 1 : actionableCount - 1)
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      if (normalized.length === 0) submitSearch(visibleRecent[activeIndex] ?? '')
      else openSuggestion(activeIndex)
    }
  }

  const suggestionsLoading = normalized.length >= 2 && (debouncedQuery !== normalized || suggestions.isPending)

  return (
    <>
      <button className="search-palette-trigger" type="button" onClick={openPalette} aria-label="Open global search">
        <span>Search</span><kbd>Ctrl K</kbd>
      </button>
      {open && (
        <div className="search-palette-backdrop" role="presentation" onMouseDown={closePalette}>
          <section className="search-palette" role="dialog" aria-modal="true" aria-label="Global search" onMouseDown={(event) => event.stopPropagation()}>
            <form className="search-palette-form" onSubmit={(event) => { event.preventDefault(); submitSearch(query) }}>
              <input
                autoFocus
                value={query}
                maxLength={200}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search concepts, questions, notes, references…"
                aria-label="Global search query"
                aria-activedescendant={activeIndex >= 0 ? `search-palette-option-${activeIndex}` : undefined}
              />
              <button className="primary-button" type="submit" disabled={!normalized}>Search</button>
            </form>
            <div className="search-palette-body">
              {!normalized && (
                <div>
                  <p className="palette-section-title">Recent searches</p>
                  {visibleRecent.length === 0 ? <p className="palette-muted">최근 검색어가 없습니다.</p> : (
                    <div className="palette-list" role="listbox">
                      {visibleRecent.map((item, index) => (
                        <button
                          id={`search-palette-option-${index}`}
                          key={item}
                          className={activeIndex === index ? 'active' : undefined}
                          role="option"
                          aria-selected={activeIndex === index}
                          type="button"
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => submitSearch(item)}
                        ><span>{item}</span><small>Search again</small></button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {normalized.length === 1 && <p className="palette-muted">두 글자 이상 입력하면 바로가기 제안을 보여줍니다.</p>}
              {suggestionsLoading && <p className="palette-muted">Suggestions loading…</p>}
              {normalized.length >= 2 && debouncedQuery === normalized && suggestions.isError && <p className="palette-muted">제안을 불러오지 못했습니다. Enter로 전체 검색은 계속 사용할 수 있습니다.</p>}
              {normalized.length >= 2 && debouncedQuery === normalized && suggestions.data && (
                <div>
                  <p className="palette-section-title">Suggestions</p>
                  <div className="palette-list" role="listbox">
                    {suggestions.data.length === 0 ? <p className="palette-muted">일치하는 제목 제안이 없습니다.</p> : suggestions.data.map((item, index) => (
                      <button
                        id={`search-palette-option-${index}`}
                        key={`${item.documentType}:${item.sourceId}`}
                        className={activeIndex === index ? 'active' : undefined}
                        role="option"
                        aria-selected={activeIndex === index}
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => openSuggestion(index)}
                      ><span>{item.title}</span><small>{item.documentType.replace('_', ' ')}</small></button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <footer className="search-palette-footer"><span>↑↓ · Move</span><span>Enter · Select</span><span>Esc · Close</span></footer>
          </section>
        </div>
      )}
    </>
  )
}
