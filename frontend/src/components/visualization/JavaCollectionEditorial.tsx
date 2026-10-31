import { useState } from 'react'
import { javaApiScenes } from '../../lib/java-api-models'
import { EditorialNote, EditorialSteps } from './JavaSemanticDiagrams'
import './java-editorial.css'

/** PECS is a reading/writing boundary, not an immutable-collection hierarchy. */
export function JavaPecsEditorial() {
  const scene = javaApiScenes.pecs[0]
  return <section className="java-ed-collection" aria-label="PECS의 읽기와 쓰기 방향">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-pecs">
      <div className="java-ed-pecs-side">
        <span className="java-editorial-kicker">값을 읽는 원본</span>
        <strong><code>List&lt;? extends T&gt;</code></strong>
        <span>읽기 결과는 T</span>
      </div>
      <div className="java-ed-pecs-transfer" aria-label="원본에서 T를 읽어 대상으로 전달">
        <span>읽기</span><strong>T</strong><span>쓰기</span>
      </div>
      <div className="java-ed-pecs-side">
        <span className="java-editorial-kicker">값을 쓰는 대상</span>
        <strong><code>List&lt;? super T&gt;</code></strong>
        <span>T 추가 가능 · 읽으면 Object</span>
      </div>
    </div>
    <p className="java-editorial-qualification">extends가 불변 뷰라는 뜻은 아닙니다. null 추가와 clear 지원 여부 등은 해당 컬렉션 계약을 따릅니다.</p>
    <p className="java-ed-note">{scene.note}</p>
  </section>
}

/** Compare reference-slot shifting against positional traversal and link changes. */
export function JavaListLayoutEditorial() {
  const scene = javaApiScenes['list-layout'][0]
  const values = ['A', 'B', 'C', 'D']
  const linked = ['A', 'B', 'C']
  return <section className="java-ed-collection" aria-label="ArrayList와 LinkedList의 논리적 저장 구조">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-layout-case">
      <div className="java-ed-layout-label"><strong>ArrayList</strong><span>인덱스로 참조 슬롯 접근</span></div>
      <ol className="java-ed-reference-slots" aria-label="배열 안의 참조 슬롯">
        {values.map((value, index) => <li key={value}><small>[{index}]</small><strong>{value}</strong></li>)}
      </ol>
      <p><code>add(2, X)</code> → C·D의 <strong>참조 슬롯</strong>을 뒤로 이동</p>
    </div>
    <div className="java-ed-layout-case">
      <div className="java-ed-layout-label"><strong>LinkedList</strong><span>위치 탐색 후 앞·뒤 링크 변경</span></div>
      <ol className="java-ed-linked-nodes" aria-label="양방향 연결 노드">
        {linked.map((value, index) => <li key={value}>
          {index > 0 && <span className="java-ed-bidirectional" aria-hidden="true">⇄</span>}
          <span className="java-ed-linked-node">{value}</span>
        </li>)}
      </ol>
      <p><code>add(index, X)</code>는 위치 탐색을 생략할 수 없지만 이미 해당 위치에 있는 ListIterator를 이용한다면 다릅니다.</p>
    </div>
    <p className="java-editorial-qualification">그림은 논리적 슬롯·연결 관계입니다. 실제 JVM 객체의 연속 메모리 배치나 내부 노드 필드 레이아웃을 뜻하지 않습니다.</p>
    <p className="java-ed-note">{scene.note}</p>
  </section>
}

/** Retains the same eight cells. Only position, limit and known content change. */
export function JavaBufferEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes.buffer
  const scene = scenes[index]
  const cells = scene.cells ?? []
  return <section className="java-ed-collection" aria-label="8칸 ByteBuffer의 position과 limit 상태">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <dl className="java-ed-buffer-metrics">
      <div><dt>position</dt><dd>{scene.position}</dd></div>
      <div><dt>limit</dt><dd>{scene.limit}</dd></div>
      <div><dt>capacity</dt><dd>8</dd></div>
    </dl>
    <ol className="java-ed-buffer-slots" aria-label="같은 ByteBuffer의 여덟 칸">
      {cells.map((cell, slot) => <li key={slot} className={slot >= (scene.limit ?? 8) ? 'is-outside-limit' : slot === scene.position ? 'is-position' : ''}>
        <small>[{slot}]</small><strong>{cell}</strong>
      </li>)}
    </ol>
    <p className="java-ed-buffer-state">{scene.position === 8 ? 'position은 버퍼의 끝 경계' : `다음 접근 위치: ${scene.position}`} · 읽기·쓰기 한계: {scene.limit}</p>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scene.note} />
    <p className="java-editorial-qualification"><code>flip()</code>은 값은 그대로 두고 범위를 바꾸며, <code>compact()</code>는 남은 바이트를 앞으로 옮깁니다. <code>clear()</code>는 데이터를 지우지 않습니다. ?는 미정 영역입니다.</p>
  </section>
}

/** An ordered, sequential example of anyMatch, not a guarantee of peek evaluation counts. */
export function JavaStreamLazinessEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['stream-laziness']
  const scene = scenes[index]
  const numbers = [90, 101, 102, 104] as const
  return <section className="java-ed-collection" aria-label="순차 Stream에서 지연 실행과 anyMatch 조기 종료">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <ol className="java-ed-stream-values" aria-label="원소의 평가 상태">
      {numbers.map((value, n) => {
        const state = index === 0 ? '아직 평가 전' : n < index - 1 ? '이전 확인' : n === index - 1 ? (value === 90 ? 'filter 탈락' : value === 101 ? '조건 불일치' : 'anyMatch true') : index === 3 && value === 104 ? '미평가 (조기 종료)' : '아직 평가 전'
        return <li key={value} className={index > 0 && n === index - 1 ? 'is-current' : ''}>
          <strong>{value}</strong><span>{state}</span>
        </li>
      })}
    </ol>
    <div className="java-ed-stream-operations">
      <span><code>filter(n &gt; 100)</code></span><span><code>anyMatch(n % 2 == 0)</code></span>
    </div>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scene.note} />
    <p className="java-editorial-qualification">이 그림은 순차 예제의 평가 경로입니다. peek의 출력 횟수, 임의의 스트림 최적화·병렬 실행 순서를 보장하는 도식이 아닙니다.</p>
  </section>
}
