import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { javaApiScenes } from '../../lib/java-api-models'
import { JavaClassInitializationEditorial, JavaProcessMemoryEditorial, JavaVirtualCarrierEditorial } from './JavaRuntimeEditorial'
import { LearningVisualization } from './LearningVisualization'

const source = (example: string) => JSON.stringify({
  version: 1, type: 'java-api-contract', example,
  title: 'Java 런타임 도식', description: '기술 계약의 학습 장면',
})

describe('Java editorial runtime diagrams', () => {
  it('preserves class loading, preparation and initialization without declaring resolution an always-later phase', () => {
    const html = renderToStaticMarkup(<JavaClassInitializationEditorial />)
    expect(html).toContain('로딩')
    expect(html).toContain('검증·준비')
    expect(html).toContain('초기화')
    expect(html).toContain('정상 경로')
    expect(html).toContain('해석 전체가 초기화 전에 완료')
    expect(html).toContain('1 / 5')
    expect(javaApiScenes['class-initialization']).toHaveLength(5)
  })

  it('separates memory consumers from RSS/NMT measurement', () => {
    const html = renderToStaticMarkup(<JavaProcessMemoryEditorial />)
    for (const term of ['Java heap', 'Metaspace', '스레드 스택', 'direct / native', 'code cache', 'RSS · NMT']) {
      expect(html).toContain(term)
    }
    expect(html).toContain('측정 및 한도')
    expect(html).not.toContain('java-ed-steps')
  })

  it('preserves virtual carrier mount and remount states as exclusive snapshots', () => {
    const scenes = javaApiScenes['virtual-carrier']
    expect(scenes).toHaveLength(3)
    for (const scene of scenes) {
      const mountEdges = scene.graph?.edges.filter((edge) => edge.label === 'mount' || edge.label === 'remount') ?? []
      expect(mountEdges).toHaveLength(1)
      expect(['vtA', 'vtB']).toContain(mountEdges[0].from)
    }
    const html = renderToStaticMarkup(<JavaVirtualCarrierEditorial />)
    expect(html).toContain('가상 스레드 A')
    expect(html).toContain('가상 스레드 B')
    expect(html).toContain('현재 mount')
    expect(html).toContain('1 / 3')
  })

  it('routes only three named Java examples to these renderer variants', () => {
    for (const example of ['class-initialization', 'process-memory', 'virtual-carrier']) {
      const html = renderToStaticMarkup(<LearningVisualization source={source(example)} />)
      expect(html).toContain('java-visualization')
      expect(html).toContain('java-ed-runtime')
      expect(html).not.toContain('학습 도식을 표시할 수 없습니다.')
    }
  })
})
