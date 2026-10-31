import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { javaApiScenes } from '../../lib/java-api-models'
import { LearningVisualization } from './LearningVisualization'
import { JavaMapViewsEditorial, JavaViewCopyEditorial } from './JavaCollectionStructureEditorial'

const source = (example: string) => JSON.stringify({
  version: 1, type: 'java-api-contract', example,
  title: 'Java 컬렉션 도식', description: '하나의 컬렉션과 뷰의 관계를 확인합니다.',
})

describe('Java G3 collection structure diagrams', () => {
  it('contrasts a backed unmodifiable view with an earlier copyOf snapshot', () => {
    expect(javaApiScenes['view-copy']).toHaveLength(1)
    const html = renderToStaticMarkup(<JavaViewCopyEditorial />)
    expect(html).toContain('source.add(N)')
    expect(html).toContain('source = [M, N]')
    expect(html).toContain('unmodifiableList(source)')
    expect(html).toContain('List.copyOf(source)')
    expect(html).toContain('원본 구조 변경과 분리')
    expect(html).toContain('깊게 복사하지 않습니다')
    expect(html).not.toContain('도식 단계 이동')
  })

  it('shows three views on the same backing Map and write-through removal', () => {
    expect(javaApiScenes['map-views']).toHaveLength(1)
    const html = renderToStaticMarkup(<JavaMapViewsEditorial />)
    for (const view of ['keySet()', 'values()', 'entrySet()']) expect(html).toContain(view)
    expect(html).toContain('keys.remove(&quot;A&quot;)')
    expect(html).toContain('기반 Map')
    expect(html).toContain('B ↦ 2')
    expect(html).toContain('제거 전')
    expect(html).toContain('제거 후')
    expect(html).toContain('A=1, B=2')
    expect(html).toContain('B=2')
    expect(html).not.toContain('Map의 반복 순서를 고정합니다')
    expect(html).toContain('스냅샷이 아닙니다')
    expect(html).not.toContain('도식 단계 이동')
  })

  it('routes exactly two existing collection examples without changing canonical data', () => {
    for (const example of ['view-copy', 'map-views']) {
      const html = renderToStaticMarkup(<LearningVisualization source={source(example)} />)
      expect(html, example).toContain('java-ed-collection')
      expect(html, example).toContain('java-visualization')
      expect(html, example).not.toContain('diagram-canvas')
      expect(html, example).not.toContain('diagram-fallback')
    }
  })
})
