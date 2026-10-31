import { javaApiScenes } from '../../lib/java-api-models'
import './java-editorial.css'

/** Logical equality implies equal hashes, but hash collisions do not imply equality. */
export function JavaHashContractEditorial() {
  const scene = javaApiScenes['hash-contract'][0]
  return <section className="java-ed-contract" aria-label="equals와 hashCode의 단방향 계약">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-contract-pair">
      <div><strong><code>a.equals(b) == true</code></strong><span>반드시 같은 해시</span><code>a.hashCode() == b.hashCode()</code></div>
      <div><strong><code>a.hashCode() == b.hashCode()</code></strong><span>동등성은 보장되지 않음</span><code>a.equals(b) == false</code><small>충돌이 발생할 수 있음</small></div>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">해시 값은 유일한 객체 식별자도 메모리 주소도 아닙니다. 해시 기반 Map은 해시로 후보를 줄인 뒤 키 동등성을 확인합니다.</p>
  </section>
}

/** Show tie breaking and reverse-order scope without an artificial state animation. */
export function JavaComparatorEditorial() {
  const scene = javaApiScenes.comparator[0]
  return <section className="java-ed-contract" aria-label="금액 비교와 동률 시 id 비교">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <ol className="java-ed-contract-order">
      <li><strong>01 · amount 비교</strong><span>비교 결과가 0이 아니면 여기서 순서 확정</span></li>
      <li><strong>02 · id 비교</strong><span>amount가 동률일 때만 적용</span></li>
    </ol>
    <div className="java-ed-contract-contrast">
      <div><strong><code>comparingLong(amount).thenComparingLong(id)</code></strong><span>금액 ↑ · 동률이면 ID ↑</span></div>
      <div><strong><code>...thenComparingLong(id).reversed()</code></strong><span>금액 ↓ · 동률이면 ID ↓</span></div>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">reversed()는 호출 이전에 구성된 Comparator 전체를 뒤집습니다. thenComparing은 두 번째 비교 기준을 제공할 뿐 ID의 고유성은 보장하지 않습니다.</p>
  </section>
}

/** The same end supports stack and queue semantics; arrow directions are explicit. */
export function JavaDequeEndsEditorial() {
  const scene = javaApiScenes.deque[0]
  return <section className="java-ed-contract" aria-label="Deque의 FIRST와 LAST 및 FIFO와 LIFO">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-deque-ends" role="group" aria-label="Deque 논리적 원소 순서">
      <div><small>FIRST</small><strong>A</strong></div><div><small> </small><strong>B</strong></div><div><small>LAST</small><strong>C</strong></div>
    </div>
    <div className="java-ed-contract-contrast">
      <div><strong>FIFO · Queue 방식</strong><code>offerLast(X)</code><span>뒤로 추가 → <code>pollFirst()</code>로 앞에서 제거</span></div>
      <div><strong>LIFO · Stack 방식</strong><code>push(X) = addFirst(X)</code><span>앞에 추가 → <code>pop() = removeFirst()</code>로 같은 앞에서 제거</span></div>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">Deque가 언제나 FIFO인 것은 아니며 ArrayDeque는 null을 허용하지 않고 자체적으로 스레드 안전하지 않습니다. 그림은 내부 저장 배열의 물리 배치가 아닙니다.</p>
  </section>
}

/** Iterator.remove is optional and may only follow a next call once per item. */
export function JavaIteratorRemoveEditorial() {
  const scene = javaApiScenes.iterator[0]
  return <section className="java-ed-contract" aria-label="Iterator remove 호출의 유효 상태">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <ol className="java-ed-contract-order">
      <li><strong>next() 이전</strong><span><code>remove()</code> → <code>IllegalStateException</code></span></li>
      <li><strong>next() 성공 후</strong><span>지원하는 반복자라면 직전 반환 원소를 한 번 제거 가능</span></li>
      <li><strong>remove() 이후</strong><span>다시 <code>next()</code>하지 않으면 연속 remove 불가</span></li>
    </ol>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">remove()는 선택적 API이므로 구현에 따라 UnsupportedOperationException이 발생할 수 있습니다. fail-fast는 best-effort 진단이며 동시성 제어가 아닙니다.</p>
  </section>
}

/** A captured local reference does not freeze the object it points to. */
export function JavaLambdaCaptureEditorial() {
  const scene = javaApiScenes['lambda-capture'][0]
  return <section className="java-ed-contract" aria-label="effectively final 지역 변수와 가변 객체의 구분">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-capture">
      <div><span className="java-editorial-kicker">캡처된 지역 변수</span><strong><code>names</code></strong><small>참조 변수 재대입 없음 · effectively final</small></div>
      <span aria-hidden="true">→</span>
      <div><span className="java-editorial-kicker">참조하는 객체</span><strong><code>ArrayList&lt;String&gt;</code></strong><small><code>[] → ["java"]</code> · 내용 변경 가능</small></div>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">지역 변수의 effectively final 제약은 참조 대상의 불변성이나 스레드 사이의 동기화를 보장하지 않습니다.</p>
  </section>
}

/** Stream operations differ in filtering, mapping, and flattening the element type. */
export function JavaStreamShapesEditorial() {
  const scene = javaApiScenes['stream-shapes'][0]
  const operations = [
    { op: 'filter', input: 'Stream<Order>', output: 'Stream<Order>', meaning: '조건에 맞는 주문만 남김 · 타입 유지' },
    { op: 'map', input: 'Stream<Order>', output: 'Stream<Long>', meaning: '각 Order를 ID 하나로 변환' },
    { op: 'flatMap', input: 'Stream<Order>', output: 'Stream<Item>', meaning: '각 주문의 상품 흐름을 하나로 펼침' },
  ] as const
  return <section className="java-ed-contract" aria-label="filter map flatMap의 원소 변환 결과">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-contract-operations" role="list">
      {operations.map((item) => <div role="listitem" key={item.op}>
        <strong><code>{item.op}</code></strong>
        <span><code>{item.input}</code> <span aria-hidden="true">→</span> <code>{item.output}</code></span>
        <small>{item.meaning}</small>
      </div>)}
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">flatMap은 그룹별 Stream을 하나의 Stream으로 평탄화하므로 원래 주문별 그룹을 자동 유지하지 않습니다. 이 표현은 원소 변환 계약이지 모든 연산에서 고정 원소 수를 뜻하지 않습니다.</p>
  </section>
}
