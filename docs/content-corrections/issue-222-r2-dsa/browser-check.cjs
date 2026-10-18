'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(path.join(process.env.R2_PLAYWRIGHT_ROOT,'node_modules/playwright'));
const apiRoot='http://127.0.0.1:8080',uiRoot='http://127.0.0.1:5173';
const out='/tmp/csforge-r2-dsa-reader'; fs.mkdirSync(out,{recursive:true});
const cases=[
 {title:'플로이드–워셜 알고리즘(Floyd–Warshall)',url:'https://algs4.cs.princeton.edu/44sp/',snippet:'연습문항 11',width:375,theme:'light'},
 {title:'이중 연결 리스트(Doubly Linked List)',url:'https://algs4.cs.princeton.edu/13stacks/',snippet:'pre/post 센티널',width:375,theme:'dark'},
 {title:'단조 스택·큐(Monotonic Stack and Queue)',url:'https://algs4.cs.princeton.edu/13stacks/',snippet:'Web Exercises 62',width:768,theme:'light'},
 {title:'전처리와 질의 비용',url:'https://algs4.cs.princeton.edu/14analysis/',snippet:'비용 모델',width:768,theme:'dark'},
 {title:'이진 트리 순회(Binary Tree Traversal)',url:'https://algs4.cs.princeton.edu/32bst/',snippet:'중위 순회',width:1280,theme:'light'},
 {title:'재귀 호출 상태',url:'https://algs4.cs.princeton.edu/22mergesort/',snippet:'Top-down mergesort',width:1280,theme:'dark'}
];
const report={head:process.env.GITHUB_SHA,context:'disposable PostgreSQL/Java25/Vite/Chromium',bootstrap:null,api:[],screens:[],keyboard:null,warnings:[],errors:[]};
async function api(endpoint,method='GET'){
 const res=await fetch(apiRoot+endpoint,{method,signal:AbortSignal.timeout(240000)});
 const json=await res.json();assert.equal(res.status,200,method+' '+endpoint+' '+JSON.stringify(json).slice(0,600));return json;
}
async function main(){
 let browser;
 try {
  assert.equal((await api('/api/canonical-bootstrap/status')).state,'EMPTY','Refuse non-empty DB');
  const b=await api('/api/canonical-bootstrap','POST');
  assert.equal(b.success,true,JSON.stringify(b));assert.equal(b.totalItems,3380);assert.equal(b.totals.errors,0);assert.equal(b.totals.failed,0);
  assert.equal((await api('/api/canonical-bootstrap/status')).state,'READY');
  report.bootstrap={before:'EMPTY',after:'READY',created:b.totals.created,error:b.totals.errors};
  const areas=await api('/api/learning-areas');
  const area=areas.find(x=>x.name.includes('Data Structures')||x.name.includes('자료구조')||x.slug.includes('algorithm'));
  assert.ok(area,'Missing DSA area in '+JSON.stringify(areas.map(x=>({name:x.name,slug:x.slug}))));
  const outline=await api('/api/learning-areas/'+area.slug+'/outline?page=0&size=200');
  const byTitle=new Map(outline.items.map(x=>[x.title,x.id]));
  for(const c of cases){
   c.id=byTitle.get(c.title);assert.ok(Number.isInteger(c.id),'Missing Concept: '+c.title);
   const concept=await api('/api/concepts/'+c.id);
   assert.equal(concept.references.length,1,'Unexpected reference count '+c.title);
   const ref=concept.references[0];assert.equal(ref.url,c.url);
   assert.ok(ref.relationNote?.includes(c.snippet),'Missing note '+c.title);
   c.ref=ref;report.api.push({title:c.title,id:c.id,url:ref.url,note:ref.relationNote});
  }
  console.log('DSA_R2_API_PASS',report.api.length);
  browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.R2_CHROME_PATH?{executablePath:process.env.R2_CHROME_PATH}:{})});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  page.on('pageerror',e=>report.errors.push({kind:'runtime',message:e.message}));
  page.on('console',e=>{if(e.type()==='error')report.warnings.push({kind:'console',text:e.text()})});
  page.on('response',r=>{if(r.status()>=400)report.warnings.push({kind:'http',status:r.status(),url:r.url()})});
  for(let i=0;i<cases.length;i++){
   const c=cases[i];await page.setViewportSize({width:c.width,height:900});
   await page.goto(uiRoot+'/',{waitUntil:'domcontentloaded'});
   await page.evaluate(theme=>localStorage.setItem('csforge.theme.v1',theme),c.theme);
   await page.goto(uiRoot+'/concepts/'+c.id,{waitUntil:'domcontentloaded'});
   const links=page.locator('#references a.reference-item');await links.first().waitFor({timeout:30000});
   const cards=await links.evaluateAll(es=>es.map(x=>({url:x.getAttribute('href'),title:x.querySelector('strong')?.textContent?.trim(),note:x.querySelector('small')?.textContent?.trim(),target:x.getAttribute('target')})));
   assert.equal(cards.length,1);assert.equal(cards[0].url,c.url);assert.equal(cards[0].title,c.ref.title);
   assert.equal(cards[0].note,c.ref.relationNote);assert.equal(cards[0].target,'_blank');
   const geometry=await page.evaluate(()=>{
    const width=document.documentElement.clientWidth;
    return {width,scroll:document.documentElement.scrollWidth,theme:document.documentElement.getAttribute('data-theme'),rects:[...document.querySelectorAll('#references a.reference-item')].map(el=>{const r=el.getBoundingClientRect();return [r.left,r.right]})};
   });
   assert.equal(geometry.theme,c.theme);assert.ok(geometry.scroll<=geometry.width+1,JSON.stringify(geometry));
   assert.ok(geometry.rects.every(([l,r])=>l>=-1&&r<=geometry.width+1),JSON.stringify(geometry));
   const filename=c.width+'-'+c.theme+'-'+i+'.png';
   await page.locator('#references').screenshot({path:path.join(out,filename)});
   report.screens.push({title:c.title,width:c.width,theme:c.theme,file:filename,status:'PASS'});
   console.log('DSA_R2_VIEW_PASS',c.title,c.width,c.theme);
  }
  const c=cases[0];await page.goto(uiRoot+'/concepts/'+c.id,{waitUntil:'domcontentloaded'});
  const link=page.locator('#references a.reference-item');await link.waitFor();await link.focus();
  assert.ok(await link.evaluate(el=>document.activeElement===el));
  const original=page.url();const popupPromise=page.waitForEvent('popup',{timeout:20000});
  await page.keyboard.press('Enter');const popup=await popupPromise;
  await popup.waitForURL(url=>url.toString().startsWith(c.url),{timeout:20000,waitUntil:'commit'});
  await popup.close();assert.equal(page.url(),original);report.keyboard='PASS';
  assert.equal(report.errors.length,0,JSON.stringify(report.errors));
  const blocking=report.warnings.filter(x=>x.kind==='http'&&x.status>=400&&!x.url?.endsWith('/favicon.ico'));
  assert.equal(blocking.length,0,JSON.stringify(blocking));
  console.log('DSA_R2_HUMAN_USAGE_PASS',JSON.stringify({api:report.api.length,views:report.screens.length,keyboard:report.keyboard,warnings:report.warnings.length}));
 } catch(error){report.failure=String(error.stack||error);console.error('DSA_R2_HUMAN_USAGE_FAIL',report.failure);process.exitCode=1;}
 finally {fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));if(browser)await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1});
