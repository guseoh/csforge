import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const evidenceDir = join(root, 'os-qa-evidence');
await mkdir(evidenceDir, { recursive: true });
const cases = [
  { id: 901, slug: 'block-allocation-tradeoff', title: '블록 할당(Block Allocation)', file: '../content/operating-systems/filesystem/allocation.md', asset: 'block-allocation-tradeoff.svg' },
  { id: 902, slug: 'ipc-tradeoff', title: 'IPC 방식 선택(IPC Trade-offs)', file: '../content/operating-systems/ipc/ipc-tradeoff.md', asset: 'ipc-tradeoff.svg' },
];
for (const entry of cases) {
  const content = await readFile(join(root, entry.file), 'utf8');
  const delimiters = [...content.matchAll(/^---\s*$/gm)];
  assert(delimiters.length >= 2, `Missing front matter delimiters: ${entry.file}`);
  entry.markdown = content.slice(delimiters[1].index + delimiters[1][0].length).trim();
  assert(entry.markdown.includes(entry.asset));
}
const browser = await chromium.launch({ headless: true });
try {
  for (const concept of cases) for (const mode of ['light', 'dark']) for (const width of [375, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 800 }, colorScheme: mode });
    await page.addInitScript(theme => window.localStorage.setItem('csforge.theme.v1', theme), mode);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/**', async route => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      const data = path === '/api/auth/session'
        ? { authenticated: true, mode: 'LOCAL', email: null }
        : path === `/api/concepts/${concept.id}`
          ? {
              id: concept.id, contentKey: `operating-systems.core.${concept.slug}`, slug: concept.slug,
              title: concept.title, summary: 'OS SVG reader verification', contentMarkdown: concept.markdown,
              level: 2, contentStatus: 'PUBLISHED',
              area: { id: 3, slug: 'operating-systems', name: 'Operating Systems' },
              topic: { id: concept.id, slug: concept.slug, title: 'Operating Systems' },
              progress: { learningStatus: 'UNSEEN', bookmarked: false, firstViewedAt: null, lastViewedAt: null, completedAt: null },
              references: [], personalNote: null, previous: null, next: null, relatedConcepts: [],
            }
          : path === `/api/concepts/${concept.id}/view`
            ? { learningStatus: 'LEARNING', bookmarked: false, firstViewedAt: null, lastViewedAt: null, completedAt: null }
            : {};
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
    });
    await page.goto(`http://127.0.0.1:4179/concepts/${concept.id}`, { waitUntil: 'domcontentloaded' });
    const trigger = page.locator(`article.concept-reading-content button.markdown-image-trigger:has(img[src$="${concept.asset}"])`);
    await trigger.waitFor({ state: 'visible', timeout: 18000 });
    const img = trigger.locator('img');
    await img.evaluate(async element => {
      if (!element.complete) await new Promise((resolve, reject) => {
        element.onload = resolve;
        element.onerror = reject;
      });
    });
    const geometry = await img.evaluate(el => ({
      width: el.naturalWidth, height: el.naturalHeight,
      box: { x: el.getBoundingClientRect().x, right: el.getBoundingClientRect().right },
    }));
    assert(geometry.width > 0 && geometry.height > 0, 'SVG must decode');
    assert(geometry.box.x >= -2 && geometry.box.right <= width + 2,
      `Reader image clipped horizontally: ${concept.slug}, ${mode}, ${width}, ${JSON.stringify(geometry.box)}`);
    assert.equal(await page.locator('html').getAttribute('data-theme'), mode);
    await page.screenshot({ path: join(evidenceDir, `${concept.slug}-${mode}-${width}.png`), fullPage: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: /이미지 확대/ });
    await dialog.waitFor({ state: 'visible', timeout: 8000 });
    assert.equal(await dialog.evaluate(el => el.open), true);
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
    if (width === 375) {
      const zoom = await dialog.evaluate(el => ({
        clientWidth: el.clientWidth, scrollWidth: el.scrollWidth,
        imageWidth: el.querySelector('img')?.getBoundingClientRect().width,
      }));
      assert(zoom.imageWidth >= 900, `Zoom image must keep native SVG resolution: ${JSON.stringify(zoom)}`);
      assert(zoom.scrollWidth > zoom.clientWidth + 300, `Zoom should allow horizontal panning: ${JSON.stringify(zoom)}`);
      await dialog.evaluate(el => { el.scrollLeft = 200; });
      assert((await dialog.evaluate(el => el.scrollLeft)) >= 150, 'Touch-size horizontal pan area must scroll');
      await dialog.evaluate(el => { el.scrollLeft = 0; });
    }
    await page.screenshot({ path: join(evidenceDir, `${concept.slug}-${mode}-${width}-zoom.png`) });
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden', timeout: 8000 });
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    assert.equal(await trigger.evaluate(el => document.activeElement === el), true);
    await trigger.click();
    await dialog.getByRole('button', { name: '닫기' }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 8000 });
    assert.deepEqual(errors, [], `Browser errors: ${errors.join('; ')}`);
    console.log(`PASS Reader ${concept.slug} theme=${mode} viewport=${width} decode/dialog/Escape/close/focus/scrolllock`);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log('PASS ALL: 2 actual Reader concept pages x 2 themes x 2 viewports = 8 cases');
