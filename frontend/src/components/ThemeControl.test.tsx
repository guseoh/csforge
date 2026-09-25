import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useThemePreference } from './ThemeProvider'
import { ThemeControl } from './ThemeControl'

vi.mock('./ThemeProvider', () => ({
  useThemePreference: vi.fn(),
}))

const mockedUseThemePreference = vi.mocked(useThemePreference)

describe('ThemeControl', () => {
  const setPreference = vi.fn()

  beforeEach(() => {
    setPreference.mockReset()
    mockedUseThemePreference.mockReturnValue({ preference: 'system', setPreference })
  })

  it('renders direct system, light, and dark controls with the current preference exposed', () => {
    const markup = renderToStaticMarkup(<ThemeControl />)

    expect(markup).toContain('role="group" aria-label="테마"')
    expect(markup).toContain('aria-label="시스템 테마" title="시스템 테마" aria-pressed="true"')
    expect(markup).toContain('aria-label="라이트 테마" title="라이트 테마" aria-pressed="false"')
    expect(markup).toContain('aria-label="다크 테마" title="다크 테마" aria-pressed="false"')
    expect(markup.match(/<button /g)).toHaveLength(3)
  })

  it('changes the preference directly from each theme button', () => {
    const control = ThemeControl()
    const buttons = control.props.children

    buttons.forEach((button: { props: { onClick: () => void } }) => button.props.onClick())

    expect(setPreference.mock.calls).toEqual([
      ['system'],
      ['light'],
      ['dark'],
    ])
  })
})
