import { isValidElement, useState, type ReactNode } from 'react'

interface MarkdownCodeBlockProps {
  children: ReactNode
}

const LANGUAGE_LABELS: Record<string, string> = {
  java: 'Java',
  sql: 'SQL',
  bash: 'Bash',
  shell: 'Shell',
  sh: 'Shell',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  http: 'HTTP',
  xml: 'XML',
  text: '텍스트',
  plaintext: '텍스트',
}

function plainText(value: ReactNode): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.map(plainText).join('')
  if (isValidElement<{ children?: ReactNode }>(value)) return plainText(value.props.children)
  return ''
}

/** 코드 텍스트의 의미를 바꾸지 않고 복사·줄바꿈·가로 스크롤을 제공한다. */
export function MarkdownCodeBlock({ children }: MarkdownCodeBlockProps) {
  const [wrapped, setWrapped] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const code = Array.isArray(children) ? children[0] : children
  const codeClassName = isValidElement<{ className?: string }>(code) ? code.props.className : undefined
  const language = codeClassName?.match(/(?:^|\s)language-([\w-]+)/)?.[1]?.toLowerCase() ?? 'text'
  const label = LANGUAGE_LABELS[language] ?? '텍스트'
  const source = plainText(children).replace(/\n$/, '')

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(source)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  return (
    <div className={'markdown-code-block' + (wrapped ? ' markdown-code-wrapped' : '')}>
      <div className="markdown-code-toolbar">
        <span className="markdown-code-language">{label}</span>
        <div className="markdown-code-actions">
          <button type="button" aria-pressed={wrapped} onClick={() => setWrapped(!wrapped)}>
            {wrapped ? '줄바꿈 해제' : '줄바꿈'}
          </button>
          <button type="button" onClick={() => void copyCode()}>코드 복사</button>
        </div>
      </div>
      <pre tabIndex={0} aria-label={label + ' 코드 블록, 가로 스크롤 가능'}>{children}</pre>
      <span className="markdown-code-feedback" role="status" aria-live="polite">
        {copyState === 'copied' ? '코드를 복사했어요.' : copyState === 'error' ? '복사에 실패했어요. 코드를 직접 선택해 복사해 주세요.' : ''}
      </span>
    </div>
  )
}
