import { useEffect, useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate, useSearch } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import {
  createQuiz,
  getActiveQuiz,
  getLearningAreas,
  getQuizAvailability,
  type QuestionDifficulty,
  type QuestionType,
  type QuizSetupPayload,
} from '../lib/api'
import {
  csvParam,
  csvValues,
  hasExplicitQuizSearch,
  isDefaultQuizSearch,
  quizSearchForPreset,
  type QuizSearch,
} from '../lib/quiz-search'
import { canStartQuiz, quizAvailabilityState } from '../lib/quiz-availability'

const rememberedSettingsKey = 'csforge.quiz.setup'
const questionTypes: { value: QuestionType; label: string }[] = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple choice' },
  { value: 'SHORT_ANSWER', label: 'Short answer' },
  { value: 'DESCRIPTIVE', label: 'Descriptive' },
  { value: 'SCENARIO', label: 'Scenario' },
]
const difficulties: { value: QuestionDifficulty; label: string }[] = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
]

function settingsFromSearch(search: QuizSearch): QuizSetupPayload {
  return {
    areas: csvValues(search.areas),
    concepts: csvValues(search.concepts).map(Number).filter((value) => Number.isSafeInteger(value) && value > 0),
    levels: csvValues(search.levels).map(Number).filter((value) => [1, 2, 3].includes(value)),
    difficulties: csvValues(search.difficulties)
      .filter((value): value is QuestionDifficulty => difficulties.some((item) => item.value === value)),
    questionTypes: csvValues(search.questionTypes)
      .filter((value): value is QuestionType => questionTypes.some((item) => item.value === value)),
    state: search.state,
    count: search.count,
    timeLimitSeconds: search.timeLimitSeconds,
  }
}

function searchFromSettings(settings: QuizSetupPayload): QuizSearch {
  return {
    areas: csvParam(settings.areas),
    concepts: csvParam(settings.concepts),
    levels: csvParam(settings.levels),
    difficulties: csvParam(settings.difficulties),
    questionTypes: csvParam(settings.questionTypes),
    state: settings.state,
    count: settings.count,
    timeLimitSeconds: settings.timeLimitSeconds,
  }
}

function readRemembered(): QuizSetupPayload | null {
  try {
    const stored = localStorage.getItem(rememberedSettingsKey)
    if (!stored) return null
    const remembered = JSON.parse(stored) as Partial<QuizSetupPayload>
    return {
      areas: Array.isArray(remembered.areas)
        ? remembered.areas.filter((item): item is string => typeof item === 'string')
        : [],
      concepts: Array.isArray(remembered.concepts)
        ? remembered.concepts.filter((item): item is number => Number.isSafeInteger(item) && item > 0)
        : [],
      levels: Array.isArray(remembered.levels)
        ? remembered.levels.filter((item): item is number => [1, 2, 3].includes(item))
        : [],
      difficulties: Array.isArray(remembered.difficulties)
        ? remembered.difficulties.filter((item): item is QuestionDifficulty => difficulties.some((option) => option.value === item))
        : [],
      questionTypes: Array.isArray(remembered.questionTypes)
        ? remembered.questionTypes.filter((item): item is QuestionType => questionTypes.some((option) => option.value === item))
        : [],
      state: remembered.state === 'UNSEEN' || remembered.state === 'WRONG' || remembered.state === 'REVIEW_NEEDED' ? remembered.state : 'ALL',
      count: typeof remembered.count === 'number' && remembered.count >= 1 && remembered.count <= 50
        ? remembered.count
        : 10,
      timeLimitSeconds: typeof remembered.timeLimitSeconds === 'number'
        && remembered.timeLimitSeconds >= 60
        && remembered.timeLimitSeconds <= 7200
        ? remembered.timeLimitSeconds
        : null,
    }
  } catch {
    return null
  }
}

