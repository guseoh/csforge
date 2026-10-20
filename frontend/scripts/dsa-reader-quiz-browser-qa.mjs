import assert from 'node:assert/strict';
import {readFile, mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {chromium} from 'playwright';

const dest=join(process.cwd(),'dsa-browser-evidence');
await mkdir(dest,{recursive:true});
const cases=[
  {id:9801,file:'../content/dsa/search-sort/binary-search-boundary.md',title:'이진 탐색 경계값',term:'정답 경계'},
  {id:9802,file:'../content/dsa/hashing/resize.md',title:'해시 테이블 크기 조정',term:'기대 Θ(n)'},
  {id:9803,file:'../content/dsa/dynamic-programming/initialization-order.md',title:'초기화와 계산 순서',term:'dp[4]=6'},
  {id:9804,file:'../content/dsa/graph-path/prim.md',title:'프림 알고리즘',term:'lazy Prim'},
];
for(const x of cases){
 const source=await readFile(join(process.cwd(),x.file),'utf8');
 const matches=[...source.matchAll(/^---\s*$/gm)];
 assert(matches.length>=2,x.file);
 x.content=source.slice(matches[1].index+matches[1][0].length).trim();
 assert(x.content.includes(x.term),x.file);
}
const data=JSON.parse(await readFile('../content/dsa/greedy/questions.json','utf8'));
const q=data.find(q=>q.contentKey==='dsa.core.greedy.interval-scheduling.q3');
assert(q?.questionType==='SCENARIO');
const browser=await chromium.launch({headless:true});
try{
 for(const theme of ['light','dark'])for(const width of [375,1280]){
  for(const item of cases){
   const page=await browser.newPage({viewport:{width,height:820},colorScheme:theme});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(t=>localStorage.setItem('csforge.theme.v1',t),theme);
   await page.route('**/api/**',async route=>{
    const path=new URL(route.request().url()).pathname;
    const response=path==='/api/auth/session'?{authenticated:true,mode:'LOCAL',email:null}
      :path===`/api/concepts/${item.id}`?{
       id:item.id,contentKey:`dsa.core.test.${item.id}`,slug:'dsa-qa',
       title:item.title,summary:'DSA corrected reader',contentMarkdown:item.content,level:2,contentStatus:'PUBLISHED',
       area:{id:3,slug:'dsa',name:'Data Structures & Algorithms'},topic:{id:3,slug:'search-sort',title:'DSA'},
       progress:{learningStatus:'UNSEEN',bookmarked:false,firstViewedAt:null,lastViewedAt:null,completedAt:null},
       references:[],personalNote:null,previous:null,next:null,relatedConcepts:[]}
      :path===`/api/concepts/${item.id}/view`?{learningStatus:'LEARNING',bookmarked:false,firstViewedAt:null,lastViewedAt:null,completedAt:null}:{};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response)});
   });
   await page.goto(`http://127.0.0.1:4179/concepts/${item.id}`,{waitUntil:'domcontentloaded'});
   const article=page.locator('article.concept-reading-content');
   await article.waitFor({state:'visible',timeout:15000});
   assert((await article.textContent()).includes(item.term));
   assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
   const geom=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:window.innerWidth}));
   assert(geom.scroll<=geom.width+2,JSON.stringify(geom));
   assert.deepEqual(errors,[]);
   await page.screenshot({path:join(dest,`reader-${item.id}-${theme}-${width}.png`),fullPage:true});
   await page.close();
  }
  const page=await browser.newPage({viewport:{width,height:820},colorScheme:theme});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(t=>localStorage.setItem('csforge.theme.v1',t),theme);
  await page.route('**/api/**',async route=>{
   const path=new URL(route.request().url()).pathname;
   const response=path==='/api/auth/session'?{authenticated:true,mode:'LOCAL',email:null}
     :path==='/api/quizzes/904'?{quizId:904,status:'IN_PROGRESS',source:'STANDARD',
      startedAt:'2026-10-20T10:00:00Z',submittedAt:null,completedAt:null,expiresAt:null,
      expired:false,lastPosition:0,answeredCount:0,
      questions:[{questionId:8904,position:0,promptMarkdown:q.promptMarkdown,questionType:q.questionType,
       difficulty:q.difficulty,concepts:[{id:9802,slug:'interval-scheduling',title:'구간 스케줄링',areaSlug:'dsa',areaName:'Data Structures & Algorithms',level:1}],choices:[],answer:null}]}
     :path.includes('/answer')?{...JSON.parse(route.request().postData()??'{}'),answeredAt:'2026-10-20T10:01:00Z'}:{};
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response)});
  });
  await page.goto('http://127.0.0.1:4179/quiz/904',{waitUntil:'domcontentloaded'});
  const card=page.locator('article.quiz-focus-card');
  await card.waitFor({state:'visible',timeout:15000});
  assert((await card.textContent()).includes('가장 빨리 시작하는 구간'), 'Actual DSA scenario prompt not rendered');
  await card.locator('textarea.quiz-answer-editor').fill('반열린 구간에서 A는 하나만 선택되지만 B,C,D는 세 개를 선택한다.');
  assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
  const g=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:window.innerWidth}));
  assert(g.scroll<=g.width+2,JSON.stringify(g));
  assert.deepEqual(errors,[]);
  await page.screenshot({path:join(dest,`quiz-${theme}-${width}.png`),fullPage:true});
  await page.close();
 }
}finally{await browser.close();}
console.log('PASS DSA Reader/Quiz 20 conditions');
