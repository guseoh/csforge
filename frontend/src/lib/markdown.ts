const FENCED_CODE_PATTERN = /```[\s\S]*?```/g
const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g

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
