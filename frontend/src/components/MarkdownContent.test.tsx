import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarkdownContent } from './MarkdownContent'

function renderMarkdown(markdown: string) {
  return renderToStaticMarkup(<MarkdownContent>{markdown}</MarkdownContent>)
}

describe('MarkdownContent Korean strong delimiters', () => {
  it('renders the canonical classfile example with its attached particle', () => {
    // content/java/jvm-runtime/jdk-jvm-classfile.md, unchanged through Import/API.
    const html = renderMarkdown('흔히 **바이트코드(bytecode)**라고 부르는 것은 클래스 파일 안의 JVM 명령 중심 표현입니다.')
    expect(html).toContain('<strong>바이트코드(bytecode)</strong>라고')
  })

  it.each(['**강조**', '**예시**를', '**필드(field)**와', '**“예시”**는', '**C(x) < C(y)**라는'])('renders %s without literal delimiters', (source) => {
    const html = renderMarkdown(source)
    expect(html).toContain('<strong>')
    expect(html).not.toContain('**')
  })

  it('preserves deliberate escapes, unmatched symbols, inline code and fenced code', () => {
    const tick = String.fromCharCode(96)
    const fence = tick.repeat(3)
    const html = renderMarkdown(String.raw`\*\*예시\*\*와 \*\*필드(field)\*\*를` + '\n\n** 미완성 **\n\n' + tick + '**예시**를' + tick + '\n\n' + fence + 'text\n**필드(field)**를\n' + fence)
    expect(html).toContain('**예시**와 **필드(field)**를')
    expect(html).toContain('** 미완성 **')
    expect(html).toContain('<code>**예시**를</code>')
    expect(html).toContain('**필드(field)**를</code>')
    expect(html).not.toContain('<strong>')
  })

  it('keeps GFM lists, tables, links, URLs and unsafe HTML boundaries', () => {
    const html = renderMarkdown('- **필드(field)**와 **예시**를 확인\n\n| 용어 | 설명 |\n| --- | --- |\n| **필드(field)**는 | 값 |\n\n[문서](https://example.com/a**b)\n\n<script>alert(1)</script>')
    expect(html).toContain('<li><strong>필드(field)</strong>와 <strong>예시</strong>를 확인</li>')
    expect(html).toContain('<strong>필드(field)</strong>는')
    expect(html).toContain('href="https://example.com/a**b"')
    expect(html).not.toContain('<script>')
  })

  it('renders emphasis within a link label without rewriting its destination', () => {
    expect(renderMarkdown('[**필드(field)**를](https://example.com/a**b)')).toContain('<a href="https://example.com/a**b"><strong>필드(field)</strong>를</a>')
  })
})

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


describe('MarkdownContent canonical visualization recovery', () => {
  const fence = String.fromCharCode(96).repeat(3)
  const payload = JSON.stringify({
    version: 1,
    type: 'java-definite-assignment',
    title: '두 분기의 대입과 합류 지점',
    description: '두 분기에서 모두 대입되어 컴파일 가능합니다.',
  })

  it.each(['csforge-viz', 'text', ''])('renders a valid visualization in a %s code fence', (language) => {
    const html = renderMarkdown(fence + language + '\\n' + payload + '\\n' + fence)
    expect(html).toContain('learning-visualization')
    expect(html).not.toContain('markdown-code-block')
    expect(html).not.toContain('코드 복사')
  })

  it('keeps explicitly documented JSON source as code, not a visualization', () => {
    const html = renderMarkdown(fence + 'json\\n' + payload + '\\n' + fence)
    expect(html).toContain('markdown-code-block')
    expect(html).not.toContain('learning-visualization')
  })

  it('does not silently render unknown or invalid visualization configuration', () => {
    const html = renderMarkdown(fence + 'text\\n' + JSON.stringify({
      version: 2, type: 'java-definite-assignment', title: '오래된 데이터',
      description: '지원되지 않는 형식',
    }) + '\\n' + fence)
    expect(html).toContain('markdown-code-block')
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
    // The native dialog is mounted into document.body after hydration, never inside a Markdown <p>.
    expect(html).not.toContain('<dialog')
  })

  it('preserves linked images without nesting a viewer button inside an anchor', () => {
    const html = renderMarkdown('[![diagram](/diagram.svg)](https://example.com/guide)')
    expect(html).toContain('href="https://example.com/guide"')
    expect(html).toContain('src="/diagram.svg"')
    expect(html).not.toContain('markdown-image-trigger')
  })

  it('keeps decorative images non-interactive and raw HTML inert', () => {
    const html = renderMarkdown('![](/icon.svg)\n\n<script>alert("unsafe")</script>')
    expect(html).toContain('alt=""')
    expect(html).not.toContain('markdown-image-trigger')
    expect(html).not.toContain('<script>')
  })
})
