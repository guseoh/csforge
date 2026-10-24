import { useId, useState } from 'react'
import { MAX_HEAP_SIZE, type VisualizationOf } from '../../lib/learning-visualization'
import { buildMinHeap, heapDiagramSize, heapOperation, heapPosition, type HeapFrame } from '../../lib/visualization-models'
import { DiagramCanvas, DiagramControls } from './DiagramPrimitives'

export function HeapDiagram({ data }: { data: VisualizationOf<'min-heap'> }) {
  const errorId = useId()
  const initial = () => [{ values: buildMinHeap(data.initialValues), active: [], explanation: '초기 상태: 자연 순서의 최소 힙. 모든 부모 ≤ 자식입니다.', settled: true }]
  const [frames, setFrames] = useState<HeapFrame[]>(initial)
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const frame = frames[index]
  const canvas = heapDiagramSize(frame.values.length)
  const committed = frames.at(-1)!.values
  const replaying = index !== frames.length - 1
  function operate(operation: { type: 'offer'; value: number } | { type: 'poll' }) {
    const next = heapOperation(committed, operation)
    setFrames(next)
    setIndex(next.length - 1)
    setError('')
    setInput('')
  }
  return <>
    <form className="diagram-controls" onSubmit={(event) => {
      event.preventDefault()
      if (!/^-?\d{1,2}$/.test(input) || Math.abs(Number(input)) > 99) { setError('-99~99 사이 정수를 입력하세요.'); return }
      if (replaying || committed.length >= MAX_HEAP_SIZE) return
      operate({ type: 'offer', value: Number(input) })
    }}>
      <label>삽입할 정수 <input aria-label="힙에 삽입할 정수" type="text" inputMode="numeric" maxLength={3} value={input} onChange={(e) => setInput(e.target.value)} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} /></label>
      <button type="submit" disabled={replaying || committed.length >= MAX_HEAP_SIZE}>삽입 (offer)</button>
      <button type="button" disabled={replaying} onClick={() => operate({ type: 'poll' })}>최솟값 꺼내기 (poll)</button>
    </form>
    {error && <p id={errorId} role="alert">{error}</p>}
    <p>최대 {MAX_HEAP_SIZE}개 · {replaying ? '기록을 보는 중에는 다음 단계로 완료 위치에 돌아온 뒤 조작하세요.' : committed.length === MAX_HEAP_SIZE ? '큐가 가득 찼습니다. poll 후 삽입하세요.' : '중복 값·음수도 삽입할 수 있습니다.'}</p>
    <DiagramCanvas label={`최소 힙 트리. 배열 인덱스와 값: ${frame.values.map((v, i) => `${i}번 ${v}`).join(', ') || '빈 큐'}`} width={canvas.width} height={canvas.height} centerInitially>
      {frame.values.map((_, child) => {
        if (child === 0) return null
        const p = heapPosition(Math.floor((child - 1) / 2), canvas.width)
        const c = heapPosition(child, canvas.width)
        const length = Math.hypot(c.x - p.x, c.y - p.y)
        const dx = (c.x - p.x) / length * 24
        const dy = (c.y - p.y) / length * 24
        return <line className="diagram-tree-edge" key={`edge-${child}`} x1={p.x + dx} y1={p.y + dy} x2={c.x - dx} y2={c.y - dy} />
      })}
      {frame.values.map((value, i) => {
        const { x, y } = heapPosition(i, canvas.width)
        return <g key={i} className={`diagram-node${frame.active.includes(i) ? ' diagram-active' : ''}`}>
          <circle cx={x} cy={y} r={24} /><text x={x} y={y + 5} textAnchor="middle">{value}</text>
          <text className="diagram-index" x={x} y={y + 44} textAnchor="middle">[{i}]</text>
        </g>
      })}
      {!frame.values.length && <text x={canvas.width / 2} y={50} textAnchor="middle">빈 큐 · peek() = null</text>}
    </DiagramCanvas>
    <ol className="diagram-array" aria-label="트리와 같은 상태의 힙 배열">{frame.values.map((v, i) => <li key={i} className={frame.active.includes(i) ? 'diagram-active' : ''}><span>[{i}]</span><strong>{v}</strong></li>)}</ol>
    <p className="diagram-status" role="status" aria-live="polite">{frame.settled ? '안정 상태 · ' : '힙 성질 복구 중 · '}{frame.explanation}</p>
    <DiagramControls index={index} count={frames.length} onChange={setIndex} onReset={() => { setFrames(initial()); setIndex(0); setInput(''); setError('') }} />
    <details className="diagram-trace"><summary>비교·교환 기록 {frames.length}단계</summary><ol>{frames.map((f, i) => <li key={i} aria-current={index === i ? 'step' : undefined}>{f.explanation}</li>)}</ol></details>
    <p>굵은 테두리: 현재 비교·교환 인덱스. 복구 중 화면은 연산의 중간 상태입니다. 다음 조작은 완료된 최소 힙에서만 시작합니다. 동일 우선순위의 처리 순서는 보장하지 않습니다.</p>
  </>
}
