import { useState } from 'react'
import { javaApiScenes } from '../../lib/java-api-models'
import { EditorialNote, EditorialSteps } from './JavaSemanticDiagrams'
import './java-editorial.css'

const lostUpdateFrames = [
  {
    shared: 0,
    a: '0 읽음 → 1 계산',
    b: '0 읽음 → 1 계산',
    event: '두 작업 모두 같은 이전 값 0을 읽었습니다.',
  },
  {
    shared: 1,
    a: '1 기록 완료',
    b: '이전에 계산한 1 보유',
    event: 'A가 1을 썼지만 B의 지역 계산 값은 바뀌지 않습니다.',
  },
  {
    shared: 1,
    a: '1 기록 완료',
    b: '1을 다시 기록',
    event: 'B가 1을 덮어써서 증가 두 번의 최종 결과가 1입니다.',
  },
] as const

/** A fixed shared cell and two stable actor rows make the lost update trace visible. */
export function JavaLostUpdateEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['lost-update']
  const frame = lostUpdateFrames[index]
  return <section className="java-ed-state" aria-label="두 스레드의 count 증가가 유실되는 실행">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <div className="java-ed-shared-cell" role="group" aria-label={'공유 count = ' + frame.shared}>
      <span className="java-editorial-kicker">공유 변수 · 같은 저장 위치</span>
      <strong><code>count = {frame.shared}</code></strong>
    </div>
    <div className="java-ed-state-actors" role="list" aria-label="각 작업의 상태">
      <div role="listitem"><strong>Thread A</strong><span>{frame.a}</span></div>
      <div role="listitem"><strong>Thread B</strong><span>{frame.b}</span></div>
    </div>
    <p className="java-ed-state-event" role="status" aria-live="polite">{frame.event}</p>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification">동기화 없는 read → compute → write의 가능한 한 가지 순서입니다. CPU 명령 수나 모든 실행 결과를 고정하지 않습니다. <code>volatile</code>만으로 이 복합 증가가 원자화되지는 않습니다.</p>
  </section>
}

/** Constructor escape and correctly completed publication are distinct paths, not a single lifecycle. */
export function JavaSafePublicationEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['safe-publication']
  const safe = index === 1
  const actions = safe
    ? [
      ['생성자', 'final 필드 설정 후 정상 종료'],
      ['Writer', '완성된 객체 참조를 volatile 필드에 기록'],
      ['Reader', 'volatile 읽기로 공개된 참조 획득'],
    ]
    : [
      ['생성자', 'this를 외부에 등록 · 아직 실행 중'],
      ['Reader', '생성 완료 전 객체에 접근할 수 있음'],
    ]
  return <section className="java-ed-state" aria-label="객체 생성 중 유출과 안전한 공개 비교">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <div className="java-ed-publication-heading">
      <strong>{safe ? '정상 생성 → volatile 공개' : '생성 중 this 유출'}</strong>
      <span>{safe ? '공개 전에 객체 생성 완료' : '생성 완료 전 참조가 외부에 노출'}</span>
    </div>
    <ol className="java-ed-publication-steps">
      {actions.map(([actor, description], step) => <li key={actor}>
        <small>{String(step + 1).padStart(2, '0')}</small>
        <strong>{actor}</strong>
        <span>{description}</span>
      </li>)}
    </ol>
    <p className="java-ed-state-event" role="status" aria-live="polite">
      {safe ? 'volatile 쓰기 → 읽기: 초기화 동작에 대한 happens-before 경로' : '조기 유출: final 필드의 올바른 생성 조건을 위반할 수 있음'}
    </p>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification">올바르게 생성된 객체의 final 필드 초기화 보장과 일반 상태의 안전한 공개는 서로 다른 규칙입니다. final 참조 대상의 이후 가변 상태 변경은 별도 동기화가 필요합니다.</p>
  </section>
}

const referenceKinds = [
  { kind: '강한 참조', reference: '일반 참조', target: '대상 A', effect: '강하게 도달 가능한 동안 유지' },
  { kind: '소프트 참조', reference: 'SoftReference', target: '대상 B', effect: '메모리 수요에 따라 clear 가능 · TTL 없음' },
  { kind: '약한 참조', reference: 'WeakReference', target: '대상 C', effect: 'weakly reachable 시 clear 가능 · get()은 null 가능' },
  { kind: '팬텀 참조', reference: 'PhantomReference', target: '대상 D', effect: 'get()은 항상 null · 객체를 다시 꺼낼 수 없음' },
] as const

