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
    expect(html).toContain('<code class="language-text" data-language="text">https://example.com/path에서</code>')
    expect(html).toContain('<a href="https://example.com/%ED%95%9C%EA%B8%80%EC%97%90%EC%84%9C">https://example.com/한글에서</a>')
  })
})


describe('MarkdownContent shared learning media', () => {
  const fence = String.fromCharCode(96).repeat(3)
  it.each([
    ['java', 'public class Main {}', 'code-keyword'],
    ['sql', 'SELECT * FROM books;', 'code-keyword'],
    ['bash', 'echo hello', 'code-keyword'],
    ['shell', 'if true; then echo yes; fi', 'code-keyword'],
    ['json', '{"enabled":true}', 'code-type'],
    ['yaml', 'enabled: true', 'code-type'],
    ['http', 'GET /path HTTP/1.1', 'code-keyword'],
    ['xml', '<root />', 'code-keyword'],
  ])('highlights supported %s source as inert text', (language, source, tokenClass) => {
    const html = renderMarkdown(fence + language + '\n' + source + '\n' + fence)
    expect(html).toContain('markdown-code-block')
    expect(html).toContain('코드 복사')
    expect(html).toContain('줄바꿈')
    expect(html).toContain('class="' + tokenClass + '"')
  })

  it('falls back to escaped plain text for unknown languages', () => {
    const html = renderMarkdown(fence + 'fancy\n<script>alert(1)</script>\n' + fence)
    expect(html).toContain('data-language="fancy"')
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('class="code-keyword"')
  })

  it('keeps code controls separate from inline code and preserves focusable scrolling', () => {
    const tick = String.fromCharCode(96)
    const html = renderMarkdown('본문 ' + tick + 'map()' + tick + '\n\n' + fence + 'sql\nSELECT 1;\n' + fence)
    expect(html).toContain('<code>map()</code>')
    expect(html).toContain('aria-label="SQL 코드 블록, 가로 스크롤 가능"')
    expect(html).toContain('aria-pressed="false"')
  })

  it('isolates wide GFM tables inside an accessible scrolling region', () => {
    const html = renderMarkdown('| key | value |\n| --- | --- |\n| A | very-long-data |')
    expect(html).toContain('markdown-table-scroll')
    expect(html).toContain('aria-label="비교 표, 가로 스크롤 가능"')
    expect(html).toContain('<table>')
    expect(html).toContain('very-long-data')
  })

  it('offers a named image viewer while preserving alt and src', () => {
    const html = renderMarkdown('![CPU와 캐시의 연결](/learning/java/cache.svg)')
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).toContain('CPU와 캐시의 연결 이미지 확대')
    expect(html).toContain('src="/learning/java/cache.svg"')
    expect(html).toContain('alt="CPU와 캐시의 연결"')
    expect(html).toContain('markdown-image-dialog')
  })

  it('keeps decorative images non-interactive and raw HTML inert', () => {
    const html = renderMarkdown('![](/icon.svg)\n\n<script>alert("unsafe")</script>')
    expect(html).toContain('alt=""')
    expect(html).not.toContain('markdown-image-trigger')
    expect(html).not.toContain('<script>')
  })
})
