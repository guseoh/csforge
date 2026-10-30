import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MarkdownContent } from '../components/MarkdownContent'
import { javaApiScenes } from './java-api-models'
import { parseVisualization } from './learning-visualization'

const root = new URL('../../../content/java/', import.meta.url)
const packs = [['functional', 5, 33], ['streams', 7, 41]] as const

describe('functional and streams content', () => {
  it.each(packs)('%s preserves valid question and concept structure', (topic, conceptCount, questionCount) => {
    const folder = new URL(`${topic}/`, root)
    const files = readdirSync(folder).filter((name) => name.endsWith('.md'))
    expect(files).toHaveLength(conceptCount)
    const keys = new Set(files.map((file) => readFileSync(new URL(file, folder), 'utf8').match(/^contentKey: (.+)$/m)?.[1]))
    const questions = JSON.parse(readFileSync(new URL('questions.json', folder), 'utf8')) as { contentKey: string; conceptKeys: string[]; questionType: string; choices?: { key: string; displayOrder: number }[]; correctChoiceKey?: string }[]
    expect(questions).toHaveLength(questionCount)
    expect(new Set(questions.map((q) => q.contentKey)).size).toBe(questionCount)
    for (const q of questions) {
      expect(q.conceptKeys.length).toBeGreaterThan(0)
      for (const key of q.conceptKeys) expect(keys.has(key)).toBe(true)
      if (q.questionType === 'MULTIPLE_CHOICE') {
        const choices = q.choices ?? []
        expect(new Set(choices.map((c) => c.key)).size).toBe(choices.length)
        expect(new Set(choices.map((c) => c.displayOrder)).size).toBe(choices.length)
        expect(choices.filter((c) => c.key === q.correctChoiceKey)).toHaveLength(1)
      }
    }
  })
  it('renders the four approved declarations and only one stepped example', () => {
    const files = ['functional/lambda-capture-effectively-final.md', 'streams/stream-pipeline-laziness.md', 'streams/stream-map-filter-flatmap.md', 'streams/parallel-stream-tradeoffs.md']
    for (const file of files) {
      const source = readFileSync(new URL(file, root), 'utf8')
      const declaration = source.match(/```csforge-viz\r?\n([\s\S]*?)\r?\n```/)
      expect(declaration, file).not.toBeNull()
      expect(parseVisualization(declaration![1]), file).not.toBeNull()
      const html = renderToStaticMarkup(<MarkdownContent>{source.split(/\r?\n---\r?\n/)[1]}</MarkdownContent>)
      expect(html).not.toContain('diagram-fallback')
      expect(html.includes('도식 단계 조작')).toBe(file.includes('pipeline-laziness'))
    }
    expect(javaApiScenes['stream-laziness']).toHaveLength(4)
    expect(javaApiScenes['stream-laziness'][3].lanes[1][1]).toContain('true')
  })
})
