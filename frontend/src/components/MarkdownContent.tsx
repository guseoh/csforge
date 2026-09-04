import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownContentProps {
  children: string
  className?: string
  fallback?: ReactNode
}

/** Canonical Markdown을 화면 맥락에 맞게 일관된 GFM 콘텐츠로 렌더링한다. */
export function MarkdownContent({ children, className, fallback }: MarkdownContentProps) {
  const content = children.trim() ? children : fallback
  if (!content) return null

  return (
    <div className={['markdown-content', className].filter(Boolean).join(' ')}>
      {typeof content === 'string'
        ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        : content}
    </div>
  )
}
