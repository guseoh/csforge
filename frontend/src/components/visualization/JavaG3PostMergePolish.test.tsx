import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { defensiveCopyFrames, dispatchFrames, initializationFrames } from '../../lib/object-model-models'
import { valueReferenceFrames } from '../../lib/language-type-models'
import { JavaMapViewsEditorial } from './JavaCollectionStructureEditorial'
import { JavaReferenceStrengthEditorial } from './JavaStateEditorial'
import { JavaProcessMemoryEditorial } from './JavaRuntimeEditorial'
import { LearningVisualization } from './LearningVisualization'

const source=(type:string,example:string)=>JSON.stringify({version:1,type,example,title:'Java G3',description:'학습 도식'})

describe('Java G3 post-merge 12 P2 editorial polish without canonical edits',()=>{
  it.each(['static-members','inheritance','composition','casting'] as const)('replaces legacy object %s diagrams with compact static semantics',example=>{
    const html=renderToStaticMarkup(<LearningVisualization source={source('java-object-model',example)}/>)
    expect(html,example).toContain('java-ed-object')
    expect(html,example).toContain('java-desktop-fit')
    expect(html,example).not.toContain('diagram-canvas')
    expect(html,example).not.toContain('도식 단계 이동')
  })
  it.each([
    ['initialization',initializationFrames.length],
    ['dispatch',dispatchFrames.length],
    ['defensive-copy',defensiveCopyFrames.length],
  ] as const)('keeps %s model intact with %i accessible step scenes',(example,count)=>{
    const html=renderToStaticMarkup(<LearningVisualization source={source('java-object-model',example)}/>)
    expect(html,example).toContain('java-ed-object')
    expect(html,example).toContain('도식 단계 이동')
    expect(html,example).toContain('1 / '+count)
    expect(html,example).not.toContain('diagram-canvas')
  })
  it('retains constructor chaining counts without inventing duplicate Child objects',()=>{
    expect(initializationFrames[7].fields).toBe(1)
    expect(initializationFrames[7].blocks).toBe(1)
    const html=renderToStaticMarkup(<LearningVisualization source={source('java-object-model','initialization')}/>)
    expect(html).toContain('하나의 Child 객체')
    expect(html).toContain('필드 초기화 식')
    expect(html).toContain('현재까지 출력')
  })
  it('does not claim immutable elements or rollback for List.copyOf',()=>{
    expect(defensiveCopyFrames[4].member).toBe('park')
    expect(defensiveCopyFrames[5].rejected).toBe(true)
    const html=renderToStaticMarkup(<LearningVisualization source={source('java-object-model','defensive-copy')}/>)
    expect(html).toContain('복사본 생성 전')
    expect(html).toContain('깊게 복사되지')
  })
  it('keeps the single-visual primitive assignment and improves final and String intern identities',()=>{
    const original=renderToStaticMarkup(<LearningVisualization source={source('java-value-reference','assignment-copy')}/>)
    expect(original).toContain('diagram-canvas')
    for(const example of ['final-list','string-intern'] as const){
      const html=renderToStaticMarkup(<LearningVisualization source={source('java-value-reference',example)}/>)
      expect(html,example).toContain('java-ed-value-contract')
      expect(html,example).not.toContain('diagram-canvas')
    }
    expect(valueReferenceFrames('string-intern')[0].variables.map(v=>v.target)).toEqual(['A','A','B'])
  })
  it('reads Map backed views as three named rows with one removal result',()=>{
    const html=renderToStaticMarkup(<JavaMapViewsEditorial/>)
    for(const word of ['keySet()','values()','entrySet()','A=1, B=2','B=2','제거 전','제거 후','keys.remove'])expect(html).toContain(word)
    expect(html).toContain('java-ed-map-compare')
  })
  it('keeps ReferenceQueue independent of a referent object and 4 different lifetimes',()=>{
    const html=renderToStaticMarkup(<JavaReferenceStrengthEditorial/>)
    for(const word of ['강한 참조','소프트 참조','약한 참조','팬텀 참조','ReferenceQueue','PhantomReference 객체'])expect(html).toContain(word)
    expect(html).toContain('java-ed-reference-compare')
    expect(html).toContain('대상 객체 D가 큐에 담기는 것은 아닙니다')
  })
  it('displays JVM memory consumers separately from measurement and Xmx',()=>{
    const html=renderToStaticMarkup(<JavaProcessMemoryEditorial/>)
    for(const word of ['Java heap','Metaspace','direct / native','RSS · NMT','-Xmx'])expect(html).toContain(word)
    expect(html).toContain('java-ed-memory-compare')
    expect(html).toContain('물리적인 연속 배치')
  })
})
