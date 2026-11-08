import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright'

const dir=resolve(process.cwd(),'..','artifacts','network-area-audit')
mkdirSync(dir,{recursive:true})
const browser=await chromium.launch({headless:true})
const checks=[], errors=[]
const layouts=new Set(['stack','path','compare','branch','matrix','sequence'])
const widthVariants=[1280,1440], themes=['dark','light']

try {
  for(const width of widthVariants) for(const theme of themes) {
    const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1})
    page.on('pageerror',e=>errors.push(e.message))
    await page.emulateMedia({colorScheme:theme==='dark'?'light':'dark'})
    await page.goto('http://127.0.0.1:5173/network-area-preview.html',{waitUntil:'networkidle'})
    if(theme==='light') await page.getByRole('button',{name:'라이트로 보기'}).click()
    await page.waitForFunction(mode=>document.documentElement.getAttribute('data-theme')===mode,theme)
    const items=page.locator('section[data-network-example]')
    assert.equal(await items.count(),49,'Network DIAGRAM inventory coverage')
    const ids=await items.evaluateAll(nodes=>nodes.map(el=>el.getAttribute('data-network-example')))
    assert.equal(new Set(ids).size,49)
    for(const id of ids) {
      const item=page.locator('section[data-network-example="'+id+'"]')
      const figure=item.locator('figure.learning-visualization')
      const viz=figure.locator('[data-network-area="'+id+'"]')
      const svg=viz.locator('svg[role="img"]')
      assert.equal(await figure.count(),1,'Reader figure '+id)
      assert.equal(await svg.count(),1,'SVG '+id)
      const layout=await viz.getAttribute('data-network-layout')
      assert.ok(layouts.has(layout),'unknown layout '+id)
      const bounds=await svg.evaluate(element=>{
        const rect=element.getBoundingClientRect()
        const labels=[...element.querySelectorAll('text')].map(text=>{
          const r=text.getBoundingClientRect()
          return {text:text.textContent?.trim(),left:r.left-rect.left,right:r.right-rect.right,top:r.top-rect.top,bottom:r.bottom-rect.bottom}
        })
        return {
          width:rect.width,height:rect.height,
          pageOverflow:document.documentElement.scrollWidth-window.innerWidth,
          clipped:labels.filter(label=>label.left < -2 || label.right > rect.width+2 ||
            label.top < -3 || label.bottom > rect.height+3),
          overlaps:labels.flatMap((a,i)=>labels.slice(i+1).filter(b=>
            Math.min(a.right,b.right)-Math.max(a.left,b.left)>4 &&
            Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>4
          ).map(b=>[a.text,b.text])),
          figureBackground:getComputedStyle(element.closest('figure')).backgroundColor,
        }
      })
      assert.ok(bounds.width>=675 && bounds.height>80,'SVG collapsed: '+id)
      assert.ok(bounds.pageOverflow<=2,'page overflow: '+id)
      assert.equal(bounds.figureBackground,theme==='dark'?'rgb(24, 24, 24)':'rgb(255, 255, 255)')
      assert.equal(bounds.clipped.length,0,'text clipped: '+id+' '+JSON.stringify(bounds.clipped.slice(0,3)))
      assert.equal(bounds.overlaps.length,0,'text overlaps: '+id+' '+JSON.stringify(bounds.overlaps.slice(0,3)))
      await figure.screenshot({path:resolve(dir,id+'-'+theme+'-'+width+'.png'),animations:'disabled'})
      checks.push({id,layout,theme,width,result:'PASS'})
    }
    await page.close()
  }
  assert.deepEqual(errors,[],'browser JS errors')
  writeFileSync(resolve(dir,'qa.json'),JSON.stringify({
    cases:49,variants:checks.length,formats:[...layouts],checks,errors,
  },null,2))
  console.log('NETWORK_AREA_49_SVG_PASS',checks.length,'cases across themes/widths, zero text clipping')
} catch(error) {
  writeFileSync(resolve(dir,'qa.json'),JSON.stringify({checks,errors,failure:String(error)},null,2))
  console.error(error)
  process.exitCode=1
} finally {await browser.close()}
