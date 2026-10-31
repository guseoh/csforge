import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarkdownContent } from '../components/MarkdownContent'
import { javaTimeScenes } from './java-time-models'

describe('fixed date and deque diagrams', () => {
  it('renders all four declarations and steps only the DST comparison', () => {
    for (const file of ['time-numeric/instant-local-zoned-time', 'time-numeric/zoneid-dst', 'time-numeric/duration-period', 'coding-tests/arraydeque-stack-queue']) {
      const source = readFileSync(new URL(`../../../content/java/${file}.md`, import.meta.url), 'utf8')
      const html = renderToStaticMarkup(<MarkdownContent>{source.split(/\r?\n---\r?\n/)[1]}</MarkdownContent>)
      const editorial = ['time-numeric/instant-local-zoned-time', 'time-numeric/duration-period', 'time-numeric/zoneid-dst', 'coding-tests/arraydeque-stack-queue'].includes(file)
      expect(html, file).toContain(editorial ? (file.includes('zoneid-dst') ? 'java-ed-coordination' : 'java-ed-contract') : 'diagram-canvas')
      expect(html, file).not.toContain('diagram-fallback')
      expect(html.includes('도식 단계 조작') || html.includes('도식 단계 이동'), file).toBe(file.includes('zoneid-dst'))
    }
  })

  it('distinguishes no valid offset, gap adjustment, and two overlap instants', () => {
    const scenes = javaTimeScenes['zone-dst']
    expect(scenes[0].graph.nodes[1].lines).toContain('[] · 유효 offset 없음')
    expect(scenes[1].graph.nodes[1].lines).toContain('2026-03-29 03:30')
    expect(scenes[2].graph.nodes.slice(1).map((node) => node.lines[1])).toEqual(['Instant 00:30Z', 'Instant 01:30Z'])
    expect(scenes[3].note).toContain('발생 순서')
  })

  it('keeps the same start and separates elapsed hours from the calendar day', () => {
    const { nodes, edges } = javaTimeScenes['duration-period'][0].graph
    expect(edges.map((edge) => edge.from)).toEqual(['start', 'start'])
    expect(nodes.find((node) => node.id === 'duration')?.lines).toContain('경과 24시간')
    expect(nodes.find((node) => node.id === 'period')?.lines).toContain('경과 23시간')
  })
})
