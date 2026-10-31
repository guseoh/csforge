import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { javaApiScenes } from '../../lib/java-api-models'
import { LearningVisualization } from './LearningVisualization'
import { JavaExecutorAdmissionEditorial, JavaThreadLocalReuseEditorial, JavaFailureAtomicityEditorial, JavaZoneDstEditorial } from './JavaAdvancedReviewEditorial'

const source = (example: string) => JSON.stringify({ version: 1, type: 'java-api-contract', example, title: 'Java 구조', description: '상태 비교' })

describe('Java advanced G3 models and editorial branch rendering', () => {
  it('keeps Executor queue/maximum/rejection conditional', () => {
    expect(javaApiScenes['executor-admission']).toHaveLength(4)
    const html = renderToStaticMarkup(<JavaExecutorAdmissionEditorial />)
    expect(html).toContain('worker &lt; core')
    expect(html).toContain('조건부 선택지')
    expect(html).toContain('1 / 4')
  })
  it('keeps thread-local cleanup a separate path on the same worker', () => {
    expect(javaApiScenes['threadlocal-reuse'][2].note).toContain('다른 경로')
    const html = renderToStaticMarkup(<JavaThreadLocalReuseEditorial />)
    expect(html).toContain('worker W')
    expect(html).toContain('context A')
    expect(html).toContain('자동 복구가 아닙니다')
  })
  it('separates failed transfer from independently validated immutable replacement', () => {
    expect(javaApiScenes['failure-atomicity']).toHaveLength(5)
    expect(javaApiScenes['failure-atomicity'][4].note).toContain('다른 경로')
    const html = renderToStaticMarkup(<JavaFailureAtomicityEditorial />)
    expect(html).toContain('source = 100')
    expect(html).toContain('자동으로 롤백하지 않습니다')
    expect(html).toContain('1 / 5')
  })
  it('keeps Paris gap and overlap as two dates and distinct offsets', () => {
    expect(javaApiScenes['zone-dst']).toHaveLength(4)
    expect(javaApiScenes['zone-dst'][2].graph?.nodes[2].lines).toContain('Instant 01:30Z')
    const html = renderToStaticMarkup(<JavaZoneDstEditorial />)
    expect(html).toContain('2026-03-29 02:30')
    expect(html).toContain('유효 offset')
    expect(html).toContain('1 / 4')
  })
  it('routes all four dedicated examples without the generic canvas', () => {
    for (const example of ['executor-admission','threadlocal-reuse','failure-atomicity','zone-dst']) {
      const html = renderToStaticMarkup(<LearningVisualization source={source(example)} />)
      expect(html, example).toContain('java-ed-advanced-rows')
      expect(html, example).toContain('도식 단계 이동')
      expect(html, example).not.toContain('diagram-canvas')
    }
  })
})
