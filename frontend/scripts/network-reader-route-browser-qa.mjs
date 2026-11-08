import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright'

const root = resolve(process.cwd(), '..')
const out = resolve(root, 'artifacts/network-reader-route-audit')
mkdirSync(out, { recursive: true })
const inventory = readFileSync(resolve(root, 'docs/content-corrections/network-pilot/NETWORK-AREA-INVENTORY.md'), 'utf8')
const rows = [...inventory.matchAll(/^\| [\w-]+ \| \[(network-http\.core\.[\w.-]+)\]\(\.\.\/\.\.\/\.\.\/(content\/network-http\/[^)]+)\) \|/gm)]
assert.equal(rows.length, 53, 'Curriculum DIAGRAM inventory must have 53 Concept rows')

const concepts = rows.map(([, contentKey, path], index) => {
  const raw = readFileSync(resolve(root, path), 'utf8')
  const source = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  assert.ok(source, path)
  const meta = source[1]
  const field = (name, fallback) => meta.match(new RegExp('^' + name + ':\\s*"?([^"\\r\\n]+)"?', 'm'))?.[1] || fallback
  return {
    id: 7000 + index, contentKey, sourcePath: path,
    slug: field('slug', contentKey.split('.').at(-1)),
    title: field('title', contentKey), summary: field('summary', ''),
    level: Number(field('level', '1')),
    contentMarkdown: source[2],
  }
})
const ids = new Set(concepts.map(item => item.contentKey))
assert.equal(ids.size, 53, 'Duplicate Network DIAGRAM key')
const byId = new Map(concepts.map(item => [item.id, {
  ...item, contentStatus: 'PUBLISHED',
  area: { id: 1, slug: 'network-http', name: 'Network & HTTP' },
  topic: { id: 25, slug: 'network-diagrams', title: 'Network & HTTP' },
  progress: { learningStatus: 'UNSEEN', bookmarked: false,
    firstViewedAt: null, lastViewedAt: null, completedAt: null },
  personalNote: null, references: [], previous: null, next: null, relatedConcepts: [],
}]))
const checks = [], errors = [], screenshots = []
const browser = await chromium.launch({ headless: true })
const contexts = []

async function makePage(owner) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 940 }, deviceScaleFactor: 1, serviceWorkers: 'block',
  })
  contexts.push(context)
  await context.addInitScript(() => localStorage.setItem('csforge.theme.v1', 'light'))
  await context.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname
    const send = (body, status = 200) => route.fulfill({
      status, contentType: 'application/json', body: JSON.stringify(body),
    })
    if (path === '/api/auth/session')
      return send({ authenticated: owner, mode: owner ? 'LOCAL' : 'CLOUD',
        email: owner ? 'qa@example.invalid' : null })
    const concept = path.match(/^\/api\/(?:public\/)?concepts\/(\d+)(?:\/(understanding|view|progress|note))?$/)
    if (concept) {
      const id = Number(concept[1]), data = byId.get(id)
      if (!data) return send({ code: 'NOT_FOUND', message: 'No QA fixture' }, 404)
      if (concept[2] === 'understanding') return send({
        conceptId: id, learningStatus: 'UNSEEN',
        evidence: { uniqueQuestions: 0, finalizedAttempts: 0,
          correctQuestions: 0, pendingSelfCheckCount: 0 },
        recentAccuracyPercent: null, assessmentStatus: 'NOT_ENOUGH_EVIDENCE',
        lastAssessedAt: null,
      })
      if (concept[2] === 'view' || concept[2] === 'progress') return send(data.progress)
      if (concept[2] === 'note') return send({ content: '', updatedAt: null })
      return send(data)
    }
    if (path.includes('bookmark-categories')) return send([])
    return send({ items: [], page: { page: 0, size: 100,
      totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false } })
  })
  const page = await context.newPage()
  page.on('pageerror', err => errors.push({ owner, message: err.message, url: page.url() }))
  return page
}

async function openConcept(page, item) {
  await page.goto('http://127.0.0.1:5173/concepts/' + item.id, {
    waitUntil: 'domcontentloaded', timeout: 20000,
  })
  const figure = page.locator('article.concept-reading-content figure.learning-visualization')
  await figure.waitFor({ timeout: 15000 })
  assert.equal(await figure.count(), 1, 'Reader figure: ' + item.contentKey)
  assert.ok(await figure.locator('svg[role="img"]').count() >= 1, 'Reader SVG: ' + item.contentKey)
  assert.equal(await figure.locator('.diagram-fallback').count(), 0, 'Reader fallback: ' + item.contentKey)
  return figure
}

try {
  const guest = await makePage(false)
  for (let i = 0; i < concepts.length; i++) {
    const item = concepts[i]
    const figure = await openConcept(guest, item)
    for (const theme of ['light', 'dark']) {
      await guest.getByRole('button', { name: theme === 'light' ? '라이트 테마' : '다크 테마' }).click()
      for (const width of [1280, 1440]) {
        await guest.setViewportSize({ width, height: 940 })
        const measure = await figure.evaluate(element => {
          const bounds = element.getBoundingClientRect()
          return {
            theme: document.documentElement.getAttribute('data-theme'),
            bg: getComputedStyle(element).backgroundColor,
            pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
            right: bounds.right, width: bounds.width,
            diagramPan: element.querySelector('.network-area__scroll')
              ? Math.max(0, element.querySelector('.network-area__scroll').scrollWidth
                - element.querySelector('.network-area__scroll').clientWidth) : 0,
          }
        })
        assert.equal(measure.theme, theme, item.contentKey)
        assert.equal(measure.bg, theme === 'dark' ? 'rgb(24, 24, 24)' : 'rgb(255, 255, 255)')
        assert.ok(measure.pageOverflow <= 2, 'Reader page overflow: ' + item.contentKey)
        assert.ok(measure.width > 400 && measure.right <= width + 2,
          'Reader figure sizing: ' + item.contentKey)
        assert.ok(measure.diagramPan <= 2,
          'Desktop Network diagram requires internal horizontal scroll: ' + item.contentKey)
        checks.push({ contentKey: item.contentKey, mode: 'guest', theme, width, result: 'PASS' })
        if (i % 13 === 0) {
          const file = 'reader-' + item.id + '-' + theme + '-' + width + '.png'
          await figure.screenshot({ path: resolve(out, file), animations: 'disabled' })
          screenshots.push(file)
        }
      }
    }
  }
  const owner = await makePage(true)
  for (const item of [concepts[0], concepts[14], concepts[25], concepts[48]]) {
    await openConcept(owner, item)
    const note = owner.getByRole('textbox', { name: '개인 노트' })
    await note.waitFor()
    checks.push({ contentKey: item.contentKey, mode: 'owner', result: 'PASS' })
  }
  assert.deepEqual(errors, [], 'Browser JavaScript errors')
  assert.equal(checks.length, 53 * 4 + 4)
  console.log('NETWORK_READER_ROUTE_PASS 212 guest theme/width cases, 4 owner Reader cases')
} catch (error) {
  errors.push({ stage: 'reader', message: String(error) })
  console.error(error)
  process.exitCode = 1
} finally {
  writeFileSync(resolve(out, 'qa.json'), JSON.stringify({
    cases: 53, checks, screenshots, errors,
  }, null, 2))
  for (const context of contexts) await context.close().catch(() => {})
  await browser.close()
}
