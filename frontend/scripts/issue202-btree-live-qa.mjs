import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {writeFile,mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const root='http://127.0.0.1:4179';
const answer='B-tree는 키를 정렬된 상태로 유지하므로 하한 위치를 찾은 뒤 인접한 리프 엔트리를 순서대로 스캔할 수 있다.';
const contentKey='database.core.index.btree.q2';
const file='../content/database/index/questions.json';
const pg=(sql)=>execFileSync('docker',['compose','exec','-T','postgres','psql','-U','csforge','-d','csforge','-At','-c',sql],{cwd:'..',encoding:'utf8'}).trim();
const api=async (path,method='GET',body=null)=>{const r=await fetch('http://127.0.0.1:8080'+path,{method,headers:{'Content-Type':'application/json','Idempotency-Key':randomUUID()},body:body?JSON.stringify(body):undefined});if(!r.ok)throw new Error(`${method} ${path}: ${r.status} ${await r.text()}`);return r.json();};
const qid=Number(pg(`select id from question where content_key='${contentKey}'`));
assert(qid>0);
const count=()=>Number(pg(`select count(*) from question_answer where question_id=${qid} and answer_kind='ACCEPTED_TEXT'`));
assert.equal(count(),8,'previous canonical accepted-answers contract');
const oldIds=pg(`select id from question_answer where question_id=${qid} and answer_kind='ACCEPTED_TEXT' order by id`).split('\n');
async function practiceViaApi(){
 const start=await api(`/api/quizzes/questions/${qid}/practice`,'POST');
 assert.equal(start.questionCount,1);
 await api(`/api/quizzes/${start.quizId}/questions/${qid}/answer`,'PUT',{selectedChoiceKey:null,answerText:answer,reviewNeeded:false});
 await api(`/api/quizzes/${start.quizId}/submit`,'POST');
 return api(`/api/quizzes/${start.quizId}/result`);
}
const old=await practiceViaApi();
assert.equal(old.correct,0);assert.equal(old.wrong,1);
assert.equal(old.questions[0].correct,false);
const before={
  qid, noteCount:pg('select count(*) from wrong_note'),
  attemptCount:pg('select count(*) from attempt'),
  reviewCount:pg('select count(*) from review_schedule'),
  quizCount:pg('select count(*) from quiz_session'),
};
assert(Number(before.noteCount)>=1,'old wrong-note must exist');
console.log('PASS reproduced previous false-negative in actual Spring/Postgres',before);
const current=execFileSync('git',['show',`${process.env.GITHUB_SHA}:content/database/index/questions.json`],{cwd:'..',encoding:'utf8'});
assert(JSON.parse(current).find(x=>x.contentKey===contentKey).acceptedAnswers.includes(answer));
await writeFile(file,current);
const expectedEntries=JSON.parse(current).length;
async function importCorrected(){
 const filePart=new Blob([current],{type:'application/json'});
 const form=new FormData();form.append('files',filePart,'questions.json');
 const previewResp=await fetch('http://127.0.0.1:8080/api/imports/preview',{method:'POST',body:form});
 assert(previewResp.ok,`Import Preview HTTP ${previewResp.status}: ${await previewResp.clone().text()}`);
 const preview=await previewResp.json();assert(preview.canApply,JSON.stringify(preview));
 const applyForm=new FormData();applyForm.append('files',filePart,'questions.json');applyForm.append('previewDigest',preview.previewDigest);
 const appliedResp=await fetch('http://127.0.0.1:8080/api/imports/apply',{method:'POST',body:applyForm});
 assert(appliedResp.ok,`Import Apply HTTP ${appliedResp.status}: ${await appliedResp.clone().text()}`);
 const applied=await appliedResp.json();
 return {preview,applied};
}
const first=await importCorrected();
assert.equal(first.preview.totals.updated,1,'B-tree q2 preview change');
assert.equal(first.preview.totals.unchanged,expectedEntries-1);
assert.equal(first.applied.totals.updated,1,'B-tree q2 apply changed');
assert.equal(first.applied.totals.failed,0);
assert.equal(Number(pg(`select id from question where content_key='${contentKey}'`)),qid);
assert.equal(count(),9);
const afterIds=pg(`select id from question_answer where question_id=${qid} and answer_kind='ACCEPTED_TEXT' order by id`).split(String.fromCharCode(10));
for(const id of oldIds)assert(afterIds.includes(id),'existing canonical accepted-answer ID disappeared');
for(const [table,oldCount] of [['wrong_note',before.noteCount],['attempt',before.attemptCount],['review_schedule',before.reviewCount],['quiz_session',before.quizCount]]){
 assert.equal(pg(`select count(*) from ${table}`),oldCount, `history modified on import: ${table}`);
}
const replay=await importCorrected();
assert.equal(replay.preview.totals.updated,0);
assert.equal(replay.preview.totals.unchanged,expectedEntries);
assert.equal(replay.applied.totals.updated,0);
assert.equal(replay.applied.totals.unchanged,expectedEntries);
console.log(`PASS direct Preview/Apply: 1 UPDATED, replay ${expectedEntries} UNCHANGED, history/IDs preserved`);

const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900},colorScheme:'light'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const created=await page.request.post(`${root}/api/quizzes/questions/${qid}/practice`,{headers:{'Idempotency-Key':randomUUID()}});
 assert.equal(created.status(),201);
 const quiz=await created.json();
 await page.goto(`${root}/quiz/${quiz.quizId}`,{waitUntil:'domcontentloaded'});
 const card=page.locator('article.quiz-focus-card');
 await card.waitFor({state:'visible',timeout:30000});
 assert((await card.textContent()).includes('범위 스캔'));
 await card.locator('textarea.quiz-answer-editor').fill(answer);
 await card.getByRole('button',{name:'제출하기'}).click();
 await page.waitForURL(u=>u.pathname===`/quiz/${quiz.quizId}/result`,{timeout:30000});
 const response=await page.request.get(`${root}/api/quizzes/${quiz.quizId}/result`);
 assert.equal(response.status(),200);
 const result=await response.json();
 assert.equal(result.correct,1);
 assert.equal(result.wrong,0);
 assert.equal(result.questions[0].gradingStatus,'GRADED');
 assert.equal(result.questions[0].correct,true);
 assert(result.questions[0].acceptedAnswers.includes(answer));
 assert.deepEqual(errors,[]);
 await mkdir('issue202-btree-evidence',{recursive:true});
 await page.screenshot({path:'issue202-btree-evidence/btree-corrected-result.png',fullPage:true});
 console.log('PASS corrected answer now GRADED correct via LIVE browser/UI/Spring API/Postgres');
 const stored=Number(pg(`select count(*) from attempt where quiz_session_id=${quiz.quizId} and correct=true`));
 assert.equal(stored,1,'new correct attempt not persisted');
 const oldWrong=await api(`/api/quizzes/${old.quizId}/result`); // old may not include quizId? check
 assert.equal(oldWrong.wrong,1,'historical wrong attempt was rewritten');
}finally{await browser.close();}
console.log('PASS issue202 B-tree short-answer correction E2E');
