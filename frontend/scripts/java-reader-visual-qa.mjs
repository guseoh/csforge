import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright'

const root = resolve(process.cwd(), '..')
const out = resolve(root, 'artifacts/java-g3-reader')
const shots = resolve(out, 'screenshots')
mkdirSync(shots, { recursive: true })
const audit = JSON.parse(readFileSync(resolve(root, 'docs/content-audit/issue-292/java-g3-review.json'), 'utf8'))
const concepts = audit.conceptDiagrams.map((item, index) => {
  const raw = readFileSync(resolve(root, item.sourcePath), 'utf8')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) throw Error('Invalid canonical Markdown: ' + item.sourcePath)
  const meta = match[1]
  return {
    ...item, id: 5000 + index, markdown: match[2],
    title: meta.match(/^title:\s*"([^"]+)"/m)?.[1] || item.contentKey,
    summary: meta.match(/^summary:\s*"([^"]+)"/m)?.[1] || '',
    slug: meta.match(/^slug:\s*"?([^"\r\n]+)"?/m)?.[1] || item.contentKey.split('.').at(-1),
    level: Number(meta.match(/^level:\s*(\d+)/m)?.[1] || '1'),
  }
})
const byId = new Map(concepts.map(item => [item.id, {
  id: item.id, contentKey: item.contentKey, slug: item.slug, title: item.title, summary: item.summary,
  contentMarkdown: item.markdown, level: item.level, contentStatus: 'PUBLISHED',
  area: {id:1,slug:'java',name:'Java'}, topic: {id:101,slug:'java-g3',title:'Java G3'},
  progress: {learningStatus:'UNSEEN',bookmarked:false,firstViewedAt:null,lastViewedAt:null,completedAt:null},
  personalNote: null, references:[], previous:null, next:null, relatedConcepts:[],
}]))
const widths = [320,390,768,1024,1440]
const themes = ['light','dark']
const rows = [], failures = [], errors = [], screenshotList = []
const info = { sha: process.env.G3_QA_SHA || 'UNKNOWN', methodology: 'Real production Vite build and Chromium, real Guest and Owner Reader components, canonical Markdown, isolated mocked HTTP. No Production DB reads or writes.', diagrams: concepts.length, themes, widths, browserVisualAccepted: 0 }
const browser = await chromium.launch({headless:true,args:['--no-sandbox']})
const contexts = []
const jsErr = (item, err) => errors.push({item,message:String(err?.message || err).slice(0,800)})
function itemResult() {
  const figure = document.querySelector('.learning-visualization')
  if (!figure) return {missing:true}
  const box = figure.getBoundingClientRect()
  const bounds = [...figure.querySelectorAll('*')]
    .filter(node => !node.closest('.diagram-scroll') && !node.closest('.markdown-code-block'))
    .map(node => ({node,rect:node.getBoundingClientRect()}))
    .filter(v => v.rect.width>0 && (v.rect.right > Math.min(box.right,innerWidth)+3 || v.rect.left < Math.max(0,box.left)-3))
    .slice(0,6).map(v => ({tag:v.node.tagName,cls:String(v.node.className).slice(0,50),right:Math.round(v.rect.right)}))
  return {
    missing:false, figureWidth:Math.round(box.width), figureRight:Math.round(box.right),
    docWidth:document.documentElement.scrollWidth, theme:document.documentElement.getAttribute('data-theme'),
    content:[...figure.children].some(child => child.tagName !== 'FIGCAPTION' && !child.classList.contains('diagram-fallback')),fallback:!!figure.querySelector('.diagram-fallback'),
    controls:!!figure.querySelector('nav.java-ed-steps'),overhanging:bounds,
  }
}
async function makeContext(mode) {
  const ctx = await browser.newContext({viewport:{width:1440,height:940},deviceScaleFactor:1,serviceWorkers:'block'})
  contexts.push(ctx)
  await ctx.addInitScript(() => localStorage.setItem('csforge.theme.v1','light'))
  await ctx.route('**/api/**', async r => {
    const req = r.request(), path = new URL(req.url()).pathname
    const send = (body,status=200) => r.fulfill({status,contentType:'application/json',body:JSON.stringify(body)})
    if (path === '/api/auth/session') return send({authenticated:mode==='owner',mode:mode==='owner'?'LOCAL':'CLOUD',email:mode==='owner'?'qa@example.invalid':null})
    const cm = path.match(/^\/api\/(?:public\/)?concepts\/(\d+)(?:\/(understanding|view|progress|note))?$/)
    if (cm) {
      const id = Number(cm[1]), data = byId.get(id)
      if (!data) return send({code:'NOT_FOUND',message:'No QA fixture'},404)
      if (cm[2] === 'understanding') return send({conceptId:id,learningStatus:'UNSEEN',evidence:{uniqueQuestions:0,finalizedAttempts:0,correctQuestions:0,pendingSelfCheckCount:0},recentAccuracyPercent:null,assessmentStatus:'NOT_ENOUGH_EVIDENCE',lastAssessedAt:null})
      if (cm[2] === 'view' || cm[2] === 'progress') return send(data.progress)
      if (cm[2] === 'note') return send({content:'',updatedAt:null})
      return send(data)
    }
    if (path.includes('bookmark-categories')) return send([])
    if (path.includes('learning-areas')) return send({items:[],page:{page:0,size:100,totalElements:0,totalPages:0,hasNext:false,hasPrevious:false}})
    return send({items:[],page:{page:0,size:100,totalElements:0,totalPages:0,hasNext:false,hasPrevious:false}})
  })
  const page = await ctx.newPage()
  page.on('pageerror', err => jsErr({mode,url:page.url()},err))
  return page
}
async function inspect(page, item, mode) {
  try {
    await page.goto('http://127.0.0.1:4173/concepts/'+item.id,{waitUntil:'domcontentloaded',timeout:20000})
    const figure = page.locator('.learning-visualization').first()
    await figure.waitFor({timeout:15000})
    for (const theme of themes) {
      await page.getByRole('button',{name:theme==='dark'?'다크 테마':'라이트 테마'}).click()
      for (const width of widths) {
        await page.setViewportSize({width,height:940})
        const data = await page.evaluate(itemResult)
        const failed = []
        if (data.missing || !data.content || data.fallback) failed.push('RENDER_FALLBACK')
        if (data.theme !== theme) failed.push('THEME')
        if (data.docWidth>width+3) failed.push('PAGE_OVERFLOW')
        if (data.figureRight>width+3 || data.figureWidth<100) failed.push('FIGURE_WIDTH')
        if (data.overhanging?.length) failed.push('CHILD_OVERFLOW')
        const row = {mode,key:item.contentKey,sourcePath:item.sourcePath,theme,width,failed,data}
        rows.push(row)
        if (failed.length) failures.push(row)
        if ((mode==='guest' || item.id%10===0) && (width===390||width===1440)) {
          const filename=mode+'-'+item.id+'-'+theme+'-'+width+'.png'
          await figure.screenshot({path:resolve(shots,filename),animations:'disabled',timeout:14000})
          screenshotList.push({mode,key:item.contentKey,theme,width,filename})
        }
      }
    }
    if (mode==='guest') {
      const steps=figure.locator('nav.java-ed-steps')
      if (await steps.count()) {
        const before=await steps.locator('span[aria-live]').first().textContent()
        const next=steps.getByRole('button',{name:/다음/})
        if (await next.isEnabled()) {
          await next.focus()
          await page.keyboard.press('Enter')
          const after=await steps.locator('span[aria-live]').first().textContent()
          if (before===after) failures.push({mode,key:item.contentKey,failed:['KEYBOARD_STEP_NOT_ADVANCED']})
          const prev=steps.getByRole('button',{name:/이전/})
          if (await prev.isEnabled()) await prev.click()
          const restored=await steps.locator('span[aria-live]').first().textContent()
          if (before!==restored) failures.push({mode,key:item.contentKey,failed:['PREVIOUS_STEP_NOT_RESTORED']})
        }
      }
    }
  } catch(err) { jsErr({mode,key:item.contentKey},err) }
}
try {
  const guest=await makeContext('guest')
  for(const item of concepts)await inspect(guest,item,'guest')
  const owner=await makeContext('owner')
  for(const item of concepts)await inspect(owner,item,'owner')
} catch(err) { jsErr({stage:'global'},err) }
finally { for(const ctx of contexts)await ctx.close().catch(()=>{});await browser.close() }

