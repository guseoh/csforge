import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { JavaHashLookupDiagram, JavaPassByValueEditorial } from './JavaEditorialDiagrams'
import { LearningVisualization } from './LearningVisualization'

const passByValue = {
  version: 1 as const,
  type: 'java-pass-by-value' as const,
  title: '참조 값 복사와 매개변수 재대입',
  description: '객체와 참조 값을 구분합니다.',
  initialName: 'kim',
  replacementName: 'park',
}

describe('Java editorial diagrams', () => {
  it('uses static candidates instead of interactive controls for HashMap lookup', () => {
    const html = renderToStaticMarkup(<JavaHashLookupDiagram />)
    expect(html).toContain('values.get(&quot;BB&quot;)')
    expect(html).toContain('2112')
    expect(html).toContain('동등한 키')
    expect(html).toContain('반환 값')
    expect(html).not.toContain('<button')
  })

  it('scopes editorial styling to Java and does not change Network diagrams', () => {
    const java = renderToStaticMarkup(<LearningVisualization source={JSON.stringify({
      version: 1, type: 'java-api-contract', example: 'hash-lookup',
      title: '충돌 후보에서 값 찾기', description: '정확히 동등한 키를 조회합니다.',
    })} />)
    const network = renderToStaticMarkup(<LearningVisualization source={JSON.stringify({
      version: 1, type: 'tcp-handshake', title: '연결 수립', description: 'SYN, SYN-ACK, ACK',
      clientIsn: 100, serverIsn: 200,
    })} />)
    expect(java).toContain('java-visualization')
    expect(network).not.toContain('java-visualization')
    expect(network).toContain('learning-visualization')
  })

  it('begins pass-by-value with member referencing A and no parameter', () => {
    const html = renderToStaticMarkup(<JavaPassByValueEditorial data={passByValue} />)
    expect(html).toContain('member')
    expect(html).toContain('객체 A')
    expect(html).toContain('호출 전')
    expect(html).toContain('01 / 05')
    expect(html).toContain('name = &quot;kim&quot;')
    expect(html).toContain('초기화')
    expect(html).toContain('java-ed-pass-statement')
    expect(html).toContain('java-ed-pass-diagram')
    expect(html).toContain('java-ed-pass-link')
    expect(html).toContain('현재 실행')
    expect(html).toContain('replace(member); // 호출 직전')
    expect(html).not.toContain('class="diagram-code"')
    expect(html).not.toContain('java-editorial-pass-arrows')
  })
})
