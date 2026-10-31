import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { javaApiScenes } from '../../lib/java-api-models'
import { LearningVisualization } from './LearningVisualization'
import { JavaConcurrencyParallelismEditorial, JavaMonitorOwnershipEditorial } from './JavaConcurrencyContrastEditorial'

const source = (example: string) => JSON.stringify({
  version: 1, type: 'java-api-contract', example, title: 'Java 동시성', description: '학습 도식',
})

describe('Java G3 concurrency contrast and monitor semantics', () => {
  it('keeps a single-resource interleaving distinct from multi-resource overlap', () => {
    const scene=javaApiScenes['concurrency-parallelism'][0]
    expect(scene.graph?.nodes).toHaveLength(5)
    const html=renderToStaticMarkup(<JavaConcurrencyParallelismEditorial />)
    expect(html).toContain('한 실행 자원')
    expect(html).toContain('별도 두 실행 자원')
    expect(html).toContain('스레드 스케줄')
    expect(html).not.toContain('도식 단계 이동')
  })

  it('keeps monitor identity, reentry and unlock-lock HB separate across three scenes', () => {
    const scenes=javaApiScenes.monitor
    expect(scenes).toHaveLength(3)
    expect(scenes[1].note).toContain('마지막 소유 수준')
    expect(scenes[2].note).toContain('공정성 보장은 없으며')
    const html=renderToStaticMarkup(<JavaMonitorOwnershipEditorial />)
    expect(html).toContain('monitor M')
    expect(html).toContain('owner: A')
    expect(html).toContain('Thread B')
    expect(html).toContain('1 / 3')
    expect(html).toContain('자동 롤백')
  })

  it('routes the static comparison and step-based monitor with the original controls contract', () => {
    const comparison=renderToStaticMarkup(<LearningVisualization source={source('concurrency-parallelism')} />)
    expect(comparison).toContain('java-ed-concurrency-contrast')
    expect(comparison).not.toContain('diagram-canvas')
    expect(comparison).not.toContain('도식 단계 이동')

    const monitor=renderToStaticMarkup(<LearningVisualization source={source('monitor')} />)
    expect(monitor).toContain('java-ed-monitor')
    expect(monitor).toContain('도식 단계 이동')
    expect(monitor).not.toContain('diagram-canvas')
    expect(monitor).not.toContain('diagram-fallback')
  })
})
