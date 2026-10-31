import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarkdownContent } from '../components/MarkdownContent'
import { parseVisualization } from './learning-visualization'

type DiagramAudit = {
  sourcePath: string
  visualizationType: string
  example: string | null
  rendering: string
  browserVisualVerdict: string
}
type Audit = {
  stats: { javaConcepts: number; viz: number; nonViz: number; javaApiContract: number; explicitJavaRoutes: number; specializedTypeRenderers: number; remainingGenericJavaApi: number }
  conceptDiagrams: DiagramAudit[]
  conceptsWithoutDiagrams: { sourcePath: string; contentKey: string }[]
}
const audit = JSON.parse(readFileSync(new URL('../../../docs/content-audit/issue-292/java-g3-review.json', import.meta.url), 'utf8')) as Audit
const markdownSource = (path: string) => readFileSync(new URL('../../../' + path, import.meta.url), 'utf8')
const bodyOf = (source: string) => source.split(/\r?\n---\r?\n/)[1]
const declarationsOf = (body: string) => [...body.matchAll(/^\x60\x60\x60csforge-viz\r?\n([\s\S]*?)^\x60\x60\x60/gm)]

describe('Java G3 per-Concept declaration and renderer inventory (#292)', () => {
  it('accounts for 145 unique canonical Concepts without adding visual quota', () => {
    expect(audit.stats.javaConcepts).toBe(145)
    expect(audit.stats.viz).toBe(85)
    expect(audit.stats.nonViz).toBe(60)
    expect(audit.conceptDiagrams).toHaveLength(85)
    expect(audit.conceptsWithoutDiagrams).toHaveLength(60)
    const sources = [...audit.conceptDiagrams.map(x => x.sourcePath), ...audit.conceptsWithoutDiagrams.map(x => x.sourcePath)]
    expect(new Set(sources).size).toBe(145)
    for (const { sourcePath } of audit.conceptsWithoutDiagrams) {
      const source = markdownSource(sourcePath)
      expect(declarationsOf(bodyOf(source)), sourcePath).toHaveLength(0)
    }
  })

  it('parses and renders all 85 current diagrams without falling back to text', () => {
    const routeTypes = new Map<string, number>()
    let javaApiCount = 0
    for (const item of audit.conceptDiagrams) {
      const source = markdownSource(item.sourcePath)
      const body = bodyOf(source)
      const declaration = declarationsOf(body)
      expect(declaration, item.sourcePath).toHaveLength(1)
      const parsed = parseVisualization(declaration[0][1])
      expect(parsed, item.sourcePath).not.toBeNull()
      expect(parsed?.type, item.sourcePath).toBe(item.visualizationType)
      const example = 'example' in (parsed ?? {}) ? (parsed as { example?: string }).example ?? null : null
      expect(example, item.sourcePath).toBe(item.example)
      expect(item.browserVisualVerdict).toBe('NOT_YET_VERIFIED')
      const html = renderToStaticMarkup(<MarkdownContent>{body}</MarkdownContent>)
      expect(html, item.sourcePath).toContain('learning-visualization')
      expect(html, item.sourcePath).not.toContain('diagram-fallback')
      expect(html, item.sourcePath).not.toContain('csforge-viz')
      routeTypes.set(item.visualizationType, (routeTypes.get(item.visualizationType) ?? 0) + 1)
      if (item.visualizationType === 'java-api-contract') {
        javaApiCount++
        expect(item.rendering, item.sourcePath).toBe('G3_EXPLICIT_JAVA_EXAMPLE')
        expect(html, item.sourcePath).toContain('java-visualization')
        expect(html, item.sourcePath).not.toContain('diagram-canvas')
      }
    }
    expect(javaApiCount).toBe(68)
    expect(routeTypes.get('java-object-model')).toBe(7)
    expect(routeTypes.get('java-value-reference')).toBe(3)
    expect(routeTypes.get('static-flow')).toBe(3)
    for (const kind of ['java-pass-by-value','java-array-store','java-definite-assignment','min-heap']) {
      expect(routeTypes.get(kind)).toBe(1)
    }
    expect([...routeTypes.values()].reduce((a,b)=>a+b,0)).toBe(85)
  })
})
