import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { javaApiScenes } from '../../lib/java-api-models'
import { LearningVisualization } from './LearningVisualization'
import { JavaLatchGateEditorial, JavaSemaphoreEditorial, JavaFutureCompletionEditorial, JavaDeadlockProgressEditorial } from './JavaCoordinationRelationsEditorial'

const source=(example:string)=>JSON.stringify({version:1,type:'java-api-contract',example,title:'Java Coordination',description:'동시성 관계'})

describe('Java G3 resource coordination and progress states',()=>{
  it('shows one-shot latch count without equating a signal and task success',()=>{
    const scenes=javaApiScenes['latch-gate']
    expect(scenes).toHaveLength(3)
    expect(scenes[2].note).toContain('reset')
    const html=renderToStaticMarkup(<JavaLatchGateEditorial/>)
    expect(html).toContain('남은 latch count')
    expect(html).toContain('작업 성공 건수가 아닙니다')
    expect(html).toContain('1 / 3')
  })
  it('distinguishes semaphore permits from lock ownership',()=>{
    const scenes=javaApiScenes['semaphore-permits']
    expect(scenes).toHaveLength(3)
    expect(scenes[1].note).toContain('finally')
    const html=renderToStaticMarkup(<JavaSemaphoreEditorial/>)
    expect(html).toContain('Semaphore(3)')
    expect(html).toContain('소유 스레드만')
    expect(html).toContain('1 / 3')
  })
  it('does not confuse three alternative Future completion cases',()=>{
    const scenes=javaApiScenes['future-completion']
    expect(scenes).toHaveLength(3)
    expect(scenes[2].note).toContain('allOf')
    const html=renderToStaticMarkup(<JavaFutureCompletionEditorial/>)
    expect(html).toContain('CompletableFuture')
    expect(html).toContain('thenCompose')
    expect(html).toContain('cancel(true)')
    expect(html).toContain('1 / 3')
  })
  it('does not present deadlock, starvation and livelock as one timeline',()=>{
    const scenes=javaApiScenes['deadlock-progress']
    expect(scenes).toHaveLength(3)
    expect(scenes[0].graph?.edges.filter(x=>x.dashed)).toHaveLength(2)
    const html=renderToStaticMarkup(<JavaDeadlockProgressEditorial/>)
    expect(html).toContain('순환 대기')
    expect(html).toContain('독립 현상')
    expect(html).toContain('1 / 3')
  })
  it('routes four cases through responsive Java editorial steps',()=>{
    for(const example of ['latch-gate','semaphore-permits','future-completion','deadlock-progress']){
      const html=renderToStaticMarkup(<LearningVisualization source={source(example)}/>)
      expect(html,example).toContain('java-ed-coordination')
      expect(html,example).toContain('도식 단계 이동')
      expect(html,example).not.toContain('diagram-canvas')
    }
  })
})
