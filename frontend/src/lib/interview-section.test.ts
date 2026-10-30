import { describe, expect, it } from 'vitest'
import { extractInterviewSection } from './interview-section'

describe('extractInterviewSection', () => {
  it('extracts interview questions and leaves the learning article intact', () => {
    const markdown = `# Pass-by-value

### 핵심 동작

Java는 값을 복사해 전달한다.

### 면접에서 이렇게 나옵니다

#### Q. Java는 pass-by-reference인가요?

아닙니다. Java는 항상 pass-by-value입니다.

참조형에서는 참조 값 자체가 복사됩니다.

#### Q. 메서드 안에서 매개변수를 재대입하면 호출자 변수도 바뀌나요?

아닙니다. 재대입은 복사된 매개변수 값만 바꿉니다.

### 흔한 오해

객체 상태 변경과 변수 재대입을 구분해야 한다.`

    const result = extractInterviewSection(markdown)

    expect(result.interview?.questions).toHaveLength(2)
    expect(result.interview?.questions[0].question).toBe('Java는 pass-by-reference인가요?')
    expect(result.interview?.questions[0].answerMarkdown).toContain('참조 값 자체가 복사')
    expect(result.bodyMarkdown).toContain('### 핵심 동작')
    expect(result.bodyMarkdown).toContain('### 흔한 오해')
    expect(result.bodyMarkdown).not.toContain('### 면접에서 이렇게 나옵니다')
  })

  it('keeps malformed interview content visible instead of dropping it', () => {
    const markdown = `# 제목

### 면접에서 이렇게 나옵니다

정해진 Q heading 없이 작성된 내용입니다.`

    expect(extractInterviewSection(markdown)).toEqual({
      bodyMarkdown: markdown,
      interview: null,
    })
  })

  it('keeps a question without an answer in the article for authoring review', () => {
    const markdown = `# 제목

### 면접에서 이렇게 나옵니다

#### Q. 답이 비어 있나요?`

    expect(extractInterviewSection(markdown)).toEqual({
      bodyMarkdown: markdown,
      interview: null,
    })
  })
})
