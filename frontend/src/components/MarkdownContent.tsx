import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { removeDuplicateLeadingHeading } from '../lib/markdown'

interface MarkdownContentProps {
  children: string
  className?: string
  fallback?: ReactNode
  dedupeLeadingHeading?: string
}

const JAVA_KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue',
  'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'if', 'implements',
  'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public',
  'record', 'return', 'sealed', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw',
  'throws', 'transient', 'try', 'var', 'void', 'volatile', 'while', 'yield', 'true', 'false', 'null',
])

const JAVA_TYPES = new Set([
  'ArrayList', 'BigDecimal', 'Boolean', 'Byte', 'Character', 'Class', 'Collection', 'CompletableFuture', 'Double',
  'Duration', 'Exception', 'Float', 'HashMap', 'HashSet', 'Integer', 'Instant', 'Iterable', 'List', 'Long', 'Map',
  'Math', 'Number', 'Object', 'Optional', 'Override', 'RuntimeException', 'Set', 'Short', 'StandardCharsets',
  'Stream', 'String', 'StringBuilder', 'System', 'Thread', 'Throwable', 'TimeUnit', 'UUID', 'Void',
])

function tokenizeJava(source: string): ReactNode[] {
  const tokens: ReactNode[] = []
  let index = 0
  let tokenIndex = 0

  const push = (value: string, className?: string) => {
    if (!value) return
    tokens.push(className
      ? <span key={`java-token-${tokenIndex++}`} className={className}>{value}</span>
      : value)
  }

  while (index < source.length) {
    const remainder = source.slice(index)

    if (remainder.startsWith('//')) {
      const lineEnd = source.indexOf('\n', index)
      const end = lineEnd === -1 ? source.length : lineEnd
      push(source.slice(index, end), 'code-comment')
      index = end
      continue
    }

    if (remainder.startsWith('/*')) {
      const commentEnd = source.indexOf('*/', index + 2)
      const end = commentEnd === -1 ? source.length : commentEnd + 2
      push(source.slice(index, end), 'code-comment')
      index = end
      continue
    }

    if (source[index] === '"' || source[index] === "'") {
      const quote = source[index]
      let end = index + 1
      while (end < source.length) {
        if (source[end] === '\\') {
          end += 2
          continue
        }
        if (source[end] === quote) {
          end += 1
          break
        }
        end += 1
      }
      push(source.slice(index, end), 'code-string')
      index = end
      continue
    }

    if (source[index] === '@') {
      const annotation = remainder.match(/^@[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*/)?.[0]
      if (annotation) {
        push(annotation, 'code-annotation')
        index += annotation.length
        continue
      }
    }

    const number = remainder.match(/^(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*(?:\.\d[\d_]*)?[fFdDlL]?)/)?.[0]
    if (number) {
      push(number, 'code-number')
      index += number.length
      continue
    }

    const identifier = remainder.match(/^[A-Za-z_$][\w$]*/)?.[0]
    if (identifier) {
      const className = JAVA_KEYWORDS.has(identifier)
        ? 'code-keyword'
        : JAVA_TYPES.has(identifier) || /^[A-Z][A-Za-z\d_$]*$/.test(identifier)
          ? 'code-type'
          : undefined
      push(identifier, className)
      index += identifier.length
      continue
    }

    push(source[index])
    index += 1
  }

  return tokens
}

/** Canonical Markdown을 화면 맥락에 맞게 일관된 GFM 콘텐츠로 렌더링한다. */
export function MarkdownContent({ children, className, fallback, dedupeLeadingHeading }: MarkdownContentProps) {
  const markdown = dedupeLeadingHeading ? removeDuplicateLeadingHeading(children, dedupeLeadingHeading) : children
  const content = markdown.trim() ? markdown : fallback
  if (!content) return null

  return (
    <div className={['markdown-content', className].filter(Boolean).join(' ')}>
      {typeof content === 'string'
        ? <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({ className: codeClassName, children: codeChildren }) => {
                const language = codeClassName?.match(/language-([\w-]+)/)?.[1]
                const source = String(codeChildren).replace(/\n$/, '')
                return (
                  <code className={codeClassName} data-language={language}>
                    {language === 'java' ? tokenizeJava(source) : codeChildren}
                  </code>
                )
              },
            }}
          >{content}</ReactMarkdown>
        : content}
    </div>
  )
}
