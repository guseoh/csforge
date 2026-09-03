import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { WrongAnswerAnalysis, WrongAnswerAnalysisStatus } from '../lib/api'
import { WrongAnswerAnalysisCard } from './WrongAnswerAnalysisCard'

function analysis(status: WrongAnswerAnalysisStatus): WrongAnswerAnalysis {
  return {
    questionId: 42,
    attemptId: 7,
    status,
    available: status === 'NOT_REQUESTED',
    providerConfigured: status !== 'PROVIDER_NOT_CONFIGURED',
    retryable: status === 'FAILED',
    result: status === 'COMPLETED'
      ? {
          whyWrong: '선택한 답은 원자성을 보장하지 않습니다.',
          missedConcepts: ['원자성'],
          correctUnderstanding: '트랜잭션 경계에서 전체 연산을 하나의 단위로 이해해야 합니다.',
          relatedConceptKeys: [],
          relatedConcepts: [],
          followUpQuestions: ['원자성이 필요한 이유를 설명해보세요.'],
        }
      : null,
    requestedAt: null,
    startedAt: null,
    completedAt: null,
    failedAt: null,
    errorCode: null,
    errorMessage: null,
  }
}

function render(status: WrongAnswerAnalysisStatus): string {
  return renderToStaticMarkup(
    <WrongAnswerAnalysisCard
      analysis={analysis(status)}
      requestPending={false}
      requestError={false}
      retryPending={false}
      retryError={false}
      onRequest={() => {}}
      onRetry={() => {}}
    />,
  )
}

describe('WrongAnswerAnalysisCard', () => {
  it('renders not-requested action', () => {
    expect(render('NOT_REQUESTED')).toContain('AI 분석하기')
  })

  it('renders pending state', () => {
    expect(render('PENDING')).toContain('분석 작업을 준비하는 중입니다.')
  })

  it('renders processing state', () => {
    expect(render('PROCESSING')).toContain('Ollama가 오답을 분석하는 중입니다.')
  })

  it('renders completed learning result', () => {
    const markup = render('COMPLETED')
    expect(markup).toContain('왜 틀렸는가')
    expect(markup).toContain('놓친 핵심')
    expect(markup).toContain('올바른 이해')
    expect(markup).toContain('확인 질문')
  })

  it('renders failed retry action', () => {
    expect(render('FAILED')).toContain('다시 시도')
  })

  it('renders provider-not-configured state', () => {
    expect(render('PROVIDER_NOT_CONFIGURED')).toContain('AI 분석을 사용할 수 없습니다.')
  })
})
