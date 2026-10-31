import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LearningVisualization } from './LearningVisualization'
import { arrayStoreFrames } from '../../lib/language-type-models'

const direct = (type: 'java-definite-assignment' | 'java-array-store') =>
  JSON.stringify({version:1,type,title:'Java learning',description:'언어 계약'})
function canonical(path: string) {
  const markdown = readFileSync(new URL('../../../../content/java/' + path, import.meta.url), 'utf8')
  const fence = String.fromCharCode(96).repeat(3)
  const start = markdown.indexOf(fence + 'csforge-viz\n')
  if (start < 0) throw new Error('Missing canonical diagram: ' + path)
  const bodyStart = start + fence.length + 'csforge-viz\n'.length
  const end = markdown.indexOf(fence, bodyStart)
  return markdown.slice(bodyStart, end).trim()
}

describe('Java G3 classic flow replacements (#292)', () => {
  it('shows two distinct assignment branches and one compiler-time join without SVG', () => {
    const html = renderToStaticMarkup(<LearningVisualization source={direct('java-definite-assignment')} />)
    for (const x of ['java-ed-definite','result = 1;', 'result = 0;', '확정 할당 성립', 'System.out.println(result);'])expect(html).toContain(x)
    expect(html).toContain('두 분기를 모두 실행한다는 뜻이 아닙니다')
    expect(html).not.toContain('diagram-canvas')
    expect(html).not.toContain('도식 단계 이동')
  })
  it('keeps the actual array object and all five state snapshots without rollback', () => {
    const frames = arrayStoreFrames()
    expect(frames).toHaveLength(5)
    for (const f of frames.slice(2))expect(f.elements).toEqual(['kim',null])
    const html = renderToStaticMarkup(<LearningVisualization source={direct('java-array-store')} />)
    for(const x of ['java-ed-array','String[] names','String[2]','도식 단계 이동','1 / 5','실패한 저장은 앞서 성공한 저장을 되돌리지'])expect(html).toContain(x)
    expect(html).not.toContain('diagram-canvas')
  })
  it.each([
    ['language-types/stringbuilder-mutable-text.md', 'builder.append(...)', 'toString()의 결과는 builder의 실시간 뷰'],
    ['io-nio/byte-character-stream-charset.md', 'InputStreamReader · Charset', 'UTF-16 코드 단위'],
    ['io-nio/buffered-io.md', 'flush()', '디스크 영구 저장'],
  ])('renders the canonical %s as a static editorial relation', (path,code,caveat) => {
    const html=renderToStaticMarkup(<LearningVisualization source={canonical(path)} />)
    expect(html,path).toContain('java-ed-static-flow')
    expect(html,path).toContain(code)
    expect(html,path).toContain(caveat)
    expect(html,path).not.toContain('diagram-canvas')
    expect(html,path).not.toContain('도식 단계 이동')
  })
  it('retains the shared generic fallback for unrelated static-flow JSON', () => {
    const html=renderToStaticMarkup(<LearningVisualization source={JSON.stringify({
      version:1,type:'static-flow',title:'Other',description:'generic',labels:['Alpha','Beta'],
    })}/>)
    expect(html).toContain('diagram-canvas')
    expect(html).not.toContain('java-ed-static-flow')
  })
})
