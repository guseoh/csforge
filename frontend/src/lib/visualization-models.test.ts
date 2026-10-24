import { describe, expect, it } from 'vitest'
import { buildMinHeap, heapDiagramSize, heapOperation, heapPosition, isMinHeap, passByValueFrames, tcpHandshakeFrames } from './visualization-models'

const common = { version: 1 as const, title: '도식', description: '설명' }

describe('pass-by-value state truth', () => {
  it('copies the reference value without changing the caller and resets reproducibly', () => {
    const data = { ...common, type: 'java-pass-by-value' as const, initialName: 'kim', replacementName: 'park' }
    const frames = passByValueFrames(data)
    expect(frames.map((f) => f.parameter)).toEqual([null, 'A', 'B', 'B', null])
    expect(frames.every((f) => f.caller === 'A' && f.a === 'kim')).toBe(true)
    expect(frames[0].b).toBeNull()
    expect(frames[2].b?.name).toBeNull()
    expect(frames[3].b?.name).toBe('park')
    expect(passByValueFrames(data)).toEqual(frames)
    expect([...frames].reverse().reverse()).toEqual(frames)
  })
})

describe('TCP handshake protocol states', () => {
  it('distinguishes the final ACK in flight from its receipt at the server', () => {
    const frames = tcpHandshakeFrames({ ...common, type: 'tcp-handshake', clientIsn: 100, serverIsn: 300 })
    expect(frames.map((f) => [f.client, f.server])).toEqual([
      ['CLOSED', 'LISTEN'], ['SYN-SENT', 'LISTEN'], ['SYN-SENT', 'SYN-RECEIVED'],
      ['ESTABLISHED', 'SYN-RECEIVED'], ['ESTABLISHED', 'ESTABLISHED'],
    ])
    expect(frames[2].messages[1].text).toBe('SYN, ACK · seq=300 · ack=101')
    expect(frames[3].messages[2].text).toBe('ACK · seq=101 · ack=301')
    expect(frames[4].active).toBe(-1)
  })
  it('wraps 32-bit sequence numbers', () => {
    const frames = tcpHandshakeFrames({ ...common, type: 'tcp-handshake', clientIsn: 4_294_967_295, serverIsn: 4_294_967_295 })
    expect(frames[2].messages[1].text).toContain('ack=0')
    expect(frames[3].messages[2].text).toBe('ACK · seq=0 · ack=0')
  })
})

describe('interactive min heap', () => {
  it('has exact array/tree index correspondence and non-overlapping positions', () => {
    const positions = Array.from({ length: 15 }, (_, index) => heapPosition(index))
    expect(new Set(positions.map((p) => `${p.x},${p.y}`)).size).toBe(15)
    positions.slice(1).forEach((point, i) => expect(point.y).toBeGreaterThan(positions[Math.floor(i / 2)].y))
    expect(positions[0].x).toBe(360)
    for (let size = 1; size <= 15; size++) {
      const canvas = heapDiagramSize(size)
      const points = Array.from({ length: size }, (_, i) => heapPosition(i, canvas.width))
      expect(points.every((p) => p.x >= 24 && p.x <= canvas.width - 24 && p.y + 48 <= canvas.height)).toBe(true)
    }
    expect(heapDiagramSize(3)).toEqual({ width: 320, height: 188 })
  })

  it('shows real comparisons/swaps and keeps prior snapshots immutable', () => {
    const initial = [10, 30, 20]
    const frames = heapOperation(initial, { type: 'offer', value: 5 })
    expect(frames.some((f) => f.explanation.includes('비교'))).toBe(true)
    expect(frames.filter((f) => f.explanation.includes('교환'))).toHaveLength(2)
    expect(frames[0].values).toEqual([10, 30, 20, 5])
    expect(frames.at(-1)!.values).toEqual([5, 10, 20, 30])
    expect(initial).toEqual([10, 30, 20])
    expect(frames.at(-1)!.settled).toBe(true)
    expect(heapOperation(initial, { type: 'offer', value: 5 })).toEqual(frames)
  })

  it('offers and polls in forward learning order while retaining the settled result', () => {
    const offered = heapOperation([10, 30, 20], { type: 'offer', value: 5 })
    expect(offered.map((frame) => frame.values)).toEqual([
      [10, 30, 20, 5], [10, 30, 20, 5], [10, 5, 20, 30],
      [10, 5, 20, 30], [5, 10, 20, 30], [5, 10, 20, 30],
    ])
    const polled = heapOperation(offered.at(-1)!.values, { type: 'poll' })
    expect(polled.map((frame) => frame.values)).toEqual([
      [30, 10, 20], [30, 10, 20], [30, 10, 20], [10, 30, 20], [10, 30, 20],
    ])
    for (const trace of [offered, polled]) {
      expect(trace[0].settled).toBe(false)
      expect(trace.slice(0, -1).every((frame) => !frame.settled)).toBe(true)
      expect(trace.at(-1)!.settled).toBe(true)
      expect(isMinHeap(trace.at(-1)!.values)).toBe(true)
      const snapshots = trace.map((frame) => [...frame.values])
      for (let cursor = trace.length - 1; cursor >= 0; cursor--) expect(trace[cursor].values).toEqual(snapshots[cursor])
    }
  })

  it('maintains the stable invariant and sorted poll results for duplicate/negative inputs', () => {
    let seed = 276
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed }
    for (let sample = 0; sample < 100; sample++) {
      const values = Array.from({ length: random() % 16 }, () => random() % 199 - 99)
      let heap = buildMinHeap(values)
      expect(isMinHeap(heap)).toBe(true)
      const removed: number[] = []
      while (heap.length) {
        removed.push(heap[0])
        heap = heapOperation(heap, { type: 'poll' }).at(-1)!.values
        expect(isMinHeap(heap)).toBe(true)
      }
      expect(removed).toEqual([...values].sort((a, b) => a - b))
    }
  })

  it('handles empty/single-element polling, bounds and malformed states', () => {
    expect(heapOperation([], { type: 'poll' })[0].explanation).toContain('null')
    expect(heapOperation([7], { type: 'poll' }).at(-1)!.values).toEqual([])
    expect(() => heapOperation([5, 1], { type: 'poll' })).toThrow()
    expect(() => heapOperation(buildMinHeap(Array(15).fill(1)), { type: 'offer', value: 2 })).toThrow()
    expect(() => heapOperation([], { type: 'offer', value: 1.5 })).toThrow()
  })
})
