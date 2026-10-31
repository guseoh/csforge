import { useState } from 'react'
import type { VisualizationOf } from '../../lib/learning-visualization'
import { defensiveCopyFrames, dispatchFrames, initializationFrames } from '../../lib/object-model-models'
import { EditorialSteps } from './JavaSemanticDiagrams'
import './java-editorial.css'

type Example = VisualizationOf<'java-object-model'>['example']

/** Compact class and instance relationships, not physical object layouts. */
function StaticObject({ example }: { example: Example }) {
  if (example === 'static-members') return <section className="java-ed-object" aria-label="클래스의 정적 멤버와 서로 다른 두 인스턴스">
    <div className="java-ed-object-central"><span className="java-editorial-kicker">클래스의 공유 상태</span><strong>Member 클래스</strong><code>static totalCount = 2</code></div>
    <div className="java-ed-object-pair" role="list">
      <div role="listitem"><span className="java-editorial-kicker">인스턴스 a</span><strong>Member a</strong><code>name = "kim"</code></div>
      <div role="listitem"><span className="java-editorial-kicker">인스턴스 b</span><strong>Member b</strong><code>name = "lee"</code></div>
    </div>
    <p className="java-editorial-qualification">totalCount는 인스턴스마다 복제되는 값이 아닙니다. 인스턴스 필드 name은 각 객체별로 별도이며, 위 배치는 메모리 주소가 아닙니다.</p>
  </section>
  if (example === 'inheritance') return <section className="java-ed-object" aria-label="is-a 상속과 별도의 객체 협력 비교">
    <div className="java-ed-object-comparison" role="list">
      <div role="listitem"><span className="java-editorial-kicker">상속 · is-a</span><strong>CardPayment <span aria-hidden="true">→</span> Payment</strong><span>하위 타입이 상위 계약을 확장 · <code>extends</code></span></div>
      <div role="listitem"><span className="java-editorial-kicker">협력 · uses-a</span><strong>Report <span aria-hidden="true">→</span> FileUtil</strong><span>파일 기능을 호출 · 상속 관계 아님</span></div>
    </div>
    <p className="java-editorial-qualification">두 관계를 같은 상속 화살표로 해석하지 않습니다. 협력 호출은 타입의 하위 관계를 만들지 않습니다.</p>
  </section>
  if (example === 'composition') return <section className="java-ed-object" aria-label="OrderService와 DiscountPolicy 구현의 관계">
    <div className="java-ed-object-central"><span className="java-editorial-kicker">협력 객체</span><strong>OrderService</strong><span><code>DiscountPolicy.discount(order)</code> 계약에 위임</span></div>
    <div className="java-ed-object-pair" role="list">
      <div role="listitem"><span className="java-editorial-kicker">같은 인터페이스의 구현 후보 A</span><strong>FixedDiscountPolicy</strong><span>정액 할인</span></div>
      <div role="listitem"><span className="java-editorial-kicker">같은 인터페이스의 구현 후보 B</span><strong>RateDiscountPolicy</strong><span>비율 할인</span></div>
    </div>
    <p className="java-editorial-qualification">두 구현이 한 번의 discount 호출에서 모두 실행되는 뜻이 아닙니다. 실제 선택된 정책 객체를 통해 공통 계약을 호출합니다.</p>
  </section>
  if (example === 'casting') return <section className="java-ed-object" aria-label="실제 객체 타입에 따른 다운캐스팅 결과">
    <div className="java-ed-object-comparison" role="list">
      <div role="listitem"><span className="java-editorial-kicker">실제 객체 · Dog</span><strong><code>(Dog) animal</code> · 성공</strong><span>같은 Dog 객체 참조 · 새 객체를 생성하지 않음</span></div>
      <div role="listitem"><span className="java-editorial-kicker">실제 객체 · Cat</span><strong><code>(Dog) other</code> · 실패</strong><span><code>ClassCastException</code> · 실제 객체 타입은 바뀌지 않음</span></div>
    </div>
    <p className="java-editorial-qualification">참조 변수의 선언 타입보다 실제 객체 타입이 중요합니다. 캐스팅은 객체 자체를 다른 타입으로 변환하는 연산이 아닙니다.</p>
  </section>
  return null
}

