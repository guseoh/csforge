import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TcpHandshakeDiagram } from './TcpHandshakeEditorial'
import { LearningVisualization } from './LearningVisualization'
import { tcpHandshakeFrames } from '../../lib/visualization-models'
import type { VisualizationOf } from '../../lib/learning-visualization'

const data: VisualizationOf<'tcp-handshake'> = {
  version: 1, type: 'tcp-handshake',
  title: 'TCP 연결 수립', description: '상태·시퀀스 번호',
  clientIsn: 100, serverIsn: 300,
}

describe('N-01 TCP textbook handshake', () => {
  it('is integrated through the existing canonical tcp-handshake contract', () => {
    const html = renderToStaticMarkup(<LearningVisualization source={JSON.stringify(data)} />)
    expect(html).toContain('learning-visualization')
    expect(html).toContain('data-network-pilot="n01-tcp-handshake"')
    expect(html).toContain('data-tcp-step="0"')
    expect(html).toContain('도식 단계 조작')
    expect(html).toContain('가로 스크롤 가능')
    expect(html).not.toContain('java-desktop-fit')
    expect(html).not.toContain('csforge-viz')
  })

  it('renders fixed endpoint identity and five-step protocol context', () => {
    const html = renderToStaticMarkup(<TcpHandshakeDiagram data={data} />)
    expect(html).toContain('data-tcp-party="client"')
    expect(html).toContain('data-tcp-party="server"')
    expect(html).toContain('CLOSED')
    expect(html).toContain('LISTEN')
    expect(html).toContain('1 / 5')
    expect((html.match(/data-tcp-message=/g) ?? [])).toHaveLength(3)
    expect((html.match(/data-tcp-phase="future"/g) ?? [])).toHaveLength(3)
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('데이터 없는 마지막 ACK는 소비하지 않습니다.')
    expect(html).toContain('TLS/HTTP')
  })

  it('preserves in-flight and received transitions independently of rendering', () => {
    const frames = tcpHandshakeFrames(data)
    expect(frames).toHaveLength(5)
    expect(frames.map(f => [f.sent, f.active])).toEqual([
      [0, -1], [1, 0], [2, 1], [3, 2], [3, -1],
    ])
    expect(frames.map(f => f.server)).toEqual([
      'LISTEN','LISTEN','SYN-RECEIVED','SYN-RECEIVED','ESTABLISHED',
    ])
    expect(frames[2].messages[1].text).toContain('ack=101')
    expect(frames[3].messages[2].text).toBe('ACK · seq=101 · ack=301')
  })
})
