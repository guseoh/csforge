const FENCED_CODE_PATTERN = /```[\s\S]*?```/g
const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g
const ATX_HEADING_PATTERN = /^ {0,3}#{1,6}(?:[ \t]+|$)(.*?)[ \t]*#*[ \t]*$/

function normalizeHeading(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

/** 제목을 화면 shell이 소유할 때 동일한 canonical 선행 heading만 표현 계층에서 제거한다. */
export function removeDuplicateLeadingHeading(markdown: string, title: string) {
  const lines = markdown.split(/\r?\n/)
  const firstContentLine = lines.findIndex((line) => line.trim().length > 0)
  if (firstContentLine < 0) return markdown

  const headingMatch = lines[firstContentLine].match(ATX_HEADING_PATTERN)
  if (!headingMatch || normalizeHeading(headingMatch[1]) !== normalizeHeading(title)) return markdown

  let contentStart = firstContentLine + 1
  if (lines[contentStart]?.trim() === '') contentStart += 1
  const separator = markdown.includes('\r\n') ? '\r\n' : '\n'
  return [...lines.slice(0, firstContentLine), ...lines.slice(contentStart)].join(separator)
}

/** 목록 행에서도 Markdown 문법이 노출되지 않도록 짧은 텍스트 미리보기를 만든다. */
export function compactMarkdownPreview(markdown: string, maxLength = 180) {
  const normalized = markdown
    .replace(HTML_COMMENT_PATTERN, ' ')
    .replace(FENCED_CODE_PATTERN, ' 코드 블록 ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s*\|?(?:\s*:?-+:?\s*\|)+\s*$/gm, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/gm, '')
    .replace(/[`*_~]/g, '')
    .replace(/\|/g, ' · ')
    .replace(/(?:\s*·\s*){2,}/g, ' · ')
    .replace(/\s+/g, ' ')
    .replace(/^\s*·\s+/, '')
    .replace(/\s+·\s*$/, '')
    .trim()

  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}