/** Distinguish references to referents from the Reference objects enqueued for notification. */
export function JavaReferenceStrengthEditorial() {
  const scene = javaApiScenes['reference-strength'][0]
  return <section className="java-ed-state" aria-label="Java 참조 강도와 ReferenceQueue 관계">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-reference-compare" role="table" aria-label="강한 소프트 약한 팬텀 참조의 수명과 접근 차이">
      <div role="row" className="java-ed-reference-compare-header">
        <span role="columnheader">종류</span><span role="columnheader">참조 → 대상</span><span role="columnheader">핵심 계약</span>
      </div>
      {referenceKinds.map(item=><div role="row" key={item.kind}>
        <strong role="cell">{item.kind}</strong>
        <span role="cell"><code>{item.reference}</code><span aria-hidden="true"> → </span>{item.target}</span>
        <span role="cell">{item.effect}</span>
      </div>)}
    </div>
    <div className="java-ed-ref-queue" role="group" aria-label="PhantomReference 객체의 큐 등록">
      <span className="java-editorial-kicker">큐 알림 · 별도 관계</span>
      <div><code>PhantomReference 객체</code><span aria-hidden="true">→</span><code>ReferenceQueue</code></div>
      <p>조건이 충족되고 GC가 처리하면 등록된 Reference 객체가 큐에 들어갈 수 있습니다. 대상 객체 D가 큐에 담기는 것은 아닙니다.</p>
    </div>
    <EditorialNote description={scene.note} />
    <p className="java-editorial-qualification">각 행의 대상은 서로 다른 객체입니다. 큐 알림은 대상의 즉시 수거, 메모리 반환 또는 외부 자원 정리 완료를 보장하지 않습니다.</p>
  </section>
}

const heapPollutionActions = [
  'unsafe(List.of("java"))',
  'Object[] array = lists',
  'array[0] = List.of(42)',
  'String value = lists[0].getFirst()',
] as const

/** The same runtime List[] is visible via both aliases; the String cast fails after the store. */
export function JavaHeapPollutionEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['heap-pollution']
  const alias = index >= 1
  const polluted = index >= 2
  return <section className="java-ed-state" aria-label="제네릭 varargs 배열 별칭과 힙 오염">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <div className="java-ed-state-code"><span className="java-editorial-kicker">현재 문장</span><code>{heapPollutionActions[index]}</code></div>
    <div className="java-ed-heap-aliases">
      <div className="java-ed-heap-name"><strong><code>lists</code></strong><small>선언: List&lt;String&gt;... / 실제 배열: List[]</small></div>
      <div className={'java-ed-heap-name' + (alias ? '' : ' is-pending')}>
        <strong><code>array</code></strong><small>{alias ? 'Object[]로 본 동일한 배열' : 'Object[] 별칭 도입 전'}</small>
      </div>
      <div className="java-ed-heap-slot" role="group" aria-label="두 별칭이 공유하는 배열의 0번 슬롯">
        <small>하나의 배열 · [0]</small>
        <strong>{polluted ? 'List 원소: 42 (Integer)' : 'List 원소: "java" (String)'}</strong>
        <span>{polluted ? '배열 저장 검사는 통과 · 타입 인자까지 검증하지 않음' : '초기 인자로 들어온 목록'}</span>
      </div>
    </div>
    <p className="java-ed-state-event" role="status" aria-live="polite">
      {index === 3 ? 'ClassCastException: Integer 42를 String으로 읽으려는 변환에서 실패'
        : index === 2 ? 'heap pollution: 저장 시점에는 ArrayStoreException이 발생하지 않음'
          : '동일한 List[] 배열과 정적 제네릭 타입의 차이를 추적합니다.'}
    </p>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification">실제 배열의 런타임 원소 타입 검사는 List 수준입니다. <code>List&lt;String&gt;</code> 타입 인자는 소거되며 <code>@SafeVarargs</code>가 런타임 검사를 추가하지 않습니다.</p>
  </section>
}
