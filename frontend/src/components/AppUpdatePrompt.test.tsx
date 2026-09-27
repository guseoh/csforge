import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  needRefresh: false,
  offlineReady: false,
  updateServiceWorker: vi.fn(async () => {}),
}))

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [mocks.needRefresh, vi.fn()],
    offlineReady: [mocks.offlineReady, vi.fn()],
    updateServiceWorker: mocks.updateServiceWorker,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  useLocation: () => ({ pathname: '/learning', searchStr: '', hash: '' }),
}))

import { AppUpdatePrompt } from './AppUpdatePrompt'

describe('AppUpdatePrompt', () => {
  beforeEach(() => {
    mocks.needRefresh = false
    mocks.offlineReady = false
    mocks.updateServiceWorker.mockClear()
  })

  it('does not show an update prompt for offline ready or when no update is waiting', () => {
    mocks.offlineReady = true
    expect(renderToStaticMarkup(<AppUpdatePrompt />)).toBe('')
  })

  it('shows an accessible persistent choice when an update is ready', () => {
    mocks.needRefresh = true
    const markup = renderToStaticMarkup(<AppUpdatePrompt />)

    expect(markup).toContain('새 버전이 준비되었습니다.')
    expect(markup).toContain('현재 작업을 저장한 뒤 업데이트할 수 있습니다.')
    expect(markup).toContain('aria-labelledby="app-update-heading"')
    expect(markup).toContain('업데이트 적용')
    expect(markup).toContain('나중에')
    expect(markup).not.toContain('오프라인 사용 준비 완료')
  })
})
