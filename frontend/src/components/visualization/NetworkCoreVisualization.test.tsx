import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LearningVisualization } from './LearningVisualization'
import { tcpTeardownFrames, networkCoreExamples } from '../../lib/network-core-model'
import { parseVisualization } from '../../lib/learning-visualization'
import { TcpSlidingWindowStudyVisual } from './TcpSlidingWindowStudyVisual'

const payload = (example: string) => JSON.stringify({
  version: 1, title: '네트워크 시각화', description: '학습 목적에 따른 고정 예제입니다.',
  type: 'network-core', example,
})

describe('Network Pilot Pack - four new allowlisted types and existing handshake', () => {
  it.each(networkCoreExamples)('parses and renders %s through Reader', example => {
    expect(parseVisualization(payload(example))).not.toBeNull()
    const html = renderToStaticMarkup(<LearningVisualization source={payload(example)} />)
    expect(html).toContain('class="learning-visualization"')
    if (example !== 'tcp-sliding-window') expect(html).toContain('data-network-core="' + example + '"')
    expect(html).toContain('role="img"')
    expect(html).not.toContain('<script')
  })

  it('rejects unknown examples and arbitrary HTML/SVG input', () => {
    expect(parseVisualization(payload('javascript:alert(1)'))).toBeNull()
    expect(parseVisualization(JSON.stringify({
      version: 1, title: '도식', description: '설명', type: 'network-core',
      example: 'dns-iterative', svg: '<svg onload="alert(1)">',
    }))).toBeNull()
  })

  it('keeps one HTTP/1.1 request distinct from TCP segments', () => {
    const html = renderToStaticMarkup(<LearningVisualization source={payload('http-over-tcp')} />)
    expect(html).toContain('HTTP 요청 1개 ≠ TCP 세그먼트 1개')
    expect(html).toContain('GET /health HTTP/1.1')
    expect(html).toContain('HTTP/1.1 200 OK')
    expect(html).toContain('TLS·프록시 없는 HTTP/1.1')
  })

  it('distinguishes DNS referrals, cache hit and authoritative records', () => {
    const html = renderToStaticMarkup(<LearningVisualization source={payload('dns-iterative')} />)
    expect((html.match(/data-dns-hop=/g) || [])).toHaveLength(3)
    expect(html).toContain('.com 위임 정보')
    expect(html).toContain('example.com 위임 정보')
    expect(html).toContain('192.0.2.10')
    expect(html).toContain('캐시 적중')
    expect(html).toContain('DNSSEC')
  })

  it('models send/receive and TIME-WAIT as eight distinct states', () => {
    const frames = tcpTeardownFrames()
    expect(frames).toHaveLength(8)
    expect(frames.map(f => [f.client, f.server])).toEqual([
      ['ESTABLISHED', 'ESTABLISHED'], ['FIN-WAIT-1', 'ESTABLISHED'],
      ['FIN-WAIT-1', 'CLOSE-WAIT'], ['FIN-WAIT-2', 'CLOSE-WAIT'],
      ['FIN-WAIT-2', 'LAST-ACK'], ['TIME-WAIT', 'LAST-ACK'],
      ['TIME-WAIT', 'CLOSED'], ['CLOSED', 'CLOSED'],
    ])
    expect(frames.map(f => f.active)).toEqual([-1, 0, 1, -1, 2, 3, -1, -1])
    expect(frames[5].explanation).toContain('서버는 아직 ACK를 받지')
    const html = renderToStaticMarkup(<LearningVisualization source={payload('tcp-teardown')} />)
    expect(html).toContain('data-network-step="0"')
    expect(html).toContain('도식 단계 조작')
    expect(html).toContain('FIN 1개 = 시퀀스 번호 1개 소비')
  })

  it('embeds existing window without duplicate Reader summary', () => {
    const html = renderToStaticMarkup(<LearningVisualization source={payload('tcp-sliding-window')} />)
    expect(html).toContain('data-window="1000-1399"')
    expect(html).toContain('data-window="1200-1599"')
    expect(html).toContain('data-tcp-state="확인됨"')
    expect(html).toContain('study-visual--embedded')
    expect(html).not.toContain('<summary')
    const standalone = renderToStaticMarkup(<TcpSlidingWindowStudyVisual />)
    expect(standalone).toContain('<summary')
  })
})
