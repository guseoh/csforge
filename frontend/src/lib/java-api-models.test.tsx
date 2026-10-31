import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MarkdownContent } from '../components/MarkdownContent'
import { javaApiScenes } from './java-api-models'
import { parseVisualization } from './learning-visualization'

const audit = JSON.parse(readFileSync(new URL('../../../docs/content-audit/issue-277/java.json', import.meta.url), 'utf8')) as { concepts: { implementationPackage: string; sourcePath: string; targetTier: string }[] }
const topics = ['object-contracts', 'generics', 'collections', 'io-nio']
const expectedCounts = [5, 6, 9, 6]
describe('four Java Topic batch', () => {
  it.each(topics)('renders every actual %s concept and its approved visual tier', (topic) => {
    const concepts = audit.concepts.filter(c => c.implementationPackage === `J-${topic}`)
    expect(concepts).toHaveLength(expectedCounts[topics.indexOf(topic)])
    for (const c of concepts) {
      const source = readFileSync(new URL(`../../../${c.sourcePath}`, import.meta.url), 'utf8')
      const body = source.split(/\r?\n---\r?\n/)[1]
      const declarations = [...body.matchAll(/^```csforge-viz\r?\n([\s\S]*?)^```/gm)]
      expect(declarations, c.sourcePath).toHaveLength(c.targetTier === 'NONE' ? 0 : 1)
      for (const d of declarations) expect(parseVisualization(d[1]), c.sourcePath).not.toBeNull()
      const html = renderToStaticMarkup(<MarkdownContent>{body}</MarkdownContent>)
      expect(html, c.sourcePath).not.toContain('diagram-fallback')
      expect(html).not.toContain('csforge-viz')
      expect(html).not.toMatch(/<p>[^<]*\*\*/)
      expect(html).toContain('<strong>')
      // Java editorial stepped diagrams use "도식 단계 이동"; the legacy SVG controls use "도식 단계 조작".
      const stepControls = html.match(/aria-label="(?:도식 단계 조작|도식 단계 이동|참조 값 복사 단계 조작)"/g) ?? []
      expect(stepControls.length, c.sourcePath).toBe(c.targetTier === 'V2' || c.targetTier === 'V3' ? 1 : 0)
    }
  })
  it('keeps buffer capacity and accessible bounds across forward and reverse snapshots', () => {
    for (const scene of [...javaApiScenes.buffer, ...[...javaApiScenes.buffer].reverse()]) {
      expect(scene.cells).toHaveLength(8)
      expect(scene.position).toBeGreaterThanOrEqual(0)
      expect(scene.position!).toBeLessThanOrEqual(scene.limit!)
      expect(scene.limit!).toBeLessThanOrEqual(8)
    }
    expect(javaApiScenes.buffer[4].cells?.slice(0, 2)).toEqual(['D', 'E'])
    expect(javaApiScenes.buffer[5].cells).toEqual(javaApiScenes.buffer[4].cells)
  })
  it('retains a selected key on zero update and removes selection without cancelling registration', () => {
    expect(javaApiScenes.selector[3].lanes.map(l => l[1]).join(' ')).toContain('{A}')
    expect(javaApiScenes.selector[4].lanes[0][1]).toContain('등록 유지')
    expect(javaApiScenes.selector[4].lanes[1][1]).toBe('∅')
    expect(javaApiScenes.selector[5].lanes[0][1]).toContain('invalid')
  })
})
