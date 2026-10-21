import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ConceptDetail } from '../lib/learning-api'

const mocks = vi.hoisted(() => ({ mode: 'success' as 'success' | 'pending' | 'error' | 'empty' }))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, className }: { children: ReactNode; className?: string }) => (
    <a href="#" className={className}>{children}</a>
  ),
}))

vi.mock('./useLearningRailCollapsed', () => ({
  useLearningRailCollapsed: () => ({ collapsed: false, toggleCollapsed: () => {} }),
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: unknown[] }) => {
    const isArea = queryKey[0] === 'learning-area'
    const mode = mocks.mode
    return {
      isPending: mode === 'pending',
      isError: mode === 'error',
      refetch: vi.fn(),
      data: mode === 'success' || mode === 'empty'
        ? isArea
          ? { topics: [{ id: 2, title: '기본 문법', publishedConceptCount: 2, completedConceptCount: 1 }] }
          : { items: mode === 'success' ? [{ id: 17, title: '값의 전달', learningStatus: 'LEARNING' }] : [] }
        : undefined,
    }
  },
}))

import { ConceptLearningRail } from './ConceptLearningRail'

const concept = {
  id: 17,
  area: { id: 1, name: 'Java', slug: 'java' },
  topic: { id: 2, title: '기본 문법', slug: 'basics' },
} as ConceptDetail

describe('ConceptLearningRail', () => {
  beforeEach(() => { mocks.mode = 'success' })

  it('keeps the current topic and known progress visible', () => {
    const markup = renderToStaticMarkup(<ConceptLearningRail concept={concept} />)
    expect(markup).toContain('1/2개 개념 완료')
    expect(markup).toContain('값의 전달')
    expect(markup).toContain('aria-current="page"')
  })

  it('does not mislabel loading as an empty curriculum', () => {
    mocks.mode = 'pending'
    const markup = renderToStaticMarkup(<ConceptLearningRail concept={concept} />)
    expect(markup).toContain('진행률 불러오는 중')
    expect(markup).toContain('개념 목록 불러오는 중')
    expect(markup).not.toContain('0%')
    expect(markup).not.toContain('공개된 개념이 없습니다')
  })

  it('exposes retry instead of a misleading empty outline after errors', () => {
    mocks.mode = 'error'
    const markup = renderToStaticMarkup(<ConceptLearningRail concept={concept} />)
    expect(markup).toContain('진행률을 불러오지 못했습니다')
    expect(markup).toContain('개념 목록을 불러오지 못했습니다')
    expect(markup).toContain('다시 시도')
    expect(markup).toContain('role="alert"')
  })

  it('labels a truly empty topic only after a successful fetch', () => {
    mocks.mode = 'empty'
    const markup = renderToStaticMarkup(<ConceptLearningRail concept={concept} />)
    expect(markup).toContain('이 주제에 공개된 개념이 없습니다.')
    expect(markup).not.toContain('다시 시도')
  })
})
