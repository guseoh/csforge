import { useRef, useState, type KeyboardEvent } from 'react'
import {
  HEAP_EXPLORER_DEMO_VALUES,
  HEAP_NODE_SIZE,
  HEAP_TREE_WIDTH,
  getHeapIndexRelation,
  heapExplorerHeight,
  heapExplorerPosition,
  heapTreeEdge,
  isValidHeapExplorerValues,
  nextHeapArrayFocus,
  nextHeapTreeFocus,
} from '../../lib/heap-index-explorer-model'
import './heap-index-explorer.css'

export interface HeapIndexExplorerProps {
  values?: readonly number[]
  initialSelectedIndex?: number
  title?: string
  description?: string
  onSelectionChange?: (index: number) => void
}

/**
 * A study diagram, not a graph editor: select a tree node or array cell and
 * read the corresponding parent/child indices. No value mutation or animation.
 */
export function HeapIndexExplorer({
  values = HEAP_EXPLORER_DEMO_VALUES,
  initialSelectedIndex = 1,
  title = '데모',
  description = '노드나 칸을 눌러 고릅니다.',
  onSelectionChange,
}: HeapIndexExplorerProps) {
  const valid = isValidHeapExplorerValues(values)
  const safeInitial = Number.isInteger(initialSelectedIndex)
    && initialSelectedIndex >= 0 && initialSelectedIndex < values.length
    ? initialSelectedIndex : 0
  const [selectedIndex, setSelectedIndex] = useState(safeInitial)
  const [treeFocus, setTreeFocus] = useState(safeInitial)
  const [arrayFocus, setArrayFocus] = useState(safeInitial)
  const treeButtons = useRef<(HTMLButtonElement | null)[]>([])
  const arrayButtons = useRef<(HTMLButtonElement | null)[]>([])

  if (!valid) {
    return <p role="alert" className="heap-index-explorer__error">유효한 최소 힙 데이터를 표시할 수 없습니다.</p>
  }

  const selected = Math.min(selectedIndex, values.length - 1)
  const relation = getHeapIndexRelation(selected, values.length)
  const related = new Set([relation.parent, relation.left, relation.right].filter((value): value is number => value !== null))
  const activeTreeFocus = Math.min(treeFocus, values.length - 1)
  const activeArrayFocus = Math.min(arrayFocus, values.length - 1)

  function select(index: number) {
    if (!Number.isInteger(index) || index < 0 || index >= values.length) return
    setSelectedIndex(index)
    onSelectionChange?.(index)
  }

  function onTreeArrow(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    const next = nextHeapTreeFocus(index, values.length, event.key)
    setTreeFocus(next)
    treeButtons.current[next]?.focus()
  }

  function onArrayArrow(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const next = nextHeapArrayFocus(index, values.length, event.key)
    setArrayFocus(next)
    arrayButtons.current[next]?.focus()
  }

  return (
    <details className="heap-index-explorer" open>
      <summary className="heap-index-explorer__summary">
        <span>{title}</span><span className="heap-index-explorer__chevron" aria-hidden="true" />
      </summary>
      <div className="heap-index-explorer__content">
        <p className="heap-index-explorer__instruction">{description}</p>
        <div className="heap-index-explorer__tree-viewport" role="region" aria-label="완전 이진 트리">
          <div
            className="heap-index-explorer__tree"
            role="group"
            aria-label="트리 노드: 화살표 키로 이동, Enter 또는 스페이스로 선택"
            style={{ width: HEAP_TREE_WIDTH, height: heapExplorerHeight(values.length) }}
          >
            <svg className="heap-index-explorer__edges" width={HEAP_TREE_WIDTH} height={heapExplorerHeight(values.length)} viewBox={`0 0 ${HEAP_TREE_WIDTH} ${heapExplorerHeight(values.length)}`} aria-hidden="true">
              {values.map((_, index) => {
                if (index === 0) return null
                const edge = heapTreeEdge(Math.floor((index - 1) / 2), index)
                return <line key={index} x1={edge.from.x} y1={edge.from.y} x2={edge.to.x} y2={edge.to.y} />
              })}
            </svg>
            {values.map((value, index) => {
              const point = heapExplorerPosition(index)
              const state = index === selected ? 'selected' : related.has(index) ? 'related' : 'normal'
              return <button
                key={index}
                ref={(button) => { treeButtons.current[index] = button }}
                type="button"
                className="heap-index-explorer__tree-node"
                data-heap-index-node={index}
                data-state={state}
                style={{ left: point.x, top: point.y, width: HEAP_NODE_SIZE, height: HEAP_NODE_SIZE }}
                aria-label={`트리 ${index}번 노드, 값 ${value}`}
                aria-pressed={index === selected}
                tabIndex={index === activeTreeFocus ? 0 : -1}
                onFocus={() => setTreeFocus(index)}
                onKeyDown={(event) => onTreeArrow(event, index)}
                onClick={() => select(index)}
              >{value}</button>
            })}
          </div>
        </div>

        <section className="heap-index-explorer__array-section" aria-label="트리의 배열 표현">
          <h3 className="heap-index-explorer__array-title">배열</h3>
          <div className="heap-index-explorer__array-viewport">
            <div className="heap-index-explorer__array" role="group" aria-label="배열 칸: 왼쪽 또는 오른쪽 화살표 키로 이동, Enter 또는 스페이스로 선택">
              {values.map((value, index) => {
                const state = index === selected ? 'selected' : related.has(index) ? 'related' : 'normal'
                return <div className="heap-index-explorer__array-item" key={index}>
                  <button
                    ref={(button) => { arrayButtons.current[index] = button }}
                    type="button"
                    className="heap-index-explorer__array-cell"
                    data-heap-index-cell={index}
                    data-state={state}
                    aria-label={`배열 ${index}번 칸, 값 ${value}`}
                    aria-pressed={index === selected}
                    tabIndex={index === activeArrayFocus ? 0 : -1}
                    onFocus={() => setArrayFocus(index)}
                    onKeyDown={(event) => onArrayArrow(event, index)}
                    onClick={() => select(index)}
                  >{value}</button>
                  <span className="heap-index-explorer__array-index" aria-hidden="true">{index}</span>
                </div>
              })}
            </div>
          </div>
        </section>

        <div className="heap-index-explorer__relations" role="status" aria-live="polite" aria-atomic="true">
          <p className="heap-index-explorer__selected">고른 칸: {selected}번 ({values[selected]})</p>
          <p>부모 {relation.parent === null
            ? ': 없음 (루트 노드)'
            : `(${selected} − 1) ÷ 2의 몫 = ${relation.parent}번 칸 (${values[relation.parent]})`}
          </p>
          <p>왼쪽 자식 {relation.left === null
            ? `: 없음 (계산한 인덱스 ${selected * 2 + 1}이 배열 범위를 벗어납니다)`
            : `2 × ${selected} + 1 = ${relation.left}번 칸 (${values[relation.left]})`}
          </p>
          <p>오른쪽 자식 {relation.right === null
            ? `: 없음 (계산한 인덱스 ${selected * 2 + 2}가 배열 범위를 벗어납니다)`
            : `2 × ${selected} + 2 = ${relation.right}번 칸 (${values[relation.right]})`}
          </p>
        </div>
      </div>
    </details>
  )
}
