import { useMemo, useState } from 'react'
import { MarkdownContent } from './MarkdownContent'
import { selectActiveRecallPrompt } from '../lib/active-recall'
import { clearRecallDraft, MAX_RECALL_DRAFT_LENGTH, readRecallDraft, writeRecallDraft } from '../lib/active-recall-draft'

type RecallAssessment = 'CLEAR' | 'UNCLEAR' | null

/** Optional reflection between reading and Quiz; no grade or independent review schedule. */
export function ActiveRecallSection({ contentKey, bodyMarkdown }: {
  contentKey: string
  bodyMarkdown: string
}) {
  const exercise = useMemo(() => selectActiveRecallPrompt(bodyMarkdown), [bodyMarkdown])
  const [text, setText] = useState(() => readRecallDraft(contentKey))
  const [autoSave, setAutoSave] = useState(true)
  const [storageError, setStorageError] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [assessment, setAssessment] = useState<RecallAssessment>(null)

  if (!exercise) return null

  const updateAnswer = (value: string) => {
    const bounded = value.slice(0, MAX_RECALL_DRAFT_LENGTH)
    setText(bounded)
    setAssessment(null)
    if (autoSave) setStorageError(!writeRecallDraft(contentKey, bounded))
  }

  const toggleAutoSave = (enabled: boolean) => {
    setAutoSave(enabled)
    const successful = enabled ? writeRecallDraft(contentKey, text) : clearRecallDraft(contentKey)
    setStorageError(!successful)
  }

  const clearDraft = () => {
    setText('')
    setAssessment(null)
    setStorageError(!clearRecallDraft(contentKey))
  }

  return (
    <section className="detail-section active-recall-section" id="active-recall" aria-labelledby="active-recall-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">선택 학습 · 채점 없음</p>
          <h2 id="active-recall-heading">핵심 내용을 스스로 설명해 보기</h2>
        </div>
      </div>
      <p className="helper-text">본문을 잠시 가리고 떠올린 뒤 기존 설명과 비교해 보세요. 이 활동은 Quiz 점수나 복습 일정에 반영되지 않습니다.</p>
      <details className="active-recall-disclosure">
        <summary>자기 설명 연습 열기 <span aria-hidden="true">↓</span></summary>
        <div className="active-recall-body">
          <p className="active-recall-prompt">{exercise.prompt}</p>
          <label className="active-recall-input-label" htmlFor="active-recall-answer">내 설명 (선택 입력)</label>
          <textarea
            id="active-recall-answer"
            className="note-editor active-recall-answer"
            rows={5}
            maxLength={MAX_RECALL_DRAFT_LENGTH}
            value={text}
            onChange={(event) => updateAnswer(event.target.value)}
            placeholder="글을 보지 않고 핵심 원리, 예시, 주의점을 떠올려 적어보세요."
          />
          <div className="active-recall-draft-controls">
            <label className="active-recall-autosave">
              <input type="checkbox" checked={autoSave} onChange={(event) => toggleAutoSave(event.target.checked)} />
              이 브라우저에만 초안 자동 보관
            </label>
            <button className="text-button" type="button" onClick={clearDraft}>회상 초안 지우기</button>
          </div>
          <p className="helper-text">브라우저 초안은 개인 노트와 별개이며 다른 기기에 동기화되지 않습니다. 자동 보관을 끄면 이 브라우저의 저장된 회상 초안도 지웁니다.</p>
          {storageError && (
            <p className="helper-text error-text" role="alert">브라우저 저장이 제한되어 초안을 복원하지 못할 수 있습니다. 작성한 답을 직접 복사해 보관하세요.</p>
          )}
          <button className="secondary-button active-recall-reveal" type="button" aria-expanded={revealed} onClick={() => setRevealed((current) => !current)}>
            {revealed ? '원문 비교 닫기' : '내 설명과 원문 비교하기'}
          </button>
          {revealed && (
            <div className="active-recall-guide">
              <p className="eyebrow">검토된 Concept 원문 · AI 생성 답안 아님</p>
              {exercise.sourceHeading && <h3>{exercise.sourceHeading}</h3>}
              <MarkdownContent>{exercise.guideMarkdown}</MarkdownContent>
              <div className="active-recall-assessment">
                <p>원문과 비교해 보니 어땠나요?</p>
                <div className="active-recall-assessment-actions">
                  <button className="secondary-button" type="button" aria-pressed={assessment === 'CLEAR'} onClick={() => setAssessment('CLEAR')}>설명할 수 있었어요</button>
                  <button className="secondary-button" type="button" aria-pressed={assessment === 'UNCLEAR'} onClick={() => setAssessment('UNCLEAR')}>헷갈렸어요</button>
                  <a className="text-button" href="#concept-reading-start">본문 다시 학습 →</a>
                </div>
                {assessment === 'CLEAR' && <p className="helper-text" role="status">이번 회상에서 스스로 설명할 수 있다고 판단했습니다. 실제 정답 확인은 관련 Quiz에서 진행하세요.</p>}
                {assessment === 'UNCLEAR' && (
                  <p className="helper-text" role="status">헷갈린 부분은 본문을 다시 확인한 뒤 <a href="#learning-actions">기존 ‘복습 필요’ 상태</a>로 표시할 수 있습니다.</p>
                )}
                <p className="helper-text">이 판단은 현재 화면에서만 표시되며 채점·학습 상태를 자동 변경하지 않습니다.</p>
              </div>
            </div>
          )}
        </div>
      </details>
    </section>
  )
}
