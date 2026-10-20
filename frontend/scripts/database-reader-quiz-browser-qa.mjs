import assert from 'node:assert/strict';
import {readFile, mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {chromium} from 'playwright';

const dest=join(process.cwd(),'database-browser-evidence');
await mkdir(dest,{recursive:true});
const cases=[
  {id:9801,file:'../content/database/mvcc/visibility.md',title:'MVCC 가시성',term:'xmin'},
  {id:9802,file:'../content/database/sql/window-function.md',title:'윈도 함수',term:'ROWS'},
  {id:9803,file:'../content/database/isolation/serializable.md',title:'직렬화 가능',term:'40001'},
];
for(const x of cases){
 const source=await readFile(join(process.cwd(),x.file),'utf8');
 const matches=[...source.matchAll(/^---\s*$/gm)];
 assert(matches.length>=2,x.file);
 x.content=source.slice(matches[1].index+matches[1][0].length).trim();
 assert(x.content.includes(x.term),x.file);
}
const data=JSON.parse(await readFile('../content/database/sql/questions.json','utf8'));
const q=data.find(q=>q.contentKey==='database.core.sql.select-order.q1');
assert(q?.questionType==='SHORT_ANSWER');
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
       id:item.id,contentKey:`database.core.test.${item.id}`,slug:'database-qa',
       title:item.title,summary:'Database corrected reader',contentMarkdown:item.content,level:2,contentStatus:'PUBLISHED',
       area:{id:3,slug:'database',name:'Database'},topic:{id:3,slug:'mvcc',title:'Database'},
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
       difficulty:q.difficulty,concepts:[{id:9802,slug:'window-function',title:'SQL',areaSlug:'database',areaName:'Database',level:1}],choices:[],answer:null}]}
     :path.includes('/answer')?{...JSON.parse(route.request().postData()??'{}'),answeredAt:'2026-10-20T10:01:00Z'}:{};
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response)});
  });
  await page.goto('http://127.0.0.1:4179/quiz/904',{waitUntil:'domcontentloaded'});
  const card=page.locator('article.quiz-focus-card');
  await card.waitFor({state:'visible',timeout:15000});
  assert((await card.textContent()).includes('AVG(salary)'), 'Actual short-answer prompt not rendered');
  await card.locator('textarea.quiz-answer-editor').fill('HAVING');
  assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
  const g=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:window.innerWidth}));
  assert(g.scroll<=g.width+2,JSON.stringify(g));
  assert.deepEqual(errors,[]);
  await page.screenshot({path:join(dest,`quiz-${theme}-${width}.png`),fullPage:true});
  await page.close();
 }
}finally{await browser.close();}
console.log('PASS Database Reader/Quiz 16 conditions');
