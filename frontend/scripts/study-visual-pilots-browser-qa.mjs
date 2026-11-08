import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright'

const root = resolve(process.cwd(), '..')
const out = resolve(root, 'artifacts', 'heap-index-explorer')
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ headless: true })
const checks = []
const errors = []

try {
  for (const width of [1280, 1440]) {
    for (const theme of ['dark', 'light']) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 })
      // Verify explicit preview theme even if OS preference requests the opposite.
      await page.emulateMedia({ colorScheme: theme === 'light' ? 'dark' : 'light' })
      page.on('pageerror', err => errors.push(err.message))
      await page.goto('http://127.0.0.1:5173/study-visual-pilots-preview.html', { waitUntil: 'networkidle' })
      if (theme === 'light') await page.getByRole('button', { name: '라이트로 보기' }).click()
      assert.equal(await page.locator('.heap-explorer-preview').getAttribute('data-heap-theme'), theme)

      const java = page.locator('[data-study-visual="java-pass-by-value"]')
      const tcp = page.locator('[data-study-visual="tcp-sliding-window"]')
      assert.equal(await java.locator('svg').count(), 2, 'Java must have exactly two snapshots')
      assert.equal(await tcp.locator('svg').count(), 2, 'TCP must have exactly two snapshots')
      assert.equal(await java.locator('button').count(), 0, 'Java is static by design')
      assert.equal(await tcp.locator('button').count(), 0, 'TCP is static by design')
      assert.equal(await java.locator('svg text.study-visual__svg-label').filter({ hasText: /^객체 A$/ }).count(), 2)
      assert.equal(await java.locator('svg text.study-visual__svg-label').filter({ hasText: /^객체 B$/ }).count(), 1)
      assert.match(await java.locator('.study-visual__java-code').innerText(), /void replace\(Member param\)/)
      assert.match(await java.locator('.study-visual__java-code').innerText(), /param = new Member\("park"\)/)
      const objectA = await java.locator('svg rect[data-java-object="A"]').evaluateAll(nodes =>
        nodes.map(node => ({ x: node.getAttribute('x'), y: node.getAttribute('y'), width: node.getAttribute('width'), height: node.getAttribute('height') }))
      )
      assert.deepEqual(objectA, [
        { x: '278', y: '70', width: '132', height: '72' },
        { x: '278', y: '70', width: '132', height: '72' },
      ], 'object A must not move between snapshots')

      assert.equal(await tcp.locator('[data-tcp-byte]').count(), 12)
      assert.equal(await tcp.locator('[data-tcp-state="확인됨"]').count(), 2)
      assert.equal(await tcp.locator('[data-tcp-state="대기"]').count(), 2)
      assert.equal(await tcp.locator('[data-tcp-state="전송 가능"]').count(), 2)
      assert.equal(await tcp.locator('[data-window="1000-1399"]').count(), 1)
      assert.equal(await tcp.locator('[data-window="1200-1599"]').count(), 1)
      assert.match(await tcp.locator('[data-tcp-explanation]').innerText(), /ACK 1200은 다음에 기대하는 바이트가 1200/)

      const geometry = await page.evaluate(() => {
        const selectors = ['[data-study-visual="java-pass-by-value"]','[data-study-visual="tcp-sliding-window"]']
        return {
          bodyWidth: document.documentElement.scrollWidth,
          viewport: innerWidth,
          examples: selectors.map(selector => {
            const root = document.querySelector(selector)
            const rect = root.getBoundingClientRect()
            const css = getComputedStyle(root)
            const charts = [...root.querySelectorAll('svg')].map(svg => {
              const b = svg.getBoundingClientRect()
              return { width:b.width, height:b.height, right:b.right, left:b.left }
            })
            return {
              left: rect.left, right: rect.right, width: rect.width,
              background: css.backgroundColor, color:css.color,
              chartBounds: charts,
            }
          }),
        }
      })
      assert.ok(geometry.bodyWidth <= width + 2, 'document horizontal overflow')
      const expectedBG = theme === 'dark' ? 'rgb(16, 16, 16)' : 'rgb(255, 255, 255)'
      for (const ex of geometry.examples) {
        assert.equal(ex.background, expectedBG, 'theme background must match selected preview theme')
        assert.ok(ex.right <= width + 2 && ex.left >= -2, 'example escapes viewport')
        for (const rect of ex.chartBounds) {
          assert.ok(rect.width > 200 && rect.height > 50, 'diagram collapsed')
          assert.ok(rect.left >= ex.left-2 && rect.right <= ex.right+2, 'SVG clips outside figure')
        }
      }

      await java.screenshot({ path: resolve(out, `java-pass-by-value-${theme}-${width}.png`), animations: 'disabled' })
      await tcp.screenshot({ path: resolve(out, `tcp-sliding-window-${theme}-${width}.png`), animations: 'disabled' })
      const initialSelection = page.locator('[data-heap-index-node="1"]')
      assert.equal(await initialSelection.getAttribute('aria-pressed'), 'true')
      checks.push({ theme, width, geometry, result: 'PASS' })
      await page.close()
    }
  }
  assert.equal(errors.length, 0, 'browser JS errors')
  writeFileSync(resolve(out, 'study-visual-qa.json'), JSON.stringify({checks,errors},null,2))
  console.log('STUDY_VISUAL_PILOT_QA_PASS', checks.length, 'Java/TCP light/dark viewport cases')
} catch (error) {
  writeFileSync(resolve(out,'study-visual-qa.json'), JSON.stringify({checks,errors,failure:String(error)},null,2))
  console.error(error)
  process.exitCode = 1
} finally {
  await browser.close()
}
