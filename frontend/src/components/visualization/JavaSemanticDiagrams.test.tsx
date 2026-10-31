import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { JavaCasEditorial, JavaGcReachabilityEditorial, JavaHappensBeforeEditorial, JavaSelectorEditorial, JavaVolatileHandoffEditorial } from './JavaSemanticDiagrams'
import { LearningVisualization } from './LearningVisualization'
import { javaApiScenes } from '../../lib/java-api-models'

const source = (example: string) => JSON.stringify({
  version: 1, type: 'java-api-contract', example,
  title: 'Java 학습 도식', description: '기술 계약의 상태를 살펴봅니다.',
})

describe('Java-only semantic editorial diagrams', () => {
  it('distinguishes program-order-only from a validated volatile handoff', () => {
    const html = renderToStaticMarkup(<JavaHappensBeforeEditorial />)
    expect(html).toContain('Writer 스레드')
    expect(html).toContain('Reader 스레드')
    expect(html).toContain('program order')
    expect(html).toContain('스레드 간 동기화 간선은 아직 제시되지 않음')
    expect(html).not.toContain('CPU cache flush 과정이 발생')
  })

  it('connects writer and reader with an explicit volatile synchronizes-with handoff', () => {
    const html = renderToStaticMarkup(<JavaVolatileHandoffEditorial />)
    expect(html).toContain('Writer 스레드')
    expect(html).toContain('Reader 스레드')
    expect(html).toContain('스레드 사이의 관찰은 아직 표시하지 않음')
    expect(html).toContain('ready 읽기 전')
    expect(html).not.toContain('ready == true')
    expect(html).toContain('count++')
    expect(html).toContain('1 / 2')
    expect(javaApiScenes['volatile-handoff']).toHaveLength(2)

    const routed = renderToStaticMarkup(<LearningVisualization source={source('volatile-handoff')} />)
    expect(routed).toContain('java-ed-volatile')
    expect(routed).toContain('도식 단계 이동')
    expect(routed).not.toContain('diagram-canvas')
  })

  it('keeps CAS comparison attempts separate from overall progress guarantees', () => {
    const html = renderToStaticMarkup(<JavaCasEditorial />)
    expect(html).toContain('AtomicInteger')
    expect(html).toContain('current = 0')
    expect(html).toContain('lock-free')
    expect(html).toContain('1 / 3')
  })

  it('represents a rooted strong path without claiming immediate collection', () => {
    const html = renderToStaticMarkup(<JavaGcReachabilityEditorial />)
    expect(html).toContain('GC root')
    expect(html).toContain('Cache')
    expect(html).toContain('User A')
    expect(html).toContain('User B')
    expect(html).toContain('즉시')
    expect(html).not.toContain('Cache → A 참조 제거')
  })

  it('makes selector set semantics explicit without misleading physical timing', () => {
    const html = renderToStaticMarkup(<JavaSelectorEditorial />)
    expect(html).toContain('selected-key set')
    expect(html).toContain('interestOps')
    expect(html).toContain('1 / 6')
    expect(html).toContain('완전한 메시지 수신')
  })

  it('preserves the existing JMM/CAS/GC/Selector scenario contracts', () => {
    const hb = javaApiScenes['happens-before']
    expect(hb).toHaveLength(2)
    expect(hb[0].graph?.edges.some((edge) => edge.label === 'synchronizes-with')).toBe(false)
    expect(hb[1].graph?.edges.some((edge) => edge.label === 'synchronizes-with')).toBe(true)

    const cas = javaApiScenes['cas-retry']
    expect(cas).toHaveLength(3)
    expect(cas[1].graph?.nodes.some((node) => node.lines.some((line) => line.includes('false')))).toBe(true)
    expect(cas[2].graph?.nodes.some((node) => node.lines.some((line) => line.includes('current = 2')))).toBe(true)

    const gc = javaApiScenes['gc-roots']
    expect(gc).toHaveLength(2)
    expect(gc[0].graph?.edges.some((edge) => edge.from === 'cache' && edge.to === 'a')).toBe(true)
    expect(gc[1].graph?.edges.some((edge) => edge.from === 'cache' && edge.to === 'a')).toBe(false)
    expect(gc[1].graph?.nodes.some((node) => node.id === 'a')).toBe(true)

    const selector = javaApiScenes.selector
    expect(selector).toHaveLength(6)
    expect(selector[2].lanes.some(([label, value]) => label === 'selected-key set' && value.includes('자동 제거되지 않음'))).toBe(true)
    expect(selector[4].lanes.some(([label, value]) => label === 'selected-key set' && value.includes('∅'))).toBe(true)
  })

  it('routes all four examples through Java-only dedicated renderers', () => {
    for (const example of ['happens-before', 'cas-retry', 'gc-roots', 'selector']) {
      const html = renderToStaticMarkup(<LearningVisualization source={source(example)} />)
      expect(html).toContain('java-visualization')
      expect(html).toContain('java-ed-semantic')
      expect(html).not.toContain('학습 도식을 표시할 수 없습니다.')
    }
  })
})
