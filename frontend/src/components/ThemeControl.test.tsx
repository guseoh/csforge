import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from './ThemeProvider'
import { ThemeControl } from './ThemeControl'

describe('ThemeControl', () => {
  it('renders direct system, light, and dark controls with the current preference exposed', () => {
    const markup = renderToStaticMarkup(
      <ThemeProvider>
        <ThemeControl />
      </ThemeProvider>,
    )

    expect(markup).toContain('role="group" aria-label="테마"')
    expect(markup).toContain('aria-label="시스템 테마" title="시스템 테마" aria-pressed="true"')
    expect(markup).toContain('aria-label="라이트 테마" title="라이트 테마" aria-pressed="false"')
    expect(markup).toContain('aria-label="다크 테마" title="다크 테마" aria-pressed="false"')
    expect(markup.match(/<button /g)).toHaveLength(3)
  })
})
