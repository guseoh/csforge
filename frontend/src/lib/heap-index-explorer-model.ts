/**
 * Selection-only min-heap exploration, independent of the offer/poll animation.
 * Every node is identified by its array index, even when values are duplicated.
 */
import { MAX_HEAP_SIZE } from './learning-visualization'
import { isMinHeap } from './visualization-models'

export const HEAP_EXPLORER_DEMO_VALUES = [1, 3, 2, 7, 4, 5, 9, 8, 10, 6] as const

export interface HeapIndexRelation {
  selected: number
  parent: number | null
  left: number | null
  right: number | null
}

export interface HeapPoint {
  x: number
  y: number
}

export const HEAP_TREE_WIDTH = 460
export const HEAP_NODE_SIZE = 38
const ROOT_X = HEAP_TREE_WIDTH / 2
const ROOT_Y = 27
const LEVEL_GAP = 65

export function isValidHeapExplorerValues(values: readonly number[]): boolean {
  return values.length >= 1
    && values.length <= MAX_HEAP_SIZE
    && values.every((value) => Number.isInteger(value) && value >= -99 && value <= 99)
    && isMinHeap(values)
}

export function getHeapIndexRelation(index: number, length: number): HeapIndexRelation {
  if (!Number.isInteger(length) || length < 1 || !Number.isInteger(index) || index < 0 || index >= length) {
    throw new RangeError('선택한 배열 인덱스가 유효하지 않습니다.')
  }
  const left = index * 2 + 1
  const right = left + 1
  return {
    selected: index,
    parent: index === 0 ? null : Math.floor((index - 1) / 2),
    left: left < length ? left : null,
    right: right < length ? right : null,
  }
}

/**
 * Fixed textbook geometry: the last level has 45px center gaps, so 38px
 * square nodes never overlap, including the full 15-node min heap.
 */
export function heapExplorerPosition(index: number): HeapPoint {
  if (!Number.isInteger(index) || index < 0 || index >= MAX_HEAP_SIZE) {
    throw new RangeError('도식의 노드 인덱스는 0~14여야 합니다.')
  }
  const level = Math.floor(Math.log2(index + 1))
  const slot = index - (2 ** level - 1)
  const slots = 2 ** level
  return {
    x: ROOT_X + (2 * slot + 1 - slots) * (180 / slots),
    y: ROOT_Y + level * LEVEL_GAP,
  }
}

export function heapExplorerHeight(length: number): number {
  if (!Number.isInteger(length) || length < 1 || length > MAX_HEAP_SIZE) {
    throw new RangeError('1~15개의 노드만 표시합니다.')
  }
  return ROOT_Y * 2 + Math.floor(Math.log2(length)) * LEVEL_GAP
}

/** Intersect the center-to-center segment with the perimeters of both square nodes. */
export function heapTreeEdge(parentIndex: number, childIndex: number): { from: HeapPoint; to: HeapPoint } {
  const parent = heapExplorerPosition(parentIndex)
  const child = heapExplorerPosition(childIndex)
  const dx = child.x - parent.x
  const dy = child.y - parent.y
  const unit = (HEAP_NODE_SIZE / 2) / Math.max(Math.abs(dx), Math.abs(dy))
  return {
    from: { x: parent.x + dx * unit, y: parent.y + dy * unit },
    to: { x: child.x - dx * unit, y: child.y - dy * unit },
  }
}

/** Arrow keys move focus only; Enter/Space on native buttons commits selection. */
export function nextHeapTreeFocus(index: number, length: number, key: string): number {
  const { parent, left } = getHeapIndexRelation(index, length)
  const level = Math.floor(Math.log2(index + 1))
  const first = 2 ** level - 1
  const last = Math.min(length - 1, 2 ** (level + 1) - 2)
  switch (key) {
    case 'ArrowUp': return parent ?? index
    case 'ArrowDown': return left ?? index
    case 'ArrowLeft': return index > first ? index - 1 : index
    case 'ArrowRight': return index < last ? index + 1 : index
    default: return index
  }
}

export function nextHeapArrayFocus(index: number, length: number, key: string): number {
  getHeapIndexRelation(index, length)
  if (key === 'ArrowLeft') return Math.max(0, index - 1)
  if (key === 'ArrowRight') return Math.min(length - 1, index + 1)
  return index
}
