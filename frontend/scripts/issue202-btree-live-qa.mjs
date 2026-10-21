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
const api=async (path,method='GET',body=null)=>{const r=await fetch('http://127.0.0.1:8080'+path,{method,headers:{'Content-Type':'application/json','Idempotency-Key':randomUUID()},body:body?JSON.stringify(body):undefined});assert(r.ok,`${method} ${path}: ${r.status} ${await r.text()}`);return r.json();};
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
const updated=await api('/api/canonical-bootstrap','POST');
assert(updated.success,JSON.stringify(updated));
assert.equal(updated.totals.updated,1,'only B-tree q2 should update');
assert.equal(updated.totals.unchanged,3379);
assert.equal(Number(pg(`select id from question where content_key='${contentKey}'`)),qid);
assert.equal(count(),9);
const afterIds=pg(`select id from question_answer where question_id=${qid} and answer_kind='ACCEPTED_TEXT' order by id`).split('\n');
for(const id of oldIds)assert(afterIds.includes(id),'existing canonical accepted-answer ID disappeared');
for(const [table,oldCount] of [['wrong_note',before.noteCount],['attempt',before.attemptCount],['review_schedule',before.reviewCount],['quiz_session',before.quizCount]]){
 assert.equal(pg(`select count(*) from ${table}`),oldCount, `history modified on import: ${table}`);
}
const replay=await api('/api/canonical-bootstrap','POST');
assert(replay.success);
assert.equal(replay.totals.updated,0);
assert.equal(replay.totals.unchanged,3380);
console.log('PASS corrected import exactly one UPDATE, personal/history data preserved, exact reimport 3380 UNCHANGED');

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
