import type { ReactNode } from 'react'

const KEYWORDS: Record<string, Set<string>> = {
  sql: new Set('SELECT FROM WHERE INSERT INTO VALUES UPDATE SET DELETE JOIN LEFT RIGHT INNER OUTER ON AS AND OR NOT NULL IS IN EXISTS GROUP BY ORDER HAVING LIMIT OFFSET DISTINCT COUNT SUM AVG MIN MAX CREATE TABLE PRIMARY KEY REFERENCES BEGIN COMMIT ROLLBACK WITH UNION CASE WHEN THEN ELSE END TRUE FALSE'.split(' ')),
  bash: new Set('if then else elif fi for while do done in case esac function export local return echo cd pwd set exit trap source'.split(' ')),
  yaml: new Set('true false null yes no on off'.split(' ')),
  json: new Set('true false null'.split(' ')),
  http: new Set('GET POST PUT PATCH DELETE HEAD OPTIONS CONNECT TRACE HTTP'.split(' ')),
  xml: new Set(),
}

function languageKey(language: string) {
  if (language === 'sh' || language === 'shell') return 'bash'
  if (language === 'yml') return 'yaml'
  return language
}

/** 가벼운 어휘 강조. Lexer의 완전성이나 프로그램 실행 가능성을 보장하지 않는다. */
export function highlightSimpleCode(source: string, language: string): ReactNode {
  const key = languageKey(language)
  const keywords = KEYWORDS[key]
  if (!keywords) return source

  const result: ReactNode[] = []
  let i = 0
  let token = 0
  const push = (value: string, css?: string) => {
    if (!value) return
    result.push(css ? <span key={token++} className={css}>{value}</span> : value)
  }

  while (i < source.length) {
    const rest = source.slice(i)
    const comment = key === 'sql' && rest.startsWith('--')
      || (key === 'bash' || key === 'yaml') && rest.startsWith('#')
      || key === 'xml' && rest.startsWith('<!--')
    if (comment) {
      const stop = key === 'xml' ? source.indexOf('-->', i + 4) : source.indexOf('\n', i)
      const end = stop < 0 ? source.length : stop + (key === 'xml' ? 3 : 0)
      push(source.slice(i, end), 'code-comment')
      i = end
      continue
    }

    if (key === 'xml' && rest.startsWith('<')) {
      const tag = rest.match(/^<\/?[A-Za-z_:][\w:.-]*/)
      if (tag) {
        push(tag[0], 'code-keyword')
        i += tag[0].length
        continue
      }
    }

    if (source[i] === '"' || source[i] === "'") {
      const quote = source[i]
      let end = i + 1
      while (end < source.length) {
        if (source[end] === '\\') {
          end += 2
          continue
        }
        if (source[end] === quote) {
          // SQL doubled single quote
          if (key === 'sql' && quote === "'" && source[end + 1] === "'") {
            end += 2
            continue
          }
          end++
          break
        }
        end++
      }
      const isKey = (key === 'json' || key === 'yaml') && /^\s*:/.test(source.slice(end))
      push(source.slice(i, end), isKey ? 'code-type' : 'code-string')
      i = end
      continue
    }

    const number = rest.match(/^\b\d+(?:\.\d+)?\b/)?.[0]
    if (number) {
      push(number, 'code-number')
      i += number.length
      continue
    }

    const word = rest.match(/^[A-Za-z_][\w-]*/)?.[0]
    if (word) {
      const upper = word.toUpperCase()
      const isKeyword = keywords.has(key === 'sql' || key === 'http' ? upper : word)
      const isKey = (key === 'yaml' || key === 'http') && /^\s*:/.test(source.slice(i + word.length))
      push(word, isKeyword ? 'code-keyword' : isKey ? 'code-type' : undefined)
      i += word.length
      continue
    }

    push(source[i])
    i++
  }

  return result
}
