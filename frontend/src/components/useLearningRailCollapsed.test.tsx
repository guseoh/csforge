import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useLearningRailCollapsed } from './useLearningRailCollapsed'

function RailState() {
  const { collapsed } = useLearningRailCollapsed()
  return <output>{collapsed ? '접힘' : '펼침'}</output>
}

function browserAt(width: number, preference: string | null = null, storageUnavailable = false) {
  vi.stubGlobal('window', {
    sessionStorage: { getItem: () => {
      if (storageUnavailable) throw new Error('Storage unavailable')
      return preference
    } },
    matchMedia: (query: string) => ({ matches: width <= Number(query.match(/max-width: (\d+)px/)?.[1]) }),
  })
}

describe('learning rail initial disclosure', () => {
  afterEach(() => vi.unstubAllGlobals())

  it.each([320, 390, 768, 1024])('starts folded at %ipx without a session preference', (width) => {
    browserAt(width)
    expect(renderToStaticMarkup(<RailState />)).toContain('접힘')
  })

  it('keeps the desktop curriculum open by default', () => {
    browserAt(1440)
    expect(renderToStaticMarkup(<RailState />)).toContain('펼침')
  })

  it('preserves an explicit expanded preference on a narrow screen', () => {
    browserAt(390, 'false')
    expect(renderToStaticMarkup(<RailState />)).toContain('펼침')
  })

  it('preserves a collapsed preference on desktop', () => {
    browserAt(1440, 'true')
    expect(renderToStaticMarkup(<RailState />)).toContain('접힘')
  })

  it('still offers folded navigation when session storage is unavailable', () => {
    browserAt(1024, null, true)
    expect(renderToStaticMarkup(<RailState />)).toContain('접힘')
  })
})
