import { javaApiScenes } from '../../lib/java-api-models'
import './java-editorial.css'

/** A counterfactual write is visibly separate from the actual generic assignment rejection. */
export function JavaInvarianceEditorial() {
  const scene = javaApiScenes.invariance[0]
  return <section className="java-ed-generics java-ed-invariance" aria-label="제네릭 불공변성과 허용되지 않는 대입 반례">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <span className="java-editorial-kicker">실제 Java 컴파일 규칙 · 대입 불가</span>
    <div className="java-ed-invariance-types" role="group" aria-label="List String을 List Object로 대입할 수 없음">
      <code>List&lt;String&gt;</code>
      <span>대입 불가 · 컴파일 오류</span>
      <code>List&lt;Object&gt;</code>
    </div>
    <div className="java-ed-invariance-hypothesis">
      <span className="java-editorial-kicker">반사실적 가정 · Java에서 허용되지 않는 실행</span>
      <ol>
        <li><strong>1. 허용한다고 가정</strong><span>같은 목록을 List&lt;Object&gt;로 취급</span></li>
        <li><strong>2. 잘못된 쓰기 가능</strong><code>values.add(10)</code></li>
        <li><strong>3. 원래 약속 위반</strong><span>List&lt;String&gt;에서 String을 읽는 계약이 깨짐</span></li>
      </ol>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">이 목록의 쓰기 경로는 컴파일러가 실제로 허용하는 실행이 아닙니다. 배열 공변성과 달리 제네릭 불공변성은 위험한 대입 자체를 컴파일 단계에서 막습니다.</p>
  </section>
}
