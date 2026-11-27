import { renderToStaticMarkup } from 'react-dom/server'
import type { Components } from 'react-markdown'
import { describe, expect, it, vi } from 'vitest'

const captured = vi.hoisted(() => [] as Components[])

vi.mock('react-markdown', () => ({
  default: ({ components }: { components: Components }) => {
    captured.push(components)
    return null
  },
}))

const { MarkdownContent } = await import('./MarkdownContent')

describe('MarkdownContent renderer identity', () => {
  it('passes the same image, code, pre and table renderers on every render', () => {
    // A renderer recreated per render is a new React component type and remounts the
    // rendered subtree; on the Reader that replaced image triggers and closed open dialogs.
    const markdown = '![RANGE와 ROWS 비교](/learning/database/sql-window-frame.svg)\n\n```sql\nSELECT 1;\n```'
    renderToStaticMarkup(<MarkdownContent>{markdown}</MarkdownContent>)
    renderToStaticMarkup(<MarkdownContent>{markdown}</MarkdownContent>)

    expect(captured).toHaveLength(2)
    const [first, second] = captured
    for (const tag of ['img', 'code', 'pre', 'table'] as const) {
      expect(first[tag], tag).toBeTypeOf('function')
      expect(second[tag], tag).toBe(first[tag])
    }
  })
})
