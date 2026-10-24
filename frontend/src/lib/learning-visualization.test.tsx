import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { parseVisualization } from './learning-visualization'
import { MarkdownContent } from '../components/MarkdownContent'
import { applyThemePreference } from './theme-preference'

const cases = JSON.parse(readFileSync(new URL('../../../contracts/learning-visualization-cases.json', import.meta.url), 'utf8')) as { name: string; valid: boolean; source: string }[]
const fence = '`'.repeat(3)
const markdownCases = JSON.parse(readFileSync(new URL('../../../contracts/visualization-markdown-cases.json', import.meta.url), 'utf8')) as { name: string; source: string; visualizations: number }[]

describe('shared visualization contract', () => {
  it.each(markdownCases)('recognizes CommonMark fences: $name', ({ source, visualizations }) => {
    const html = renderToStaticMarkup(<MarkdownContent>{source}</MarkdownContent>)
    const rendered = (html.match(/class="learning-visualization"/g)?.length ?? 0)
      + (html.match(/class="diagram-fallback"/g)?.length ?? 0)
    expect(rendered).toBe(visualizations)
  })
  it.each(cases)('$name', ({ valid, source }) => {
    expect(parseVisualization(source) !== null).toBe(valid)
  })

  it('bounds the parser input before processing JSON', () => {
    expect(parseVisualization(' '.repeat(12_001))).toBeNull()
  })

  it.each(cases.filter((item) => item.valid))('renders $name through Markdown with a readable caption', ({ source }) => {
    const html = renderToStaticMarkup(<MarkdownContent>{`${fence}csforge-viz\n${source}\n${fence}`}</MarkdownContent>)
    expect(html).toContain('learning-visualization')
    expect(html).toContain('role="img"')
    expect(html).toContain('가로 스크롤 가능')
    expect(html).not.toContain('코드 복사')
    expect(html).not.toContain('csforge-viz')
  })

  it('keeps the article, existing code, image and emphasis when a diagram is invalid', () => {
    const source = `본문 **예시**를 읽습니다.\n\n${fence}csforge-viz\n{"version":99,"type":"<script>alert(1)</script>"}\n${fence}\n\n${fence}java\nint x = 1;\n${fence}\n\n![기존 이미지](/learning/java/pass-by-value.svg)`
    const html = renderToStaticMarkup(<MarkdownContent>{source}</MarkdownContent>)
    expect(html).toContain('<strong>예시</strong>를')
    expect(html).toContain('학습 도식을 표시할 수 없습니다')
    expect(html).toContain('코드 복사')
    expect(html).toContain('이미지 확대')
    expect(html).not.toContain('<script>')
  })

  it('keeps an inline reserved word and a longer literal code fence as code', () => {
    const html = renderToStaticMarkup(<MarkdownContent>{'`csforge-viz`\n\n' + fence + '`text\n' + fence + 'csforge-viz\n{}\n' + fence + '\n' + fence + '`'}</MarkdownContent>)
    expect(html).not.toContain('learning-visualization')
    expect(html).toContain('코드 복사')
  })

  it('defines only neutral diagram colors and follows manual as well as system themes', () => {
    const css = readFileSync(new URL('../learning-visualization.css', import.meta.url), 'utf8')
    for (const match of css.matchAll(/#([\da-f]{6})/gi)) {
      expect(match[1].slice(0, 2)).toBe(match[1].slice(2, 4))
      expect(match[1].slice(2, 4)).toBe(match[1].slice(4, 6))
    }
    const attributes = new Map<string, string>()
    const root = { setAttribute: (key: string, value: string) => { attributes.set(key, value) }, removeAttribute: (key: string) => { attributes.delete(key) } }
    for (const mode of ['light', 'dark'] as const) {
      applyThemePreference(mode, root)
      expect(attributes.get('data-theme')).toBe(mode)
    }
    applyThemePreference('system', root)
    expect(attributes.has('data-theme')).toBe(false)
    expect(css).toContain(":root:not([data-theme='light'])")
    expect(css).toContain(":root[data-theme='dark']")
    expect(css).toContain('prefers-reduced-motion: reduce')
  })
})
