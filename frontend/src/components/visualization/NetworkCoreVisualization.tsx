import { useId, useState } from 'react'
import type { VisualizationOf } from '../../lib/learning-visualization'
import { tcpTeardownFrames, teardownMessages } from '../../lib/network-core-model'
import { DiagramControls } from './DiagramPrimitives'
import { TcpSlidingWindowStudyVisual } from './TcpSlidingWindowStudyVisual'
import './network-core-editorial.css'

function useSvgLabels() {
  return { titleId: useId(), descId: useId() }
}

/** Distinguishes one HTTP/1.1 message from transport segmentation. */
export function HttpOverTcpEditorial() {
  const { titleId, descId } = useSvgLabels()
  return <div className="network-core-editorial" data-network-core="http-over-tcp">
    <p className="network-core-editorial__intro">HTTP 메시지는 애플리케이션의 논리적 단위이고 TCP는 순서 있는 바이트 스트림을 운반합니다.</p>
    <svg className="network-core-editorial__svg" viewBox="0 0 840 336" role="img" aria-labelledby={titleId + ' ' + descId}>
      <title id={titleId}>HTTP/1.1 요청과 TCP 바이트 스트림의 서로 다른 경계</title>
      <desc id={descId}>클라이언트의 HTTP 요청 한 개가 예시상 두 TCP 세그먼트로 분할되어 전송되고 서버가 순서대로 바이트를 받은 뒤 하나의 요청으로 파싱합니다. TCP 세그먼트 두 개는 예시일 뿐 고정 규칙이 아닙니다.</desc>
      <text className="network-core-editorial__section-label" x="22" y="33">애플리케이션 계층 · HTTP/1.1 요청 1개</text>
      <rect className="network-core-editorial__node" x="22" y="49" width="232" height="72" />
      <text className="network-core-editorial__text" x="138" y="78" textAnchor="middle">GET /health HTTP/1.1</text>
      <text className="network-core-editorial__minor" x="138" y="102" textAnchor="middle">Host: example.test</text>
      <path className="network-core-editorial__line" d="M254 85 H591" />
      <path className="network-core-editorial__tip" d="M598 85 l-11 -6 v12 Z" />
      <rect className="network-core-editorial__node" x="598" y="49" width="220" height="72" />
      <text className="network-core-editorial__text" x="708" y="78" textAnchor="middle">HTTP 요청 파싱</text>
      <text className="network-core-editorial__minor" x="708" y="102" textAnchor="middle">메서드·경로·헤더</text>

      <text className="network-core-editorial__section-label" x="22" y="170">전송 계층 · TCP 바이트 스트림</text>
      <text className="network-core-editorial__minor" x="24" y="198">클라이언트 TCP</text>
      <text className="network-core-editorial__minor" x="695" y="198">서버 TCP</text>
      <rect className="network-core-editorial__segment" x="199" y="183" width="173" height="60" />
      <rect className="network-core-editorial__segment" x="388" y="183" width="173" height="60" />
      <text className="network-core-editorial__text" x="285" y="208" textAnchor="middle">세그먼트 A</text>
      <text className="network-core-editorial__minor" x="285" y="227" textAnchor="middle">앞부분 바이트</text>
      <text className="network-core-editorial__text" x="474" y="208" textAnchor="middle">세그먼트 B</text>
      <text className="network-core-editorial__minor" x="474" y="227" textAnchor="middle">뒷부분 바이트</text>
      <path className="network-core-editorial__line" d="M93 214 H191 M565 214 H691" />
      <path className="network-core-editorial__tip" d="M699 214 l-11 -6 v12 Z" />
      <path className="network-core-editorial__line network-core-editorial__line--dashed" d="M138 123 V148 M708 147 V123" />
      <text className="network-core-editorial__minor" x="416" y="280" textAnchor="middle">서버는 연속된 바이트를 HTTP/1.1 메시지 프레이밍 규칙으로 해석합니다.</text>
      <text className="network-core-editorial__key" x="416" y="316" textAnchor="middle">HTTP 요청 1개 ≠ TCP 세그먼트 1개</text>
    </svg>
    <div className="network-core-editorial__code-pair">
      <pre aria-label="HTTP 요청 예제"><code>{'GET /health HTTP/1.1\nHost: example.test\n\n'}</code></pre>
      <pre aria-label="HTTP 응답 예제"><code>{'HTTP/1.1 200 OK\nContent-Length: 2\nContent-Type: text/plain\n\nOK'}</code></pre>
    </div>
    <p className="network-core-editorial__note">예제는 TLS·프록시 없는 HTTP/1.1 over TCP입니다. 실제 분할·재전송·결합은 네트워크 상황에 따라 달라지며, 한 TCP 연결을 여러 HTTP/1.1 요청에 재사용할 수도 있습니다.</p>
  </div>
}

