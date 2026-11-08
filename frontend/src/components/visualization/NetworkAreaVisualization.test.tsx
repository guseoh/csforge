import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LearningVisualization } from './LearningVisualization'
import { parseVisualization } from '../../lib/learning-visualization'
import { networkAreaExamples, networkAreaSpecs } from '../../lib/network-area-model'

const root=resolve(process.cwd(),'..')
const payload=(example:string)=>JSON.stringify({
  version:1,type:'network-area',example,title:'네트워크 교육용 도식',description:'개념 구조와 상태 확인',
})

describe('Network & HTTP 49 authored diagram contracts', () => {
  it('uses exactly 49 unique case IDs and more than a generic flow format', () => {
    expect(networkAreaExamples).toHaveLength(49)
    expect(new Set(networkAreaExamples).size).toBe(49)
    expect(new Set(Object.values(networkAreaSpecs).map(x=>x.layout))).toEqual(
      new Set(['stack','path','compare','branch','matrix','sequence'])
    )
  })

  it.each(networkAreaExamples)('%s renders as a Reader SVG with its authored meaning',example=>{
    const parsed=parseVisualization(payload(example))
    expect(parsed?.type).toBe('network-area')
    const html=renderToStaticMarkup(<LearningVisualization source={payload(example)}/>)
    const spec=networkAreaSpecs[example]
    expect(html).toContain('data-network-area="'+example+'"')
    expect(html).toContain('data-network-layout="'+spec.layout+'"')
    expect(html).toContain('role="img"')
    expect(html).toContain('<title')
    expect(html).toContain('<desc')
    expect(html).toContain(spec.note.replace(/&/g,'&amp;').replace(/"/g,'&quot;'))
    expect(html).not.toContain('<foreignObject')
    expect(html).not.toContain('<script')
  })

  it('rejects arbitrary content or malformed/unsafe example IDs',()=>{
    for(const example of ['unknown','../../secrets','https://example.com','<script>']){
      expect(parseVisualization(payload(example))).toBeNull()
    }
    const malformed=JSON.stringify({
      version:1,type:'network-area',example:'arp',title:'도식',description:'설명',
      nodes:[{label:'javascript:evil',svg:'<svg onload=alert(1) />'}],
    })
    expect(parseVisualization(malformed)).toBeNull()
  })

  it('matches every Curriculum DIAGRAM record to a single valid Markdown fence',()=>{
    const catalog=readFileSync(resolve(root,'docs/content-corrections/network-pilot/NETWORK-AREA-INVENTORY.md'),'utf8')
    const rows=[...catalog.matchAll(/^\| ([\w-]+) \| \[(network-http\.core\.[\w.-]+)\]\([^)]*\) \|/gm)]
    expect(rows.length).toBe(53)
    const selected=new Set<string>()
    const fence=String.fromCharCode(96).repeat(3)
    const pattern=new RegExp(fence+'csforge-viz\\s*\\n([\\s\\S]*?)\\n'+fence,'g')
    for(const [,topic,key] of rows) {
      const slug=key.split('.').at(-1)!
      const file=resolve(root,'content/network-http',topic,slug+'.md')
      const markdown=readFileSync(file,'utf8')
      expect(markdown).toContain('contentKey: '+key)
      const fences=[...markdown.matchAll(pattern)]
      expect(fences.length,key).toBe(1)
      const data=JSON.parse(fences[0][1])
      expect(parseVisualization(JSON.stringify(data)),key).not.toBeNull()
      if(data.type==='network-area'){
        expect(data.example,key).toBe(slug)
        selected.add(slug)
      }
    }
    expect(selected.size).toBe(49)
    expect(selected).toEqual(new Set(networkAreaExamples))
  })

  it('preserves key technical distinctions in high-risk examples',()=>{
    expect(networkAreaSpecs.acknowledgement.note).toContain('ACK')
    expect(networkAreaSpecs['tls-handshake'].note).toContain('0-RTT')
    expect(networkAreaSpecs['redirect-status'].note).toContain('307')
    expect(networkAreaSpecs['cookie-scope'].note).toContain('Path')
    expect(networkAreaSpecs['transport-head-of-line'].note).toContain('TCP')
  })
})
