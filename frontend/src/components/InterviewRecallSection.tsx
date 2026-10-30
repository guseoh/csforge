import { useId, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { InterviewQuestion, InterviewSection } from '../lib/interview-section'
import {
  clearInterviewDraft, MAX_INTERVIEW_DRAFT_LENGTH, readInterviewDraft, writeInterviewDraft,
} from '../lib/interview-practice'
import type { ConceptNavigation } from '../lib/learning-api'
import { defaultQuizSearch } from '../lib/quiz-search'
import { MarkdownContent } from './MarkdownContent'

type Assessment = 'CLEAR' | 'NEEDS_WORK' | null
type NoteState = 'saving' | 'saved' | 'error'

function PracticeQuestion({ item, index, contentKey, onCopyToNote, noteState }: {
  item: InterviewQuestion
  index: number
  contentKey: string
  onCopyToNote: (question: string, answer: string) => void
  noteState: NoteState
}) {
  const id = useId()
  const [answer, setAnswer] = useState(() => readInterviewDraft(contentKey, index, item.question))
  const [revealed, setRevealed] = useState(false)
  const [assessment, setAssessment] = useState<Assessment>(null)
  const [storageError, setStorageError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const hasAnswer = answer.trim().length > 0

  const updateAnswer = (text: string) => {
    const value = text.slice(0, MAX_INTERVIEW_DRAFT_LENGTH)
    setAnswer(value)
    setRevealed(false)
    setAssessment(null)
    setCopied(false)
    setCopyError(false)
    setStorageError(!writeInterviewDraft(contentKey, index, item.question, value))
  }

  const clearDraft = () => {
    setAnswer('')
    setRevealed(false)
    setAssessment(null)
    setCopied(false)
    setCopyError(false)
    setStorageError(!clearInterviewDraft(contentKey, index, item.question))
  }

  const copyToNote = () => {
    try {
      onCopyToNote(item.question, answer)
      setCopied(true)
      setCopyError(false)
    } catch {
      setCopied(false)
      setCopyError(true)
    }
  }

  return <article className="interview-practice-item" aria-labelledby={`${id}-question`}>
    <div className="interview-practice-prompt">
      <span className="interview-question-index" aria-hidden="true">Q{index + 1}</span>
      <h3 id={`${id}-question`}>{item.question}</h3>
    </div>
    <label className="interview-practice-label" htmlFor={`${id}-answer`}>내 답변 (선택 입력)</label>
    <textarea id={`${id}-answer`} className="note-editor interview-practice-editor" rows={5}
      maxLength={MAX_INTERVIEW_DRAFT_LENGTH} value={answer} aria-describedby={`${id}-storage`}
      onChange={event => updateAnswer(event.target.value)}
      placeholder="핵심 원리와 근거, 예외 상황을 내 말로 설명해 보세요. 코드나 Markdown도 입력할 수 있습니다." />
    <div className="interview-practice-actions">
      <button type="button" className="secondary-button" aria-expanded={revealed}
        aria-controls={`${id}-comparison`}
        onClick={() => { setRevealed(current => !current); setAssessment(null) }}>
        {revealed ? '모범 답변 닫기' : '모범 답변 펼치기'}
      </button>
      <button type="button" className="text-button" onClick={clearDraft}>내 초안 지우기</button>
    </div>
    <p id={`${id}-storage`} className="helper-text">
      초안은 현재 브라우저 탭이 열려 있는 동안만 보관하며 학습 이력·Quiz 점수에 반영되지 않습니다.
    </p>
    {storageError && <p role="alert" className="helper-text error-text">
      브라우저의 임시 저장이 제한되어 화면을 떠나면 답변이 사라질 수 있습니다. 직접 복사해 보관하세요.
    </p>}
    {revealed && <div className="interview-practice-revealed" id={`${id}-comparison`}>
      <div className="interview-practice-comparison">
        <div className="interview-practice-pane">
          <h4>나의 답변</h4>
          {hasAnswer ? <MarkdownContent>{answer}</MarkdownContent> :
            <p className="helper-text">입력한 답변이 없습니다. 가이드를 확인한 뒤 다시 연습할 수 있습니다.</p>}
        </div>
        <div className="interview-practice-pane">
          <h4>검수된 Concept 답변 가이드</h4>
          <MarkdownContent>{item.answerMarkdown}</MarkdownContent>
        </div>
      </div>
      <div className="interview-practice-assessment">
        <p>내 설명과 가이드를 비교한 후 직접 판단해 주세요. 자동 채점하지 않습니다.</p>
        <div className="interview-practice-actions">
          <button type="button" className="secondary-button" aria-pressed={assessment === 'CLEAR'}
            onClick={() => setAssessment('CLEAR')}>핵심을 설명함</button>
          <button type="button" className="secondary-button" aria-pressed={assessment === 'NEEDS_WORK'}
            onClick={() => setAssessment('NEEDS_WORK')}>보완 필요</button>
          <a className="text-button" href="#concept-reading-start">본문 다시 읽기</a>
        </div>
        {assessment !== null && <p role="status" className="helper-text">
          {assessment === 'CLEAR'
            ? '이번 답변에서 핵심을 설명했다고 판단했습니다. 관련 Quiz로 이해를 확인해 보세요.'
            : '빠진 원리와 오해를 본문에서 확인하고, 답변을 수정해 다시 비교해 보세요.'}
          {' '}이 판단은 점수·학습 상태·복습 일정에 반영되지 않습니다.
        </p>}
        <div className="interview-practice-note-actions">
          <button type="button" className="secondary-button" disabled={!hasAnswer}
            onClick={copyToNote}>내 답변을 학습 노트에 복사</button>
          <a href="#personal-note" className="text-button">학습 노트 확인</a>
        </div>
        {copied && <p role="status" className="helper-text">
          기존 개인 노트를 유지하고 답변을 추가했습니다.
          {noteState === 'saving' ? ' 서버에 자동 저장 중입니다.' :
            noteState === 'error' ? ' 자동 저장에 실패했습니다. 아래 개인 노트에서 다시 저장하세요.' :
              ' 저장 상태는 아래 개인 노트에서 확인할 수 있습니다.'}
        </p>}
        {copyError && <p role="alert" className="helper-text error-text">
          학습 노트로 복사하지 못했습니다. 개인 노트 상태를 확인하고 다시 시도하거나 답변을 직접 복사해 주세요.
        </p>}
      </div>
    </div>}
  </article>
}

/** Existing canonical Q&A, now a voluntary draft/compare flow with no extra persistence domain. */
export function InterviewRecallSection({ section, contentKey, conceptId, areaSlug, relatedConcepts, onCopyToNote, noteState }: {
  section: InterviewSection
  contentKey: string
  conceptId: number
  areaSlug: string
  relatedConcepts: ConceptNavigation[]
  onCopyToNote: (question: string, answer: string) => void
  noteState: NoteState
}) {
  if (!section.questions.length) return null
  return <section className="detail-section interview-recall-section" id="interview" aria-labelledby="interview-practice-title">
    <div className="section-heading interview-recall-heading">
      <div><p className="eyebrow">말로 설명해보기 · 자가 평가</p><h2 id="interview-practice-title">{section.title}</h2></div>
      <span className="result-count">{section.questions.length}개</span>
    </div>
    <p className="interview-recall-intro">
      먼저 내 말로 답하고 가이드를 펼쳐 비교하세요. 답변·자가 판단은 자동 채점하지 않으며 학습 노트로 명시적으로 복사할 때만 서버 저장 대상이 됩니다.
    </p>
    <div className="interview-practice-list">
      {section.questions.map((item, index) =>
        <PracticeQuestion key={`${index}:${item.question}`} item={item} index={index}
          contentKey={contentKey} onCopyToNote={onCopyToNote} noteState={noteState} />)}
    </div>
    <div className="interview-practice-next">
      <Link className="secondary-button" to="/quiz" search={{ ...defaultQuizSearch, areas: areaSlug, concepts: String(conceptId) }}>
        이 개념 Quiz 풀기
      </Link>
      {relatedConcepts.slice(0, 3).map(related => <Link key={related.id}
        className="text-button" to="/concepts/$conceptId" params={{ conceptId: String(related.id) }}>
        관련 개념: {related.title}
      </Link>)}
    </div>
  </section>
}
