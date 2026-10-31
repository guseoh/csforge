import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { javaApiScenes } from '../../lib/java-api-models'
import { LearningVisualization } from './LearningVisualization'
import { JavaDependencyInjectionEditorial, JavaStrategyPolicyEditorial, JavaAdapterContractEditorial } from './JavaCollaborationBoundaryEditorial'

const source=(example:string)=>JSON.stringify({version:1,type:'java-api-contract',example,title:'Java collaboration',description:'책임의 경계'})

describe('Java G3 collaboration and construction diagrams',()=>{
  it('places implementation construction in assembly, not in the using service',()=>{
    expect(javaApiScenes['dependency-injection'][0].graph?.edges.some(x=>x.from==='assembly'&&x.to==='sender')).toBe(true)
    const html=renderToStaticMarkup(<JavaDependencyInjectionEditorial/>)
    expect(html).toContain('SmtpEmailSender(config)')
    expect(html).toContain('OrderService(sender)')
    expect(html).toContain('일반 Java')
  })
  it('compares selected Strategy implementation with the stable policy contract',()=>{
    expect(javaApiScenes.strategy[0].graph?.edges.some(x=>x.dashed)).toBe(true)
    const html=renderToStaticMarkup(<JavaStrategyPolicyEditorial/>)
    expect(html).toContain('PriceCalculator')
    expect(html).toContain('DiscountPolicy')
    expect(html).toContain('RateDiscountPolicy')
    expect(html).toContain('setter')
  })
  it('expresses the adapter conversion boundary without moving business policy',()=>{
    expect(javaApiScenes.adapter[0].graph?.edges).toHaveLength(2)
    const html=renderToStaticMarkup(<JavaAdapterContractEditorial/>)
    expect(html).toContain('PaymentGateway.pay(Money)')
    expect(html).toContain('charge(int cents)')
    expect(html).toContain('PaymentDeclinedException')
    expect(html).toContain('비즈니스 정책')
  })
  it('routes three patterns to distinct Java-only static diagrams',()=>{
    for(const example of ['dependency-injection','strategy','adapter']){
      const html=renderToStaticMarkup(<LearningVisualization source={source(example)}/>)
      expect(html,example).toContain('java-ed-boundary')
      expect(html,example).not.toContain('diagram-canvas')
      expect(html,example).not.toContain('도식 단계 이동')
    }
  })
})
