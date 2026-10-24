import { useEffect, useState } from 'react'

type TocHeading = {
  id: string
  label: string
  level: 2 | 3
}

export type ArticleTocProps = {
  headings: TocHeading[]
  activeId: string
  onNavigate: (id: string) => void
}

export function useConceptArticleToc(conceptId: number, contentMarkdown: string) {
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

export function ConceptArticleToc({ headings, activeId, onNavigate }: ArticleTocProps) {
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

