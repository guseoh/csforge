import { useState } from 'react'
import { javaApiScenes, type JavaApiExample } from '../../lib/java-api-models'
import { DiagramArrow, DiagramCanvas, DiagramControls, DiagramNode } from './DiagramPrimitives'

export function JavaApiDiagram({ example }: { example: JavaApiExample }) {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes[example]
  const scene = scenes[index]
  if (scene.graph) {
    const { nodes, edges } = scene.graph
    const width = 48 + (Math.max(...nodes.map((node) => node.column)) + 1) * 390 - 40
    const height = 110 + (Math.max(...nodes.map((node) => node.row)) + 1) * 145
    return <div className="java-api-diagram">
      <DiagramCanvas label={`${scene.title}. ${nodes.map((node) => node.lines.join(': ')).join('. ')}. ${edges.map((edge) => `${edge.from} → ${edge.to}: ${edge.label}`).join('. ')}`} width={width} height={height}>
        <text x={24} y={35} fontWeight="700">{scene.title}</text>
        {edges.map((edge, i) => {
          const from = nodes.find((node) => node.id === edge.from)!
          const to = nodes.find((node) => node.id === edge.to)!
          const dx = (to.column - from.column) * 390
          const dy = (to.row - from.row) * 145
          const boundary = Math.max(Math.abs(dx) / 125, Math.abs(dy) / 34)
          const paired = edges.some((other) => other.from === edge.to && other.to === edge.from)
          const offset = paired && dy === 0 ? (dx > 0 ? -14 : 14) : 0
          const x1 = 149 + from.column * 390 + dx / boundary
          const y1 = 106 + from.row * 145 + dy / boundary + offset
          const x2 = 149 + to.column * 390 - dx / boundary
          const y2 = 106 + to.row * 145 - dy / boundary + offset
          return <g key={`${edge.from}-${edge.to}-${i}`}>
            <DiagramArrow x1={x1} y1={y1} x2={x2} y2={y2} dashed={edge.dashed} />
            <text className="diagram-index" x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} textAnchor="middle">{edge.label}</text>
          </g>
        })}
        {nodes.map((node) => <DiagramNode key={node.id} x={24 + node.column * 390} y={72 + node.row * 145} width={250} lines={node.lines} active={node.active} />)}
      </DiagramCanvas>
      {scenes.length > 1 && <DiagramControls index={index} count={scenes.length} onChange={setIndex} onReset={() => setIndex(0)} />}
      <p role="status" className="diagram-status">{scene.note}</p>
    </div>
  }
  const bufferState = scene.cells ? `position ${scene.position}, limit ${scene.limit}, capacity 8. 칸 내용 ${scene.cells.join(', ')}.` : ''
  if (example === 'lambda-capture') return <div className="java-api-diagram">
    <DiagramCanvas label="names 지역 변수의 참조는 재대입되지 않지만 같은 ArrayList의 내용은 변경할 수 있습니다" width={680} height={240}>
      <text x={24} y={36} fontWeight="700">캡처된 참조와 같은 가변 목록</text>
      <text x={34} y={93}>names</text>
      <text className="diagram-index" x={34} y={122}>재대입 없음</text>
      <DiagramArrow x1={150} y1={91} x2={278} y2={91} />
      <g className="diagram-node"><rect x={290} y={60} width={270} height={70} rx={8} /></g>
      <text x={310} y={88}>ArrayList</text><text x={310} y={113}>[] → ["java"]</text>
      <text className="diagram-index" x={24} y={195}>names.add("java")는 같은 객체의 상태를 바꿉니다.</text>
    </DiagramCanvas><p>{scene.note}</p>
  </div>
  if (example === 'stream-laziness') return <div className="java-api-diagram">
    <DiagramCanvas label={`${scene.title}. ${scene.lanes.map(([a, b]) => `${a}: ${b}`).join('. ')}`} width={680} height={220}>
      <text x={24} y={35} fontWeight="700">{scene.title}</text>
      {[90, 101, 102, 104].map((value, i) => <g key={value} className={`diagram-node${index > 0 && i === index - 1 ? ' diagram-active' : ''}`}>
        <circle cx={80 + i * 145} cy={104} r={28} />
        <text x={80 + i * 145} y={110} textAnchor="middle">{value}</text>
      </g>)}
      <text x={24} y={175}>{scene.lanes[scene.lanes.length - 1][1]}</text>
    </DiagramCanvas>
    <DiagramControls index={index} count={scenes.length} onChange={setIndex} onReset={() => setIndex(0)} />
    <p role="status" className="diagram-status">{scene.lanes.map(([a, b]) => `${a}: ${b}`).join('. ')}. {scene.note}</p>
  </div>
  if (example === 'pecs') return <div className="java-api-diagram">
    <DiagramCanvas label="extends 원본에서 T를 읽어 super 대상에 T를 씁니다" width={680} height={290}>
      <text x={24} y={36} fontWeight="700">타입 경계를 넘는 값 T의 방향</text>
      <g className="diagram-node"><rect x={24} y={76} width={250} height={142} rx={10} /><rect x={406} y={76} width={250} height={142} rx={10} /></g>
      <text x={42} y={109}>SOURCE · ? extends T</text><text className="diagram-index" x={42} y={142}>정확한 하위 타입은 모름</text>
      <text x={424} y={109}>DESTINATION · ? super T</text><text className="diagram-index" x={424} y={142}>T 또는 상위 타입의 목록</text>
      <DiagramArrow x1={190} y1={179} x2={320} y2={179} /><text x={220} y={164}>읽기</text>
      <g className="diagram-node diagram-active"><circle cx={340} cy={179} r={19} /></g><text x={340} y={185} textAnchor="middle">T</text>
      <DiagramArrow x1={360} y1={179} x2={486} y2={179} /><text x={433} y={164}>쓰기</text>
      <text x={24} y={258}>extends는 수정 불가 뷰가 아니며, super의 읽기 결과는 Object입니다.</text>
    </DiagramCanvas><p>{scene.note}</p>
  </div>
  if (example === 'list-layout') return <div className="java-api-diagram">
    <DiagramCanvas label="위는 배열의 참조 슬롯, 아래는 연결 리스트의 탐색 경로입니다. 객체의 물리 배치가 아닙니다" width={680} height={408}>
      <text x={24} y={35} fontWeight="700">ArrayList · 참조 슬롯을 인덱스로 접근</text>
      {['A', 'B', 'C', 'D'].map((v, i) => <g className="diagram-node" key={v}><rect x={24 + i * 150} y={61} width={136} height={55} /><text x={92 + i * 150} y={96} textAnchor="middle">[{i}] {v}</text></g>)}
      <text className="diagram-index" x={24} y={150}>index 2에 X 삽입: C·D의 참조를 뒤로 이동</text>
      <text x={24} y={213} fontWeight="700">LinkedList · 위치 탐색 뒤 연결 변경</text>
      {['A', 'B', 'C'].map((v, i) => <g className="diagram-node" key={v}><circle cx={90 + i * 212} cy={274} r={29} /><text x={90 + i * 212} y={280} textAnchor="middle">{v}</text>{i < 2 && <><DiagramArrow x1={125 + i * 212} y1={265} x2={265 + i * 212} y2={265} /><DiagramArrow x1={265 + i * 212} y1={284} x2={125 + i * 212} y2={284} /></>}</g>)}
      <text className="diagram-index" x={24} y={340}>add(index, X) = 위치 탐색 + 연결 변경</text>
      <text className="diagram-index" x={24} y={375}>이미 그 위치의 ListIterator가 있다면 탐색 비용을 따로 냈습니다.</text>
    </DiagramCanvas><p>{scene.note}</p>
  </div>
  return <div className="java-api-diagram">
    <DiagramCanvas label={`${scene.title}. ${bufferState} ${scene.lanes.map(([a, b]) => `${a}: ${b}`).join('. ')}`} width={680} height={scene.cells ? 228 : 110 + scene.lanes.length * 104}>
      <text x={24} y={36} fontWeight="700">{scene.title}</text>
      {scene.cells ? <>
        <text x={24} y={72}>position = {scene.position} · limit = {scene.limit} · capacity = 8</text>
        {scene.cells.map((cell, i) => <g key={i} className={`diagram-node${i === scene.position ? ' diagram-active' : ''}`}>
          <rect x={24 + i * 76} y={100} width={68} height={52} opacity={i >= scene.limit! ? .4 : 1} />
          <text x={58 + i * 76} y={132} textAnchor="middle">{cell}</text>
          <text className="diagram-index" x={58 + i * 76} y={180} textAnchor="middle">{i}</text>
        </g>)}
        <text x={24} y={215}>굵은 테두리: 다음 위치 / 흐린 칸: limit 이후</text>
      </> : scene.lanes.map(([label, value], i) => <g key={label}>
        <line className="diagram-tree-edge" x1={24} x2={656} y1={64 + i * 104} y2={64 + i * 104} />
        <text className="diagram-index" x={24} y={91 + i * 104}>{label}</text>
        <text x={24} y={125 + i * 104}>{Array.from(value.matchAll(/.{1,38}/gu), (m, j) => <tspan key={j} x={24} dy={j === 0 ? 0 : 22}>{m[0]}</tspan>)}</text>
      </g>)}
    </DiagramCanvas>
    {scenes.length > 1 && <DiagramControls index={index} count={scenes.length} onChange={setIndex} onReset={() => setIndex(0)} />}
    <p role="status" className="diagram-status">{bufferState} {scene.note}</p>
  </div>
}
