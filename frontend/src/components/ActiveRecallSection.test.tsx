import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./MarkdownContent', () => ({
  MarkdownContent: ({ children }: { children: string }) => <div className="markdown-content">{children}</div>,
}))

import { ActiveRecallSection } from './ActiveRecallSection'

const body = [
  '# 값을 복사한다',
  '메서드를 호출하면 새로운 매개변수에 값이 전달됩니다. 그 값이 참조라면 같은 객체를 바라볼 수 있다는 점을 이해해야 합니다.',
  '### 참조 값이 전달될 때',
  '참조 타입의 매개변수도 값의 복사입니다. 참조 값은 복사되지만 공유 객체의 상태는 변경될 수 있어 호출자의 객체에서 변경이 확인됩니다.',
  '### 주의할 점',
  '매개변수에 새 객체를 할당하는 동작은 원본 변수에 영향을 주지 않습니다. 상태 변경과 참조 변수 재할당을 구분해야 합니다.',
].join('\n')

describe('ActiveRecallSection', () => {
  it('presents an optional closed recall step and does not reveal original answer before explicit comparison', () => {
    const html = renderToStaticMarkup(<ActiveRecallSection contentKey="java.core.pass-by-value" bodyMarkdown={body} />)
    expect(html).toContain('핵심 내용을 스스로 설명해 보기')
    expect(html).toContain('<details class="active-recall-disclosure"')
    expect(html).toContain('참조 값이 전달될 때')
    expect(html).toContain('내 설명 (선택 입력)')
    expect(html).toContain('이 브라우저에만 초안 자동 보관')
    expect(html).toContain('내 설명과 원문 비교하기')
    expect(html).toContain('회상 초안 지우기')
    expect(html).not.toContain('공유 객체의 상태는 변경될 수 있어')
    expect(html).not.toContain('설명할 수 있었어요')
  })

  it('remains optional on content without an authored explanatory paragraph', () => {
    expect(renderToStaticMarkup(
      <ActiveRecallSection contentKey="java.core.empty" bodyMarkdown="# 빈 문서\n\n짧음" />,
    )).toBe('')
  })

  it('does not introduce quiz grading, review schedule, or personal note APIs in recall UI', () => {
    const html = renderToStaticMarkup(<ActiveRecallSection contentKey="java.core.pass-by-value" bodyMarkdown={body} />)
    expect(html).toContain('Quiz 점수나 복습 일정에 반영되지 않습니다')
    expect(html).toContain('개인 노트와 별개')
    expect(html).not.toContain('자동 채점')
  })
})
