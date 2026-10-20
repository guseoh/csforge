import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {chromium} from 'playwright';

const root='http://127.0.0.1:4179';
const out=join(process.cwd(),'issue202-live-evidence');
await mkdir(out,{recursive:true});
const ids=[
 {area:'Network',id:Number(process.env.LIVE_NETWORK_CONCEPT),term:'RFC 9846',ref:'https://www.rfc-editor.org/rfc/rfc9846'},
 {area:'Database',id:Number(process.env.LIVE_DATABASE_CONCEPT),term:'xmin'},
 {area:'DSA',id:Number(process.env.LIVE_DSA_CONCEPT),term:'정답 경계'},
];
const quiz=[
 {area:'Network',id:Number(process.env.LIVE_NETWORK_QUESTION),term:'Last-Modified',type:'MULTIPLE_CHOICE'},
 {area:'Database',id:Number(process.env.LIVE_DATABASE_QUESTION),term:'AVG(salary)',type:'SHORT_ANSWER'},
 {area:'DSA',id:Number(process.env.LIVE_DSA_QUESTION),term:'가장 빨리 시작하는 구간',type:'SCENARIO'},
];
for(const c of [...ids,...quiz])assert(Number.isSafeInteger(c.id)&&c.id>0,'Missing real ID: '+c.area);

const browser=await chromium.launch({headless:true});
try {
 const api=await browser.newContext();
 // Make sure the three real corrected records are returned by Spring/JPA.
 for(const c of ids){
  const response=await api.request.get(`http://127.0.0.1:8080/api/concepts/${c.id}`);
  assert.equal(response.status(),200,`GET concept ${c.area}`);
  const data=await response.json();
  assert(data.contentMarkdown?.includes(c.term),`Not corrected ${c.area} content`);
  if(c.ref)assert(data.references?.some(r=>r.url===c.ref),'RFC9846 reference missing in live backend');
  console.log(`PASS live backend concept ${c.area}: ${data.contentKey}`);
 }
 // The same real Spring backend drives Vite's API proxy; NO API mocking.
 for(const theme of ['light','dark'])for(const width of [375,1280])for(const c of ids){
  const page=await browser.newPage({viewport:{width,height:820},colorScheme:theme});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(t=>localStorage.setItem('csforge.theme.v1',t),theme);
  await page.goto(`${root}/concepts/${c.id}`,{waitUntil:'domcontentloaded'});
  const article=page.locator('article.concept-reading-content');
  await article.waitFor({state:'visible',timeout:30000});
  assert((await article.textContent()).includes(c.term),'Reader correction not visible: '+c.area);
  if(c.ref)await page.locator(`.reference-list a[href="${c.ref}"]`).waitFor({state:'visible'});
  assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
  const geom=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:window.innerWidth}));
  assert(geom.scroll<=geom.width+2,`Horizontal Reader overflow: ${JSON.stringify({area:c.area,theme,width,...geom})}`);
  assert.deepEqual(errors,[],`Reader JS errors: ${c.area}`);
  await page.screenshot({path:join(out,`reader-${c.area}-${theme}-${width}.png`),fullPage:true});
  console.log(`PASS LIVE Reader ${c.area} ${theme} ${width}`);
  await page.close();
 }
 for(const item of quiz){
  const page=await browser.newPage({viewport:{width:1280,height:850},colorScheme:'light'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('csforge.theme.v1','light'));
  const created=await page.request.post(`${root}/api/quizzes/questions/${item.id}/practice`,{headers:{'Idempotency-Key':randomUUID()}});
  assert.equal(created.status(),201,`Create practice: ${item.area} ${await created.text()}`);
  const session=await created.json();
  assert.equal(session.questionCount,1);
  const res=await page.request.get(`${root}/api/quizzes/${session.quizId}`);
  assert.equal(res.status(),200);
  const s=await res.json();
  assert.equal(s.questions.length,1);
  assert.equal(s.questions[0].questionType,item.type);
  assert(s.questions[0].promptMarkdown.includes(item.term),'Old prompt: '+item.area);
  await page.goto(`${root}/quiz/${session.quizId}`,{waitUntil:'domcontentloaded'});
  const card=page.locator('article.quiz-focus-card');
  await card.waitFor({state:'visible',timeout:25000});
  assert((await card.textContent()).includes(item.term),'Quiz prompt UI not rendered: '+item.area);
  if(item.type==='MULTIPLE_CHOICE'){
   const choices=card.locator('.choice-button');
   assert.equal(await choices.count(),4);
   await choices.nth(3).click();
  }else {
   await card.locator('textarea.quiz-answer-editor').fill(item.type==='SHORT_ANSWER'?'HAVING':'B, C, D 세 구간을 선택할 수 있어 A보다 많다.');
  }
  await card.getByRole('button',{name:'제출하기'}).click();
  await page.waitForURL(url=>url.pathname===`/quiz/${session.quizId}/result`,{timeout:25000});
  const result=await page.request.get(`${root}/api/quizzes/${session.quizId}/result`);
  assert.equal(result.status(),200,`Quiz result ${item.area}`);
  const data=await result.json();
  assert.equal(data.total,1);
  assert.equal(data.questions[0].questionId,item.id);
  assert.deepEqual(errors,[],`Quiz JS errors: ${item.area}`);
  await page.screenshot({path:join(out,`quiz-${item.area}.png`),fullPage:true});
  console.log(`PASS LIVE Quiz ${item.area}: ${data.questions[0].gradingStatus}`);
  await page.close();
 }
 await api.dispose();
} finally {await browser.close();}
console.log('PASS Issue #202 combined source: live PostgreSQL/Spring Reader(12) and Quiz(3) checks');
