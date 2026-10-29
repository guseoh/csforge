import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarkdownContent } from '../components/MarkdownContent'
import { javaConcurrencyScenes } from './java-concurrency-models'

const files = ['concurrency-vs-parallelism', 'thread-lifecycle-interruption', 'platform-virtual-thread', 'shared-mutable-state-race', 'synchronized-monitor', 'jmm-happens-before-visibility', 'safe-publication-final-fields', 'volatile', 'atomic-cas', 'locks-reentrantlock-condition', 'executor-task-thread-pools', 'blockingqueue-producer-consumer', 'countdownlatch-coordination', 'semaphore-permits', 'threadlocal-context', 'scoped-value-context', 'future-completablefuture', 'deadlock-starvation-livelock']

describe('fixed concurrency executions', () => {
  it.each(files)('renders %s with controls for state traces', (file) => {
    const source = readFileSync(new URL(`../../../content/java/concurrency/${file}.md`, import.meta.url), 'utf8')
    const html = renderToStaticMarkup(<MarkdownContent>{source.split(/\r?\n---\r?\n/)[1]}</MarkdownContent>)
    expect(html, file).toContain('diagram-canvas')
    expect(html, file).not.toContain('diagram-fallback')
    expect(html.includes('도식 단계 조작'), file).toBe(file !== 'concurrency-vs-parallelism')
  })

  it('never mounts two virtual threads on one carrier in a snapshot', () => {
    for (const scene of javaConcurrencyScenes['virtual-carrier']) {
      expect(scene.graph.edges.filter((edge) => edge.to === 'carrier')).toHaveLength(1)
    }
    expect(javaConcurrencyScenes['virtual-carrier'][2].note).toContain('보장은 없습니다')
  })

  it('distinguishes program order from the conditional synchronizes-with edge', () => {
    const scenes = javaConcurrencyScenes['happens-before']
    expect(scenes[0].graph.edges.some((edge) => edge.label === 'synchronizes-with')).toBe(false)
    expect(scenes[1].graph.edges.map(({ from, to, label }) => [from, to, label])).toEqual([
      ['write', 'publish', 'program order'], ['publish', 'observe', 'synchronizes-with'], ['observe', 'read', 'program order'],
    ])
  })

  it('keeps CAS failure distinct from a successful retry', () => {
    const scenes = javaConcurrencyScenes['cas-retry']
    expect(scenes[1].graph.nodes.find((node) => node.id === 'b')?.lines).toContain('false · 변경 없음')
    expect(scenes[2].graph.nodes.find((node) => node.id === 'value')?.lines).toContain('current = 2')
    expect(javaConcurrencyScenes['condition-await'][2].note).toContain('재획득')
  })

  it('keeps stable node identities, finite coordinates and unobstructed relation paths', () => {
    for (const scenes of Object.values(javaConcurrencyScenes)) for (const { graph } of scenes) {
      expect(new Set(graph.nodes.map((node) => node.id)).size).toBe(graph.nodes.length)
      for (const edge of graph.edges) {
        const from = graph.nodes.find((node) => node.id === edge.from)!
        const to = graph.nodes.find((node) => node.id === edge.to)!
        expect(from).toBeDefined()
        expect(to).toBeDefined()
        expect(from.id).not.toBe(to.id)
        for (let step = 1; step < 100; step++) {
          const x = from.column * 390 + (to.column - from.column) * 390 * step / 100
          const y = from.row * 145 + (to.row - from.row) * 145 * step / 100
          for (const node of graph.nodes.filter((candidate) => candidate !== from && candidate !== to)) {
            expect(Math.abs(x - node.column * 390) < 125 && Math.abs(y - node.row * 145) < 34, `${edge.from} → ${edge.to} through ${node.id}`).toBe(false)
          }
        }
      }
    }
  })
})
