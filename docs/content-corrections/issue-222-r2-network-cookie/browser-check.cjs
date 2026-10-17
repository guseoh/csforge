'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium}=require(path.join(process.env.R2_PLAYWRIGHT_ROOT,'node_modules/playwright'));
const root = 'http://127.0.0.1:8080', ui='http://127.0.0.1:5173';
const evidence='/tmp/csforge-r2-cookie-browser';
fs.mkdirSync(evidence,{recursive:true});
const report={branch:process.env.GITHUB_SHA,context:'github-hosted Ubuntu; disposable PostgreSQL; local-mode backend',bootstrap:null,api:[],browser:[],warnings:[],errors:[],screenshots:[],keyboard:null};
const expectRefs=[
  'https://www.rfc-editor.org/rfc/rfc6265.html',
  'https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html'
];
const configs=[
 {title:'Cookie로 상태 이어가기',width:375,theme:'light',note:'5.7'},
 {title:'Set-Cookie로 쿠키 저장하기',width:375,theme:'dark',note:'5.6'},
 {title:'쿠키의 전송 범위와 SameSite',width:1280,theme:'light',note:'5.6.7'},
 {title:'쿠키의 전송 범위와 SameSite',width:1280,theme:'dark',note:'5.6.7'}
];
async function api(uri,method='GET'){
 const res=await fetch(root+uri,{method,signal:AbortSignal.timeout(240000)});
 const data=await res.json();assert.equal(res.status,200,method+' '+uri+' '+JSON.stringify(data).slice(0,800));
 return data;
}
async function main(){
 let browser;
 try {
  const s=await api('/api/canonical-bootstrap/status');
  assert.equal(s.state,'EMPTY','Refuse to run on non-empty database');
  const b=await api('/api/canonical-bootstrap','POST');
  assert.equal(b.success,true,JSON.stringify(b));
  assert.equal(b.totalItems,3380);
  assert.equal(b.totals.errors,0);
  assert.equal(b.totals.failed,0);
  assert.equal((await api('/api/canonical-bootstrap/status')).state,'READY');
  report.bootstrap={before:'EMPTY',after:'READY',items:3380,created:b.totals.created,error:b.totals.errors};
  console.log('R2_BOOTSTRAP_PASS',JSON.stringify(report.bootstrap));
  const outline=await api('/api/learning-areas/network-http/outline?page=0&size=200');
  const byTitle=new Map(outline.items.map(c=>[c.title,c.id]));
  const unique=[...new Set(configs.map(c=>c.title))],byCase=new Map();
  for(const title of unique){
    const id=byTitle.get(title);
    assert.ok(Number.isInteger(id),'Missing Concept '+title);
    const concept=await api('/api/concepts/'+id);
    assert.equal(concept.references.length,2,'Unexpected reference count for '+title);
    assert.deepEqual(new Set(concept.references.map(x=>x.url)),new Set(expectRefs));
    assert.ok(concept.references.every(x=>x.relationNote?.length>25),'Missing relationNote '+title);
    const draft=concept.references.find(x=>x.url===expectRefs[1]);
    assert.ok(draft.title.includes('Internet-Draft')&&draft.title.includes('미발행'));
    assert.ok(draft.recommendation.includes('초안')&&draft.recommendation.includes('발행 전'));
    const official=concept.references.find(x=>x.url===expectRefs[0]);
    assert.ok(official.title.includes('RFC 6265')&&!official.title.includes('Draft'));
    report.api.push({title,id,passed:true,urls:concept.references.map(x=>x.url)});
    byCase.set(title,{id,concept});
  }
  console.log('R2_API_PASS',report.api.length);
  browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.R2_CHROME_PATH?{executablePath:process.env.R2_CHROME_PATH}:{})});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  page.on('pageerror',x=>report.errors.push({kind:'runtime',message:x.message}));
  page.on('console',x=>{if(x.type()==='error')report.warnings.push({kind:'console',message:x.text(),source:x.location()?.url})});
  page.on('response',response=>{if(response.status()>=400)report.warnings.push({kind:'http',status:response.status(),url:response.url()})});
  for(let i=0;i<configs.length;i++){
    const c=configs[i],data=byCase.get(c.title);
    await page.setViewportSize({width:c.width,height:900});
    await page.goto(ui+'/',{waitUntil:'domcontentloaded'});
    await page.evaluate(theme=>localStorage.setItem('csforge.theme.v1',theme),c.theme);
    await page.goto(ui+'/concepts/'+data.id,{waitUntil:'domcontentloaded'});
    const links=page.locator('#references a.reference-item');
    await links.first().waitFor({timeout:30000});
    const cards=await links.evaluateAll(es=>es.map(x=>({url:x.getAttribute('href'),title:x.querySelector('strong')?.textContent?.trim(),note:x.querySelector('small')?.textContent?.trim(),target:x.getAttribute('target')})));
    assert.equal(cards.length,2);
    for(const expected of data.concept.references){
      const card=cards.find(x=>x.url===expected.url);
      assert.ok(card,'Missing URL in Reader '+expected.url);
      assert.equal(card.title,expected.title);
      assert.equal(card.note,expected.relationNote);
      assert.equal(card.target,'_blank');
    }
    assert.ok(cards.some(x=>x.note.includes(c.note)));
    const metrics=await page.evaluate(()=>{
      const width=document.documentElement.clientWidth;
      return {width,scroll:document.documentElement.scrollWidth,theme:document.documentElement.getAttribute('data-theme'),links:[...document.querySelectorAll('#references a.reference-item')].map(x=>{const r=x.getBoundingClientRect();return {left:r.left,right:r.right}})};
    });
    assert.equal(metrics.theme,c.theme);
    assert.ok(metrics.scroll<=metrics.width+1,JSON.stringify(metrics));
    assert.ok(metrics.links.every(x=>x.left>=-1&&x.right<=metrics.width+1),JSON.stringify(metrics));
    const screen=c.width+'-'+c.theme+'-'+i+'.png';
    await page.locator('#references').screenshot({path:path.join(evidence,screen)});
    report.screenshots.push(screen);
    report.browser.push({title:c.title,width:c.width,theme:c.theme,passed:true});
    console.log('R2_VIEW_PASS',c.title,c.width,c.theme);
  }
  const first=byCase.get('Cookie로 상태 이어가기');
  await page.goto(ui+'/concepts/'+first.id,{waitUntil:'domcontentloaded'});
  const link=page.locator('#references a[href="https://www.rfc-editor.org/rfc/rfc6265.html"]');
  await link.waitFor();await link.focus();
  assert.ok(await link.evaluate(el=>el===document.activeElement));
  const from=page.url(),open=page.waitForEvent('popup',{timeout:20000});
  await page.keyboard.press('Enter');
  const popup=await open;
  await popup.waitForURL(x=>x.toString().startsWith('https://www.rfc-editor.org/rfc/rfc6265.html'),{timeout:20000,waitUntil:'commit'});
  await popup.close();
  assert.equal(page.url(),from);
  report.keyboard='PASS';
  assert.equal(report.errors.length,0,'Browser runtime errors '+JSON.stringify(report.errors));
  const blockers=report.warnings.filter(x=>x.kind==='http'&&x.status>=400&&!x.url?.endsWith('/favicon.ico'));
  assert.equal(blockers.length,0,'Unexpected failing local resource '+JSON.stringify(blockers));
  console.log('R2_BROWSER_ACCEPTANCE_PASS',JSON.stringify({api:report.api.length,views:report.browser.length,keyboard:report.keyboard,warnings:report.warnings.length}));
 } catch(e) {
  report.failure=String(e.stack||e);
  console.error('R2_BROWSER_ACCEPTANCE_FAIL',report.failure);
  process.exitCode=1;
 } finally {
  fs.writeFileSync(path.join(evidence,'report.json'),JSON.stringify(report,null,2));
  if(browser)await browser.close();
 }
}
main().catch(err=>{console.error('R2_UNCAUGHT',err);process.exitCode=1});
