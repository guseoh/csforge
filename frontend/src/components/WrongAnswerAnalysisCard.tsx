import { Link } from '@tanstack/react-router'
import type { WrongAnswerAnalysis } from '../lib/api'

interface WrongAnswerAnalysisCardProps {
  analysis: WrongAnswerAnalysis
  requestPending: boolean
  requestError: boolean
  retryPending: boolean
  retryError: boolean
  onRequest: () => void
  onRetry: () => void
}

export function WrongAnswerAnalysisCard({
  analysis,
  requestPending,
  requestError,
  retryPending,
  retryError,
  onRequest,
  onRetry,
}: WrongAnswerAnalysisCardProps) {
  if (analysis.status === 'PROVIDER_NOT_CONFIGURED') {
    return (
      <div className="state-card">
        <strong>AI 분석을 사용할 수 없습니다.</strong>
        <span>로컬 Ollama provider를 구성하면 명시적으로 분석을 요청할 수 있습니다.</span>
      </div>
    )
  }

  if (analysis.status === 'NOT_REQUESTED') {
    return (
      <div className="ai-analysis-empty">
        <p>현재 latest wrong answer와 문제·정답·관련 개념을 바탕으로 오답 원인을 분석합니다.</p>
        <button
          className="primary-button"
          type="button"
          onClick={onRequest}
          disabled={!analysis.available || requestPending}
        >
          AI 분석하기
        </button>
        {requestError && <p className="save-state error">분석 요청에 실패했습니다. 잠시 후 다시 시도하세요.</p>}
      </div>
    )
  }

  if (analysis.status === 'PENDING' || analysis.status === 'PROCESSING') {
    return (
      <div className="state-card" aria-live="polite">
        <strong>AI 분석을 처리하고 있습니다.</strong>
        <span>{analysis.status === 'PENDING' ? '분석 작업을 준비하는 중입니다.' : 'Ollama가 오답을 분석하는 중입니다.'}</span>
        <span className="helper-text">이 화면은 자동으로 갱신됩니다.</span>
      </div>
    )
  }

  if (analysis.status === 'FAILED') {
    return (
      <div className="state-card error-state">
        <strong>AI 분석에 실패했습니다.</strong>
        <span>provider 상태를 확인한 뒤 다시 시도할 수 있습니다.</span>
        <button
          className="secondary-button"
          type="button"
          onClick={onRetry}
          disabled={!analysis.retryable || retryPending}
        >
          다시 시도
        </button>
        {retryError && <p className="save-state error">재시도 요청에 실패했습니다.</p>}
      </div>
    )
  }

  const result = analysis.result
  if (!result) {
    return (
      <div className="state-card error-state">
        <strong>분석 결과가 비어 있습니다.</strong>
        <span>다시 시도해 주세요.</span>
      </div>
    )
  }

  return (
    <div className="ai-analysis-result">
      <div><h3>왜 틀렸는가</h3><p>{result.whyWrong}</p></div>
      <div><h3>놓친 핵심</h3><ul>{result.missedConcepts.map((concept) => <li key={concept}>{concept}</li>)}</ul></div>
      <div><h3>올바른 이해</h3><p>{result.correctUnderstanding}</p></div>
      <div>
        <h3>관련 개념</h3>
        {result.relatedConcepts.length === 0
          ? <p className="helper-text">연결된 개념이 없습니다.</p>
          : (
            <div className="related-list">
              {result.relatedConcepts.map((concept) => (
                <Link key={concept.id} to="/concepts/$conceptId" params={{ conceptId: String(concept.id) }}>
                  {concept.title}<span>{concept.areaName} · Level {concept.level}</span>
                </Link>
              ))}
            </div>
          )}
      </div>
      <div><h3>확인 질문</h3><ol>{result.followUpQuestions.map((question) => <li key={question}>{question}</li>)}</ol></div>
    </div>
  )
}
