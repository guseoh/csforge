import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getLearningInsights, type LearningInsights } from '../lib/insights-api'
import { defaultQuizSearch } from '../lib/quiz-search'
import { type DashboardAreaProgress } from '../lib/dashboard-api'
import type { InsightsSearch } from '../lib/insights-search'

function percent(value: number | null) {
  return value === null ? '—' : `${Math.round(value)}%`
}

export function LearningInsightsResults({ data }: { data: LearningInsights }) {
  const { current, previous } = data
  return (
    <div className="insights-results">
      <p className="helper-text">
        기준: {data.studyDate} · {data.zoneId} · 확정된 답이 있는 풀이만 정확도 분모에 포함합니다.
        미응답·진행 중·자기채점 대기는 분모에서 제외합니다.
        선택 기간에는 아직 끝나지 않은 오늘이 포함됩니다(기준 시각: {data.asOf}). 이전 기간은 완료된 날짜 전체이므로 실제 관찰 시간은 같지 않습니다.
      </p>
      <div className="insights-periods">
        <div className="insights-period">
          <strong>선택 기간 · {current.from} ~ {current.through}</strong>
          <div className="insights-stats">
            <span>풀이 활동 <b>{current.finalizedAttempts}회</b></span>
            <span>고유 문제 <b>{current.uniqueQuestions}개</b></span>
            <span>확정 답안 정답률 <b>{percent(current.accuracyPercent)}</b></span>
            <span>읽은 개념 <b>{current.viewedConcepts}개</b></span>
            <span>자기채점 대기 <b>{current.pendingSelfCheck}회</b></span>
          </div>
        </div>
        <div className="insights-period">
          <strong>이전 {data.range === '30d' ? '30' : '7'}일(완료된 기간) · {previous.from} ~ {previous.through}</strong>
          <div className="insights-stats">
            <span>풀이 활동 <b>{previous.finalizedAttempts}회</b></span>
            <span>고유 문제 <b>{previous.uniqueQuestions}개</b></span>
            <span>확정 답안 정답률 <b>{percent(previous.accuracyPercent)}</b></span>
            <span>읽은 개념 <b>{previous.viewedConcepts}개</b></span>
            <span>자기채점 대기 <b>{previous.pendingSelfCheck}회</b></span>
          </div>
        </div>
      </div>
      <p className="helper-text insights-comparison" role="status">
        {data.comparable && current.accuracyPercent !== null && previous.accuracyPercent !== null
          ? `확정 답안 정답률 차이: ${(current.accuracyPercent - previous.accuracyPercent).toFixed(1)}%p · ${data.comparisonReason}`
          : `추세 판단 어려움 · ${data.comparisonReason}`}
      </p>
      <div className="insights-due">
        <strong>현재 복습 근거</strong>
        <span>이전 날짜부터 지연 {data.overdueCount}개 · 오늘 기한 도래 {data.dueNowCount}개</span>
        <Link className="text-link" to="/review" search={{ page: 0, due: 'DUE' }}>복습 일정 확인 →</Link>
      </div>
      <div className="insights-weak">
        <div className="dashboard-section-heading">
          <div><h3>복습할 이유가 있는 개념</h3><p className="helper-text">최근 오답 횟수 → 최근 오답 시각 → 개념 ID 순서 · 최대 5개</p></div>
        </div>
        {data.weakConcepts.length === 0
          ? <p className="helper-text">이 기간에는 근거가 있는 오답 개념이 없습니다. 결과가 없어도 숙달을 의미하지 않습니다.</p>
          : <div className="insights-weak-list">{data.weakConcepts.map((item) => (
            <div className="insights-weak-row" key={item.conceptId}>
              <div>
                <strong>{item.title}</strong>
                <span>{item.areaName} · 최근 오답 {item.wrongAttempts}회 · 지금 복습할 연결 문제 {item.dueQuestions}개</span>
                <small>
                  최근 고유 문제 {item.distinctQuestions}개 중 {item.correctQuestions}개 정답
                  {item.evidenceAccuracyPercent === null
                    ? ' · 근거 부족(서로 다른 3문제 미만)'
                    : ` · 고유 문제 정답 근거 ${percent(item.evidenceAccuracyPercent)}`}
                </small>
              </div>
              <div className="insights-weak-actions">
                <Link className="text-link" to="/concepts/$conceptId" params={{ conceptId: String(item.conceptId) }}>개념 읽기 →</Link>
                <Link className="text-link" to="/quiz" search={{ ...defaultQuizSearch, concepts: String(item.conceptId) }}>문제 다시 풀기 →</Link>
              </div>
            </div>
          ))}</div>}
      </div>
      <p className="helper-text">이전 기간 비교는 시도 횟수 기준이며, 취약 개념의 정답 근거는 같은 문제를 여러 번 풀어도 최근 확정 풀이 1건만 반영합니다. 오늘 Dashboard의 통계는 날짜·미답변 처리 기준이 달라 직접 합산하지 마세요.</p>
    </div>
  )
}

export function LearningInsightsSection({ areas }: { areas: DashboardAreaProgress[] }) {
  const search = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })
  const open = search.insightsOpen === '1'
  const query = useQuery({
    queryKey: ['learning-insights', search.insightsRange ?? '7d', search.insightsArea ?? ''],
    queryFn: () => getLearningInsights(search.insightsRange ?? '7d', search.insightsArea ?? ''),
    enabled: open,
  })
  const update = (next: Partial<InsightsSearch>) => {
    void navigate({ to: '/', search: { ...search, ...next }, replace: true })
  }
  return (
    <section className="dashboard-section learning-insights-section" aria-labelledby="learning-insights-title">
      <div className="dashboard-section-heading">
        <div><p className="eyebrow">추가 분석</p><h2 id="learning-insights-title">7·30일 학습 진단</h2></div>
        <button className="text-button" type="button" aria-expanded={open} aria-controls="learning-insights-panel"
          onClick={() => update({ insightsOpen: open ? '0' : '1' })}>
          {open ? '학습 진단 접기 ↑' : '학습 진단 펼치기 ↓'}
        </button>
      </div>
      {open && (
        <div id="learning-insights-panel">
          <p className="helper-text">학습 이력을 수정하지 않는 조회입니다. 기간과 영역은 주소에 유지됩니다.</p>
          <div className="insights-filters">
            <label>분석 기간
              <select value={search.insightsRange ?? '7d'}
                onChange={(event) => update({ insightsRange: event.target.value === '30d' ? '30d' : '7d' })}>
                <option value="7d">최근 7일</option>
                <option value="30d">최근 30일</option>
              </select>
            </label>
            <label>학습 영역
              <select value={search.insightsArea ?? ''} onChange={(event) => update({ insightsArea: event.target.value })}>
                <option value="">전체 영역</option>
                {areas.map((area) => <option key={area.areaSlug} value={area.areaSlug}>{area.areaName}</option>)}
              </select>
            </label>
          </div>
          {query.isPending
            ? <p className="helper-text" role="status">진단 근거 불러오는 중…</p>
            : query.isError || !query.data
              ? <div role="alert" className="insights-error"><span>학습 진단을 불러오지 못했습니다.</span><button type="button" className="text-button" onClick={() => void query.refetch()}>다시 시도</button></div>
              : <LearningInsightsResults data={query.data} />}
        </div>
      )}
    </section>
  )
}
