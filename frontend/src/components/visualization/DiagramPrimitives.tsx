import { useEffect, useId, useRef, type ReactNode } from 'react'

export function DiagramCanvas({ label, width, height, children, centerInitially = false }: { label: string; width: number; height: number; children: ReactNode; centerInitially?: boolean }) {
  const titleId = useId()
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = scrollRef.current
    if (element && centerInitially) element.scrollLeft = Math.max(0, (element.scrollWidth - element.clientWidth) / 2)
  }, [width, centerInitially])
  return <><p className="diagram-pan-hint">좁은 화면에서는 도식 안을 좌우로 스크롤하세요.</p>
  <div ref={scrollRef} className="diagram-scroll" role="region" aria-label={`${label}, 가로 스크롤 가능`} tabIndex={0}>
    <svg className="diagram-canvas" viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-labelledby={titleId}>
      <title id={titleId}>{label}</title>
      {children}
    </svg>
  </div></>
}

export function DiagramNode({ x, y, width = 200, height = 68, lines, active = false, dashed = false }: {
  x: number; y: number; width?: number; height?: number; lines: readonly string[]; active?: boolean; dashed?: boolean
}) {
  return <g className={`diagram-node${active ? ' diagram-active' : ''}${dashed ? ' diagram-dashed' : ''}`}>
    <rect x={x} y={y} width={width} height={height} rx={4} />
    {lines.map((text, index) => <text key={index} x={x + width / 2} y={y + height / 2 + (index - (lines.length - 1) / 2) * 21 + 5} textAnchor="middle">{text}</text>)}
  </g>
}

export function DiagramArrow({ x1, y1, x2, y2, active = false, dashed = false }: {
  x1: number; y1: number; x2: number; y2: number; active?: boolean; dashed?: boolean
}) {
  const length = Math.hypot(x2 - x1, y2 - y1) || 1
  const dx = (x2 - x1) / length
  const dy = (y2 - y1) / length
  return <g className={`diagram-edge${active ? ' diagram-active' : ''}${dashed ? ' diagram-dashed' : ''}`}>
    <line x1={x1} y1={y1} x2={x2} y2={y2} />
    <path d={`M ${x2} ${y2} L ${x2 - 9 * dx + 4 * dy} ${y2 - 9 * dy - 4 * dx} L ${x2 - 9 * dx - 4 * dy} ${y2 - 9 * dy + 4 * dx} Z`} />
  </g>
}

export function DiagramControls({ index, count, onChange, onReset }: { index: number; count: number; onChange: (index: number) => void; onReset: () => void }) {
  return <div className="diagram-controls" role="group" aria-label="도식 단계 조작">
    <button type="button" disabled={index === 0} onClick={() => onChange(index - 1)}>이전 단계</button>
    <span>{index + 1} / {count}</span>
    <button type="button" disabled={index === count - 1} onClick={() => onChange(index + 1)}>다음 단계</button>
    <button type="button" onClick={onReset}>초기화</button>
  </div>
}
