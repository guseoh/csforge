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
  understanding: {
    data: null as import('../lib/learning-api').ConceptUnderstanding | null,
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
  useQuery: ({ queryKey }: { queryKey: readonly unknown[] }) =>
    queryKey[0] === 'concept-understanding' ? mocks.understanding : mocks.query,
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

import { CompactConceptArticleToc, ConceptPage, ConceptUnderstandingSection } from './ConceptPage'

const concept: ConceptDetail = {
  id: 17,
  contentKey: 'java:reference-value',
  slug: 'reference-value',
  title: '원시 값과 참조 값',
  summary: '값이 전달되고 공유되는 방식을 구분해 이해합니다.',
  contentMarkdown: '본문 첫 문단에서는 값 전달과 참조의 차이를 소개합니다. 메서드 호출 시 인자 값은 매개변수에 복사되며 참조 변수 재대입과 객체 상태 변경을 구분해야 합니다.\n\n## 값 전달 방식\n\n메서드를 호출할 때 호출자의 원시 값과 참조 값은 매개변수에 복사됩니다. 복사된 참조 값이 동일한 객체를 가리키면 객체의 필드를 수정한 결과는 호출자에게도 관찰됩니다.',
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
    mocks.understanding.data = null
    mocks.understanding.isPending = false
    mocks.understanding.isError = false
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
    expect(markup).toContain('핵심 내용을 스스로 설명해 보기')
    expect(markup.indexOf('concept-reading-content')).toBeLessThan(markup.indexOf('active-recall-section'))
    expect(markup.indexOf('active-recall-section')).toBeLessThan(markup.indexOf('concept-completion-section'))
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

describe('CompactConceptArticleToc', () => {
  const headings = [
    { id: 'concept-17-section-1', label: '핵심 설명', level: 2 as const },
    { id: 'concept-17-section-2', label: '동작 예시', level: 3 as const },
    { id: 'learning-actions', label: '학습 마무리', level: 2 as const },
  ]

  it('keeps a collapsible accessible article outline with the active location', () => {
    const markup = renderToStaticMarkup(
      <CompactConceptArticleToc headings={headings} activeId="concept-17-section-2" onNavigate={() => {}} />,
    )

    expect(markup).toContain('class="concept-toc-compact"')
    expect(markup).toContain('<summary>')
    expect(markup).toContain('3개 섹션')
    expect(markup).toContain('aria-label="이 글의 목차"')
    expect(markup).toContain('href="#concept-17-section-1"')
    expect(markup).toContain('class="toc-level-3 active"')
    expect(markup).toContain('aria-current="location"')
    expect(markup).toContain('href="#learning-actions"')
  })

  it('omits the outline when there are no navigable sections', () => {
    expect(renderToStaticMarkup(
      <CompactConceptArticleToc headings={[]} activeId="" onNavigate={() => {}} />,
    )).toBe('')
  })
})

describe('ConceptUnderstandingSection', () => {
  beforeEach(() => {
    mocks.understanding.data = null
    mocks.understanding.isPending = false
    mocks.understanding.isError = false
  })

  it('never equates reading completion with assessed understanding when no attempts exist', () => {
    mocks.understanding.data = {
      conceptId: 17, learningStatus: 'COMPLETED',
      evidence: { uniqueQuestions: 0, finalizedAttempts: 0, correctQuestions: 0, pendingSelfCheckCount: 0 },
      recentAccuracyPercent: null, assessmentStatus: 'NOT_ENOUGH_EVIDENCE', lastAssessedAt: null,
    }
    const html = renderToStaticMarkup(<ConceptUnderstandingSection conceptId={17} />)
    expect(html).toContain('판단할 문제 근거가 아직 부족합니다')
    expect(html).toContain('최근 서로 다른 문제 0개 중 0개 정답')
    expect(html).not.toContain('최근 정답 비율 0%')
    expect(html).toContain('학습 행동 기록')
  })

  it('reports repeated attempts separately and pending self-check outside the finalized sample', () => {
    mocks.understanding.data = {
      conceptId: 17, learningStatus: 'LEARNING',
      evidence: { uniqueQuestions: 3, finalizedAttempts: 12, correctQuestions: 2, pendingSelfCheckCount: 1 },
      recentAccuracyPercent: 66.66666667, assessmentStatus: 'DEVELOPING', lastAssessedAt: '2026-10-21T10:00:00Z',
    }
    const html = renderToStaticMarkup(<ConceptUnderstandingSection conceptId={17} />)
    expect(html).toContain('문제 풀이 근거가 쌓이고 있습니다')
    expect(html).toContain('최근 정답 비율 67%')
    expect(html).toContain('전체 확정 풀이 12회')
    expect(html).toContain('자기채점 대기 1회')
    expect(html).toContain('여러 개념과 연결')
  })

  it('handles pending and failed reads without blocking the Concept reader', () => {
    mocks.understanding.isPending = true
    expect(renderToStaticMarkup(<ConceptUnderstandingSection conceptId={17} />)).toContain('채점 근거 불러오는 중')
    mocks.understanding.isPending = false
    mocks.understanding.isError = true
    const html = renderToStaticMarkup(<ConceptUnderstandingSection conceptId={17} />)
    expect(html).toContain('읽기와 노트 작성은 계속할 수 있습니다')
    expect(html).toContain('다시 시도')
  })
})
