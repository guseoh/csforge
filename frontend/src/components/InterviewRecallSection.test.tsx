import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { InterviewSection } from '../lib/interview-section'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
}))
vi.mock('./MarkdownContent', () => ({
  MarkdownContent: ({ children }: { children: string }) => <div className="markdown-content">{children}</div>,
}))

import { InterviewRecallSection } from './InterviewRecallSection'

const question = (num: number) => ({
  question: `질문 ${num}: 실행 원리를 설명하세요.`,
  answerMarkdown: `**정답 ${num}**\n\n```java\nSystem.out.println(${num});\n````,
})
const props = (section: InterviewSection) => ({
  section, contentKey: 'java.core.value', conceptId: 17, areaSlug: 'java',
  relatedConcepts: [{ id: 18, title: '관련 객체 개념', level: 2 }],
  onCopyToNote: vi.fn(), noteState: 'saved' as const,
})

describe('InterviewRecallSection practice', () => {
  it('does not introduce controls for zero canonical questions', () => {
    expect(renderToStaticMarkup(<InterviewRecallSection {...props({ title: '면접', questions: [] })} />)).toBe('')
  })

  it('keeps authored guide hidden until manual reveal while offering a draft input', () => {
    const html = renderToStaticMarkup(<InterviewRecallSection {...props({ title: '면접', questions: [question(1)] })} />)
    expect(html).toContain('질문 1')
    expect(html).toContain('내 답변 (선택 입력)')
    expect(html).toContain('모범 답변 펼치기')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('초안은 현재 브라우저 탭이 열려 있는 동안만 보관')
    expect(html).not.toContain('정답 1')
    expect(html).not.toContain('System.out.println(1)')
    expect(html).not.toContain('핵심을 설명함')
    expect(html).not.toContain('내 답변을 학습 노트에 복사')
  })

  it('renders three independent accessible prompts and existing quiz/related navigation', () => {
    const html = renderToStaticMarkup(<InterviewRecallSection {...props({
      title: '면접', questions: [question(1), question(2), question(3)],
    })} />)
    expect(html.match(/class="interview-practice-item"/g)).toHaveLength(3)
    expect(html).toContain('Q1')
    expect(html).toContain('Q2')
    expect(html).toContain('Q3')
    expect(html).toContain('이 개념 Quiz 풀기')
    expect(html).toContain('관련 개념: 관련 객체 개념')
    expect(html).not.toContain('정답 3')
    expect(html.match(/aria-describedby=/g)).toHaveLength(3)
  })
})
