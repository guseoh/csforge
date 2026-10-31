import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { javaApiScenes } from '../../lib/java-api-models'
import { JavaBufferEditorial, JavaListLayoutEditorial, JavaPecsEditorial, JavaStreamLazinessEditorial } from './JavaCollectionEditorial'
import { LearningVisualization } from './LearningVisualization'

const source = (example: string) => JSON.stringify({ version: 1, type: 'java-api-contract', example, title: 'Java 학습 도식', description: '관계와 상태' })

describe('Java editorial collection, Buffer and Stream diagrams', () => {
  it('keeps PECS a static read-then-write boundary', () => {
    const html = renderToStaticMarkup(<JavaPecsEditorial />)
    expect(html).toContain('extends T')
    expect(html).toContain('super T')
    expect(html).toContain('읽기')
    expect(html).toContain('쓰기')
    expect(html).not.toContain('java-ed-steps')
  })

  it('separates array reference slots and doubly linked nodes', () => {
    const html = renderToStaticMarkup(<JavaListLayoutEditorial />)
    expect(html).toContain('java-ed-reference-slots')
    expect(html).toContain('java-ed-linked-nodes')
    expect(html).toContain('⇄')
    expect(html).toContain('ListIterator')
    expect(html).not.toContain('java-ed-steps')
  })

  it('keeps eight cells and never claims clear erases bytes', () => {
    const html = renderToStaticMarkup(<JavaBufferEditorial />)
    expect(javaApiScenes.buffer).toHaveLength(6)
    expect(javaApiScenes.buffer.every((scene) => scene.cells?.length === 8)).toBe(true)
    for (const scene of javaApiScenes.buffer) {
      expect(scene.position).toBeGreaterThanOrEqual(0)
      expect(scene.limit).toBeLessThanOrEqual(8)
      expect(scene.position).toBeLessThanOrEqual(scene.limit)
    }
    expect(javaApiScenes.buffer[2].position).toBe(0)
    expect(javaApiScenes.buffer[2].limit).toBe(5)
    expect(javaApiScenes.buffer[4].position).toBe(2)
    expect(javaApiScenes.buffer[4].limit).toBe(8)
    expect(javaApiScenes.buffer[5].position).toBe(0)
    expect(javaApiScenes.buffer[5].limit).toBe(8)
    expect(html).toContain('clear()')
    expect(html).toContain('지우지 않습니다')
    expect(html).toContain('java-ed-buffer-slots')
  })

  it('shows a sequential short circuit without implying evaluation of the last value', () => {
    const html = renderToStaticMarkup(<JavaStreamLazinessEditorial />)
    expect(javaApiScenes['stream-laziness']).toHaveLength(4)
    expect(html).toContain('104')
    expect(html).toContain('anyMatch')
    expect(html).toContain('peek')
    expect(html).toContain('1 / 4')
  })

  it('routes exactly four Java example keys to the editorial renderer', () => {
    for (const example of ['pecs', 'list-layout', 'buffer', 'stream-laziness']) {
      const html = renderToStaticMarkup(<LearningVisualization source={source(example)} />)
      expect(html).toContain('java-visualization')
      expect(html).toContain('java-ed-collection')
      expect(html).not.toContain('학습 도식을 표시할 수 없습니다')
    }
  })
})