/** DNS cache hit versus resolver referrals: no assumption that root returns a host IP. */
export function DnsIterativeEditorial() {
  const { titleId, descId } = useSvgLabels()
  const servers = [
    { name: '루트 서버', reply: '.com 위임 정보' },
    { name: '.com TLD 서버', reply: 'example.com 위임 정보' },
    { name: '권한 서버', reply: 'A = 192.0.2.10' },
  ]
  return <div className="network-core-editorial" data-network-core="dns-iterative">
    <p className="network-core-editorial__intro">캐시에 최종 응답이 없으면 재귀 리졸버가 위임 정보를 따라 권한 서버를 찾습니다.</p>
    <svg className="network-core-editorial__svg" viewBox="0 0 840 464" role="img" aria-labelledby={titleId + ' ' + descId}>
      <title id={titleId}>DNS 반복 조회: 재귀 리졸버와 루트·TLD·권한 서버</title>
      <desc id={descId}>애플리케이션 스텁 리졸버는 재귀 리졸버에 질의합니다. 캐시 적중이면 즉시 반환하고, 캐시 미스이면 재귀 리졸버가 루트와 TLD 권한 서버의 위임 정보를 따라 최종 권한 서버에서 A 레코드를 얻습니다.</desc>
      <rect className="network-core-editorial__node" x="20" y="22" width="242" height="63" />
      <text className="network-core-editorial__text" x="141" y="47" textAnchor="middle">애플리케이션·스텁</text>
      <text className="network-core-editorial__minor" x="141" y="69" textAnchor="middle">www.example.com / A</text>
      <path className="network-core-editorial__line" d="M141 85 V116" />
      <path className="network-core-editorial__tip" d="M141 123 l-6 -11 h12 Z" />
      <rect className="network-core-editorial__node" x="20" y="124" width="242" height="57" />
      <text className="network-core-editorial__text" x="141" y="158" textAnchor="middle">재귀 리졸버</text>
      <path className="network-core-editorial__line" d="M262 151 H307" />
      <path className="network-core-editorial__tip" d="M314 151 l-11 -6 v12 Z" />
      <rect className="network-core-editorial__segment" x="314" y="122" width="501" height="59" />
      <text className="network-core-editorial__text" x="562" y="145" textAnchor="middle">캐시 적중 → 최종 응답 즉시 반환</text>
      <text className="network-core-editorial__minor" x="562" y="167" textAnchor="middle">루트·TLD·권한 서버로 다시 질의할 필요 없음</text>
      <text className="network-core-editorial__section-label" x="24" y="221">캐시 미스 → 위임을 따라 반복 조회</text>
      <line className="network-core-editorial__lifeline" x1="141" y1="238" x2="141" y2="429" />
      {servers.map((server, i) => {
        const y = 251 + i * 68
        return <g key={server.name} data-dns-hop={i}>
          <rect className="network-core-editorial__node" x="515" y={y - 9} width="295" height="53" />
          <text className="network-core-editorial__text" x="662" y={y + 10} textAnchor="middle">{server.name}</text>
          <text className="network-core-editorial__minor" x="662" y={y + 31} textAnchor="middle">{server.reply}</text>
          <path className="network-core-editorial__line" d={'M156 ' + (y + 3) + ' H503'} />
          <path className="network-core-editorial__tip" d={'M511 ' + (y + 3) + ' l-11 -6 v12 Z'} />
          <path className="network-core-editorial__return" d={'M515 ' + (y + 34) + ' H156'} />
          <path className="network-core-editorial__return-tip" d={'M149 ' + (y + 34) + ' l11 -6 v12 Z'} />
        </g>
      })}
      <text className="network-core-editorial__minor" x="22" y="454">권한 응답은 DNS 조회 결과이며, TCP 연결이나 HTTP 서비스 성공을 보장하지 않습니다.</text>
    </svg>
    <p className="network-core-editorial__note">그림은 최종 A 레코드의 캐시가 없는 단순 예제입니다. 위임 정보 자체가 캐시되어 있다면 루트·TLD 일부 단계를 생략할 수 있습니다. CNAME·DNSSEC·재시도는 제외합니다.</p>
  </div>
}

