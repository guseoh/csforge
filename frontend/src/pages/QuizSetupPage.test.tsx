import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  search: {
    areas: '',
    concepts: '506',
    levels: '',
    difficulties: '',
    questionTypes: '',
    state: 'ALL',
    count: 10,
    timeLimitSeconds: null,
  },
  location: { searchStr: '?concepts=506&count=10' },
  areas: { data: [], isPending: false, isError: false, refetch: vi.fn() },
  active: { data: null, isPending: false, isError: false },
  availability: { data: { availableCount: 3 }, isPending: false, isError: false, refetch: vi.fn() },
  navigate: vi.fn(),
  createQuiz: vi.fn(async () => ({ quizId: 95 })),
  getQuizAvailability: vi.fn(async () => ({ availableCount: 5 })),
  createMutationFn: null as (() => unknown) | null,
  availabilityQueryFn: null as (() => unknown) | null,
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
  useLocation: () => mocks.location,
  useNavigate: () => mocks.navigate,
  useSearch: () => mocks.search,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey, queryFn }: { queryKey: readonly unknown[]; queryFn?: () => unknown }) => {
    if (queryKey[0] === 'learning-areas') return mocks.areas
    if (queryKey[0] === 'quiz-active') return mocks.active
    mocks.availabilityQueryFn = queryFn ?? null
    return mocks.availability
  },
  useMutation: (options: { mutationFn: () => unknown }) => {
    mocks.createMutationFn = options.mutationFn
    return { isPending: false, isError: false, mutate: vi.fn() }
  },
}))

vi.mock('../lib/quiz-api', () => ({
  createQuiz: mocks.createQuiz,
  getActiveQuiz: vi.fn(),
  getQuizAvailability: mocks.getQuizAvailability,
}))

vi.mock('../lib/learning-api', () => ({ getLearningAreas: vi.fn() }))

import { QuizSetupPage } from './QuizSetupPage'

function renderSetup({ concepts = '506', count = 10, availableCount = 3 } = {}) {
  mocks.search = {
    areas: '',
    concepts,
    levels: '',
    difficulties: '',
    questionTypes: '',
    state: 'ALL',
    count,
    timeLimitSeconds: null,
  }
  mocks.location.searchStr = concepts ? `?concepts=${concepts}&count=${count}` : `?count=${count}`
  mocks.availability = {
    data: { availableCount },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }

  return renderToStaticMarkup(<QuizSetupPage />)
}

describe('QuizSetupPage concept practice count', () => {
  beforeEach(() => {
    mocks.search = {
      areas: '',
      concepts: '506',
      levels: '',
      difficulties: '',
      questionTypes: '',
      state: 'ALL',
      count: 10,
      timeLimitSeconds: null,
    }
    mocks.location.searchStr = '?concepts=506&count=10'
    mocks.areas.data = []
    mocks.areas.isPending = false
    mocks.areas.isError = false
    mocks.active.data = null
    mocks.availability = {
      data: { availableCount: 3 },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    }
    mocks.createMutationFn = null
    mocks.availabilityQueryFn = null
    mocks.createQuiz.mockClear()
    mocks.getQuizAvailability.mockClear()
    mocks.navigate.mockReset()
  })

  it('starts a concept quiz with the available count while preserving requested settings', async () => {
    const markup = renderSetup({ concepts: '506', count: 10, availableCount: 3 })

    expect(markup).toContain('<strong>3문제</strong>')
    expect(markup).toContain('이 개념에서 3문항을 사용할 수 있습니다.')
    expect(markup).toContain('<button class="primary-button" type="button">가능한 3문항으로 시작</button>')
    expect(mocks.search.count).toBe(10)
    expect(mocks.location.searchStr).toBe('?concepts=506&count=10')
    expect(mocks.navigate).not.toHaveBeenCalled()

    await mocks.createMutationFn?.()

    expect(mocks.createQuiz).toHaveBeenCalledWith(expect.objectContaining({ concepts: [506], count: 3 }))
    expect(mocks.search.count).toBe(10)
    expect(mocks.location.searchStr).toBe('?concepts=506&count=10')
  })

  it('keeps a zero-availability concept quiz disabled', () => {
    const markup = renderSetup({ concepts: '506', count: 10, availableCount: 0 })

    expect(markup).toContain('<strong>0문제</strong>')
    expect(markup).toContain('이 선택 범위에 등록된 문제가 아직 없습니다.')
    expect(markup).toContain('<button class="primary-button" type="button" disabled="">등록된 문제 없음</button>')
    expect(markup).not.toContain('요청한 10문항보다 가능한 문항이 적습니다.')
    expect(mocks.createQuiz).not.toHaveBeenCalled()
  })

  it('uses all topic concept IDs from the URL and preserves the requested count', async () => {
    renderSetup({ concepts: '506,507', count: 10, availableCount: 5 })

    await mocks.availabilityQueryFn?.()
    await mocks.createMutationFn?.()

    expect(mocks.getQuizAvailability).toHaveBeenCalledWith({
      areas: [], concepts: [506, 507], levels: [], difficulties: [], questionTypes: [], state: 'ALL',
    })
    expect(mocks.createQuiz).toHaveBeenCalledWith(expect.objectContaining({ concepts: [506, 507], count: 5 }))
    expect(mocks.location.searchStr).toBe('?concepts=506,507&count=10')
  })

  it('keeps the general quiz shortage policy unchanged', () => {
    const markup = renderSetup({ concepts: '', count: 10, availableCount: 3 })

    expect(markup).toContain('<strong>10문제</strong>')
    expect(markup).toContain('<button class="primary-button" type="button" disabled="">선택 조건으로 시작</button>')
    expect(mocks.createMutationFn).not.toBeNull()
  })
})
