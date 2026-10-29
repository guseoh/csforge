import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { arrayStoreFrames, valueReferenceFrames } from './language-type-models'
import { parseVisualization } from './learning-visualization'
import { MarkdownContent } from '../components/MarkdownContent'

describe('Java language type examples', () => {
  it('separates primitive copies, shared mutation and reference reassignment', () => {
    const f = valueReferenceFrames('assignment-copy')
    expect(f[2].variables.map((v) => v.value)).toEqual(['10', '20'])
    expect(f[2].objects).toEqual([])
    expect(f[5].variables.map((v) => v.target)).toEqual(['A', 'A'])
    expect(f[5].objects).toHaveLength(1)
    expect(f[6].objects[0].lines).toContain('name = "lee"')
    expect(f[7].variables.map((v) => v.target)).toEqual(['A', 'B'])
    expect(f[7].objects[1].lines).toContain('name = null')
    expect(f[8].objects.map((o) => o.lines.at(-1))).toEqual(['name = "lee"', 'name = "park"'])
    // Later snapshots do not overwrite the earlier shared object's state.
    expect(f[5].objects[0].lines).toContain('name = "kim"')
    for (const frame of f) for (const v of frame.variables) {
      if (v.target) expect(frame.objects.some((o) => o.id === v.target)).toBe(true)
    }
  })

  it('keeps a final reference distinct from a mutable target and intern return distinct from created', () => {
    const final = valueReferenceFrames('final-list')
    expect(final).toHaveLength(1)
    expect(final[0].variables[0].target).toBe('A')
    expect(final[0].objects[0].lines).toContain('["kim"]')
    const intern = valueReferenceFrames('string-intern')[0]
    expect(Object.fromEntries(intern.variables.map((v) => [v.name, v.target]))).toEqual({
      'String literal = "java"': 'A', 'String pooled': 'A', 'String created': 'B',
    })
    expect(intern.objects).toHaveLength(2)
  })

  it('preserves the successful first store and actual array type after a rejected second store', () => {
    const f = arrayStoreFrames()
    expect(f.map((v) => v.phase)).toEqual(['created', 'aliased', 'accepted', 'checking', 'rejected'])
    expect(f[0].elements).toEqual([null, null])
    expect(f[1].alias).toBe(true)
    expect(f[2].elements).toEqual(['kim', null])
    expect(f[3].elements).toEqual(f[2].elements)
    expect(f[4].elements).toEqual(['kim', null])
    expect(f[0].elements).toEqual([null, null])
    expect(f.every((v) => v.elements.length === 2)).toBe(true)
  })
})

const audit = JSON.parse(readFileSync(new URL('../../../docs/content-audit/issue-277/java.json', import.meta.url), 'utf8')) as {
  concepts: { topicContentKey: string; sourcePath: string; visualizationNeed: string }[]
}
const pack = audit.concepts.filter((c) => c.topicContentKey === 'java.core.language-types')

describe('actual J-language-types Markdown', () => {
  it('covers the exact ten audited concepts', () => { expect(pack).toHaveLength(10) })
  it.each(pack)('preserves Markdown and meets the visualization decision: $sourcePath', (c) => {
    const source = readFileSync(new URL(`../../../${c.sourcePath}`, import.meta.url), 'utf8')
    const body = source.split(/\r?\n---\r?\n/)[1]
    const declarations = [...body.matchAll(/^```csforge-viz\r?\n([\s\S]*?)^```/gm)].map((m) => m[1])
    expect(declarations.length).toBe(c.visualizationNeed === 'NONE' ? 0 : 1)
    for (const declaration of declarations) expect(parseVisualization(declaration)).not.toBeNull()
    const html = renderToStaticMarkup(<MarkdownContent>{body}</MarkdownContent>)
    expect(html).toContain('<strong>')
    expect(html).toContain('코드 복사')
    expect(html).not.toContain('diagram-fallback')
    expect(html).not.toContain('/learning/java/')
    expect(html).not.toContain('csforge-viz')
    expect(html).not.toMatch(/<p>[^<]*\*\*/)
    expect(body).not.toMatch(/[┌┐└┘├┤┬┴│─]/)
  })
})
