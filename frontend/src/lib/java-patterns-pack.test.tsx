import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarkdownContent } from '../components/MarkdownContent'
import { javaPatternScenes } from './java-pattern-models'

describe('fixed Java collaboration diagrams', () => {
  it('renders each new canonical relation without falling back to text', () => {
    const files = ['api-design/dependency-injection-construction', ...['strategy', 'adapter', 'decorator', 'proxy', 'observer', 'state'].map((name) => `design-patterns/${name}-pattern`)]
    for (const file of files) {
      const source = readFileSync(new URL(`../../../content/java/${file}.md`, import.meta.url), 'utf8')
      const body = source.split(/\r?\n---\r?\n/)[1]
      const html = renderToStaticMarkup(<MarkdownContent>{body}</MarkdownContent>)
      expect(html, file).toContain(['strategy','adapter','decorator','proxy','observer','state'].some(name=>file.includes(`/${name}-pattern`)) || file.startsWith('api-design/dependency-injection-')?'java-ed-pattern':'diagram-canvas')
      expect(html, file).not.toContain('diagram-fallback')
      expect(html.includes('도식 단계 조작') || html.includes('도식 단계 이동'), file).toBe(file.includes('observer'))
    }
  })

  it('keeps the call effects and explicit unsubscribe separate after observer failure', () => {
    const failed = javaPatternScenes.observer[2]
    expect(failed.graph.nodes.find((node) => node.id === 'a')?.lines).toContain('기존 효과 유지')
    expect(failed.graph.nodes.find((node) => node.id === 'c')?.lines).toContain('미호출')
    expect(failed.graph.edges).toHaveLength(0)
    const unsubscribed = javaPatternScenes.observer[3]
    expect(unsubscribed.graph.nodes.some((node) => node.id === 'b')).toBe(false)
    expect(unsubscribed.graph.edges.map((edge) => edge.to)).toEqual(['a', 'c'])
  })

  it('shows only the documented state transitions separately from the current reference', () => {
    const edges = javaPatternScenes.state[0].graph.edges
    expect(edges.filter((edge) => !edge.dashed).map(({ from, to, label }) => [from, to, label])).toEqual([
      ['draft', 'published', 'publish'], ['published', 'draft', 'revise'], ['published', 'archived', 'archive'],
    ])
    expect(edges.find((edge) => edge.from === 'document')).toMatchObject({ to: 'published', dashed: true })
  })

  it('routes edges between distinct existing nodes without crossing another node', () => {
    for (const scenes of Object.values(javaPatternScenes)) for (const { graph } of scenes) {
      for (const edge of graph.edges) {
        const from = graph.nodes.find((node) => node.id === edge.from)!
        const to = graph.nodes.find((node) => node.id === edge.to)!
        expect(from).toBeDefined()
        expect(to).toBeDefined()
        expect(from.id).not.toBe(to.id)
        for (let step = 1; step < 100; step++) {
          const x = from.column * 390 + (to.column - from.column) * 390 * step / 100
          const y = from.row * 145 + (to.row - from.row) * 145 * step / 100
          for (const node of graph.nodes.filter((candidate) => candidate !== from && candidate !== to)) {
            expect(Math.abs(x - node.column * 390) < 125 && Math.abs(y - node.row * 145) < 34, `${edge.from} → ${edge.to} through ${node.id}`).toBe(false)
          }
        }
      }
    }
  })
})
