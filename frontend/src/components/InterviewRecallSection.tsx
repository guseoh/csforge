import type { InterviewSection } from '../lib/interview-section'
import { MarkdownContent } from './MarkdownContent'

/** Concept에서 핵심 내용을 스스로 회상한 뒤 답변 가이드를 펼쳐보는 면접 Q&A 영역이다. */
export function InterviewRecallSection({ section }: { section: InterviewSection }) {
  return (
    <section className="detail-section interview-recall-section" id="interview">
      <div className="section-heading interview-recall-heading">
        <div>
          <p className="eyebrow">말로 설명해보기</p>
          <h2>{section.title}</h2>
        </div>
        <span className="result-count">{section.questions.length}개</span>
      </div>
      <p className="interview-recall-intro">
        먼저 내 말로 답해본 뒤 펼쳐보세요. 문장을 외우기보다 어떤 근거와 경계를 설명해야 하는지 확인합니다.
      </p>
      <div className="interview-recall-list">
        {section.questions.map((item, index) => (
          <details className="interview-recall-item" key={`${index}:${item.question}`}>
            <summary>
              <span className="interview-question-index">Q{index + 1}</span>
              <strong>{item.question}</strong>
              <span className="interview-disclosure-label">답 보기</span>
            </summary>
            <div className="interview-recall-answer">
              <p className="eyebrow">답변 가이드</p>
              <MarkdownContent>{item.answerMarkdown}</MarkdownContent>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
