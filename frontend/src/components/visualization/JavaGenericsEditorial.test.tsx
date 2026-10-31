import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { javaApiScenes } from '../../lib/java-api-models'
import { LearningVisualization } from './LearningVisualization'
import { JavaInvarianceEditorial } from './JavaGenericsEditorial'

const source = JSON.stringify({
  version: 1, type: 'java-api-contract', example: 'invariance',
  title: '제네릭 불공변성과 잘못된 쓰기 방지', description: '대입이 컴파일에서 막히는 이유',
})

describe('Java G3 invariance diagram', () => {
  it('separates the actual compiler rejection from the impossible counterfactual write', () => {
    const scene = javaApiScenes.invariance[0]
    expect(scene.lanes[0][1]).toContain('대입 거부')
    const html = renderToStaticMarkup(<JavaInvarianceEditorial />)
    expect(html).toContain('List&lt;String&gt;')
    expect(html).toContain('List&lt;Object&gt;')
    expect(html).toContain('컴파일 오류')
    expect(html).toContain('반사실적 가정')
    expect(html).toContain('values.add(10)')
    expect(html).not.toContain('도식 단계 이동')
  })

  it('uses a static Java-only renderer without treating the hypothesis as an actual state transition', () => {
    const html = renderToStaticMarkup(<LearningVisualization source={source} />)
    expect(html).toContain('java-ed-generics')
    expect(html).toContain('java-visualization')
    expect(html).not.toContain('diagram-canvas')
    expect(html).not.toContain('diagram-fallback')
  })
})
