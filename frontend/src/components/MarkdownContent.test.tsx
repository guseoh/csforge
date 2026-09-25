import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarkdownContent } from './MarkdownContent'

function renderMarkdown(markdown: string) {
  return renderToStaticMarkup(<MarkdownContent>{markdown}</MarkdownContent>)
}

describe('MarkdownContent literal URL particles', () => {
  it.each(['으로', '에서', '은', '는', '이', '가', '을', '를', '에', '로', '와', '과'])(
    'keeps %s outside a GFM literal autolink',
    (particle) => {
      const url = 'https://example.com/path'
      const html = renderMarkdown(`${url}${particle}`)
      expect(html).toContain(`<a href="${url}">${url}</a>${particle}`)
    },
  )

  it('keeps punctuation after the detached particle outside the link', () => {
    const html = renderMarkdown('www.example.com을, 다음 문장을 확인하세요.')
    expect(html).toContain('<a href="http://www.example.com">www.example.com</a>을, 다음 문장을 확인하세요.')
  })

  it('does not alter explicit Markdown links or angle autolinks', () => {
    const html = renderMarkdown('[www.example.com을](https://example.com) <https://example.com/에서>')
    expect(html).toContain('<a href="https://example.com">www.example.com을</a>')
    expect(html).toContain('<a href="https://example.com/%EC%97%90%EC%84%9C">https://example.com/에서</a>')
  })

  it('leaves inline code, fenced code, and Korean URL paths unchanged', () => {
    const html = renderMarkdown('`www.example.com을`\n\n```text\nhttps://example.com/path에서\n```\n\nhttps://example.com/한글에서')
    expect(html).toContain('<code>www.example.com을</code>')
    expect(html).toContain('<pre><code class="language-text" data-language="text">https://example.com/path에서\n</code></pre>')
    expect(html).toContain('<a href="https://example.com/%ED%95%9C%EA%B8%80%EC%97%90%EC%84%9C">https://example.com/한글에서</a>')
  })
})
