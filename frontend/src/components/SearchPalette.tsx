import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { getSearchSuggestions } from '../lib/search-api'
import { addRecentSearch, primarySearchDestination } from '../lib/search-ui'
import { defaultSearchSearch } from '../lib/search-search'

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
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
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
  const actionableSuggestions = useMemo(
    () => (suggestions.data ?? []).filter((item) => primarySearchDestination(item) !== null),
    [suggestions.data],
  )

  const openPalette = () => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setOpen(true)
  }

  const closePalette = () => setOpen(false)

  const openSearchWorkspace = () => {
    closePalette()
    void navigate({ to: '/search', search: defaultSearchSearch })
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (open) closePalette()
        else openPalette()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    if (open) {
      const dialog = dialogRef.current
      if (dialog && !dialog.open) dialog.showModal()
      inputRef.current?.focus()
      wasOpenRef.current = true
      return
    }
    if (dialogRef.current?.open) dialogRef.current.close()
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

  const openSuggestion = (item: (typeof actionableSuggestions)[number] | undefined) => {
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
    : normalized.length >= 2 ? actionableSuggestions.length : 0

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
      else openSuggestion(actionableSuggestions[activeIndex])
    }
  }

  const suggestionsLoading = normalized.length >= 2 && (debouncedQuery !== normalized || suggestions.isPending)

  return (
    <>
      <button className="search-palette-trigger" type="button" onClick={openPalette} aria-label="전체 검색 열기">
        <span className="search-trigger-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" strokeWidth="1.8" /><path d="m16 16 4 4" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </span>
        <span className="search-trigger-placeholder">개념, 문제, 오답을 검색하세요</span>
        <kbd>Ctrl K</kbd>
      </button>
      <dialog
        ref={dialogRef}
        className="search-palette-backdrop"
        aria-label="전체 검색"
        onCancel={(event) => { event.preventDefault(); closePalette() }}
        onClick={(event) => { if (event.target === event.currentTarget) closePalette() }}
      >
          <section className="search-palette">
            <form className="search-palette-form" onSubmit={(event) => { event.preventDefault(); submitSearch(query) }}>
              <input
                ref={inputRef}
                value={query}
                maxLength={200}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="개념, 문제, 오답, 노트를 검색하세요"
                aria-label="전체 검색어"
                aria-activedescendant={activeIndex >= 0 ? `search-palette-option-${activeIndex}` : undefined}
              />
              <button className="primary-button" type="submit" disabled={!normalized}>검색</button>
            </form>
            <div className="search-palette-body">
              {!normalized && (
                <div>
                  <div className="palette-section-heading">
                    <p className="palette-section-title">최근 검색</p>
                    <button className="text-button" type="button" onClick={openSearchWorkspace}>전체 검색 열기 →</button>
                  </div>
                  {visibleRecent.length === 0 ? <p className="palette-muted">최근 검색어가 없습니다. 전체 검색에서 영역과 주제를 조합해 탐색할 수 있습니다.</p> : (
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
                        ><span>{item}</span><small>다시 검색</small></button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {normalized.length === 1 && <p className="palette-muted">두 글자 이상 입력하면 바로가기 제안을 보여줍니다.</p>}
              {suggestionsLoading && <p className="palette-muted">제안을 불러오는 중…</p>}
              {normalized.length >= 2 && debouncedQuery === normalized && suggestions.isError && <p className="palette-muted">제안을 불러오지 못했습니다. Enter로 전체 검색은 계속 사용할 수 있습니다.</p>}
              {normalized.length >= 2 && debouncedQuery === normalized && suggestions.data && (
                <div>
                  <p className="palette-section-title">바로가기 제안</p>
                  <div className="palette-list" role="listbox">
                    {actionableSuggestions.length === 0 ? <p className="palette-muted">바로 이동할 수 있는 제목 제안이 없습니다. Enter로 전체 검색을 할 수 있습니다.</p> : actionableSuggestions.map((item, index) => (
                      <button
                        id={`search-palette-option-${index}`}
                        key={`${item.documentType}:${item.sourceId}`}
                        className={activeIndex === index ? 'active' : undefined}
                        role="option"
                        aria-selected={activeIndex === index}
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => openSuggestion(item)}
                      ><span>{item.title}</span><small>{item.documentType.replace('_', ' ')}</small></button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <footer className="search-palette-footer"><span>↑↓ · 이동</span><span>Enter · 선택</span><span>Esc · 닫기</span></footer>
          </section>
      </dialog>
    </>
  )
}
