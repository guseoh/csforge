import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const dest = join(root, 'ca-reader-evidence');
await mkdir(dest, { recursive: true });

const concepts = [
  { id: 971, slug: 'procedure-call-machine-level', file: '../content/computer-architecture/isa-execution/procedure-call-machine-level.md', title: '기계 수준 함수 호출' },
  { id: 972, slug: 'page-table-walk', file: '../content/computer-architecture/virtual-memory-hardware/page-table-walk.md', title: '페이지 테이블 순회' },
];
for (const entry of concepts) {
  const source = await readFile(join(root, entry.file), 'utf8');
  const matches = [...source.matchAll(/^---\\s*$/gm)];
  assert(matches.length >= 2, 'Missing Markdown frontmatter ' + entry.file);
  entry.markdown = source.slice(matches[1].index + matches[1][0].length).trim();
}
const browser = await chromium.launch({ headless: true });
try {
  for (const entry of concepts) for (const theme of ['light', 'dark']) for (const width of [375, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 820 }, colorScheme: theme });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(value => localStorage.setItem('csforge.theme.v1', value), theme);
    await page.route('**/api/**', async route => {
      const path = new URL(route.request().url()).pathname;
      const response = path === '/api/auth/session'
        ? { authenticated: true, mode: 'LOCAL', email: null }
        : path === `/api/concepts/${entry.id}`
          ? { id: entry.id, contentKey: 'computer-architecture.core.' + entry.slug,
              slug: entry.slug, title: entry.title, summary: 'CA Reader regression',
              contentMarkdown: entry.markdown, level: 2, contentStatus: 'PUBLISHED',
              area: { id: 9, slug: 'computer-architecture', name: 'Computer Architecture' },
              topic: { id: 7, slug: entry.slug, title: 'Computer Architecture' },
              progress: { learningStatus: 'UNSEEN', bookmarked: false,
                firstViewedAt: null, lastViewedAt: null, completedAt: null },
              references: [], personalNote: null, previous: null, next: null, relatedConcepts: [] }
          : path === `/api/concepts/${entry.id}/view`
            ? { learningStatus: 'LEARNING', bookmarked: false, firstViewedAt: null,
                lastViewedAt: null, completedAt: null } : {};
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
    });
    await page.goto(`http://127.0.0.1:4179/concepts/${entry.id}`, { waitUntil: 'domcontentloaded' });
    await page.locator('article.concept-reading-content').waitFor({ state: 'visible', timeout: 15000 });
    const article = page.locator('article.concept-reading-content');
    await article.getByText(entry.slug === 'procedure-call-machine-level'
      ? '표준 RISC-V ABI에서 스택 프레임이 실제로 변하는 흐름'
      : '소프트웨어 TLB refill 모델도 있다').waitFor({ state: 'visible' });
    const block = article.locator('.markdown-code-block').first();
    await block.waitFor({ state: 'visible' });
    const code = block.locator('pre');
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    const geometry = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    assert(geometry.scrollWidth <= geometry.viewport + 2,
      'Unexpected page-level horizontal clipping ' + JSON.stringify(geometry));
    assert.equal(await block.getByRole('button', { name: '줄바꿈' }).getAttribute('aria-pressed'), 'false');
    await block.getByRole('button', { name: '줄바꿈', exact: true }).click();
    assert.equal(await block.getByRole('button', { name: '줄바꿈 해제' }).getAttribute('aria-pressed'), 'true');
    await block.getByRole('button', { name: '줄바꿈 해제' }).click();
    assert.equal(await block.getByRole('button', { name: '줄바꿈', exact: true }).getAttribute('aria-pressed'), 'false');
    if (entry.slug === 'procedure-call-machine-level') {
      assert((await code.textContent()).includes('addi sp, sp, -32'));
      assert((await article.locator('table').count()) >= 1, 'State transition table missing');
    } else {
      assert((await article.textContent()).includes('MIPS R4000'));
    }
    assert.deepEqual(errors, [], 'Browser errors');
    await page.screenshot({ path: join(dest, `${entry.slug}-${theme}-${width}.png`), fullPage: true });
    console.log(`PASS CA Reader ${entry.slug} ${theme} ${width}`);
    await page.close();
  }
} finally { await browser.close(); }
console.log('PASS ALL CA Reader 8 cases');
