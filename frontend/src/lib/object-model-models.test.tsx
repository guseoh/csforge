import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { defensiveCopyFrames, dispatchFrames, initializationFrames } from './object-model-models'
import { parseVisualization } from './learning-visualization'
import { MarkdownContent } from '../components/MarkdownContent'

describe('Java object model snapshots', () => {
  it('separates prologue, delegation, superclass, source-order initialization and epilogues', () => {
    expect(initializationFrames.map((f) => f.name)).toEqual(['null', 'null', 'null', 'null', 'unset', 'unset', 'kim', 'kim'])
    expect(initializationFrames.map((f) => [f.fields, f.blocks])).toEqual([[0, 0], [0, 0], [0, 0], [0, 0], [1, 0], [1, 1], [1, 1], [1, 1]])
    expect(initializationFrames.at(-1)?.output).toEqual(['noarg prologue', 'target prologue', 'parent', 'field', 'block:unset', 'target epilogue:kim', 'noarg epilogue'])
    expect(initializationFrames[0].output).toEqual([])
    for (let i = 1; i < initializationFrames.length; i++) expect(initializationFrames[i].output.slice(0, -1)).toEqual(initializationFrames[i - 1].output)
  })
  it('maps each initialization frame to the actual Markdown example and its cumulative output', () => {
    const source = readFileSync(new URL('../../../content/java/object-model/initialization-order-constructor-chaining.md', import.meta.url), 'utf8')
    const example = [...source.matchAll(/```java\r?\n([\s\S]*?)```/g)].map((match) => match[1]).find((code) => code.includes('noarg prologue'))
    expect(example).toBeDefined()
    const steps = [
      ['기본값', ['new Child();'], []],
      ['Child() 전반부', ['System.out.println("noarg prologue");', 'this("kim");'], ['noarg prologue']],
      ['Child(String) 전반부', ['if (name == null) throw new IllegalArgumentException();', 'System.out.println("target prologue");'], ['noarg prologue', 'target prologue']],
      ['Parent() 실행', ['super();', 'Parent() { System.out.println("parent"); }'], ['noarg prologue', 'target prologue', 'parent']],
      ['Child 필드 초기화 식', ['String name = initialName();'], ['noarg prologue', 'target prologue', 'parent', 'field']],
      ['Child 인스턴스 초기화 블록', ['{ System.out.println("block:" + name); }'], ['noarg prologue', 'target prologue', 'parent', 'field', 'block:unset']],
      ['Child(String) 후반부', ['this.name = name;', 'System.out.println("target epilogue:" + this.name);'], ['noarg prologue', 'target prologue', 'parent', 'field', 'block:unset', 'target epilogue:kim']],
      ['Child() 후반부', ['System.out.println("noarg epilogue");'], ['noarg prologue', 'target prologue', 'parent', 'field', 'block:unset', 'target epilogue:kim', 'noarg epilogue']],
    ] as const
    expect(initializationFrames).toHaveLength(steps.length)
    steps.forEach(([location, statements, output], index) => {
      const frame = initializationFrames[index]
      expect(frame.location).toBe(location)
      expect(frame.code.split('\n')).toEqual(statements)
      for (const statement of statements) expect(example).toContain(statement)
      expect(frame.output).toEqual(output)
    })
    expect(example).toContain('System.out.println("field");')
    expect(example).toContain('return "unset";')
  })
  it('keeps static call checking separate from the same invocation dispatch and output', () => {
    expect(dispatchFrames.map((f) => f.result)).toEqual(['아직 실행 전', 'Dog.sound() 선택', 'dog'])
  })
  it('separates list structure from shared mutable elements and preserves state on rejected add', () => {
    expect(defensiveCopyFrames.map((f) => f.copied)).toEqual([false, false, true, true, true, true])
    expect(defensiveCopyFrames[3].expanded).toBe(true)
    expect(defensiveCopyFrames[3].member).toBe('kim')
    expect(defensiveCopyFrames[4].member).toBe('park')
    expect(defensiveCopyFrames[5]).toMatchObject({ shared: true, copied: true, expanded: true, member: 'park', rejected: true })
    expect(defensiveCopyFrames[0]).toMatchObject({ expanded: false, member: 'kim' })
  })
})

const audit = JSON.parse(readFileSync(new URL('../../../docs/content-audit/issue-277/java.json', import.meta.url), 'utf8')) as {
  concepts: { topicContentKey: string; sourcePath: string; visualizationNeed: string; targetTier: string }[]
}
const pack = audit.concepts.filter((c) => c.topicContentKey === 'java.core.object-model')
describe('actual J-object-model Pack', () => {
  it('covers twelve concepts with exactly four V1 and three V2 decisions', () => {
    expect(pack).toHaveLength(12)
    expect(pack.filter((c) => c.targetTier === 'V1')).toHaveLength(4)
    expect(pack.filter((c) => c.targetTier === 'V2')).toHaveLength(3)
  })
  it.each(pack)('renders and meets its audit decision: $sourcePath', (c) => {
    const source = readFileSync(new URL(`../../../${c.sourcePath}`, import.meta.url), 'utf8')
    const body = source.split(/\r?\n---\r?\n/)[1]
    const declarations = [...body.matchAll(/^```csforge-viz\r?\n([\s\S]*?)^```/gm)]
    expect(declarations).toHaveLength(c.visualizationNeed === 'NONE' ? 0 : 1)
    for (const d of declarations) expect(parseVisualization(d[1])).not.toBeNull()
    const html = renderToStaticMarkup(<MarkdownContent>{body}</MarkdownContent>)
    expect(html).toContain('<strong>')
    expect(html).toContain('코드 복사')
    expect(html).not.toContain('diagram-fallback')
    expect(html).not.toContain('csforge-viz')
    expect(body).not.toMatch(/^```text\r?\n|[┌┐└┘├┤┬┴│─]/m)
    expect(html).not.toMatch(/<p>[^<]*\*\*/)
    expect((html.match(/도식 단계 조작/g) ?? []).length).toBe(c.targetTier === 'V2' ? 1 : 0)
  })
})
