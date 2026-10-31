import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { javaApiScenes } from '../../lib/java-api-models'
import { JavaBytecodeStackEditorial, JavaClassInitializationEditorial, JavaProcessMemoryEditorial, JavaVirtualCarrierEditorial } from './JavaRuntimeEditorial'
import { LearningVisualization } from './LearningVisualization'

const source = (example: string) => JSON.stringify({
  version: 1, type: 'java-api-contract', example,
  title: 'Java 런타임 도식', description: '기술 계약의 학습 장면',
})

describe('Java editorial runtime diagrams', () => {
  it('reads the bytecode frame as five abstract snapshots with a separate operand stack', () => {
    const scenes = javaApiScenes['bytecode-stack']
    expect(scenes).toHaveLength(5)
    expect(scenes[0].title).toContain('add(3, 4)')
    expect(scenes[1].title).toContain('iload_1')
    expect(scenes[2].title).toContain('iload_2')
    expect(scenes[3].title).toContain('iadd')
    expect(scenes[4].title).toContain('ireturn')
    const html = renderToStaticMarkup(<JavaBytecodeStackEditorial />)
    expect(html).toContain('java-ed-bytecode')
    expect(html).toContain('지역 변수 배열')
    expect(html).toContain('피연산자 스택')
    expect(html).toContain('slot 0')
    expect(html).toContain('slot 2')
    expect(html).toContain('비어 있음')
    expect(html).toContain('1 / 5')
    expect(html).toContain('도식 단계 이동')
  })

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
    for (const example of ['bytecode-stack', 'class-initialization', 'process-memory', 'virtual-carrier']) {
      const html = renderToStaticMarkup(<LearningVisualization source={source(example)} />)
      expect(html).toContain('java-visualization')
      expect(html).toContain('java-ed-runtime')
      expect(html).not.toContain('학습 도식을 표시할 수 없습니다.')
    }
  })
})
