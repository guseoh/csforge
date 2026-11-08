import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright'

const out = resolve(process.cwd(), '..', 'artifacts', 'heap-index-explorer')
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', error => errors.push(error.message))

const state = async (index) => ({
  node: await page.locator(`[data-heap-index-node="${index}"]`).getAttribute('data-state'),
  cell: await page.locator(`[data-heap-index-cell="${index}"]`).getAttribute('data-state'),
})

const checks = []
try {
  for (const width of [1280, 1440]) {
    for (const theme of ['dark', 'light']) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('http://127.0.0.1:5173/heap-index-explorer-preview.html', { waitUntil: 'networkidle' })
      const root = page.locator('.heap-explorer-preview')
      if (theme === 'light') await page.getByRole('button', { name: '라이트로 보기' }).click()
      assert.equal(await root.getAttribute('data-heap-theme'), theme)
      assert.equal(await page.locator('[data-heap-index-node]').count(), 10)
      assert.equal(await page.locator('[data-heap-index-cell]').count(), 10)
      assert.deepEqual(await state(1), { node: 'selected', cell: 'selected' })
      assert.deepEqual(await state(0), { node: 'related', cell: 'related' })
      const intro = await page.locator('.heap-index-explorer__relations').innerText()
      assert.match(intro, /고른 칸: 1번 \(3\)/)
      assert.match(intro, /왼쪽 자식 2 × 1 \+ 1 = 3번 칸 \(7\)/)

      const layout = await page.evaluate(() => {
        const root = document.querySelector('.heap-index-explorer')
        const nodes = [...root.querySelectorAll('[data-heap-index-node]')].map(el => el.getBoundingClientRect())
        const canvas = root.querySelector('.heap-index-explorer__tree').getBoundingClientRect()
        const colors = getComputedStyle(root)
        const bg = getComputedStyle(root.querySelector('[data-heap-index-node="1"]')).backgroundColor
        const overlap = nodes.some((a,i) => nodes.slice(i+1).some(b => a.left < b.right-1 && a.right > b.left+1 && a.top < b.bottom-1 && a.bottom > b.top+1))
        return {
          docWidth: document.documentElement.scrollWidth, viewport: innerWidth,
          canvasWidth: canvas.width, overlap, bg,
          surface: colors.backgroundColor, ink: colors.color,
        }
      })
      assert.equal(layout.docWidth <= width + 2, true, 'full-page horizontal overflow')
      assert.equal(layout.canvasWidth, 460)
      assert.equal(layout.overlap, false, 'tree nodes overlap')
      assert.notEqual(layout.bg, layout.surface, 'selected cell should be distinguishable')
      await page.locator('.heap-index-explorer').screenshot({
        path: resolve(out, `heap-${theme}-${width}-initial.png`),
        animations: 'disabled',
      })

      await page.locator('[data-heap-index-cell="4"]').click()
      assert.deepEqual(await state(4), { node: 'selected', cell: 'selected' })
      const changed = await page.locator('.heap-index-explorer__relations').innerText()
      assert.match(changed, /고른 칸: 4번 \(4\)/)
      assert.match(changed, /왼쪽 자식 2 × 4 \+ 1 = 9번 칸 \(6\)/)
      assert.match(changed, /오른쪽 자식 : 없음/)
      await page.locator('[data-heap-index-node="4"]').focus()
      await page.keyboard.press('ArrowUp')
      assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-heap-index-node')), '1')
      await page.keyboard.press('Enter')
      assert.deepEqual(await state(1), { node: 'selected', cell: 'selected' })
      await page.locator('.heap-index-explorer__summary').click()
      assert.equal(await page.locator('.heap-index-explorer').getAttribute('open'), null)
      await page.locator('.heap-index-explorer__summary').click()
      assert.deepEqual(await state(1), { node: 'selected', cell: 'selected' })
      await page.locator('[data-heap-index-node="0"]').click()
      assert.match(await page.locator('.heap-index-explorer__relations').innerText(), /부모 : 없음 \(루트 노드\)/)
      await page.locator('.heap-index-explorer').screenshot({
        path: resolve(out, `heap-${theme}-${width}-root.png`),
        animations: 'disabled',
      })
      checks.push({ theme, width, layout, interaction: 'PASS' })
    }
  }
  assert.equal(errors.length, 0, 'browser JS errors: ' + errors.join('; '))
  writeFileSync(resolve(out, 'qa.json'), JSON.stringify({ sha: process.env.GITHUB_SHA || 'LOCAL', checks, errors }, null, 2))
  console.log('HEAP_EXPLORER_BROWSER_QA_PASS', checks.length, 'theme/viewport cases')
} catch (error) {
  writeFileSync(resolve(out, 'qa.json'), JSON.stringify({ checks, errors, failure: String(error) }, null, 2))
  console.error(error)
  process.exitCode = 1
} finally {
  await browser.close()
}
