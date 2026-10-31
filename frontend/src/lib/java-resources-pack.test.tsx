import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarkdownContent } from '../components/MarkdownContent'
import { javaResourceScenes } from './java-resource-models'

describe('exception and resource diagrams', () => {
  it('renders the new canonical diagrams and the two state traces', () => {
    const files = ['throwable-checked-unchecked-error', 'exception-propagation-catch-boundary', 'exception-translation-cause', 'failure-atomicity', 'try-with-resources-suppressed', 'autocloseable-resource-ownership']
    for (const file of files) {
      const source = readFileSync(new URL(`../../../content/java/exceptions-resources/${file}.md`, import.meta.url), 'utf8')
      const html = renderToStaticMarkup(<MarkdownContent>{source.split(/\r?\n---\r?\n/)[1]}</MarkdownContent>)
      const editorial = ['exception-translation-cause', 'try-with-resources-suppressed', 'failure-atomicity'].includes(file)
      expect(html, file).toContain(editorial ? (file === 'exception-translation-cause' ? 'java-ed-contract' : 'java-ed-coordination') : 'diagram-canvas')
      expect(html, file).not.toContain('diagram-fallback')
      expect(html.includes('도식 단계 조작') || html.includes('도식 단계 이동'), file)
        .toBe(['failure-atomicity', 'try-with-resources-suppressed'].includes(file))
    }
  })

  it('preserves the partial mutation and distinguishes failed validation from success', () => {
    const scenes = javaResourceScenes['failure-atomicity']
    expect(scenes[1].graph.nodes.map((node) => node.lines[1])).toEqual(['balance = 70', '실패 · balance = 50'])
    expect(scenes[3].graph.nodes[0].lines).toContain('Money(100) 유지')
    expect(scenes[4].graph.nodes[0].lines).toContain('Money(130)로 교체')
    expect(scenes[4].note).toContain('다른 경로')
  })

  it('retains the body exception and reverse close failure order', () => {
    const scenes = javaResourceScenes['resource-suppressed']
    expect(scenes[2].graph.nodes.find((node) => node.id === 'first')?.lines).toContain('다음 close 대상')
    expect(scenes[3].graph.edges.map(({ from, to, label }) => [from, to, label])).toEqual([
      ['work', 'secondFailure', 'suppressed[0]'], ['work', 'firstFailure', 'suppressed[1]'],
    ])
    expect(scenes[3].graph.nodes[0].lines).toContain('최종 전파되는 주 예외')
  })
})
