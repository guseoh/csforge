import { describe, expect, it } from 'vitest'
import { selectActiveRecallPrompt } from './active-recall'
import { extractInterviewSection } from './interview-section'

describe('selectActiveRecallPrompt', () => {
  it('uses a reviewed, content-specific explanatory passage without manufacturing an answer', () => {
    const markdown = [
      '# Java는 항상 값을 전달한다',
      '값 전달 방식에는 두 가지 상황이 있습니다.',
      '',
      '### 참조 값이 전달될 때',
      '참조 타입에서도 참조 값이 복사되어 새로운 매개변수에 전달됩니다. 두 값이 같은 객체를 가리키므로 객체의 필드 변경은 호출자에게 보일 수 있습니다.',
      '',
      '### 값 전달 규칙과 공유 가변 상태는 다른 문제다',
      '메서드가 참조를 복사받아도 같은 객체를 공유하면 의도치 않은 상태 변경이 발생할 수 있습니다. API 소유권과 방어적 복사의 필요성을 확인해야 합니다.',
    ].join('\n')
    const exercise = selectActiveRecallPrompt(markdown)
    expect(exercise?.sourceHeading).toBe('참조 값이 전달될 때')
    expect(exercise?.prompt).toContain('참조 값이 전달될 때')
    expect(exercise?.guideMarkdown).toContain('참조 타입에서도')
    expect(exercise?.guideMarkdown).not.toContain('방어적 복사의 필요성')
  })

  it('ignores fake headings inside fenced code and excluded interview sections', () => {
    const markdown = [
      '# 예제',
      '```markdown',
      '### 실행 흐름',
      '답안은 코드블록 안입니다. 정식 본문 섹션으로 인식하면 안 됩니다. 이것은 여러 문장을 포함하지만 검토된 설명 섹션이 아닙니다.',
      '```',
      '### 면접에서 이렇게 나옵니다',
      '#### Q. 구현 방법을 설명하시오.',
      '원문 면접 답변 내용입니다. 이 내용은 별도 면접 회상 섹션에서 관리됩니다. 여기서 자동으로 질문을 만들거나 중복해서는 안 됩니다.',
      '### 비교와 설계 선택',
      '트랜잭션과 잠금을 언제 선택하는지에 따라 정합성 및 처리량이 달라집니다. 조건을 분리하고 응답 시간이 중요한 상황에 맞는 방식을 검토합니다.',
    ].join('\n')
    const exercise = selectActiveRecallPrompt(markdown)
    expect(exercise?.sourceHeading).toBe('비교와 설계 선택')
    expect(exercise?.guideMarkdown).toContain('트랜잭션과 잠금')
    expect(exercise?.guideMarkdown).not.toContain('면접 답변')
  })

  it('falls back to authored introductory prose for concepts without section headings', () => {
    const markdown = '# 데이터란?\n\n데이터를 저장할 때는 일관된 형태를 갖춰야 합니다. 타입이 다르면 읽고 해석하는 시점에 오류가 생길 수 있습니다.\n\n따라서 형식을 먼저 결정해 두고 검증한 뒤 저장합니다.'
    const exercise = selectActiveRecallPrompt(markdown)
    expect(exercise?.sourceHeading).toBe(null)
    expect(exercise?.guideMarkdown).toContain('형식을 먼저 결정')
    expect(exercise?.prompt).toContain('문제 상황과 핵심 원리')
  })

  it('keeps curated interview Q&A separate from the general active recall passage', () => {
    const markdown = [
      '# JDBC 트랜잭션',
      '트랜잭션을 시작할 때는 작업 단위를 지정하고 실패 시 되돌릴 수 있어야 합니다. 실무에서는 처리 경계와 예외 발생 시점을 함께 판단해야 합니다.',
      '### 트랜잭션 실패와 롤백',
      '오류가 발생한 경우 같은 트랜잭션으로 묶인 작업을 되돌리는 과정이 필요합니다. 연결 반환 전에 상태를 복원하지 않으면 다음 요청에도 영향을 미칠 수 있습니다.',
      '### 면접에서 이렇게 나옵니다',
      '#### Q. 트랜잭션의 실패 시에는 어떻게 해야 하나요?',
      '원문 면접 답변은 예외 상황과 롤백 정책을 구분합니다.',
    ].join('\n')
    const extracted = extractInterviewSection(markdown)
    expect(extracted.interview?.questions).toHaveLength(1)
    const exercise = selectActiveRecallPrompt(extracted.bodyMarkdown)
    expect(exercise?.sourceHeading).toBe('트랜잭션 실패와 롤백')
    expect(exercise?.guideMarkdown).not.toContain('원문 면접 답변')
    expect(extracted.interview?.questions[0].answerMarkdown).toContain('롤백 정책')
  })

  it('does not create an unsupported response for content with no meaningful explanation', () => {
    expect(selectActiveRecallPrompt('# 빈 문서\n\n짧은 메모')).toBe(null)
  })
})
