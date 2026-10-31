import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { javaApiScenes } from '../../lib/java-api-models'
import { LearningVisualization } from './LearningVisualization'
import {
 JavaThrowableClassificationEditorial, JavaExceptionBoundaryEditorial, JavaResourceOwnershipEditorial,
 JavaProcessingReflectionEditorial, JavaModuleBoundaryEditorial, JavaBinaryEvolutionEditorial, JavaSerializationBoundaryEditorial,
} from './JavaLanguageBoundaryEditorial'

const source=(example:string)=>JSON.stringify({version:1,type:'java-api-contract',example,title:'Java boundary',description:'언어 및 런타임 계약'})

describe('Java G3 language and interoperability boundaries',()=>{
  it('recognizes checked Throwable subclasses outside Exception',()=>{
    expect(javaApiScenes['throwable-tree'][0].graph?.edges.some(x=>x.from==='throwable'&&x.to==='error')).toBe(true)
    const html=renderToStaticMarkup(<JavaThrowableClassificationEditorial/>)
    expect(html).toContain('RuntimeException')
    expect(html).toContain('IOException')
    expect(html).toContain('직접 상속한 타입')
    expect(html).toContain('checked')
  })
  it('separates exception propagation from compulsory catch per layer',()=>{
    expect(javaApiScenes['exception-boundary'][0].graph?.nodes).toHaveLength(4)
    const html=renderToStaticMarkup(<JavaExceptionBoundaryEditorial/>)
    for(const x of ['Repository','Application Service','API Boundary','Client','catch'])expect(html).toContain(x)
  })
  it('separates owner lifetime from borrowed resource usage',()=>{
    const scene=javaApiScenes['resource-ownership'][0]
    expect(scene.graph?.edges.some(x=>x.dashed&&x.from==='borrower')).toBe(true)
    const html=renderToStaticMarkup(<JavaResourceOwnershipEditorial/>)
    expect(html).toContain('OutputStream')
    expect(html).toContain('Borrower')
    expect(html).toContain('임의 close 금지')
  })
  it('distinguishes javac processing from reflection on loaded classes',()=>{
    const html=renderToStaticMarkup(<JavaProcessingReflectionEditorial/>)
    expect(html).toContain('Annotation Processor')
    expect(html).toContain('Reflection')
    expect(html).toContain('SOURCE')
    expect(html).toContain('RUNTIME')
  })
  it('separates JPMS exports from deep reflection opens',()=>{
    const html=renderToStaticMarkup(<JavaModuleBoundaryEditorial/>)
    for(const x of ['requires','exports','opens','public'])expect(html).toContain(x)
    expect(html).toContain('비공개 멤버')
  })
  it('distinguishes recompiling source from linking old bytecode',()=>{
    const html=renderToStaticMarkup(<JavaBinaryEvolutionEditorial/>)
    expect(html).toContain('client.java')
    expect(html).toContain('client.class(v1)')
    expect(html).toContain('NoSuchMethodError')
    expect(html).toContain('의미적 호환성')
  })
  it('keeps untrusted input and deserialization callbacks within a marked boundary',()=>{
    const html=renderToStaticMarkup(<JavaSerializationBoundaryEditorial/>)
    expect(html).toContain('ObjectInputStream')
    expect(html).toContain('readObject')
    expect(html).toContain('ObjectInputFilter')
    expect(html).toContain('serialVersionUID')
  })
  it('routes all seven cases to static editorial descriptions',()=>{
    for(const example of ['throwable-tree','exception-boundary','resource-ownership','processing-reflection','module-boundary','binary-evolution','serialization-boundary']){
      const html=renderToStaticMarkup(<LearningVisualization source={source(example)}/>)
      expect(html,example).toContain('java-ed-boundary')
      expect(html,example).not.toContain('diagram-canvas')
      expect(html,example).not.toContain('diagram-fallback')
    }
  })
})
