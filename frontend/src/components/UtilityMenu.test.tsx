import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="/settings/import">{children}</a>,
}))

vi.mock('./ThemeProvider', () => ({
  useThemePreference: () => ({ preference: 'system', setPreference: () => {} }),
}))

import { UtilityMenu } from './UtilityMenu'

describe('UtilityMenu', () => {
  it('exposes all three theme choices in the mobile utility popover', () => {
    const markup = renderToStaticMarkup(
      <UtilityMenu open={true} onToggle={() => {}} onClose={() => {}} />,
    )

    expect(markup).toContain('class="utility-menu-theme"')
    expect(markup).toContain('테마 선택')
    expect(markup).toContain('aria-label="시스템 테마"')
    expect(markup).toContain('aria-label="라이트 테마"')
    expect(markup).toContain('aria-label="다크 테마"')
    expect(markup).toContain('aria-expanded="true"')
  })

  it('keeps the utility panel hidden until the user opens it', () => {
    const markup = renderToStaticMarkup(
      <UtilityMenu open={false} onToggle={() => {}} onClose={() => {}} />,
    )

    expect(markup).toContain('id="utility-menu-panel" hidden=""')
    expect(markup).toContain('aria-expanded="false"')
  })
})
