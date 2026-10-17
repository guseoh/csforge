/* PR #225 disposable localhost PostgreSQL / Reader UI acceptance. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(path.join(process.env.R1_PLAYWRIGHT_ROOT,'node_modules/playwright'));
const apiOrigin='http://127.0.0.1:8080',uiOrigin='http://127.0.0.1:5173';
const out='/tmp/csforge-r1-evidence';
fs.mkdirSync(out,{recursive:true});
const report={head:process.env.GITHUB_SHA,bootstrap:null,apiCases:[],browserCases:[],errors:[],screenshots:[],popup:null};
async function api(url,method='GET'){
 const r=await fetch(apiOrigin+url,{method,signal:AbortSignal.timeout(240000)});
 const json=await r.json();assert.equal(r.status,200,method+' '+url+' '+JSON.stringify(json).slice(0,1200));
 return json;
}
const cases=[
 {title:'정적 팩터리 메서드',gone:'tecoble.techcourse.co.kr/post/2020-05-26-static-factory-method'},
 {title:'equals 계약과 논리적 동등성',gone:'tecoble.techcourse.co.kr/post/2020-06-11-value-object'},
 {title:'hashCode와 equals의 계약',gone:'tecoble.techcourse.co.kr/post/2020-07-29-equals-and-hashCode'},
 {title:'클래스, 객체와 생성자',gone:'tecoble.techcourse.co.kr/post/2021-05-17-constructor'},
 {title:'Stream 파이프라인(Stream Pipeline)과 지연 실행',gone:'d2.naver.com/helloworld/4911107'},
 {title:'Path와 Files API',url:'https://d2.naver.com/helloworld/1219',refTitle:'JDK 7',note:'Path·Files'},
 {title:'try-with-resources와 억제 예외(suppressed exception)',url:'https://d2.naver.com/helloworld/1219',refTitle:'JDK 7',note:'suppressed exception'},
 {title:'플랫폼 스레드(Platform Thread)와 가상 스레드(Virtual Thread)',url:'https://openjdk.org/jeps/491',note:'JDK 24'},
 {title:'JIT·HotSpot과 워밍업(warm-up)',url:'https://techblog.woowahan.com/2588/',refTitle:'신규 포인트 시스템 전환기 #2 – 오픈 준비 단계',note:'7-1절'},
 {title:'강한·소프트·약한·팬텀 참조',url:'https://d2.naver.com/helloworld/329631',note:'Java 25'}
];
async function main(){
let browser;
try {
 const prev=await api('/api/canonical-bootstrap/status');
 assert.equal(prev.state,'EMPTY','Refuse to mutate existing DB: '+prev.state);
 const imported=await api('/api/canonical-bootstrap','POST');
 assert.equal(imported.success,true,'Bootstrap failed '+JSON.stringify(imported));
 assert.equal(imported.totalItems,3380);assert.equal(imported.totals.errors,0);assert.equal(imported.totals.failed,0);
 const after=await api('/api/canonical-bootstrap/status');assert.equal(after.state,'READY');
 report.bootstrap={before:prev.state,after:after.state,totalItems:imported.totalItems,created:imported.totals.created,batches:imported.totalBatches};
 console.log('R1_BOOTSTRAP_PASS',JSON.stringify(report.bootstrap));
 const outline=await api('/api/learning-areas/java/outline?page=0&size=200');
 assert.ok(outline.items.length>=145,'Java inventory '+outline.items.length);
 const ids=new Map(outline.items.map(c=>[c.title,c.id]));
 const resolved=new Map();
 for(const d of cases){
  const id=ids.get(d.title);assert.ok(Number.isInteger(id),'Missing concept '+d.title);
  const data=await api('/api/concepts/'+id);
  if(d.gone)assert.ok(data.references.every(r=>!r.url.includes(d.gone)),'Removed source still present '+d.title);
  const matched=d.url?data.references.find(r=>r.url===d.url):null;
  if(d.url)assert.ok(matched,'Missing ref '+d.title);
  if(d.refTitle)assert.equal(matched.title,d.refTitle,'Global title mismatch '+d.title);
  if(d.note)assert.ok(matched.relationNote?.includes(d.note),'Note mismatch '+d.title);
  assert.ok(data.references.some(r=>r.type==='OFFICIAL'),'Official source missing '+d.title);
  report.apiCases.push({title:d.title,id,links:data.references.length,pass:true});
  resolved.set(d.title,{id,data});
 }
 const a=resolved.get('Path와 Files API').data.references.find(r=>r.url==='https://d2.naver.com/helloworld/1219');
 const b=resolved.get('try-with-resources와 억제 예외(suppressed exception)').data.references.find(r=>r.url==='https://d2.naver.com/helloworld/1219');
 assert.equal(a.title,b.title);assert.notEqual(a.relationNote,b.relationNote);
 console.log('R1_API_PASS',report.apiCases.length);
 browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.R1_CHROME_PATH?{executablePath:process.env.R1_CHROME_PATH}:{})});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 const checks=[
  {title:'정적 팩터리 메서드',width:375,theme:'light'},
  {title:'Path와 Files API',width:375,theme:'dark'},
  {title:'플랫폼 스레드(Platform Thread)와 가상 스레드(Virtual Thread)',width:1280,theme:'light'},
  {title:'JIT·HotSpot과 워밍업(warm-up)',width:1280,theme:'dark'},
  {title:'강한·소프트·약한·팬텀 참조',width:375,theme:'light'}
 ];
 for(let i=0;i<checks.length;i++){
  const s=checks[i],caseData=resolved.get(s.title);
  await page.setViewportSize({width:s.width,height:900});
  await page.goto(uiOrigin+'/',{waitUntil:'domcontentloaded'});
  await page.evaluate(mode=>localStorage.setItem('csforge.theme.v1',mode),s.theme);
  await page.goto(uiOrigin+'/concepts/'+caseData.id,{waitUntil:'domcontentloaded'});
  const refs=page.locator('#references a.reference-item');
  await refs.first().waitFor({timeout:30000});
  const drawn=await refs.evaluateAll(els=>els.map(el=>({url:el.getAttribute('href'),title:el.querySelector('strong')?.textContent?.trim(),note:el.querySelector('small')?.textContent?.trim()||null,target:el.getAttribute('target')})));
  assert.equal(drawn.length,caseData.data.references.length,'Reference card count '+s.title);
  for(const ref of caseData.data.references){
   const ui=drawn.find(x=>x.url===ref.url);assert.ok(ui,'DOM URL not shown '+ref.url);
   assert.equal(ui.title,ref.title);assert.equal(ui.note,ref.relationNote||null);assert.equal(ui.target,'_blank');
  }
  const dims=await page.evaluate(()=>{
   const links=[...document.querySelectorAll('#references a.reference-item')],w=document.documentElement.clientWidth;
   return {width:w,scrollWidth:document.documentElement.scrollWidth,theme:document.documentElement.getAttribute('data-theme'),overflowingLinks:links.filter(x=>{const r=x.getBoundingClientRect();return r.left< -1||r.right>w+1}).length};
  });
  assert.equal(dims.theme,s.theme);assert.ok(dims.scrollWidth<=dims.width+1,JSON.stringify(dims));assert.equal(dims.overflowingLinks,0);
  const shot=s.width+'-'+s.theme+'-'+i+'.png';
  await page.locator('#references').screenshot({path:path.join(out,shot)});
  report.screenshots.push(shot);
  report.browserCases.push({...s,...dims,pass:true});
  console.log('R1_BROWSER_PASS',s.title,s.width,s.theme);
 }
 const id=resolved.get('Path와 Files API').id;
 await page.goto(uiOrigin+'/concepts/'+id,{waitUntil:'domcontentloaded'});
 const link=page.locator('#references a[href="https://d2.naver.com/helloworld/1219"]');
 await link.waitFor();await link.focus();
 assert.ok(await link.evaluate(el=>el===document.activeElement),'Unable to focus Reference');
 const home=page.url(),popupEvent=page.waitForEvent('popup',{timeout:20000});
 await page.keyboard.press('Enter');
 const popup=await popupEvent;
 await popup.waitForURL(url => url.toString().startsWith('https://d2.naver.com/helloworld/1219'), {timeout:20000, waitUntil:'commit'});
 await popup.close();assert.equal(page.url(),home);
 report.popup='PASS';
 assert.equal(report.errors.length,0,'Browser errors '+JSON.stringify(report.errors));
 console.log('R1_ACCEPTANCE_PASS',JSON.stringify({api:report.apiCases.length,browser:report.browserCases.length,popup:report.popup,screenshots:report.screenshots.length}));
} catch(e) {
 report.failure=String(e.stack||e);console.error('R1_ACCEPTANCE_FAILED',report.failure);process.exitCode=1;
} finally {
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
 if(browser)await browser.close();
}
}
main().catch(err=>{console.error('R1_UNCAUGHT',err);process.exitCode=1;});