/** Normal four-segment FIN close with half-close and TIME-WAIT shown as separate events. */
export function TcpTeardownEditorial() {
  const { titleId, descId } = useSvgLabels()
  const [step, setStep] = useState(0)
  const frames = tcpTeardownFrames()
  const frame = frames[step]
  return <div className="network-core-editorial" data-network-core="tcp-teardown" data-network-step={step}>
    <p className="network-core-editorial__intro">TCP의 두 송신 방향은 독립적으로 종료됩니다. FIN의 송신과 수신을 구분해 상태를 읽습니다.</p>
    <div className="network-core-editorial__scroll" role="region" aria-label="TCP FIN 종료 시퀀스" tabIndex={0}>
      <svg className="network-core-editorial__svg" viewBox="0 0 840 504" role="img" aria-labelledby={titleId + ' ' + descId}>
        <title id={titleId}>TCP 정상 종료 {step + 1} / {frames.length}</title>
        <desc id={descId}>{frame.title}. 클라이언트 {frame.client}, 서버 {frame.server}. {frame.explanation}</desc>
        <text className="network-core-editorial__party" x="141" y="36" textAnchor="middle">클라이언트 · 능동 종료</text>
        <text className="network-core-editorial__party" x="698" y="36" textAnchor="middle">서버 · 수동 종료</text>
        <text className="network-core-editorial__state" x="141" y="67" textAnchor="middle" data-teardown-party="client">{frame.client}</text>
        <text className="network-core-editorial__state" x="698" y="67" textAnchor="middle" data-teardown-party="server">{frame.server}</text>
        <line className="network-core-editorial__lifeline" x1="141" y1="99" x2="141" y2="462" />
        <line className="network-core-editorial__lifeline" x1="698" y1="99" x2="698" y2="462" />
        {teardownMessages.map((msg, i) => {
          const y = 157 + i * 91
          const sent = i < frame.sent
          const flying = i === frame.active
          const left = msg.from === 'client'
          const from = left ? 152 : 687
          const target = flying ? 420 : left ? 687 : 152
          const direction = left ? 1 : -1
          return <g key={i} data-teardown-message={i} data-teardown-phase={!sent ? 'future' : flying ? 'in-flight' : 'received'}>
            {sent && <>
              <text className="network-core-editorial__message" x="420" y={y - 15} textAnchor="middle">{i + 1}. {msg.title}</text>
              <line className={'network-core-editorial__line' + (flying ? ' network-core-editorial__line--active' : '')} x1={from} y1={y} x2={target} y2={y} />
              <path className="network-core-editorial__tip" d={'M' + target + ' ' + y + ' l' + (-direction * 11) + ' -6 v12 Z'} />
              {flying && <text className="network-core-editorial__minor" x="420" y={y + 21} textAnchor="middle">전송 중 · 상대 수신 전</text>}
            </>}
          </g>
        })}
        <text className="network-core-editorial__minor" x="24" y="491">시간 ↓</text>
        <text className="network-core-editorial__minor" x="816" y="491" textAnchor="end">FIN 1개 = 시퀀스 번호 1개 소비</text>
      </svg>
    </div>
    <div className="network-core-editorial__reading" role="status" aria-live="polite" aria-atomic="true">
      <p><strong>{step + 1} / {frames.length} · {frame.title}</strong></p>
      <p>{frame.explanation}</p>
    </div>
    <DiagramControls index={step} count={frames.length} onChange={setStep} onReset={() => setStep(0)} />
    <p className="network-core-editorial__note">이 예제는 FIN과 ACK를 별도 세그먼트로 보내는 정상 종료입니다. 실제로는 ACK·FIN 결합도 가능하며 RST 기반 중단은 다릅니다. TIME-WAIT에서는 필요 시 마지막 ACK를 재전송할 수 있습니다.</p>
  </div>
}

export function NetworkCoreVisualization({ data }: { data: VisualizationOf<'network-core'> }) {
  switch (data.example) {
    case 'http-over-tcp': return <HttpOverTcpEditorial />
    case 'dns-iterative': return <DnsIterativeEditorial />
    case 'tcp-teardown': return <TcpTeardownEditorial />
    case 'tcp-sliding-window': return <TcpSlidingWindowStudyVisual embedded />
  }
}
