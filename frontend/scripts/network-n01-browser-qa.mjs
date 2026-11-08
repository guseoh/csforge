import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright'

const folder = resolve(process.cwd(), '..', 'artifacts', 'network-pilot-n01')
mkdirSync(folder, { recursive: true })
const browser = await chromium.launch({ headless: true })
const errors = []
const checks = []
const expected = [
  { client: 'CLOSED', server: 'LISTEN', phases: ['future', 'future', 'future'] },
  { client: 'SYN-SENT', server: 'LISTEN', phases: ['in-flight', 'future', 'future'] },
  { client: 'SYN-SENT', server: 'SYN-RECEIVED', phases: ['received', 'in-flight', 'future'] },
  { client: 'ESTABLISHED', server: 'SYN-RECEIVED', phases: ['received', 'received', 'in-flight'] },
  { client: 'ESTABLISHED', server: 'ESTABLISHED', phases: ['received', 'received', 'received'] },
]

try {
  for (const width of [1280, 1440]) {
    for (const theme of ['dark', 'light']) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 })
      page.on('pageerror', error => errors.push(error.message))
      await page.emulateMedia({ colorScheme: theme === 'dark' ? 'light' : 'dark' })
      await page.goto('http://127.0.0.1:5173/network-handshake-preview.html', { waitUntil: 'networkidle' })
      if (theme === 'light') await page.getByRole('button', { name: '라이트로 보기' }).click()
      await page.waitForFunction(mode => document.documentElement.getAttribute('data-theme') === mode, theme)
      assert.equal(await page.locator('[data-network-preview-theme]').getAttribute('data-network-preview-theme'), theme)
      const root = page.locator('[data-network-pilot="n01-tcp-handshake"]')
      assert.equal(await root.count(), 1, 'must render existing Reader contract')
      const svg = root.locator('svg[role="img"]')
      assert.equal(await svg.count(), 1)

      for (let step = 0; step < expected.length; step++) {
        const desired = expected[step]
        assert.equal(await root.getAttribute('data-tcp-step'), String(step))
        assert.equal((await root.locator('[data-tcp-party="client"]').textContent())?.trim(), desired.client)
        assert.equal((await root.locator('[data-tcp-party="server"]').textContent())?.trim(), desired.server)
        for (let i = 0; i < 3; i++) {
          const message = root.locator(`[data-tcp-message="${i}"]`)
          assert.equal(await message.getAttribute('data-tcp-phase'), desired.phases[i])
          if (desired.phases[i] === 'in-flight') {
            assert.equal(await message.locator('line.tcp-handshake-editorial__arrow-line').getAttribute('x2'), '400')
            assert.match((await message.textContent()) ?? '', /전송 중/)
          }
        }
        const status = await root.locator('.tcp-handshake-editorial__reading').innerText()
        assert.match(status, new RegExp(`${step + 1} / 5`))

        const layout = await page.evaluate(() => {
          const diagram = document.querySelector('.tcp-handshake-editorial__canvas').getBoundingClientRect()
          const figure = document.querySelector('.learning-visualization')
          const style = getComputedStyle(figure)
          return {
            docWidth: document.documentElement.scrollWidth,
            viewportWidth: window.innerWidth,
            rect: { left: diagram.left, right: diagram.right, width: diagram.width, height: diagram.height },
            surface: style.backgroundColor,
            text: style.color,
          }
        })
        assert.ok(layout.docWidth <= width + 2, 'global horizontal overflow')
        assert.ok(layout.rect.width >= 620 && layout.rect.width <= 800, 'diagram sizing')
        assert.ok(layout.rect.height > 320, 'diagram collapsed')
        assert.equal(layout.surface, theme === 'light' ? 'rgb(255, 255, 255)' : 'rgb(24, 24, 24)')
        await page.locator('.learning-visualization').screenshot({
          path: resolve(folder, `tcp-handshake-${theme}-${width}-step-${step}.png`),
          animations: 'disabled',
        })
        if (step < 4) await root.getByRole('button', { name: '다음 단계' }).click()
      }
      assert.equal(await root.locator('[data-tcp-message="2"] line.tcp-handshake-editorial__arrow-line').getAttribute('x2'), '654')
      await root.getByRole('button', { name: '이전 단계' }).click()
      assert.equal(await root.getAttribute('data-tcp-step'), '3')
      await root.getByRole('button', { name: '초기화' }).click()
      assert.equal(await root.getAttribute('data-tcp-step'), '0')
      checks.push({ width, theme, states:5, reset:'PASS', result:'PASS' })
      await page.close()
    }
  }
  assert.deepEqual(errors, [], 'browser JavaScript errors')
  writeFileSync(resolve(folder, 'qa.json'), JSON.stringify({ checks, errors }, null, 2))
  console.log('NETWORK_N01_CHROMIUM_PASS', checks.length, 'theme/viewport variants; all 5 states')
} catch (error) {
  writeFileSync(resolve(folder, 'qa.json'), JSON.stringify({ checks, errors, failure: String(error) }, null, 2))
  console.error(error)
  process.exitCode = 1
} finally {
  await browser.close()
}