export function QuizSetupPage() {
  const location = useLocation()
  const search = useSearch({ from: '/quiz' })
  const navigate = useNavigate({ from: '/quiz' })
  const applyingRememberedRef = useRef(false)
  const initializedRef = useRef(false)
  const settings = useMemo(() => settingsFromSearch(search), [search])

  const areasQuery = useQuery({ queryKey: ['learning-areas'], queryFn: getLearningAreas })
  const activeQuery = useQuery({ queryKey: ['quiz-active'], queryFn: getActiveQuiz })
  const filterPayload = useMemo(() => ({
    areas: settings.areas,
    concepts: settings.concepts,
    levels: settings.levels,
    difficulties: settings.difficulties,
    questionTypes: settings.questionTypes,
    state: settings.state,
  }), [settings])
  const availabilityQuery = useQuery({
    queryKey: ['quiz-availability', filterPayload],
    queryFn: () => getQuizAvailability(filterPayload),
  })
  const createMutation = useMutation({
    mutationFn: () => createQuiz(settings),
    onSuccess: (quiz) => void navigate({ to: '/quiz/$quizId', params: { quizId: String(quiz.quizId) } }),
  })

  useEffect(() => {
    document.title = 'Quiz · CSForge'
    return () => { document.title = 'CSForge' }
  }, [])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    if (hasExplicitQuizSearch(location.searchStr) || !isDefaultQuizSearch(search)) return

    const remembered = readRemembered()
    if (!remembered) return
    const rememberedSearch = searchFromSettings(remembered)
    if (isDefaultQuizSearch(rememberedSearch)) return

    applyingRememberedRef.current = true
    void navigate({ search: rememberedSearch, replace: true }).finally(() => {
      applyingRememberedRef.current = false
    })
  }, [location.searchStr, navigate, search])

  useEffect(() => {
    if (applyingRememberedRef.current) return
    try {
      localStorage.setItem(rememberedSettingsKey, JSON.stringify(settings))
    } catch {
      // Local storage is a convenience only; URL state remains canonical.
    }
  }, [settings])

  if (areasQuery.isPending) return <PageSkeleton rows={4} />
  if (areasQuery.isError) {
    return <ErrorState message="학습 영역을 불러오지 못했습니다." onRetry={() => void areasQuery.refetch()} />
  }

  const update = <K extends keyof QuizSetupPayload>(key: K, value: QuizSetupPayload[K]) => {
    const next = { ...settings, [key]: value }
    void navigate({ search: searchFromSettings(next), replace: true })
  }
  const questionCountAvailable = availabilityQuery.data?.availableCount
  const availabilityState = quizAvailabilityState(questionCountAvailable, settings.count, availabilityQuery.isPending, availabilityQuery.isError)

  return (
    <section className="page-section quiz-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Question practice</p>
          <h1>Quiz setup</h1>
          <p className="lead">필터와 문항 수를 정한 뒤 저장된 세션을 이어서 학습하세요.</p>
        </div>
        <span className="result-count">{availabilityQuery.isPending ? '확인 중…' : availabilityQuery.isError ? '확인 필요' : `${questionCountAvailable} available`}</span>
      </div>

      {activeQuery.data && (
        <div className="quiz-resume-banner">
          <div>
            <strong>진행 중인 Quiz가 있습니다.</strong>
            <span>{activeQuery.data.answeredCount}/{activeQuery.data.questionCount} answered</span>
          </div>
          <Link className="secondary-button" to="/quiz/$quizId" params={{ quizId: String(activeQuery.data.quizId) }}>
            이어하기
          </Link>
        </div>
      )}

      <div className="quiz-quick-presets" aria-label="Quiz quick start">
        <div><p className="eyebrow">Quick start</p><strong>빠른 시작</strong></div>
        <button type="button" className="secondary-button" onClick={() => void navigate({ search: quizSearchForPreset('NEW'), replace: true })}>
          새 문제 10
        </button>
        <button type="button" className="secondary-button" onClick={() => void navigate({ search: quizSearchForPreset('WRONG'), replace: true })}>
          오답 문제 10
        </button>
        <button type="button" className="secondary-button" onClick={() => void navigate({ search: quizSearchForPreset('ALL'), replace: true })}>
          전체 문제 10
        </button>
        <button type="button" className="text-button" onClick={() => void navigate({ search: quizSearchForPreset('DEFAULT'), replace: true })}>
          기본 설정
        </button>
      </div>

      <section className="quiz-config-panel" aria-labelledby="quiz-config-heading">
        <div className="quiz-config-heading">
          <div><p className="eyebrow">Detailed setup</p><h2 id="quiz-config-heading">조건 설정</h2></div>
          <p className="helper-text">필요할 때만 세부 조건을 조정하세요. 선택한 조건은 URL에 보존됩니다.</p>
        </div>
        <p className="multi-select-helper">여러 항목을 고르려면 <kbd>Ctrl</kbd>/<kbd>⌘</kbd>를 누른 채 선택하세요.</p>
      <div className="quiz-setup-grid">
        <label>
          Learning areas
          <select
            multiple
            size={6}
            value={settings.areas}
            onChange={(event) => update('areas', Array.from(event.target.selectedOptions, (option) => option.value))}
          >
            {areasQuery.data.map((area) => <option key={area.slug} value={area.slug}>{area.name}</option>)}
          </select>
        </label>
        <label className="quiz-deep-link-field">
          Concept IDs
          <p className="helper-text">Concept 화면에서 이어지는 deep link용입니다. 대부분의 학습자는 직접 입력할 필요가 없습니다.</p>
          <input
            value={settings.concepts.join(',')}
            inputMode="numeric"
            placeholder="예: 12,15"
            onChange={(event) => update(
              'concepts',
              csvValues(event.target.value).map(Number).filter((value) => Number.isSafeInteger(value) && value > 0),
            )}
          />
        </label>
        <label>
          Levels
          <select
            multiple
            size={3}
            value={settings.levels.map(String)}
            onChange={(event) => update('levels', Array.from(event.target.selectedOptions, (option) => Number(option.value)))}
          >
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
          </select>
        </label>
        <label>
          Difficulty
          <select
            multiple
            size={3}
            value={settings.difficulties}
            onChange={(event) => update(
              'difficulties',
              Array.from(event.target.selectedOptions, (option) => option.value as QuestionDifficulty),
            )}
          >
            {difficulties.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>
          Question types
          <select
            multiple
            size={4}
            value={settings.questionTypes}
            onChange={(event) => update(
              'questionTypes',
              Array.from(event.target.selectedOptions, (option) => option.value as QuestionType),
            )}
          >
            {questionTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>
          Question state
          <select
            value={settings.state}
            onChange={(event) => update('state', event.target.value as QuizSetupPayload['state'])}
          >
            <option value="ALL">All published</option>
            <option value="UNSEEN">Unseen only</option>
            <option value="WRONG">Active wrong notes</option>
            <option value="REVIEW_NEEDED">Scheduled review</option>
          </select>
        </label>
        <label>
          Question count
          <select
            value={[5, 10, 20, 30, 50].includes(settings.count) ? settings.count : 'custom'}
            onChange={(event) => update(
              'count',
              event.target.value === 'custom'
                ? (settings.count > 0 && ![5, 10, 20, 30, 50].includes(settings.count) ? settings.count : 15)
                : Number(event.target.value),
            )}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value="custom">Custom</option>
          </select>
          {![5, 10, 20, 30, 50].includes(settings.count) && (
            <input
              type="number"
              min={1}
              max={50}
              value={settings.count}
              aria-label="Custom question count"
              onChange={(event) => update('count', Math.min(50, Math.max(1, Number(event.target.value) || 1)))}
            />
          )}
        </label>
        <label>
          Time limit
          <select
            value={settings.timeLimitSeconds ?? ''}
            onChange={(event) => update('timeLimitSeconds', event.target.value ? Number(event.target.value) : null)}
          >
            <option value="">No limit</option>
            <option value={300}>5 minutes</option>
            <option value={600}>10 minutes</option>
            <option value={900}>15 minutes</option>
            <option value={1800}>30 minutes</option>
          </select>
        </label>
      </div>

      <div className="quiz-setup-actions">
        <span className="helper-text">{availabilityState === 'LOADING' ? '선택된 조건의 문항 수를 확인하는 중입니다…' : availabilityState === 'ERROR' ? '문항 수를 확인한 뒤 Quiz를 시작할 수 있습니다.' : `선택된 조건에서 ${questionCountAvailable}문항을 사용할 수 있습니다.`}</span>
        <button
          className="primary-button"
          type="button"
          disabled={!canStartQuiz(availabilityState, createMutation.isPending)}
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending ? 'Quiz 생성 중…' : 'Quiz 시작'}
        </button>
      </div>
      </section>
      {availabilityQuery.isError && <div className="state-card error-state" role="alert"><strong>문항 가능 수를 확인하지 못했습니다.</strong><span>서버 상태를 확인한 뒤 다시 시도하세요.</span><button className="secondary-button" type="button" onClick={() => void availabilityQuery.refetch()}>다시 시도</button></div>}
      {availabilityState === 'INSUFFICIENT' && (
        <p className="helper-text error-text">요청한 {settings.count}문항보다 가능한 문항이 적습니다.</p>
      )}
      {createMutation.isError && <p className="route-message error">Quiz를 시작하지 못했습니다. 잠시 후 다시 시도하세요.</p>}
    </section>
  )
}
