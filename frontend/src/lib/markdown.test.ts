import { describe, expect, it } from 'vitest'
import { compactMarkdownPreview, removeDuplicateLeadingHeading } from './markdown'

describe('removeDuplicateLeadingHeading', () => {
  it('removes only a matching first heading and keeps following Markdown intact', () => {
    expect(removeDuplicateLeadingHeading('# Title\n\n## Section\n\nBody', 'Title')).toBe('## Section\n\nBody')
  })

  it('accepts safe whitespace and closing ATX markers', () => {
    expect(removeDuplicateLeadingHeading('  #  Title  #\n\nBody', 'Title')).toBe('Body')
  })

  it('keeps a different first heading or a heading that is not leading content', () => {
    expect(removeDuplicateLeadingHeading('# Other\n\nBody', 'Title')).toBe('# Other\n\nBody')
    expect(removeDuplicateLeadingHeading('Intro\n\n# Title\n\nBody', 'Title')).toBe('Intro\n\n# Title\n\nBody')
  })
})

describe('compactMarkdownPreview', () => {
  it('removes visible Markdown syntax while keeping readable list context', () => {
    expect(compactMarkdownPreview('# 제목\n\n`inline` [문서](https://example.com)\n\n| A | B |\n|---|---|\n| 1 | 2 |')).toBe('제목 inline 문서 · A · B · 1 · 2')
  })

  it('replaces fenced code with a compact marker and truncates long text', () => {
    expect(compactMarkdownPreview('앞\n```java\nclass Example {}\n```\n뒤', 8)).toBe('앞 코드 블록…')
  })
})
