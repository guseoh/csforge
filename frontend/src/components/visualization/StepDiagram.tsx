import { useState } from 'react'
import type { VisualizationOf } from '../../lib/learning-visualization'
import { passByValueFrames, tcpHandshakeFrames } from '../../lib/visualization-models'
import { DiagramArrow, DiagramCanvas, DiagramControls, DiagramNode } from './DiagramPrimitives'

export function PassByValueDiagram({ data }: { data: VisualizationOf<'java-pass-by-value'> }) {
  const [index, setIndex] = useState(0)
  const frames = passByValueFrames(data)
  const frame = frames[index]
  return <>
    <DiagramCanvas label={`참조 값 복사 ${index + 1}단계: member → A, value → ${frame.parameter ?? '없음'}`} width={640} height={290}>
      <text x={32} y={24}>변수 (서로 다른 저장 공간)</text><text x={410} y={24}>객체 (식별자 A·B)</text>
      <DiagramNode x={24} y={48} lines={['호출자 member', '참조 값 → A']} />
      <DiagramNode x={24} y={166} lines={['매개변수 value', frame.parameter ? `참조 값 → ${frame.parameter}` : '호출 전 또는 종료']} dashed={!frame.parameter} active={index === 1 || index === 2} />
      <DiagramNode x={410} y={48} lines={['객체 A', 'name =', `"${frame.a}"`]} />
      <DiagramArrow x1={224} y1={82} x2={410} y2={82} />
      {frame.parameter === 'A' && <DiagramArrow x1={224} y1={200} x2={410} y2={100} active />}
      {frame.b !== null && <DiagramNode x={410} y={166} lines={['객체 B', 'name =', frame.b.name === null ? 'null' : `"${frame.b.name}"`]} active={index === 3} dashed={index === 4} />}
      {frame.parameter === 'B' && <DiagramArrow x1={224} y1={200} x2={410} y2={200} active />}
      <text x={24} y={272}>실선: 참조 · 점선 상자: 호출 전/종료 또는 참조 없는 객체</text>
    </DiagramCanvas>
    <p className="diagram-code"><code>{frame.code}</code></p>
    <p className="diagram-status" role="status" aria-live="polite">{frame.explanation}</p>
    <DiagramControls index={index} count={frames.length} onChange={setIndex} onReset={() => setIndex(0)} />
  </>
}

export function TcpHandshakeDiagram({ data }: { data: VisualizationOf<'tcp-handshake'> }) {
  const [index, setIndex] = useState(0)
  const frames = tcpHandshakeFrames(data)
  const frame = frames[index]
  return <>
    <DiagramCanvas label={`TCP ${index + 1}단계: 클라이언트 ${frame.client}, 서버 ${frame.server}`} width={680} height={380}>
      <DiagramNode x={24} y={18} width={220} lines={['클라이언트', frame.client]} active={index === 1 || index === 3} />
      <DiagramNode x={436} y={18} width={220} lines={['서버', frame.server]} active={index === 2 || index === 4} />
      <line className="diagram-lifeline" x1={134} y1={86} x2={134} y2={354} />
      <line className="diagram-lifeline" x1={546} y1={86} x2={546} y2={354} />
      {frame.messages.map((message, i) => {
        const y = 142 + i * 90
        return <g key={i}>
          <text x={340} y={y - 14} textAnchor="middle">{i + 1}. {message.text}</text>
          <DiagramArrow x1={message.from === 'client' ? 134 : 546} y1={y} x2={message.from === 'client' ? 546 : 134} y2={y} active={i === frame.active} dashed={i !== frame.active} />
        </g>
      })}
    </DiagramCanvas>
    <p className="diagram-status" role="status" aria-live="polite">{frame.explanation}</p>
    <p>굵은 화살표: 현재 전송 중 · 점선: 이전 전송 · 시퀀스 번호는 2³²에서 순환합니다.</p>
    <DiagramControls index={index} count={frames.length} onChange={setIndex} onReset={() => setIndex(0)} />
  </>
}
