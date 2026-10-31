import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { javaApiScenes } from '../../lib/java-api-models'
import { LearningVisualization } from './LearningVisualization'
import { JavaJitProfileEditorial, JavaLoaderIdentityEditorial, JavaRuntimeAreasEditorial, JavaRetainedPathEditorial } from './JavaRuntimeStructureEditorial'

const source = (example: string) => JSON.stringify({
  version: 1, type: 'java-api-contract', example,
  title: 'Java 런타임 도식', description: '추상 개념의 구조와 경계를 확인합니다.',
})

describe('Java G3 runtime structure diagrams', () => {
  it('separates two thread-local stacks from the shared heap and method area', () => {
    const scene = javaApiScenes['runtime-areas'][0]
    expect(scene.graph?.nodes).toHaveLength(4)
    expect(scene.graph?.edges.filter((edge) => edge.to === 'heap')).toHaveLength(2)
    const html = renderToStaticMarkup(<JavaRuntimeAreasEditorial />)
    for (const label of ['Thread A', 'Thread B', '지역 변수 배열', '피연산자 스택', '공유 heap', 'method area', 'Metaspace']) {
      expect(html).toContain(label)
    }
    expect(html).not.toContain('도식 단계 이동')
    expect(html).not.toContain('diagram-canvas')
  })

  it('treats deoptimization as a conditional HotSpot implementation path', () => {
    const scene = javaApiScenes['jit-profile'][0]
    expect(scene.graph?.edges.some((edge) => edge.to === 'deopt')).toBe(true)
    const html = renderToStaticMarkup(<JavaJitProfileEditorial />)
    expect(html).toContain('실행 프로파일')
    expect(html).toContain('가정이 여전히 유효')
    expect(html).toContain('조건부 경로')
    expect(html).toContain('최적화 해제')
    expect(html).toContain('항상 최적화가 발생한다는 보장은 없으며')
    expect(html).not.toContain('도식 단계 이동')
  })

  it('highlights identical binary names but different defining loaders', () => {
    const scene = javaApiScenes['loader-identity'][0]
    expect(scene.graph?.nodes.filter((node) => node.id === 'l1' || node.id === 'l2')).toHaveLength(2)
    const html = renderToStaticMarkup(<JavaLoaderIdentityEditorial />)
    expect(html).toContain('공유 PluginApi')
    expect(html).toContain('impl.Plugin')
    expect(html).toContain('defining loader L1')
    expect(html).toContain('defining loader L2')
    expect(html).toContain('binary name + defining loader')
    expect(html).toContain('initiating loader')
  })

  it('keeps Session and Payload present after owner unlink without claiming immediate collection', () => {
    const scenes = javaApiScenes['retained-path']
    expect(scenes).toHaveLength(2)
    expect(scenes[0].graph?.edges.some((edge) => edge.from === 'owner' && edge.to === 'session')).toBe(true)
    expect(scenes[1].graph?.edges.some((edge) => edge.from === 'owner' && edge.to === 'session')).toBe(false)
    expect(scenes[1].graph?.edges.some((edge) => edge.from === 'session' && edge.to === 'payload')).toBe(true)
    const html = renderToStaticMarkup(<JavaRetainedPathEditorial />)
    expect(html).toContain('장수 owner')
    expect(html).toContain('종료된 Session')
    expect(html).toContain('Payload byte[]')
    expect(html).toContain('강한 참조 유지')
    expect(html).toContain('1 / 2')
    expect(html).toContain('즉시 제거하지')
    const routed = renderToStaticMarkup(<LearningVisualization source={source('retained-path')} />)
    expect(routed).toContain('java-ed-retained')
    expect(routed).not.toContain('diagram-canvas')
  })

  it('routes the three runtime example keys to static Java editorial diagrams', () => {
    for (const example of ['runtime-areas', 'jit-profile', 'loader-identity']) {
      const html = renderToStaticMarkup(<LearningVisualization source={source(example)} />)
      expect(html, example).toContain('java-ed-runtime')
      expect(html, example).toContain('java-visualization')
      expect(html, example).not.toContain('diagram-canvas')
      expect(html, example).not.toContain('도식 단계 이동')
      expect(html, example).not.toContain('diagram-fallback')
    }
  })
})
