import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarkdownContent } from '../components/MarkdownContent'
import { javaRuntimeScenes } from './java-runtime-models'
import { javaMetadataScenes } from './java-metadata-models'

const runtime = ['jdk-jvm-classfile', 'bytecode-javap', 'class-loading-linking-initialization', 'classloader-delegation-type-identity', 'jvm-runtime-data-areas-frames', 'gc-reachability-roots', 'reference-strengths', 'gc-fundamentals-collectors', 'java-memory-leaks', 'heap-metaspace-native-thread-memory', 'jit-hotspot-warmup']
const metadata = ['dynamic-proxy-invocationhandler', 'annotation-processing-vs-reflection', 'serialization-contract-risk', 'jpms-classpath-modulepath', 'binary-compatibility-api-evolution']

describe('JVM and metadata relations', () => {
  it.each([...runtime.map((name) => `jvm-runtime/${name}`), ...metadata.map((name) => `metadata-compatibility/${name}`)])('renders %s', (file) => {
    const source = readFileSync(new URL(`../../../content/java/${file}.md`, import.meta.url), 'utf8')
    const html = renderToStaticMarkup(<MarkdownContent>{source.split(/\r?\n---\r?\n/)[1]}</MarkdownContent>)
    expect(html, file).toContain('learning-visualization')
    expect(html, file).toMatch(/(?:role="img"|aria-label="[^"]+")/)
    expect(html, file).not.toContain('diagram-fallback')
  })

  it('removes only the root path and preserves the isolated cycle without claiming collection', () => {
    const scenes = javaRuntimeScenes['gc-roots']
    expect(scenes[0].graph.edges.some((edge) => edge.from === 'cache' && edge.to === 'a')).toBe(true)
    expect(scenes[1].graph.edges.map(({ from, to }) => [from, to])).toEqual([['root', 'cache'], ['a', 'b'], ['b', 'a']])
    expect(scenes[1].graph.nodes.map((node) => node.id)).toContain('a')
    expect(scenes[1].note).toContain('즉시 수거')
  })

  it('tracks operand values without replacing the locals or JIT execution model', () => {
    const scenes = javaRuntimeScenes['bytecode-stack']
    expect(scenes.slice(0, 4).map((scene) => scene.graph.nodes.find((node) => node.id === 'operand')?.lines[1])).toEqual(['[]', '[3]', '[3, 4] · 오른쪽이 top', '[7]'])
    expect(scenes[4].graph.edges).toEqual([{ from: 'frame', to: 'caller', label: 'int 반환', dashed: false }])
  })

  it('returns proxy results to the caller and retains the checked exception boundary', () => {
    expect(javaMetadataScenes['dynamic-proxy'][3].graph.edges.map(({ from, to }) => [from, to])).toEqual([['target', 'handler'], ['handler', 'caller']])
    expect(javaMetadataScenes['dynamic-proxy'][4].note).toContain('UndeclaredThrowableException')
    expect(javaRuntimeScenes['class-initialization'][3].note).toContain('초기화 이후')
  })

  it('keeps all relation paths outside unrelated nodes', () => {
    for (const scenes of Object.values({ ...javaRuntimeScenes, ...javaMetadataScenes })) for (const { graph } of scenes) {
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