/** Follow existing canonical execution snapshots without treating constructor delegation as new objects. */
export function ObjectModelDiagram({ data }: { data: VisualizationOf<'java-object-model'> }) {
  const [index, setIndex] = useState(0)
  const example = data.example
  const frames = example === 'initialization' ? initializationFrames : example === 'dispatch' ? dispatchFrames : example === 'defensive-copy' ? defensiveCopyFrames : null
  if (!frames) return <div className="java-desktop-fit"><StaticObject example={example} /></div>
  const frame = frames[index]
  return <section className="java-desktop-fit java-ed-object" aria-label={data.title}>
    {example === 'initialization' && (() => {
      const f=initializationFrames[index]
      return <>
        <span className="java-editorial-kicker">하나의 Child 객체 · 생성 중인 단계 {index + 1} / {initializationFrames.length}</span>
        <div className="java-ed-object-central"><strong>{f.location}</strong><code>Child.name = {f.name}</code></div>
        <div className="java-ed-object-pair" role="list">
          <div role="listitem"><strong>필드 초기화 식</strong><span>{f.fields}회 실행</span></div>
          <div role="listitem"><strong>인스턴스 초기화 블록</strong><span>{f.blocks}회 실행</span></div>
        </div>
        <p className="java-editorial-qualification">Child() → Child(String) → Parent()로 위임한 뒤 역순으로 돌아옵니다. 생성자는 같은 객체에서 실행되며 필드·블록 초기화를 위임할 때마다 반복하지 않습니다.</p>
        <details className="java-ed-object-output"><summary>현재까지 출력 · {f.output.length}줄</summary><ol>{f.output.map((line,i)=><li key={i}><code>{line}</code></li>)}</ol></details>
      </>
    })()}
    {example === 'dispatch' && (() => {
      const f=dispatchFrames[index]
      return <>
        <span className="java-editorial-kicker">하나의 인스턴스 메서드 호출 · {index + 1} / {dispatchFrames.length}</span>
        <div className="java-ed-object-comparison" role="list">
          <div role="listitem"><span className="java-editorial-kicker">컴파일 타임</span><strong>Animal.sound()</strong><span>선언 타입으로 호출 가능한 메서드 검사</span></div>
          <div role="listitem"><span className="java-editorial-kicker">런타임</span><strong>Dog.sound()</strong><span>{f.result} · 실제 수신 객체에 맞는 구현 선택</span></div>
        </div>
        <p className="java-editorial-qualification">이 도식은 인스턴스 메서드의 동적 디스패치를 설명합니다. 필드나 static 메서드 선택을 동일한 규칙으로 일반화하지 않습니다.</p>
      </>
    })()}
    {example === 'defensive-copy' && (() => {
      const f=defensiveCopyFrames[index]
      return <>
        <span className="java-editorial-kicker">논리적 목록 구조 · {index + 1} / {defensiveCopyFrames.length}</span>
        <div className="java-ed-object-pair" role="list">
          <div role="listitem"><strong>원본 L1 {f.shared && <small>· shared는 동일한 L1</small>}</strong><span>원소 참조 M{f.expanded ? ', N' : ''}</span></div>
          <div role="listitem"><strong>{f.copied ? 'copy · 구조적으로 분리된 L2' : '복사본 생성 전'}</strong><span>{f.copied ? '원소 참조 M · 수정 불가 목록' : '—'}</span></div>
        </div>
        <div className="java-ed-object-central"><span className="java-editorial-kicker">양쪽 목록에 공유되는 가변 원소 M</span><strong><code>MutableMember.name = "{f.member}"</code></strong><span>{f.rejected ? 'copy.add 거절 · 구조와 원소 상태 유지' : '목록 구조를 복사해도 원소는 깊게 복사되지 않음'}</span></div>
        <p className="java-editorial-qualification">L1·L2는 논리적 목록 구분입니다. List.copyOf가 반드시 새 객체를 할당한다는 일반 규칙이 아니며, 이 예제에서는 원본이 가변이므로 변경과 무관한 구조의 결과를 얻습니다.</p>
      </>
    })()}
    <p className="java-ed-object-code"><code>{frame.code}</code></p>
    <p className="java-ed-note" role="status" aria-live="polite">{frame.explanation}</p>
    <EditorialSteps index={index} count={frames.length} setIndex={setIndex} />
  </section>
}
