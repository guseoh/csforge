import { useId, useState } from 'react'
import type { VisualizationOf } from '../../lib/learning-visualization'
import { tcpHandshakeFrames } from '../../lib/visualization-models'
import { DiagramControls } from './DiagramPrimitives'
import './tcp-handshake-editorial.css'

const phaseNames = [
  '연결 수립 전',
  'SYN 전송 중',
  'SYN-ACK 전송 중',
  '마지막 ACK 전송 중',
  '서버가 마지막 ACK 수신',
] as const

/**
 * N-01 textbook view. A half-length arrow represents a packet in flight;
 * it must not visually arrive before the remote TCP endpoint receives it.
 */
export function TcpHandshakeDiagram({ data }: { data: VisualizationOf<'tcp-handshake'> }) {
  const [step, setStep] = useState(0)
  const titleId = useId()
  const descriptionId = useId()
  const frames = tcpHandshakeFrames(data)
  const frame = frames[step]
  const messages = frames[4].messages

  return <section
    className="tcp-handshake-editorial"
    data-network-pilot="n01-tcp-handshake"
    data-tcp-step={step}
    aria-label="TCP 3방향 핸드셰이크의 시퀀스와 연결 상태"
  >
    <p className="tcp-handshake-editorial__intro">
      클라이언트와 서버의 상태는 메시지의 전송 시점과 수신 시점에 따라 달라집니다.
    </p>
    <div className="tcp-handshake-editorial__scroll" role="region" tabIndex={0} aria-label="TCP 메시지 교환 시퀀스 도식, 좁은 화면에서 가로 스크롤 가능">
      <svg className="tcp-handshake-editorial__canvas" viewBox="0 0 800 455" role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
        <title id={titleId}>TCP 3방향 핸드셰이크 {step + 1} / {frames.length}단계</title>
        <desc id={descriptionId}>
          {phaseNames[step]}. 클라이언트 {frame.client}, 서버 {frame.server}.
          {frame.active >= 0 ? '현재 메시지는 전송 중이며 아직 상대 종단점에 도착하지 않았습니다.' : ''}
          {frame.explanation}
        </desc>

        <text className="tcp-handshake-editorial__party" x="134" y="33" textAnchor="middle">클라이언트</text>
        <text className="tcp-handshake-editorial__party" x="666" y="33" textAnchor="middle">서버</text>
        <text className="tcp-handshake-editorial__state" x="134" y="64" textAnchor="middle" data-tcp-party="client">{frame.client}</text>
        <text className="tcp-handshake-editorial__state" x="666" y="64" textAnchor="middle" data-tcp-party="server">{frame.server}</text>
        <line className="tcp-handshake-editorial__rule" x1="35" y1="83" x2="765" y2="83" />
        <line className="tcp-handshake-editorial__lifeline" x1="134" y1="105" x2="134" y2="418" />
        <line className="tcp-handshake-editorial__lifeline" x1="666" y1="105" x2="666" y2="418" />

        {messages.map((message, i) => {
          const y = 159 + i * 101
          const isSent = i < frame.sent
          const inFlight = frame.active === i
          const fromLeft = message.from === 'client'
          const fromX = fromLeft ? 146 : 654
          const receivedX = fromLeft ? 654 : 146
          const targetX = inFlight ? 400 : receivedX
          const direction = fromLeft ? 1 : -1
          return <g key={i}
            className={`tcp-handshake-editorial__message ${inFlight ? 'tcp-handshake-editorial__message--active' : ''}`}
            data-tcp-message={i}
            data-tcp-phase={!isSent ? 'future' : inFlight ? 'in-flight' : 'received'}
          >
            {isSent && <>
              <text className="tcp-handshake-editorial__message-name" x="400" y={y - 19} textAnchor="middle">
                {i + 1}. {message.text}
              </text>
              <line className="tcp-handshake-editorial__arrow-line" x1={fromX} y1={y} x2={targetX} y2={y} />
              <path className="tcp-handshake-editorial__arrow-tip"
                d={`M ${targetX} ${y} L ${targetX - direction * 10} ${y - 5} L ${targetX - direction * 10} ${y + 5} Z`} />
              {inFlight && <text className="tcp-handshake-editorial__inflight" x="400" y={y + 20} textAnchor="middle">전송 중 · 수신 전</text>}
            </>}
          </g>
        })}
        <text className="tcp-handshake-editorial__axis" x="30" y="443">시간 ↓</text>
        <text className="tcp-handshake-editorial__axis" x="770" y="443" textAnchor="end">실선: 이미 교환된 메시지 · 굵은 선: 전송 중</text>
      </svg>
    </div>
    <div className="tcp-handshake-editorial__reading" role="status" aria-live="polite" aria-atomic="true">
      <p className="tcp-handshake-editorial__reading-title">{step + 1} / {frames.length} · {phaseNames[step]}</p>
      <p>{frame.explanation}</p>
    </div>
    <div className="tcp-handshake-editorial__controls">
      <DiagramControls index={step} count={frames.length} onChange={setStep} onReset={() => setStep(0)} />
    </div>
    <p className="tcp-handshake-editorial__note">
      SYN은 시퀀스 번호 하나를 소비합니다. 데이터 없는 마지막 ACK는 소비하지 않습니다.
      재전송·동시 열기·TCP Fast Open과 상위 TLS/HTTP 단계는 이 예제에서 다루지 않습니다.
    </p>
  </section>
}
