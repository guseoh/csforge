import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { javaApiScenes } from '../../lib/java-api-models'
import { LearningVisualization } from './LearningVisualization'
import {
  JavaHeapPollutionEditorial,
  JavaLostUpdateEditorial,
  JavaReferenceStrengthEditorial,
  JavaSafePublicationEditorial,
} from './JavaStateEditorial'

const source = (example: string) => JSON.stringify({
  version: 1, type: 'java-api-contract', example,
  title: 'Java 학습 도식', description: '고정된 기술 의미를 나타냅니다.',
})

describe('Java G3 state diagrams', () => {
  it('keeps a single shared count cell across the complete lost update trace', () => {
    const scenes = javaApiScenes['lost-update']
    expect(scenes).toHaveLength(3)
    expect(scenes[0].graph?.nodes.find((node) => node.id === 'count')?.lines).toContain('0')
    expect(scenes[1].graph?.nodes.find((node) => node.id === 'count')?.lines).toContain('1')
    expect(scenes[2].graph?.nodes.find((node) => node.id === 'count')?.lines).toContain('최종 1')
    const html = renderToStaticMarkup(<JavaLostUpdateEditorial />)
    expect(html).toContain('공유 count = 0')
    expect(html).toContain('Thread A')
    expect(html).toContain('Thread B')
    expect(html).toContain('0 읽음')
    expect(html).toContain('1 / 3')
    expect(html).not.toContain('diagram-canvas')
  })

  it('separates constructor escape from normal post-construction publication', () => {
    const scenes = javaApiScenes['safe-publication']
    expect(scenes).toHaveLength(2)
    expect(scenes[0].graph?.nodes.some((node) => node.lines.some((line) => line.includes('this 외부 등록')))).toBe(true)
    expect(scenes[1].graph?.edges.some((edge) => edge.label === 'volatile handoff')).toBe(true)
    const html = renderToStaticMarkup(<JavaSafePublicationEditorial />)
    expect(html).toContain('생성 중 this 유출')
    expect(html).toContain('final 필드')
    expect(html).toContain('1 / 2')
    expect(html).not.toContain('정상 생성 → volatile 공개</strong>')
  })

  it('places the PhantomReference object, not the referent, in the queue relationship', () => {
    const html = renderToStaticMarkup(<JavaReferenceStrengthEditorial />)
    expect(javaApiScenes['reference-strength']).toHaveLength(1)
    expect(html).toContain('강한 참조')
    expect(html).toContain('SoftReference')
    expect(html).toContain('WeakReference')
    expect(html).toContain('PhantomReference 객체')
    expect(html).toContain('ReferenceQueue')
    expect(html).toContain('대상 객체 D가 큐에 담기는 것은 아닙니다')
    expect(html).not.toContain('java-ed-steps')
  })

  it('keeps array aliases distinct from generic component checks and the later cast', () => {
    const scenes = javaApiScenes['heap-pollution']
    expect(scenes).toHaveLength(4)
    expect(scenes[2].note).toContain('타입 인자')
    expect(scenes[3].note).toContain('실패 시점')
    const html = renderToStaticMarkup(<JavaHeapPollutionEditorial />)
    expect(html).toContain('List[]')
    expect(html).toContain('Object[]')
    expect(html).toContain('별칭 도입 전')
    expect(html).toContain('1 / 4')
    expect(html).toContain('@SafeVarargs')
  })

  it('routes the four examples only through the dedicated Java renderer', () => {
    for (const example of ['lost-update', 'safe-publication', 'reference-strength', 'heap-pollution']) {
      const html = renderToStaticMarkup(<LearningVisualization source={source(example)} />)
      expect(html, example).toContain('java-ed-state')
      expect(html, example).toContain('java-visualization')
      expect(html, example).not.toContain('diagram-canvas')
      expect(html, example).not.toContain('diagram-fallback')
    }
  })
})
