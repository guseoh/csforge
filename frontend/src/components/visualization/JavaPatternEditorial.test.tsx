import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { javaApiScenes } from '../../lib/java-api-models'
import { LearningVisualization } from './LearningVisualization'
import { JavaDecoratorEditorial, JavaProxyBoundaryEditorial, JavaObserverEditorial, JavaStatePatternEditorial } from './JavaPatternEditorial'

const source=(example:string)=>JSON.stringify({version:1,type:'java-api-contract',example,title:'Java Pattern',description:'호출 관계'})

describe('Java G3 collaboration pattern semantics',()=>{
  it('contrasts two decorator nesting orders without implying different targets',()=>{
    const scene=javaApiScenes.decorator[0]
    expect(scene.graph?.nodes).toHaveLength(6)
    const html=renderToStaticMarkup(<JavaDecoratorEditorial/>)
    expect(html).toContain('Metrics 바깥')
    expect(html).toContain('Retry 바깥')
    expect(html).toContain('전체 재시도')
    expect(html).toContain('시도별')
  })
  it('distinguishes outer proxy entry from a target self call',()=>{
    const scene=javaApiScenes.proxy[0]
    expect(scene.graph?.edges.find(x=>x.to==='self')?.dashed).toBe(true)
    const html=renderToStaticMarkup(<JavaProxyBoundaryEditorial/>)
    expect(html).toContain('Caller')
    expect(html).toContain('this.otherMethod()')
    expect(html).toContain('Proxy를 다시 통과하지')
  })
  it('keeps listener A effects and B unsubscription on separate states',()=>{
    const scenes=javaApiScenes.observer
    expect(scenes).toHaveLength(4)
    expect(scenes[2].graph?.nodes.find(x=>x.id==='c')?.lines).toContain('미호출')
    const html=renderToStaticMarkup(<JavaObserverEditorial/>)
    expect(html).toContain('Listener A')
    expect(html).toContain('Listener B')
    expect(scenes[3].note).toContain('자동')
    expect(html).toContain('명시적 등록 해제')
    expect(html).toContain('1 / 4')
  })
  it('keeps current Published pointer distinct from legal transitions',()=>{
    const scene=javaApiScenes.state[0]
    expect(scene.graph?.edges.filter(x=>!x.dashed)).toHaveLength(3)
    const html=renderToStaticMarkup(<JavaStatePatternEditorial/>)
    for(const v of ['Published','Draft','Archived','publish()','revise()','archive()'])expect(html).toContain(v)
    expect(html).toContain('다시 호출할 수 있다는 뜻이 아닙니다')
  })
  it('routes exactly four patterns through Java-only renderers',()=>{
    for(const example of ['decorator','proxy','observer','state']){
      const html=renderToStaticMarkup(<LearningVisualization source={source(example)}/>)
      expect(html,example).toContain('java-ed-pattern')
      expect(html,example).not.toContain('diagram-canvas')
      expect(html,example).not.toContain('diagram-fallback')
      expect(html.includes('도식 단계 이동'),example).toBe(example==='observer')
    }
  })
})
