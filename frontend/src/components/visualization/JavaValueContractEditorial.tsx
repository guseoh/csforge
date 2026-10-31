import type { VisualizationOf } from '../../lib/learning-visualization'
import { valueReferenceFrames } from '../../lib/language-type-models'
import './java-editorial.css'

/** Static logical relationships; no claim about physical String pool or object placement. */
export function JavaValueContractEditorial({ data }: { data: VisualizationOf<'java-value-reference'> }) {
  const frame=valueReferenceFrames(data.example)[0]
  if(data.example==='final-list')return <section className="java-ed-object java-ed-value-contract java-desktop-fit" aria-label="final 참조와 가변 ArrayList의 구별">
    <div className="java-ed-object-central">
      <span className="java-editorial-kicker">변수의 참조 값 · 재대입 금지</span>
      <strong><code>final List&lt;String&gt; names</code></strong><span>→ 동일한 ArrayList 객체 A</span>
    </div>
    <div className="java-ed-object-pair" role="list">
      <div role="listitem"><span className="java-editorial-kicker">변수</span><strong>참조 재대입 불가</strong><code>names = anotherList; // 오류</code></div>
      <div role="listitem"><span className="java-editorial-kicker">객체 A의 내부</span><strong>리스트 내용 변경 가능</strong><code>names.add("kim");</code></div>
    </div>
    <p className="java-ed-note">{frame.explanation}</p>
    <p className="java-editorial-qualification">final은 지역 변수에 저장된 참조 값을 다시 대입하지 못하게 할 뿐 ArrayList의 변경 가능한 상태까지 불변으로 만드는 것은 아닙니다.</p>
  </section>
  return <section className="java-ed-object java-ed-value-contract java-desktop-fit" aria-label="String literal pooled created가 가리키는 두 논리 객체">
    <div className="java-ed-object-pair" role="list">
      <div role="listitem">
        <span className="java-editorial-kicker">대표 String 객체 A · 풀에서 찾은 동등한 리터럴</span>
        <strong><code>"java"</code></strong>
        <span><code>String literal → A</code> · <code>String pooled → A</code></span>
      </div>
      <div role="listitem">
        <span className="java-editorial-kicker">별도 String 객체 B · 생성한 참조</span>
        <strong><code>new String("java")</code></strong>
        <span><code>String created → B</code> · A와 내용은 같음</span>
      </div>
    </div>
    <p className="java-ed-object-code"><code>{frame.code}</code></p>
    <p className="java-ed-note">{frame.explanation}</p>
    <p className="java-editorial-qualification">A/B는 객체 동일성을 설명하는 논리적 표기입니다. String pool의 내부 레이아웃이나 물리 주소를 그린 것이 아니며 intern()은 기존 created 참조를 교체하지 않습니다.</p>
  </section>
}
