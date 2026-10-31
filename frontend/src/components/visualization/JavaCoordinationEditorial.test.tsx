import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { javaApiScenes } from '../../lib/java-api-models'
import { LearningVisualization } from './LearningVisualization'
import { JavaBoundedQueueEditorial, JavaConditionAwaitEditorial, JavaThreadLifecycleEditorial, JavaSuppressedExceptionsEditorial } from './JavaCoordinationEditorial'

const source = (example: string) => JSON.stringify({
  version: 1, type: 'java-api-contract', example, title: 'Java 단계 도식', description: '실행 상태 변화',
})

describe('Java G3 concurrency and resource coordination', () => {
  it('keeps Condition owner separate from signal and reacquisition', () => {
    const scenes = javaApiScenes['condition-await']
    expect(scenes).toHaveLength(3)
    expect(scenes[1].note).toContain('signal 자체가 lock을 넘기거나')
    expect(scenes[2].note).toContain('재획득')
    const html = renderToStaticMarkup(<JavaConditionAwaitEditorial />)
    expect(html).toContain('consumer')
    expect(html).toContain('while (queue.isEmpty())')
    expect(html).toContain('1 / 3')
    expect(html).toContain('spurious wakeup')
  })

  it('keeps queue capacity and take separate from task completion', () => {
    expect(javaApiScenes['bounded-queue']).toHaveLength(3)
    const html = renderToStaticMarkup(<JavaBoundedQueueEditorial />)
    expect(html).toContain('capacity = 1')
    expect(html).toContain('take() 대기')
    expect(html).toContain('처리 성공')
    expect(html).toContain('1 / 3')
  })

  it('separates Thread start, interruption, join and termination guarantees', () => {
    const scenes = javaApiScenes['thread-lifecycle']
    expect(scenes).toHaveLength(3)
    expect(scenes[2].graph?.edges.some((edge) => edge.label.includes('HB'))).toBe(true)
    const html = renderToStaticMarkup(<JavaThreadLifecycleEditorial />)
    expect(html).toContain('NEW')
    expect(html).toContain('Thread.State')
    expect(html).toContain('timed join')
    expect(html).toContain('1 / 3')
  })

  it('retains body exception as primary and orders suppressed failures by reverse close', () => {
    const scenes = javaApiScenes['resource-suppressed']
    expect(scenes).toHaveLength(4)
    expect(scenes[2].graph?.nodes.some((node) => node.id === 'secondFailure')).toBe(true)
    expect(scenes[3].graph?.nodes.some((node) => node.id === 'firstFailure')).toBe(true)
    const html = renderToStaticMarkup(<JavaSuppressedExceptionsEditorial />)
    expect(html).toContain('first')
    expect(html).toContain('second.close()')
    expect(html).toContain('getSuppressed()')
    expect(html).toContain('1 / 4')
  })

  it('routes four examples to the same scene count while removing generic SVG', () => {
    for (const example of ['condition-await', 'bounded-queue', 'thread-lifecycle', 'resource-suppressed']) {
      const html = renderToStaticMarkup(<LearningVisualization source={source(example)} />)
      expect(html, example).toContain('java-ed-coordination')
      expect(html, example).toContain('java-visualization')
      expect(html, example).not.toContain('diagram-canvas')
    }
  })
})
