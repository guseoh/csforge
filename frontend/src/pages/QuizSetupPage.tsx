import { useEffect, useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate, useSearch } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ErrorState, PageSkeleton } from '../components/AsyncStates'
import {
  createQuiz,
  getActiveQuiz,
  getQuizAvailability,
  type QuestionDifficulty,
  type QuestionType,
  type QuizSetupPayload,
} from '../lib/quiz-api'
import { getLearningAreas } from '../lib/learning-api'
import {
  csvParam,
  csvValues,
  hasExplicitQuizSearch,
  isDefaultQuizSearch,
  quizSearchForPreset,
  type QuizQuickPreset,
  type QuizSearch,
} from '../lib/quiz-search'
import { canStartQuiz, quizAvailabilityState } from '../lib/quiz-availability'

const rememberedSettingsKey = 'csforge.quiz.setup'
const questionTypes: { value: QuestionType; label: string }[] = [
  { value: 'MULTIPLE_CHOICE', label: '객관식' },
  { value: 'SHORT_ANSWER', label: '단답형' },
  { value: 'DESCRIPTIVE', label: '서술형' },
  { value: 'SCENARIO', label: '시나리오' },
]
const difficulties: { value: QuestionDifficulty; label: string }[] = [
  { value: 'EASY', label: '쉬움' },
  { value: 'MEDIUM', label: '보통' },
  { value: 'HARD', label: '어려움' },
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

function ChoiceOption({
  label,
  meta,
  selected,
  onClick,
}: {
  label: string
  meta?: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button className={`quiz-choice-option${selected ? ' selected' : ''}`} type="button" aria-pressed={selected} onClick={onClick}>
      <span>{label}</span>
      {meta && <small>{meta}</small>}
    </button>
  )
}

function toggleSelection<T>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
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

function quickPreset(settings: QuizSetupPayload): Exclude<QuizQuickPreset, 'DEFAULT'> | null {
  const simple = settings.areas.length === 0
    && settings.concepts.length === 0
    && settings.levels.length === 0
    && settings.difficulties.length === 0
    && settings.questionTypes.length === 0
    && settings.count === 10
    && settings.timeLimitSeconds === null
  if (!simple) return null
  if (settings.state === 'UNSEEN') return 'NEW'
  if (settings.state === 'WRONG') return 'WRONG'
  if (settings.state === 'ALL') return 'ALL'
  return null
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

  const navigateToSettings = (nextSearch: QuizSearch) => void navigate({
    search: nextSearch,
    replace: true,
    resetScroll: false,
  })

  useEffect(() => {
    document.title = '문제 풀기 · CSForge'
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
    void navigate({ search: rememberedSearch, replace: true, resetScroll: false }).finally(() => {
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
    navigateToSettings(searchFromSettings(next))
  }
  const questionCountAvailable = availabilityQuery.data?.availableCount
  const availabilityState = quizAvailabilityState(questionCountAvailable, settings.count, availabilityQuery.isPending, availabilityQuery.isError)
  const selectedPreset = quickPreset(settings)
  const hasDetailedSettings = Boolean(
    settings.areas.length
    || settings.concepts.length
    || settings.levels.length
    || settings.difficulties.length
    || settings.questionTypes.length
    || settings.state === 'REVIEW_NEEDED'
    || settings.count !== 10
    || settings.timeLimitSeconds !== null,
  )
  const availabilityMessage = availabilityState === 'LOADING'
    ? '선택된 조건의 문항 수를 확인하는 중입니다…'
    : availabilityState === 'ERROR'
      ? '문항 수를 확인한 뒤 시작할 수 있습니다.'
      : `현재 조건에서 ${questionCountAvailable}문항을 사용할 수 있습니다.`

  return (
    <section className="page-section quiz-page quiz-setup-page">
      <div className="page-heading quiz-setup-heading">
        <div>
          <p className="eyebrow">문제 풀이</p>
          <h1>문제 풀기</h1>
          <p className="lead">자주 쓰는 방식은 바로 고르고, 필요한 경우에만 세부 조건을 조정하세요.</p>
        </div>
        <span className="result-count">{availabilityQuery.isPending ? '확인 중…' : availabilityQuery.isError ? '확인 필요' : `${questionCountAvailable}개 출제 가능`}</span>
      </div>

      {activeQuery.data && (
        <div className="quiz-resume-banner">
          <div>
            <strong>진행 중인 문제가 있습니다.</strong>
            <span>{activeQuery.data.answeredCount}/{activeQuery.data.questionCount}개 풀이 완료</span>
          </div>
          <Link className="secondary-button" to="/quiz/$quizId" params={{ quizId: String(activeQuery.data.quizId) }}>
            이어 풀기
          </Link>
        </div>
      )}

      <section className="quiz-quick-start" aria-labelledby="quiz-quick-start-heading">
        <div className="quiz-quick-intro">
          <p className="eyebrow">빠른 시작</p>
          <h2 id="quiz-quick-start-heading">어떤 문제를 풀까요?</h2>
          <span>자주 쓰는 범위를 먼저 고르고, 아래에서 한 번만 시작합니다.</span>
        </div>
        <div className="quiz-quick-presets" aria-label="빠른 문제 조건">
          <button type="button" className={`secondary-button quiz-preset-button${selectedPreset === 'NEW' ? ' selected' : ''}`} aria-pressed={selectedPreset === 'NEW'} onClick={() => navigateToSettings(quizSearchForPreset('NEW'))}>
            <strong>새 문제</strong><small>아직 안 푼 문제</small>
          </button>
          <button type="button" className={`secondary-button quiz-preset-button${selectedPreset === 'WRONG' ? ' selected' : ''}`} aria-pressed={selectedPreset === 'WRONG'} onClick={() => navigateToSettings(quizSearchForPreset('WRONG'))}>
            <strong>오답 문제</strong><small>틀린 문제 다시 풀기</small>
          </button>
          <button type="button" className={`secondary-button quiz-preset-button${selectedPreset === 'ALL' ? ' selected' : ''}`} aria-pressed={selectedPreset === 'ALL'} onClick={() => navigateToSettings(quizSearchForPreset('ALL'))}>
            <strong>전체 문제</strong><small>전체에서 무작위 연습</small>
          </button>
        </div>
      </section>

      <details className="quiz-config-disclosure" open={hasDetailedSettings ? true : undefined}>
        <summary>
          <span><span className="eyebrow">직접 설정</span><strong>학습 범위와 조건 고르기</strong></span>
          <span>{hasDetailedSettings ? '현재 세부 조건 사용 중' : '영역 · 레벨 · 난이도 · 유형 · 시간'} <span aria-hidden="true">⌄</span></span>
        </summary>
        <div className="quiz-config-panel" aria-label="문제 조건 설정">
          <div className="quiz-selection-stack">
            <fieldset className="quiz-selection-group quiz-area-selection">
              <legend>학습 영역 <span>{settings.areas.length === 0 ? '전체 영역' : `${settings.areas.length}개 선택`}</span></legend>
              <div className="quiz-choice-grid quiz-area-choice-grid">
                {areasQuery.data.map((area) => (
                  <ChoiceOption
                    key={area.slug}
                    label={area.name}
                    meta={`${area.publishedQuestionCount}문항`}
                    selected={settings.areas.includes(area.slug)}
                    onClick={() => update('areas', toggleSelection(settings.areas, area.slug))}
                  />
                ))}
              </div>
            </fieldset>

            <div className="quiz-choice-row">
              <fieldset className="quiz-selection-group">
                <legend>레벨 <span>{settings.levels.length === 0 ? '전체 레벨' : `${settings.levels.length}개 선택`}</span></legend>
                <div className="quiz-choice-grid quiz-choice-grid-3">
                  {[1, 2, 3].map((level) => <ChoiceOption key={level} label={`레벨 ${level}`} selected={settings.levels.includes(level)} onClick={() => update('levels', toggleSelection(settings.levels, level))} />)}
                </div>
              </fieldset>
              <fieldset className="quiz-selection-group">
                <legend>난이도 <span>{settings.difficulties.length === 0 ? '전체 난이도' : `${settings.difficulties.length}개 선택`}</span></legend>
                <div className="quiz-choice-grid quiz-choice-grid-3">
                  {difficulties.map((item) => <ChoiceOption key={item.value} label={item.label} selected={settings.difficulties.includes(item.value)} onClick={() => update('difficulties', toggleSelection(settings.difficulties, item.value))} />)}
                </div>
              </fieldset>
              <fieldset className="quiz-selection-group">
                <legend>문제 유형 <span>{settings.questionTypes.length === 0 ? '전체 유형' : `${settings.questionTypes.length}개 선택`}</span></legend>
                <div className="quiz-choice-grid quiz-choice-grid-4">
                  {questionTypes.map((item) => <ChoiceOption key={item.value} label={item.label} selected={settings.questionTypes.includes(item.value)} onClick={() => update('questionTypes', toggleSelection(settings.questionTypes, item.value))} />)}
                </div>
              </fieldset>
            </div>
          </div>

          <details className="quiz-advanced-options" open={settings.concepts.length > 0}>
            <summary><span>고급 설정</span><small>개념 번호, 문제 상태, 문항 수, 제한 시간</small></summary>
            <div className="quiz-advanced-grid">
              <label className="quiz-deep-link-field">
                개념 번호
                <span>개념 화면에서 이어질 때만 사용합니다.</span>
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
                문제 상태
                <select value={settings.state} onChange={(event) => update('state', event.target.value as QuizSetupPayload['state'])}>
                  <option value="ALL">전체 문제</option>
                  <option value="UNSEEN">아직 안 푼 문제</option>
                  <option value="WRONG">활성 오답 노트</option>
                  <option value="REVIEW_NEEDED">복습 예정</option>
                </select>
              </label>
              <label>
                문제 수
                <select
                  value={[5, 10, 20, 30, 50].includes(settings.count) ? settings.count : 'custom'}
                  onChange={(event) => update('count', event.target.value === 'custom' ? (settings.count > 0 && ![5, 10, 20, 30, 50].includes(settings.count) ? settings.count : 15) : Number(event.target.value))}
                >
                  <option value={5}>5문제</option><option value={10}>10문제</option><option value={20}>20문제</option><option value={30}>30문제</option><option value={50}>50문제</option><option value="custom">직접 입력</option>
                </select>
                {![5, 10, 20, 30, 50].includes(settings.count) && <input type="number" min={1} max={50} value={settings.count} aria-label="직접 입력 문제 수" onChange={(event) => update('count', Math.min(50, Math.max(1, Number(event.target.value) || 1)))} />}
              </label>
              <label>
                제한 시간
                <select value={settings.timeLimitSeconds ?? ''} onChange={(event) => update('timeLimitSeconds', event.target.value ? Number(event.target.value) : null)}>
                  <option value="">제한 없음</option><option value={300}>5분</option><option value={600}>10분</option><option value={900}>15분</option><option value={1800}>30분</option>
                </select>
              </label>
            </div>
          </details>
        </div>
      </details>

      <div className="quiz-unified-start" aria-label="문제 풀이 시작">
        <div>
          <strong>{settings.count}문제</strong>
          <span className={availabilityState === 'INSUFFICIENT' || availabilityState === 'ERROR' ? 'helper-text error-text' : 'helper-text'}>{availabilityMessage}</span>
        </div>
        <div className="quiz-unified-start-actions">
          {hasDetailedSettings && <button className="text-button" type="button" onClick={() => navigateToSettings(quizSearchForPreset('DEFAULT'))}>기본값으로 초기화</button>}
          <button
            className="primary-button"
            type="button"
            disabled={!canStartQuiz(availabilityState, createMutation.isPending)}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? '문제 준비 중…' : '선택 조건으로 시작'}
          </button>
        </div>
      </div>

      {availabilityQuery.isError && <div className="state-card error-state" role="alert"><strong>문항 가능 수를 확인하지 못했습니다.</strong><span>서버 상태를 확인한 뒤 다시 시도하세요.</span><button className="secondary-button" type="button" onClick={() => void availabilityQuery.refetch()}>다시 시도</button></div>}
      {availabilityState === 'INSUFFICIENT' && <p className="helper-text error-text">요청한 {settings.count}문항보다 가능한 문항이 적습니다.</p>}
      {createMutation.isError && <p className="route-message error">문제 풀이를 시작하지 못했습니다. 잠시 후 다시 시도하세요.</p>}
    </section>
  )
}
