import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright'

const dir = resolve(process.cwd(), '..', 'artifacts', 'network-pilot-pack')
mkdirSync(dir, { recursive: true })
const browser = await chromium.launch({ headless: true })
const checks = [], errors = []
const sections = [
  { id: 'handshake', count: 5, attribute: 'data-tcp-step' },
  { id: 'http', count: 1 },
  { id: 'dns', count: 1 },
  { id: 'teardown', count: 8, attribute: 'data-network-step' },
  { id: 'window', count: 1 },
]
try {
  for (const width of [1280, 1440]) for (const theme of ['dark', 'light']) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 })
    page.on('pageerror', error => errors.push(error.message))
    await page.emulateMedia({ colorScheme: theme === 'dark' ? 'light' : 'dark' })
    await page.goto('http://127.0.0.1:5173/network-pilot-preview.html', { waitUntil: 'networkidle' })
    if (theme === 'light') await page.getByRole('button', { name: '라이트로 보기' }).click()
    await page.waitForFunction(mode => document.documentElement.getAttribute('data-theme') === mode, theme)
    assert.equal(await page.locator('section.study-pilots__section').count(), 5)
    for (const info of sections) {
      const figure = page.locator('section#' + info.id + ' > figure.learning-visualization')
      assert.equal(await figure.count(), 1)
      assert.ok(await figure.locator('svg[role="img"]').count() >= 1)
      const dims = await figure.evaluate(element => ({
        bg: getComputedStyle(element).backgroundColor,
        scroll: document.documentElement.scrollWidth - innerWidth,
        width: element.getBoundingClientRect().width,
        right: element.getBoundingClientRect().right,
      }))
      assert.equal(dims.bg, theme === 'dark' ? 'rgb(24, 24, 24)' : 'rgb(255, 255, 255)')
      assert.ok(dims.scroll <= 2 && dims.width > 500 && dims.right <= width + 2)
      for (let step = 0; step < info.count; step++) {
        if (info.attribute) assert.equal(await figure.locator('[' + info.attribute + ']').getAttribute(info.attribute), String(step))
        await figure.screenshot({ path: resolve(dir, info.id + '-' + theme + '-' + width + '-step-' + step + '.png'), animations: 'disabled' })
        if (step < info.count - 1) await figure.getByRole('button', { name: '다음 단계' }).click()
      }
      if (info.attribute) {
        await figure.getByRole('button', { name: '이전 단계' }).click()
        assert.equal(await figure.locator('[' + info.attribute + ']').getAttribute(info.attribute), String(info.count - 2))
        await figure.getByRole('button', { name: '초기화' }).click()
        assert.equal(await figure.locator('[' + info.attribute + ']').getAttribute(info.attribute), '0')
      }
      checks.push({ pilot: info.id, width, theme, states: info.count, result: 'PASS' })
    }
    await page.close()
  }
  assert.deepEqual(errors, [])
  writeFileSync(resolve(dir, 'qa.json'), JSON.stringify({ checks, errors }, null, 2))
  console.log('NETWORK_PILOT_PACK_PASS', checks.length)
} catch (error) {
  writeFileSync(resolve(dir, 'qa.json'), JSON.stringify({ checks, errors, failure: String(error) }, null, 2))
  console.error(error)
  process.exitCode = 1
} finally { await browser.close() }
