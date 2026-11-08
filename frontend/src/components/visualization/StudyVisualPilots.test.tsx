import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { JavaPassByValueStudyVisual } from './JavaPassByValueStudyVisual'
import { TcpSlidingWindowStudyVisual } from './TcpSlidingWindowStudyVisual'

describe('remaining educational visual pilot contracts', () => {
  it('distinguishes reference-value copying from parameter reassignment', () => {
    const html = renderToStaticMarkup(<JavaPassByValueStudyVisual />)
    expect(html).toContain('복사되는 것은 객체가 아니라 참조값입니다.')
    expect(html).toContain('메서드 진입 직후')
    expect(html).toContain('void replace(Member param)')
    expect(html).toContain('param = new Member(&quot;park&quot;)')
    expect(html).toContain('aria-label="호출부"')
    expect(html).toContain('aria-label="메서드 본문"')
    expect((html.match(/data-java-object="A" x="278" y="70"/g) || [])).toHaveLength(2)
    expect((html.match(/data-java-object="B" x="278" y="168"/g) || [])).toHaveLength(1)
    expect(html).toContain('name = &quot;kim&quot;')
    expect(html).toContain('name = &quot;park&quot;')
    expect(html).toContain('객체 A')
    expect(html).toContain('객체 B')
    expect(html).toContain('호출자 변수는 그대로입니다.')
    expect(html).toContain('물리적인 메모리 배치를 의미하지 않습니다.')
    expect((html.match(/role="img"/g) || [])).toHaveLength(2)
    expect(html).not.toContain('<button')
  })

  it('models TCP byte ranges and cumulative ACK 1200 without implicit losses', () => {
    const html = renderToStaticMarkup(<TcpSlidingWindowStudyVisual />)
    expect(html).toContain('data-window="1000-1399"')
    expect(html).toContain('data-window="1200-1599"')
    expect((html.match(/data-tcp-byte=/g) || [])).toHaveLength(12)
    expect((html.match(/data-tcp-state="확인됨"/g) || [])).toHaveLength(2)
    expect((html.match(/data-tcp-state="대기"/g) || [])).toHaveLength(2)
    expect((html.match(/data-tcp-state="전송 가능"/g) || [])).toHaveLength(2)
    expect(html).toContain('1000~1199 B는 누적 확인')
    expect(html).toContain('송신 윈도우는 1200~1599 B로 이동합니다.')
    expect(html).toContain('혼잡 윈도우(cwnd) ≥ 400 B')
    expect(html).not.toContain('<button')
  })
})