info.checks=rows.length
info.passed=rows.filter(x=>!x.failed.length).length
info.failed=failures.length
info.errors=errors.length
info.screenshots=screenshotList.length
info.expected=concepts.length*2*themes.length*widths.length
info.coverage=info.checks+'/'+info.expected
const result={info,failures,errors,screenshots:screenshotList,measurements:rows}
writeFileSync(resolve(out,'results.json'),JSON.stringify(result,null,2))
const summary=['# Java G3 Browser Reader QA','','Build: '+info.sha,'',
  'Method: isolated Chromium, Guest and mock Owner Reader; screenshots need human visual sign-off.','',
  'Total checks: '+info.checks+' / '+info.expected,'Passed: '+info.passed,
  'Layout failures: '+info.failed,'Browser errors: '+info.errors,'Screenshots: '+info.screenshots,
  '','## First failures',...failures.slice(0,60).map(x=>'- '+JSON.stringify({mode:x.mode,key:x.key,width:x.width,theme:x.theme,problems:x.failed})),
  '','## First errors',...errors.slice(0,30).map(x=>'- '+JSON.stringify(x))].join('\n')
writeFileSync(resolve(out,'summary.md'),summary)
console.log('G3_READER_QA_SUMMARY '+JSON.stringify(info))
for(const f of failures.slice(0,30)) console.log('G3_READER_QA_FAILURE '+JSON.stringify({mode:f.mode,key:f.key,width:f.width,theme:f.theme,failed:f.failed}))
for(const e of errors.slice(0,20)) console.log('G3_READER_QA_ERROR '+JSON.stringify(e))
if(process.env.GITHUB_STEP_SUMMARY)writeFileSync(process.env.GITHUB_STEP_SUMMARY,summary)
if(failures.length||errors.length||rows.length!==info.expected)process.exitCode=1
