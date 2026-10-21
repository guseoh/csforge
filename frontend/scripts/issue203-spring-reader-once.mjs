import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {chromium} from 'playwright';

const root='http://127.0.0.1:4179';
const out=join(process.cwd(),'issue203-spring-reader-evidence');
await mkdir(out,{recursive:true});
const examples=[
 {key:'application-context',id:Number(process.env.LIVE_SPRING_CONTEXT_ID),text:'BeanPostProcessor 초기화 후 처리'},
 {key:'dispatcher-servlet',id:Number(process.env.LIVE_SPRING_MVC_ID),text:'HandlerExceptionResolver'},
 {key:'scope-proxy',id:Number(process.env.LIVE_SPRING_SCOPE_ID),text:'prototype scoped proxy'},
 {key:'fetch-plan',id:Number(process.env.LIVE_SPRING_FETCH_ID),text:'@EntityGraph'},
];
for(const x of examples)assert(Number.isSafeInteger(x.id)&&x.id>0,`Invalid ID ${x.key}`);
const browser=await chromium.launch({headless:true});
try {
 for(const mode of ['light','dark'])for(const width of [375,1280])for(const x of examples){
  const page=await browser.newPage({viewport:{width,height:840},colorScheme:mode});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(t=>localStorage.setItem('csforge.theme.v1',t),mode);
  await page.goto(`${root}/concepts/${x.id}`,{waitUntil:'domcontentloaded'});
  const content=page.locator('article.concept-reading-content');
  await content.waitFor({state:'visible',timeout:30000});
  assert((await content.textContent()).includes(x.text),`Updated Spring concept missing from Reader ${x.key}`);
  assert.equal(await page.locator('html').getAttribute('data-theme'),mode);
  const overflow=await page.evaluate(()=>({body:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  assert(overflow.body<=overflow.viewport+2,`horizontal overflow: ${x.key} ${mode} ${width} ${JSON.stringify(overflow)}`);
  assert.deepEqual(errors,[],`Reader JS errors on ${x.key}`);
  await page.screenshot({path:join(out,`spring-${x.key}-${mode}-${width}.png`),fullPage:true});
  console.log(`PASS Spring Reader ${x.key} ${mode} ${width} live API`);
  await page.close();
 }
} finally { await browser.close(); }
console.log('PASS Issue #203 Spring Reader 16 real-API browser conditions');
