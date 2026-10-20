import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const dest = join(root, 'network-browser-evidence');
await mkdir(dest, { recursive: true });

const cases = [
  { id: 9901, file: '../content/network-http/tls/tls-handshake.md', title: 'TLS 핸드셰이크', keyword: 'CertificateVerify', reference: true },
  { id: 9902, file: '../content/network-http/http-message/content-length-transfer.md', title: 'Content-Length와 Transfer-Encoding', keyword: 'Transfer-Encoding' },
  { id: 9903, file: '../content/network-http/http-versions/header-compression.md', title: '헤더 압축', keyword: 'QPACK' },
];
for (const item of cases) {
  const source = await readFile(join(root, item.file), 'utf8');
  const matches = [...source.matchAll(/^---\\s*$/gm)];
  assert(matches.length >= 2, 'Missing frontmatter for ' + item.file);
  item.markdown = source.slice(matches[1].index + matches[1][0].length).trim();
  assert(item.markdown.includes(item.keyword), item.file + ' is missing expected corrected explanation');
}

const dns = JSON.parse(await readFile(join(root, '../content/network-http/dns/questions.json'), 'utf8'));
const cache = JSON.parse(await readFile(join(root, '../content/network-http/http-cache/questions.json'), 'utf8'));
const descriptive = dns.find(q => q.contentKey === 'network-http.core.dns.negative-cache.q2');
const choice = cache.find(q => q.contentKey === 'network-http.core.http-cache.last-modified.q1');
assert(descriptive?.questionType === 'DESCRIPTIVE');
assert(choice?.questionType === 'MULTIPLE_CHOICE');
const quizQuestions = [choice, descriptive].map((q, index) => ({
  questionId: 8900 + index,
  position: index,
  promptMarkdown: q.promptMarkdown,
  questionType: q.questionType,
  difficulty: q.difficulty,
  concepts: [{ id: 9901, slug: 'tls-handshake', title: 'Network & HTTP', areaSlug: 'network-http', areaName: 'Network & HTTP', level: 2 }],
  choices: (q.choices ?? []).map(c => ({ choiceKey: c.key, contentMarkdown: c.content })),
  answer: null,
}));

const browser = await chromium.launch({ headless: true });
try {
  for (const theme of ['light', 'dark']) for (const width of [375, 1280]) {
    for (const entry of cases) {
      const page = await browser.newPage({ viewport: { width, height: 820 }, colorScheme: theme });
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.addInitScript(t => localStorage.setItem('csforge.theme.v1', t), theme);
      await page.route('**/api/**', async route => {
        const path = new URL(route.request().url()).pathname;
        const response = path === '/api/auth/session'
          ? { authenticated: true, mode: 'LOCAL', email: null }
          : path === `/api/concepts/${entry.id}`
            ? {
                id: entry.id, contentKey: `network-http.core.${entry.id}`,
                slug: 'network-reader-fixture', title: entry.title, summary: 'Network correction Reader QA',
                contentMarkdown: entry.markdown, level: 2, contentStatus: 'PUBLISHED',
                area: { id: 4, slug: 'network-http', name: 'Network & HTTP' },
                topic: { id: 7, slug: 'tls', title: 'Network & HTTP' },
                progress: { learningStatus: 'UNSEEN', bookmarked: false, firstViewedAt: null, lastViewedAt: null, completedAt: null },
                references: entry.reference ? [
                  { id: 1, url: 'https://www.rfc-editor.org/rfc/rfc9846', title: 'RFC 9846: TLS 1.3',
                    type: 'OFFICIAL', language: 'en', depth: 'section',
                    recommendation: '현행 TLS 1.3 표준을 확인한다.', relationNote: 'RFC 8446 대체' }
                ] : [], personalNote: null, previous: null, next: null, relatedConcepts: []
              }
            : path === `/api/concepts/${entry.id}/view`
              ? { learningStatus: 'LEARNING', bookmarked: false, firstViewedAt: null, lastViewedAt: null, completedAt: null }
              : {};
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
      });
      await page.goto(`http://127.0.0.1:4179/concepts/${entry.id}`, { waitUntil: 'domcontentloaded' });
      const article = page.locator('article.concept-reading-content');
      await article.waitFor({ state: 'visible', timeout: 15000 });
      assert((await article.textContent()).includes(entry.keyword), 'Corrected content not rendered');
      assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
      if (entry.reference) {
        const reference = page.locator('.reference-list a[href="https://www.rfc-editor.org/rfc/rfc9846"]');
        await reference.waitFor({ state: 'visible' });
        assert((await reference.textContent()).includes('RFC 9846'));
      }
      const geom = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: window.innerWidth }));
      assert(geom.content <= geom.viewport + 2, 'Reader overflow ' + entry.title + ' ' + JSON.stringify(geom));
      assert.deepEqual(errors, [], 'Reader JS errors');
      await page.screenshot({ path: join(dest, `reader-${entry.id}-${theme}-${width}.png`), fullPage: true });
      console.log(`PASS Reader ${entry.title} ${theme} ${width}`);
      await page.close();
    }

    const page = await browser.newPage({ viewport: { width, height: 820 }, colorScheme: theme });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.addInitScript(t => localStorage.setItem('csforge.theme.v1', t), theme);
    await page.route('**/api/**', async route => {
      const path = new URL(route.request().url()).pathname;
      let response = {};
      if (path === '/api/auth/session') response = { authenticated: true, mode: 'LOCAL', email: null };
      if (path === '/api/quizzes/903' && route.request().method() === 'GET') {
        response = { quizId: 903, status: 'IN_PROGRESS', source: 'STANDARD',
          startedAt: '2026-10-20T10:00:00Z', submittedAt: null, completedAt: null,
          expiresAt: null, expired: false, lastPosition: 0, answeredCount: 0, questions: quizQuestions };
      }
      if (path.includes('/answer') && route.request().method() === 'PUT') {
        response = { ...JSON.parse(route.request().postData() ?? '{}'), answeredAt: '2026-10-20T10:01:00Z' };
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
    });
    await page.goto('http://127.0.0.1:4179/quiz/903', { waitUntil: 'domcontentloaded' });
    const card = page.locator('article.quiz-focus-card');
    await card.waitFor({ state: 'visible', timeout: 15000 });
    assert((await card.textContent()).includes('Last-Modified'), 'MC corrected prompt missing');
    assert.equal(await card.locator('.choice-button').count(), 4, 'Four choices expected');
    await card.locator('.choice-button').first().click();
    assert((await card.locator('.choice-button').first().getAttribute('class')).includes('selected'));
    await card.getByRole('button', { name: /다음/ }).click();
    await card.locator('textarea.quiz-answer-editor').waitFor({ state: 'visible' });
    assert((await card.textContent()).includes('DNS'), 'DNS historical correction prompt missing');
    await card.locator('textarea.quiz-answer-editor').fill('NXDOMAIN 부정 캐시 TTL이 남아 있다.');
    const geom = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    assert(geom.content <= geom.viewport + 2, 'Quiz overflow ' + JSON.stringify(geom));
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    assert.deepEqual(errors, [], 'Quiz JS errors');
    await page.screenshot({ path: join(dest, `quiz-${theme}-${width}.png`), fullPage: true });
    console.log(`PASS Quiz MC to descriptive ${theme} ${width}`);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log('PASS Network Reader/Quiz 16 browser cases');
