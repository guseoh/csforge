import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { javaApiScenes } from '../../lib/java-api-models'
import { LearningVisualization } from './LearningVisualization'
import {
  JavaParallelCostsEditorial, JavaClassfileBoundaryEditorial, JavaCollectorIntervalsEditorial,
  JavaInstantZonesEditorial, JavaDurationPeriodEditorial, JavaExceptionCauseEditorial,
} from './JavaBoundaryEditorial'

const source = (example: string) => JSON.stringify({
  version: 1, type: 'java-api-contract', example, title: 'Java 경계', description: '정적 설명',
})

describe('Java G3 stream runtime, temporal and exception boundaries', () => {
  it('classifies parallel work into split, independent compute and combine cost', () => {
    const html = renderToStaticMarkup(<JavaParallelCostsEditorial />)
    for (const term of ['분할', '독립 계산', '결합', '실제 스케줄러']) expect(html).toContain(term)
  })
  it('separates javac classfile from implementation-dependent JVM execution', () => {
    const html = renderToStaticMarkup(<JavaClassfileBoundaryEditorial />)
    for (const term of ['javac', '.class', '바이트코드', 'OS', 'JIT']) expect(html).toContain(term)
  })
  it('never claims concurrent GC eliminates all stop-the-world pauses', () => {
    const html = renderToStaticMarkup(<JavaCollectorIntervalsEditorial />)
    for (const term of ['STW pause', '동시 GC 작업', 'pause는 존재', '실측값']) expect(html).toContain(term)
  })
  it('uses the two 2026-08-31 local representations of the same Instant', () => {
    const html = renderToStaticMarkup(<JavaInstantZonesEditorial />)
    expect(html).toContain('2026-08-31T05:00:00Z')
    expect(html).toContain('2026-08-31 14:00')
    expect(html).toContain('2026-08-31 01:00')
    expect(html).toContain('UTC-04:00')
  })
  it('separates 24 elapsed hours from one calendar day over Paris DST', () => {
    const html = renderToStaticMarkup(<JavaDurationPeriodEditorial />)
    expect(html).toContain('2026-03-28 09:00+01:00')
    expect(html).toContain('03-29 10:00+02:00')
    expect(html).toContain('03-29 09:00+02:00')
    expect(html).toContain('경과 23시간')
  })
  it('shows a Throwable cause relationship, not call-flow ordering', () => {
    expect(javaApiScenes['exception-cause'][0].graph?.edges[0].label).toBe('cause')
    const html = renderToStaticMarkup(<JavaExceptionCauseEditorial />)
    expect(html).toContain('ImportException')
    expect(html).toContain('IOException')
    expect(html).toContain('getCause()')
    expect(html).toContain('호출 순서')
  })
  it('routes all six specialized semantic boundaries without generic SVG canvas', () => {
    for (const example of ['parallel-costs', 'jdk-classfile', 'collector-tradeoffs', 'instant-zones', 'duration-period', 'exception-cause']) {
      const html = renderToStaticMarkup(<LearningVisualization source={source(example)} />)
      expect(html, example).toContain('java-ed-contract')
      expect(html, example).not.toContain('diagram-canvas')
      expect(html, example).not.toContain('도식 단계 이동')
    }
  })
})
