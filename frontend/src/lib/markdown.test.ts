import { describe, expect, it } from 'vitest'
import { compactMarkdownPreview } from './markdown'

describe('compactMarkdownPreview', () => {
  it('removes visible Markdown syntax while keeping readable list context', () => {
    expect(compactMarkdownPreview('# 제목\n\n`inline` [문서](https://example.com)\n\n| A | B |\n|---|---|\n| 1 | 2 |')).toBe('제목 inline 문서 · A · B · 1 · 2')
  })

  it('replaces fenced code with a compact marker and truncates long text', () => {
    expect(compactMarkdownPreview('앞\n```java\nclass Example {}\n```\n뒤', 8)).toBe('앞 코드 블록…')
  })
})
