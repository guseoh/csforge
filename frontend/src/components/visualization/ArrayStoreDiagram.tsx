import { useState } from 'react'
import { arrayStoreFrames } from '../../lib/language-type-models'
import { DiagramArrow, DiagramCanvas, DiagramControls, DiagramNode } from './DiagramPrimitives'

export function ArrayStoreDiagram() {
  const [index, setIndex] = useState(0)
  const frames = arrayStoreFrames()
  const frame = frames[index]
  return <>
    <DiagramCanvas label={`배열 저장 검사 ${index + 1}단계. ${frame.explanation}`} width={680} height={420}>
      <text x={24} y={26}>변수의 선언 타입</text><text x={430} y={26}>같은 실제 배열 객체</text>
      <DiagramNode x={24} y={52} width={244} lines={['String[] names', '참조 A']} />
      <DiagramArrow x1={268} y1={86} x2={414} y2={86} />
      {frame.alias && <>
        <DiagramNode x={24} y={154} width={244} lines={['Object[] values', '참조 A']} />
        <DiagramArrow x1={268} y1={188} x2={414} y2={108} />
      </>}
      <DiagramNode x={414} y={52} width={242} height={80} lines={['A: String[]', '길이 2 · 타입 유지']} />
      {frame.elements.map((value, i) => <g key={i}>
        <DiagramNode x={414 + i * 122} y={164} width={112} lines={[`[${i}]`, value === null ? 'null' : `"${value}"`]} active={i === 0 && frame.phase === 'accepted'} />
      </g>)}
      <DiagramNode x={24} y={278} width={632} height={82} lines={frame.phase === 'checking' || frame.phase === 'rejected'
        ? ['Integer는 Object[] 선언에서 허용 → 실제 String[] 저장 검사', frame.phase === 'rejected' ? 'ArrayStoreException · [1] 변경 없음 · [0]은 kim 유지' : 'String으로 대입할 수 있는가? → 아니오']
        : ['참조형 배열의 원소는 String 또는 null', '선언 타입이 넓어져도 실제 배열 타입은 바뀌지 않습니다.']} active={frame.phase === 'rejected'} />
      <text x={24} y={397}>화살표: 같은 배열을 가리키는 참조 · 실패한 저장은 반영되지 않습니다.</text>
    </DiagramCanvas>
    <p className="diagram-code"><code>{frame.code}</code></p>
    <p className="diagram-status" role="status" aria-live="polite">{frame.explanation}</p>
    <DiagramControls index={index} count={frames.length} onChange={setIndex} onReset={() => setIndex(0)} />
  </>
}
