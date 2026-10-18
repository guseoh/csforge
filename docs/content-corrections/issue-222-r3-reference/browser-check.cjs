'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.join(process.env.R2_PLAYWRIGHT_ROOT,'node_modules/playwright'));
const apiRoot='http://127.0.0.1:8080', uiRoot='http://127.0.0.1:5173',out='/tmp/csforge-r3-reference';
fs.mkdirSync(out,{recursive:true});
const specs=[
 {area:'security',name:'Security',title:'사용자 조회(UserDetailsService)와 비밀번호 검증(PasswordEncoder)의 협력 경계',links:[
  {url:'https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/user-details-service.html',snippet:'DaoAuthenticationProvider'},
  {url:'https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html',snippet:'DelegatingPasswordEncoder'}]},
 {area:'infrastructure-cloud',name:'Infrastructure & Cloud',title:'백업·복구와 RPO/RTO',links:[
  {url:'https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final',snippet:'Withdrawn'},
  {url:'https://www.postgresql.org/docs/current/continuous-archiving.html',snippet:'시점 복구'}]},
 {area:'operating-systems',name:'Operating Systems',title:'사용자 수준 스레드(User-Level Thread)',links:[
  {url:'https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf',snippet:'M:N 매핑'}]}
];
const widths=[375,768,1280], themes=['light','dark'];
const report={revision:process.env.GITHUB_SHA,isolated:true,bootstrap:{},concepts:[],screens:[],keyboard:[],warnings:[],errors:[]};
async function api(route,method='GET'){
 const result=await fetch(apiRoot+route,{method,signal:AbortSignal.timeout(240000)});
 const body=await result.json();
 assert.equal(result.status,200,method+' '+route+' returned '+JSON.stringify(body).slice(0,600));
 return body;
}
async function verify(){
 let browser=null;
 try{
  const old=await api('/api/canonical-bootstrap/status'); assert.equal(old.state,'EMPTY','Refuse nonempty DB');
  const boot=await api('/api/canonical-bootstrap','POST');
  assert.equal(boot.success,true,'bootstrap failed');assert.equal(boot.totalItems,3380);
  assert.equal(boot.totals.errors,0);assert.equal(boot.totals.failed,0);
  assert.equal((await api('/api/canonical-bootstrap/status')).state,'READY');
  report.bootstrap={before:'EMPTY',after:'READY',total:boot.totalItems,created:boot.totals.created,errors:boot.totals.errors};
  const allAreas=await api('/api/learning-areas');
  for(const spec of specs){
   const found=allAreas.find(a=>a.slug===spec.area);
   assert.ok(found,'Missing LearningArea '+spec.area);
   const outline=await api('/api/learning-areas/'+found.slug+'/outline?page=0&size=200');
   const item=outline.items.find(x=>x.title===spec.title);
   assert.ok(item,'Missing Concept '+spec.title);
   spec.id=item.id;
   const concept=await api('/api/concepts/'+spec.id);
   const refs=concept.references||[];
   assert.equal(refs.length,spec.links.length,'Unexpected reference count for '+spec.title);
   assert.deepEqual(refs.map(x=>x.url),spec.links.map(x=>x.url),'Wrong order or URL for '+spec.title);
   for(const target of spec.links){
    const ref=refs.find(r=>r.url===target.url);
    assert.ok(ref?.relationNote?.includes(target.snippet),'Expected note missing for '+target.url);
    assert.equal(ref.title?.length>2,true);
   }
   spec.refs=refs;
   report.concepts.push({area:spec.area,title:spec.title,id:spec.id,refs:refs.map(r=>({url:r.url,title:r.title,note:r.relationNote}))});
   console.log('R3_REFERENCE_API_PASS',spec.area,spec.id,refs.length);
  }
  // An exact rerun must be idempotent on the same disposable PostgreSQL instance.
  const repeated=await api('/api/canonical-bootstrap','POST');
  assert.equal(repeated.success,true);assert.equal(repeated.totalItems,3380);
  assert.equal(repeated.totals.unchanged,3380);assert.equal(repeated.totals.errors,0);
  report.bootstrap.exactReimportUnchanged=repeated.totals.unchanged;
  browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.R2_CHROME_PATH?{executablePath:process.env.R2_CHROME_PATH}:{})});
  const page=await browser.newPage({viewport:{width:1280,height:950}});
  page.on('pageerror',e=>report.errors.push({message:e.message}));
  page.on('console',e=>{if(e.type()==='error')report.warnings.push({type:'console',text:e.text()});});
  page.on('response',r=>{if(r.status()>=400)report.warnings.push({type:'http',status:r.status(),url:r.url()});});
  for(const spec of specs){
   for(const width of widths){
    for(const theme of themes){
     await page.setViewportSize({width,height:950});
     await page.goto(uiRoot+'/',{waitUntil:'domcontentloaded'});
     await page.evaluate(mode=>localStorage.setItem('csforge.theme.v1',mode),theme);
     await page.goto(uiRoot+'/concepts/'+spec.id,{waitUntil:'domcontentloaded'});
     const items=page.locator('#references a.reference-item');
     await items.first().waitFor({timeout:30000});
     const cards=await items.evaluateAll(els=>els.map(el=>({
       url:el.getAttribute('href'),title:el.querySelector('strong')?.textContent?.trim(),
       meta:el.querySelector('.reference-item-metadata')?.textContent?.trim(),
       description:el.querySelector('.reference-item-body')?.textContent||'',
       opening:el.querySelector('.reference-item-open')?.textContent||'',
       target:el.getAttribute('target'),rel:el.getAttribute('rel')
     })));
     assert.equal(cards.length,spec.refs.length,spec.title);
     for(const ref of spec.refs){
      const card=cards.find(c=>c.url===ref.url);
      assert.ok(card,'Missing reference '+ref.url);
      assert.equal(card.title,ref.title);
      assert.ok(card.meta.includes('영어'),'Untranslated language '+card.meta);
      assert.ok(!card.meta.includes(' · en')&&!card.meta.includes(' · section'));
      assert.ok(card.open.includes('새 탭에서 열기'));
      assert.ok(card.description.includes(ref.relationNote));
      if(ref.recommendation) assert.ok(card.description.includes(ref.recommendation));
      assert.equal(card.target,'_blank');
      assert.ok(card.rel?.includes('noreferrer'));
      assert.ok(card.rel?.includes('noopener'));
     }
     const layout=await page.evaluate(()=>{
      const w=document.documentElement.clientWidth;
      return {width:w,scroll:document.documentElement.scrollWidth,
       theme:document.documentElement.getAttribute('data-theme'),
       rects:[...document.querySelectorAll('#references a.reference-item')].map(x=>{let r=x.getBoundingClientRect();return {left:r.left,right:r.right}})};
     });
     assert.equal(layout.theme,theme);
     assert.ok(layout.scroll<=layout.width+1,JSON.stringify(layout));
     assert.ok(layout.rects.every(r=>r.left>=-1&&r.right<=layout.width+1),JSON.stringify(layout));
     const filename=spec.area+'-'+width+'-'+theme+'.png';
     await page.locator('#references').screenshot({path:path.join(out,filename)});
     report.screens.push({area:spec.area,width,theme,file:filename,pass:true});
     console.log('R3_REFERENCE_READER_PASS',filename);
    }
   }
   await page.goto(uiRoot+'/concepts/'+spec.id,{waitUntil:'domcontentloaded'});
   for(const ref of spec.refs){
    const a=page.locator('#references a.reference-item[href="'+ref.url+'"]');
    await a.waitFor({timeout:25000});
    await a.focus();
    assert.ok(await a.evaluate(x=>document.activeElement===x));
    const original=page.url(),pending=page.waitForEvent('popup',{timeout:20000});
    await page.keyboard.press('Enter');
    const popup=await pending;
    await popup.waitForURL(u=>u.toString().startsWith(ref.url),{waitUntil:'commit',timeout:20000});
    await popup.close();
    assert.equal(page.url(),original);
    report.keyboard.push({area:spec.area,url:ref.url,result:'PASS'});
    console.log('R3_REFERENCE_KEYBOARD_PASS',spec.area,ref.url);
   }
  }
  assert.equal(report.errors.length,0,JSON.stringify(report.errors));
  const blocker=report.warnings.filter(x=>x.type==='http'&&x.status>=400&&!x.url?.endsWith('/favicon.ico'));
  assert.equal(blocker.length,0,'Local resource 4xx: '+JSON.stringify(blocker));
  console.log('R3_REFERENCE_HUMAN_USAGE_PASS',JSON.stringify({concepts:report.concepts.length,referenceLinks:report.keyboard.length,views:report.screens.length,bootstrap:report.bootstrap,warnings:report.warnings.length}));
 }catch(e){report.failure=String(e.stack||e);console.error('R3_REFERENCE_HUMAN_USAGE_FAIL',report.failure);process.exitCode=1;}
 finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));if(browser)await browser.close();}
}
verify().catch(e=>{console.error(e);process.exitCode=1;});
