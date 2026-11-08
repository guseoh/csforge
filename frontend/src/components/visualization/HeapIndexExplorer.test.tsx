import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  HEAP_EXPLORER_DEMO_VALUES,
  getHeapIndexRelation,
  heapExplorerHeight,
  heapExplorerPosition,
  heapTreeEdge,
  isValidHeapExplorerValues,
  nextHeapArrayFocus,
  nextHeapTreeFocus,
} from '../../lib/heap-index-explorer-model'
import { HeapIndexExplorer } from './HeapIndexExplorer'

describe('HeapIndexExplorer model', () => {
  it('preserves the screenshot array and correct minimum heap invariant', () => {
    expect(HEAP_EXPLORER_DEMO_VALUES).toEqual([1, 3, 2, 7, 4, 5, 9, 8, 10, 6])
    expect(isValidHeapExplorerValues(HEAP_EXPLORER_DEMO_VALUES)).toBe(true)
    expect(isValidHeapExplorerValues([1, 1, 2])).toBe(true)
    expect(isValidHeapExplorerValues([5, 1, 3])).toBe(false)
    expect(isValidHeapExplorerValues([])).toBe(false)
    expect(isValidHeapExplorerValues(Array(16).fill(1))).toBe(false)
    expect(isValidHeapExplorerValues([1, Number.NaN])).toBe(false)
  })

  it('calculates selected, parent, left and right index within bounds', () => {
    expect(getHeapIndexRelation(1, 10)).toEqual({ selected: 1, parent: 0, left: 3, right: 4 })
    expect(getHeapIndexRelation(0, 10)).toEqual({ selected: 0, parent: null, left: 1, right: 2 })
    expect(getHeapIndexRelation(4, 10)).toEqual({ selected: 4, parent: 1, left: 9, right: null })
    expect(getHeapIndexRelation(9, 10)).toEqual({ selected: 9, parent: 4, left: null, right: null })
    expect(() => getHeapIndexRelation(10, 10)).toThrow(RangeError)
  })

  it('keeps 15 nodes separate and edge endpoints on box boundaries', () => {
    const positions = Array.from({ length: 15 }, (_, index) => heapExplorerPosition(index))
    expect(positions[0].x).toBe(230)
    expect(positions[0].y).toBe(27)
    expect(new Set(positions.map((p) => p.x + ':' + p.y)).size).toBe(15)
    for (let i = 1; i < 15; i++) {
      const { from, to } = heapTreeEdge(Math.floor((i - 1) / 2), i)
      expect(to.y).toBeGreaterThan(from.y)
      expect(from.x).toBeGreaterThanOrEqual(0)
      expect(to.x).toBeLessThanOrEqual(460)
    }
    expect(heapExplorerHeight(1)).toBe(54)
    expect(heapExplorerHeight(10)).toBe(249)
  })

  it('uses arrow keys for focus navigation without modifying selection', () => {
    expect(nextHeapTreeFocus(1, 10, 'ArrowUp')).toBe(0)
    expect(nextHeapTreeFocus(1, 10, 'ArrowDown')).toBe(3)
    expect(nextHeapTreeFocus(2, 10, 'ArrowLeft')).toBe(1)
    expect(nextHeapTreeFocus(2, 10, 'ArrowRight')).toBe(2)
    expect(nextHeapTreeFocus(4, 10, 'ArrowDown')).toBe(9)
    expect(nextHeapTreeFocus(9, 10, 'ArrowDown')).toBe(9)
    expect(nextHeapArrayFocus(9, 10, 'ArrowRight')).toBe(9)
    expect(nextHeapArrayFocus(9, 10, 'ArrowLeft')).toBe(8)
  })
})

describe('HeapIndexExplorer initial rendering', () => {
  it('renders the requested 10-node diagram with synchronized selection and formulas', () => {
    const html = renderToStaticMarkup(<HeapIndexExplorer />)
    expect(html).toContain('노드나 칸을 눌러 고릅니다.')
    expect((html.match(/data-heap-index-node=/g) || [])).toHaveLength(10)
    expect((html.match(/data-heap-index-cell=/g) || [])).toHaveLength(10)
    expect((html.match(/aria-pressed="true"/g) || [])).toHaveLength(2)
    expect(html).toContain('고른 칸: 1번 (3)')
    expect(html).toContain('2 × 1 + 1 = 3번 칸 (7)')
    expect(html).toContain('2 × 1 + 2 = 4번 칸 (4)')
    expect(html).toContain('data-heap-index-node="1" data-state="selected"')
    expect(html).toContain('data-heap-index-cell="1" data-state="selected"')
    expect(html).toContain('<details')
  })

  it('identifies nodes by index rather than duplicate value and supports missing children', () => {
    const html = renderToStaticMarkup(<HeapIndexExplorer values={[1, 1, 2]} initialSelectedIndex={2} />)
    expect(html).toContain('고른 칸: 2번 (2)')
    expect(html).toContain('왼쪽 자식 : 없음')
    expect(html).toContain('오른쪽 자식 : 없음')
  })

  it('fails safely without adjusting invalid data into a different heap', () => {
    const html = renderToStaticMarkup(<HeapIndexExplorer values={[7, 1]} />)
    expect(html).toContain('role="alert"')
    expect(html).not.toContain('data-heap-index-node=')
  })
})
