import type { Root, RootContent } from 'mdast'

/** CommonMark에서 닫는 구두점과 한글 조사 사이에 남은 강조만 복원한다. */
export function remarkKoreanStrong() {
  return (tree: Root, file: { value: unknown }) => {
    const source = String(file.value)
    const visit = (parent: { children: RootContent[] }) => {
      parent.children = parent.children.flatMap((node): RootContent[] => {
        // Link destinations, HTML, code and existing emphasis are never reparsed.
        if (node.type === 'strong' || node.type === 'emphasis') return [node]
        if ('children' in node) visit(node)
        if (node.type !== 'text') return [node]
        const start = node.position?.start.offset
        const end = node.position?.end.offset
        // Decoded escapes/entities carry intentional literal meaning. Leave them intact.
        if (start === undefined || end === undefined || source.slice(start, end) !== node.value) return [node]

        const parts: RootContent[] = []
        let offset = 0
        const pattern = /\*\*([^\s*`\\][^*`\\\n]*[\p{P}\p{S}])\*\*(?=[가-힣])/gu
        for (const match of node.value.matchAll(pattern)) {
          const index = match.index
          if (index > 0 && !/[\s\p{P}]/u.test(node.value[index - 1])) continue
          if (index > offset) parts.push({ type: 'text', value: node.value.slice(offset, index) })
          parts.push({ type: 'strong', children: [{ type: 'text', value: match[1] }] })
          offset = index + match[0].length
        }
        if (offset === 0) return [node]
        if (offset < node.value.length) parts.push({ type: 'text', value: node.value.slice(offset) })
        return parts
      })
    }
    visit(tree)
  }
}
