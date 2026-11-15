import { useState } from 'react'
import type { VisualizationOf } from '../../lib/learning-visualization'
import { passByValueFrames } from '../../lib/visualization-models'
import { DiagramArrow, DiagramCanvas, DiagramControls, DiagramNode } from './DiagramPrimitives'

export { TcpHandshakeDiagram } from './TcpHandshakeEditorial'

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

