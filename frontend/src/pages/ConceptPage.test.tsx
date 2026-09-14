import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ConceptDetail } from '../lib/learning-api'

const mocks = vi.hoisted(() => ({
  query: {
    data: null as ConceptDetail | null,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  },
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, className }: { children: ReactNode; className?: string }) => <a className={className} href="#">{children}</a>,
  useParams: () => ({ conceptId: '17' }),
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => mocks.query,
  useQueryClient: () => ({ setQueryData: vi.fn(), invalidateQueries: vi.fn() }),
  useMutation: () => ({ mutate: vi.fn(), isPending: false, isError: false, data: undefined }),
}))

vi.mock('../components/ConceptLearningRail', () => ({
  ConceptLearningRail: () => <aside>학습 목차</aside>,
}))

vi.mock('../components/InterviewRecallSection', () => ({
  InterviewRecallSection: () => null,
}))

vi.mock('../components/MarkdownContent', () => ({
  MarkdownContent: ({ children }: { children: ReactNode }) => <div className="markdown-content">{children}</div>,
}))

vi.mock('../components/toast/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}))

import { ConceptPage } from './ConceptPage'

const concept: ConceptDetail = {
  id: 17,
  contentKey: 'java:reference-value',
  slug: 'reference-value',
  title: '원시 값과 참조 값',
  summary: '값이 전달되고 공유되는 방식을 구분해 이해합니다.',
  contentMarkdown: '본문 첫 문단입니다.\n\n## 값 전달 방식\n\n설명입니다.',
  level: 1,
  contentStatus: 'PUBLISHED',
  area: { id: 1, slug: 'java', name: 'Java' },
  topic: { id: 2, slug: 'language-types', title: 'Language & Types' },
  progress: {
    learningStatus: 'LEARNING',
    bookmarked: false,
    firstViewedAt: null,
    lastViewedAt: null,
    completedAt: null,
  },
  references: [],
  personalNote: null,
  previous: null,
  next: null,
  relatedConcepts: [],
}

describe('ConceptPage', () => {
  beforeEach(() => {
    mocks.query.data = concept
    mocks.query.isPending = false
    mocks.query.isError = false
  })

  it('keeps the article before the learning actions', () => {
    const markup = renderToStaticMarkup(<ConceptPage />)
    const articleIndex = markup.indexOf('concept-reading-content')
    const actionIndex = markup.indexOf('concept-completion-section')

    expect(articleIndex).toBeGreaterThan(-1)
    expect(actionIndex).toBeGreaterThan(articleIndex)
    expect(markup).toContain('학습 마무리')
    expect(markup).toContain('이 개념 문제 풀기')
    expect(markup).toContain('concept-reader-meta')
    expect(markup).not.toContain('chip-row')
  })

  it('promotes the quiz as the primary next step after completion', () => {
    mocks.query.data = {
      ...concept,
      progress: { ...concept.progress, learningStatus: 'COMPLETED', completedAt: '2026-09-14T07:00:00Z' },
    }

    const markup = renderToStaticMarkup(<ConceptPage />)

    expect(markup).toContain('문제로 이해를 확인해보세요.')
    expect(markup).toContain('class="primary-button concept-quiz-action"')
  })
})
