import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { javaApiScenes } from '../../lib/java-api-models'
import { LearningVisualization } from './LearningVisualization'
import {
  JavaComparatorEditorial, JavaDequeEndsEditorial, JavaHashContractEditorial,
  JavaIteratorRemoveEditorial, JavaLambdaCaptureEditorial, JavaStreamShapesEditorial,
} from './JavaContractEditorial'

const source = (example: string) => JSON.stringify({
  version: 1, type: 'java-api-contract', example, title: 'Java 계약', description: '정적 설명',
})

describe('Java G3 compact language, collections and stream contracts', () => {
  it('distinguishes hash equality implication from collisions', () => {
    expect(javaApiScenes['hash-contract']).toHaveLength(1)
    const html = renderToStaticMarkup(<JavaHashContractEditorial />)
    expect(html).toContain('a.equals(b) == true')
    expect(html).toContain('a.equals(b) == false')
    expect(html).toContain('충돌')
  })
  it('shows comparator tie breaking and reversing the whole comparator', () => {
    const html = renderToStaticMarkup(<JavaComparatorEditorial />)
    expect(html).toContain('amount')
    expect(html).toContain('id')
    expect(html).toContain('reversed()')
    expect(html).toContain('금액 ↓')
  })
  it('separates the front and back ends of a deque', () => {
    const html = renderToStaticMarkup(<JavaDequeEndsEditorial />)
    for (const word of ['FIRST', 'LAST', 'FIFO', 'LIFO', 'offerLast', 'pollFirst', 'push', 'pop']) expect(html).toContain(word)
  })
  it('shows optional Iterator.remove and pre-next IllegalStateException', () => {
    const html = renderToStaticMarkup(<JavaIteratorRemoveEditorial />)
    expect(html).toContain('IllegalStateException')
    expect(html).toContain('UnsupportedOperationException')
    expect(html).toContain('best-effort')
  })
  it('distinguishes final local reference from the mutable ArrayList referent', () => {
    const html = renderToStaticMarkup(<JavaLambdaCaptureEditorial />)
    expect(html).toContain('effectively final')
    expect(html).toContain('ArrayList')
    expect(html).toContain('내용 변경 가능')
  })
  it('preserves filter/map/flatMap output shape without asserting fixed cardinalities', () => {
    const html = renderToStaticMarkup(<JavaStreamShapesEditorial />)
    for (const term of ['filter', 'map', 'flatMap', 'Stream&lt;Order&gt;', 'Stream&lt;Long&gt;', 'Stream&lt;Item&gt;']) expect(html).toContain(term)
  })
  it('routes all six compact examples without old diagram canvas', () => {
    for (const example of ['hash-contract', 'comparator', 'deque', 'iterator', 'lambda-capture', 'stream-shapes']) {
      const html = renderToStaticMarkup(<LearningVisualization source={source(example)} />)
      expect(html, example).toContain('java-ed-contract')
      expect(html, example).not.toContain('diagram-canvas')
      expect(html, example).not.toContain('도식 단계 이동')
    }
  })
})
