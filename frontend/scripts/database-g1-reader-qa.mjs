import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright'

// Public API response bodies are exported by the isolated Spring/PostgreSQL integration test.
// The browser uses the real React Reader with replayed responses, not a live production DB.
const area = 'database'
const root = resolve(process.cwd(), '..')
const out = resolve(root, 'artifacts/' + area + '-g1-reader')
mkdirSync(out, { recursive: true })
const concepts = JSON.parse(readFileSync(resolve(root, 'artifacts/' + area + '-g1-api-fixtures.json'), 'utf8'))
assert.equal(concepts.length, 17)
assert.equal(new Set(concepts.map(x => x.contentKey)).size, 17)
const byId = new Map(concepts.map(x => [Number(x.id ?? x.conceptId), x]))
assert.equal(byId.size, 17, 'API fixture IDs must be unique')
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1280, height: 940 }, deviceScaleFactor: 1, serviceWorkers: 'block' })
await context.addInitScript(() => localStorage.setItem('csforge.theme.v1', 'light'))
const send = (route, body, status = 200) => route.fulfill({status, contentType: 'application/json', body: JSON.stringify(body)})
await context.route('**/api/**', async route => {
  const path = new URL(route.request().url()).pathname
  if (path === '/api/auth/session') return send(route, { authenticated: false, mode: 'CLOUD', email: null })
  const match = path.match(/^\/api\/(?:public\/)?concepts\/(\d+)$/)
  if (match) return byId.has(Number(match[1])) ? send(route, byId.get(Number(match[1]))) : send(route, {code: 'NOT_FOUND'}, 404)
  return send(route, {items: [], page: {page: 0, size: 100, totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false}})
})
const page = await context.newPage()
const errors = [], checks = [], screenshots = []
page.on('pageerror', err => errors.push({message: err.message, url: page.url()}))
try {
  for (const [index, item] of concepts.entries()) {
    const id = item.id ?? item.conceptId
    await page.goto('http://127.0.0.1:5173/concepts/' + id, {waitUntil: 'domcontentloaded'})
    const trigger = page.locator('article.concept-reading-content .markdown-image-trigger').filter({has: page.locator('img[src^="/learning/' + area + '/"]')}).first()
    await trigger.waitFor({timeout: 15000})
    const img = trigger.locator('img')
    for (const theme of ['light','dark']) {
      // Explicitly oppose OS and app theme for the embedded SVG color-scheme boundary.
      await page.emulateMedia({colorScheme: theme === 'light' ? 'dark' : 'light'})
      await page.getByRole('button', {name: theme === 'light' ? '라이트 테마' : '다크 테마'}).click()
      for (const width of [900,1280]) {
        await page.setViewportSize({width, height: 940})
        await trigger.scrollIntoViewIfNeeded()
        await img.evaluate(async el => { await el.decode() })
        const m = await trigger.evaluate(el => {
          const image = el.querySelector('img'), box = el.getBoundingClientRect(), i = image.getBoundingClientRect()
          return {theme: document.documentElement.getAttribute('data-theme'), scheme: getComputedStyle(image).colorScheme, overflow: document.documentElement.scrollWidth - innerWidth,
            loaded: image.complete && image.naturalWidth > 0, width: box.width, right: box.right, left: box.left,
            imageRight: i.right, imageLeft: i.left}
        })
        assert.equal(m.theme, theme, item.contentKey)
        assert.equal(m.scheme, theme, 'embedded image parent color-scheme: ' + item.contentKey)
        assert.ok(m.loaded && m.width > 0, 'SVG load: ' + item.contentKey)
        assert.ok(m.overflow <= 2 && m.left >= -2 && m.right <= width + 2 && m.imageLeft >= m.left - 2 && m.imageRight <= m.right + 2, 'Reader clipping: ' + item.contentKey + ' ' + JSON.stringify(m))
        const name = String(index+1).padStart(2,'0') + '-' + theme + '-' + width + '.png'
        await trigger.screenshot({path: resolve(out,name), animations:'disabled'})
        screenshots.push(name)
        if (width === 1280) {
          await trigger.click()
          const dialog = page.locator('dialog.markdown-image-dialog[open]')
          await dialog.waitFor()
          await dialog.locator('img').evaluate(async el => { await el.decode() })
          await page.keyboard.press('Escape')
          await dialog.waitFor({state:'hidden'})
          assert.ok(await trigger.evaluate(el => document.activeElement === el), 'focus restore: ' + item.contentKey)
        }
        checks.push({contentKey:item.contentKey,id,theme,width,systemTheme:theme === 'light' ? 'dark':'light',result:'PASS',...m})
      }
    }
  }
  assert.deepEqual(errors, [])
  assert.equal(checks.length, 17*4)
  console.log('G1_READER_PASS', area, checks.length)
} catch (error) {
  errors.push({stage:'reader',message:String(error)})
  console.error(error)
  process.exitCode = 1
} finally {
  writeFileSync(resolve(out,'qa.json'),JSON.stringify({area,checks,screenshots,errors},null,2))
  await browser.close()
}
