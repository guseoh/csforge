import { useId } from 'react'
import './study-visual-pilots.css'

const BYTE_STARTS = [1000, 1100, 1200, 1300, 1400, 1500] as const

type SegmentStatus = '보냄' | '대기' | '확인됨' | '전송 가능' | '범위 밖'

/**
 * 100-byte teaching segments; TCP sequence and cumulative ACK values count
 * bytes. rwnd=400 and cwnd>=400, no loss or retransmission in the example.
 */
function TcpWindowSnapshot({ ackReceived }: { ackReceived: boolean }) {
  const id = useId()
  const windowStart = ackReceived ? 1200 : 1000
  const status = (start: number): SegmentStatus => {
    if (!ackReceived) return start < 1400 ? '보냄' : '범위 밖'
    if (start < 1200) return '확인됨'
    if (start < 1400) return '대기'
    return '전송 가능'
  }

  return <svg viewBox="0 0 740 166" className="study-visual__tcp-canvas" role="img" aria-labelledby={`tcp-title-${id} tcp-desc-${id}`}>
    <title id={`tcp-title-${id}`}>{ackReceived ? 'ACK 1200 수신 후' : 'ACK 수신 전'} 송신 윈도우</title>
    <desc id={`tcp-desc-${id}`}>
      {ackReceived
        ? '1000~1199 바이트는 누적 확인되었고 송신 윈도우가 1200~1599로 이동합니다. 1200~1399는 전송했지만 확인되지 않았고 1400~1599는 새로 전송할 수 있습니다.'
        : '1000~1399 바이트를 전송했고 ACK를 받기 전입니다. 현재 송신 윈도우는 1000~1399입니다.'}
    </desc>
    <defs>
      <pattern id={`tcp-hatch-${id}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" x2="0" y1="0" y2="7" className="study-visual__hatch-line" />
      </pattern>
    </defs>
    <text x="24" y="23" className="study-visual__svg-muted">송신 윈도우: {windowStart}~{windowStart + 399} B</text>
    <rect
      x={20 + (ackReceived ? 2 : 0) * 113}
      y="42"
      width="448"
      height="104"
      className="study-visual__window-outline"
      data-window={`${windowStart}-${windowStart + 399}`}
    />
    {BYTE_STARTS.map((start, i) => {
      const state = status(start)
      const x = 27 + i * 113
      return <g key={start} data-tcp-byte={start} data-tcp-state={state}>
        <rect x={x} y="56" width="100" height="77" className={`study-visual__tcp-cell study-visual__tcp-cell--${state === '확인됨' ? 'acked' : state === '대기' || state === '보냄' ? 'sent' : state === '전송 가능' ? 'available' : 'outside'}`} />
        {state === '확인됨' && <rect x={x} y="56" width="100" height="77" fill={`url(#tcp-hatch-${id})`} className="study-visual__tcp-hatch" />}
        <text x={x + 50} y="88" textAnchor="middle" className="study-visual__svg-identifier">{start}</text>
        <text x={x + 50} y="115" textAnchor="middle" className="study-visual__svg-muted">{state}</text>
      </g>
    })}
  </svg>
}

export function TcpSlidingWindowStudyVisual() {
  return <details className="study-visual" open data-study-visual="tcp-sliding-window">
    <summary className="study-visual__summary"><span>데모</span><span className="study-visual__chevron" aria-hidden="true" /></summary>
    <div className="study-visual__content">
      <p className="study-visual__instruction">100B씩 전송한 데이터를 누적 ACK 수신 전후로 비교합니다.</p>
      <div className="study-visual__tcp-sequence">
        <section className="study-visual__panel">
          <h3>① ACK 수신 전</h3>
          <TcpWindowSnapshot ackReceived={false} />
          <p className="study-visual__panel-caption">1000~1399 B를 송신했습니다. 아직 ACK를 받지 않았습니다.</p>
        </section>
        <div className="study-visual__tcp-transition" aria-label="ACK 1200 수신">
          <span aria-hidden="true">↓</span> 누적 ACK = 1200
        </div>
        <section className="study-visual__panel">
          <h3>② ACK = 1200 수신 후</h3>
          <TcpWindowSnapshot ackReceived />
          <p className="study-visual__panel-caption">1000~1199 B가 확인되고 송신 윈도우는 1200~1599 B로 이동합니다.</p>
        </section>
      </div>
      <div className="study-visual__explanation" data-tcp-explanation>
        <p className="study-visual__key">ACK 1200은 다음에 기대하는 바이트가 1200이라는 뜻입니다.</p>
        <p>1000~1199 B는 누적 확인, 1200~1399 B는 전송 후 확인 대기, 1400~1599 B는 새로 전송 가능합니다.</p>
        <p className="study-visual__note">각 칸 100 B · 수신 윈도우(rwnd) 400 B 유지 · 혼잡 윈도우(cwnd) ≥ 400 B · 손실·재전송 없음. 점선 = 송신 윈도우, 빗금 = 누적 확인된 바이트.</p>
      </div>
    </div>
  </details>
}
