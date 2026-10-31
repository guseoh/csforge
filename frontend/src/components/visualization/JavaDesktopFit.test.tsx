import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LearningVisualization } from './LearningVisualization'
import { valueReferenceFrames } from '../../lib/language-type-models'

const source = (type: string, example: string) => JSON.stringify({
  version: 1, type, example, title: 'Java contract', description: 'desktop Reader diagram',
})

describe('Java desktop-only SVG fit and compact value states (#292)', () => {
  it('makes the initial primitive value scene compact and removes the unused object heading', () => {
    const frame = valueReferenceFrames('assignment-copy')[0]
    expect(frame.variables).toHaveLength(1)
    expect(frame.objects).toHaveLength(0)
    const html = renderToStaticMarkup(<LearningVisualization source={source('java-value-reference', 'assignment-copy')} />)
    expect(html).toContain('java-desktop-fit')
    expect(html).toContain('viewBox="0 0 680 192"')
    expect(html).toContain('원시 값 · 변수별 독립된 값')
    expect(html).not.toContain('객체 · 논리적 식별자 A/B')
    expect(html).toContain('도식 단계 조작')
  })

  it('does not remove object targets or aliases in the other value/reference examples', () => {
    const finalHtml = renderToStaticMarkup(<LearningVisualization source={source('java-value-reference', 'final-list')} />)
    const poolHtml = renderToStaticMarkup(<LearningVisualization source={source('java-value-reference', 'string-intern')} />)
    expect(finalHtml).toContain('java-ed-value-contract')
    expect(finalHtml).not.toContain('diagram-canvas')
    expect(finalHtml).toContain('재대입 금지')
    expect(poolHtml).toContain('java-ed-value-contract')
    expect(poolHtml).not.toContain('diagram-canvas')
    expect(poolHtml).toContain('대표 String 객체 A')
    expect(poolHtml).toContain('String pooled')
    expect(poolHtml).toContain('String created')
  })

  it('scopes desktop fit to Java object-model, not unrelated network diagrams', () => {
    const object = renderToStaticMarkup(<LearningVisualization source={source('java-object-model', 'static-members')} />)
    const network = renderToStaticMarkup(<LearningVisualization source={JSON.stringify({
      version: 1, type: 'tcp-handshake', title: 'TCP', description: 'connection',
      clientIsn: 10, serverIsn: 30,
    })} />)
    expect(object).toContain('java-desktop-fit')
    expect(object).toContain('Member 클래스')
    expect(object).toContain('Member a')
    expect(object).toContain('Member b')
    expect(network).not.toContain('java-desktop-fit')
  })
})
