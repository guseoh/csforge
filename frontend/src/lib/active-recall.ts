/** A recall prompt is sourced from an existing published Concept section, not generated as a new canonical Question. */
export interface ActiveRecallPrompt {
  sourceHeading: string | null
  prompt: string
  guideMarkdown: string
}

const SECTION_HEADING = /^(#{2,3})\s+(.+?)\s*#*\s*$/
const EXCLUDED_HEADING = /면접|참고|함께 볼|관련 자료|연습 문제|목차|출처|더 읽기|Q[.&]\s/
const FOCUSED_HEADING = /원리|동작|작동|실행|흐름|비교|차이|왜|문제|구분|사례|상황|규칙|오해|주의|장애|실패|전달/

/** Only reveal a real canonical passage after the learner attempts recall. */
export function selectActiveRecallPrompt(markdown: string): ActiveRecallPrompt | null {
  const normalized = markdown.replace(/\r\n?/g, '\n')
  const lines = normalized.split('\n')
  const sections: Array<{ heading: string; markdown: string; score: number }> = []
  let fence = false
  const headers: Array<{ index: number; level: number; title: string }> = []

  lines.forEach((line, index) => {
    if (/^\s*```/.test(line)) {
      fence = !fence
      return
    }
    if (fence) return
    const match = line.match(SECTION_HEADING)
    if (match && !EXCLUDED_HEADING.test(match[2])) {
      headers.push({ index, level: match[1].length, title: match[2].trim() })
    }
  })

  headers.forEach((header) => {
    let end = lines.length
    let inFence = false
    for (let i = header.index + 1; i < lines.length; i += 1) {
      if (/^\s*```/.test(lines[i])) {
        inFence = !inFence
        continue
      }
      if (inFence) continue
      const match = lines[i].match(/^(#{1,3})\s+/)
      if (match && match[1].length <= header.level) {
        end = i
        break
      }
    }
    const passage = lines.slice(header.index + 1, end).join('\n').trim()
    // Ignore sections that contain only headings, an image, or a short definition.
    const plain = passage.replace(/```[\s\S]*?```/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').trim()
    if (plain.length < 80) return
    sections.push({ heading: header.title, markdown: passage, score: FOCUSED_HEADING.test(header.title) ? 1 : 0 })
  })

  const chosen = sections.find((section) => section.score > 0) ?? sections[0]
  if (chosen) {
    return {
      sourceHeading: chosen.heading,
      prompt: `‘${chosen.heading}’ 부분에서 설명한 원리와 판단 근거를 예시와 함께 자신의 말로 설명해 보세요.`,
      guideMarkdown: chosen.markdown,
    }
  }

  // Documents without subheadings use their existing introductory prose, not an invented answer.
  const body = normalized
    .replace(/^#\s+[^\n]+\n?/, '')
    .split(/\n\s*\n/)
    .filter((paragraph) => !/^\s*(?:```|!\[|\|)/.test(paragraph.trim()))
    .slice(0, 2).join('\n\n').trim()
  if (body.length < 80) return null
  return {
    sourceHeading: null,
    prompt: '본문에서 설명한 문제 상황과 핵심 원리를 예시와 함께 자신의 말로 정리해 보세요.',
    guideMarkdown: body,
  }
}
