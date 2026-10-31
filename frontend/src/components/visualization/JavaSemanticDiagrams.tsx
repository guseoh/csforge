import { useState } from 'react'
import { javaApiScenes } from '../../lib/java-api-models'
import './java-editorial.css'

/** Small controls are reserved for cases where the teaching state actually changes. */
export function EditorialSteps({ index, count, setIndex }: {
  index: number
  count: number
  setIndex: (value: number) => void
}) {
  return <nav className="java-ed-steps" aria-label="도식 단계 이동">
    <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}>← 이전</button>
    <span aria-live="polite">{index + 1} / {count}</span>
    <button type="button" disabled={index === count - 1} onClick={() => setIndex(index + 1)}>다음 →</button>
    {index > 0 && <button className="java-ed-reset" type="button" onClick={() => setIndex(0)}>처음으로</button>}
  </nav>
}

export function EditorialNote({ description }: { description: string }) {
  return <p className="java-ed-note" role="status" aria-live="polite">{description}</p>
}

/** Distinguishes program order and synchronizes-with without claiming wall-clock order. */
export function JavaHappensBeforeEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['happens-before']
  const scene = scenes[index]
  const nodes = scene.graph?.nodes ?? []
  const label = (id: string) => nodes.find((node) => node.id === id)?.lines.at(-1) ?? '—'
  const handoff = (scene.graph?.edges ?? []).some((edge) => edge.label === 'synchronizes-with')
  return <section className="java-ed-semantic" aria-label="happens-before 관계 도식">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-thread-pair">
      <div className="java-ed-thread">
        <span className="java-editorial-kicker">Writer 스레드</span>
        <ol className="java-ed-order">
          <li><code>{label('write')}</code></li>
          <li><code>{label('publish')}</code></li>
        </ol>
        <small>program order</small>
      </div>
      <div className="java-ed-thread">
        <span className="java-editorial-kicker">Reader 스레드</span>
        <ol className="java-ed-order">
          <li><code>{label('observe')}</code></li>
          <li><code>{label('read')}</code></li>
        </ol>
        <small>{handoff ? 'program order' : '아직 읽기 전'}</small>
      </div>
    </div>
    <div className={`java-ed-handoff${handoff ? ' is-established' : ''}`}>
      <span>{handoff ? 'volatile 쓰기 → 해당 값을 관찰한 읽기' : '스레드 간 동기화 간선은 아직 제시되지 않음'}</span>
      <strong>{handoff ? 'synchronizes-with · HB 연결 성립' : 'program order만 표시'}</strong>
    </div>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scene.note} />
    <p className="java-editorial-qualification">이 간선은 JMM의 순서 관계이며 물리적 실행 시간이나 CPU 캐시 flush 과정이 아닙니다.</p>
  </section>
}

/** The comparison rows show success, failed update and retry as distinct outcomes. */
export function JavaCasEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['cas-retry']
  const scene = scenes[index]
  const nodes = scene.graph?.nodes ?? []
  return <section className="java-ed-semantic" aria-label="CAS 경쟁과 재시도 도식">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-cas-table" role="table" aria-label="현재 값과 작업별 CAS 상태">
      <div className="java-ed-cas-row java-ed-cas-head" role="row">
        <span role="columnheader">주체</span><span role="columnheader">상태 / 시도</span>
      </div>
      {nodes.map((node) => <div role="row" className={`java-ed-cas-row${node.lines.some((line) => line.includes('false')) ? ' is-failed' : ''}`} key={node.id}>
        <strong role="cell">{node.lines[0]}</strong>
        <span role="cell">{node.lines.slice(1).join(' · ') || '—'}</span>
      </div>)}
    </div>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scene.note} />
    <p className="java-editorial-qualification">이 예제의 순서만 보여줍니다. CAS 사용 자체가 전체 알고리즘의 lock-free·wait-free 진행성을 보장하지는 않습니다.</p>
  </section>
}

/** Detached strongly-referencing cycles are not automatically collected at the moment of unlinking. */
export function JavaGcReachabilityEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['gc-roots']
  const scene = scenes[index]
  const edges = scene.graph?.edges ?? []
  const reachable = edges.some((edge) => edge.from === 'cache' && edge.to === 'a')
  return <section className="java-ed-semantic" aria-label="GC root에서 객체로 이어지는 참조 경로">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-gc-path">
      <div className="java-ed-gc-reachable" aria-label="루트에서 도달 가능한 부분">
        <span className="java-ed-gc-label">GC root</span>
        <span className="java-ed-gc-link" aria-hidden="true">→</span>
        <span className="java-ed-gc-object">Cache</span>
        {reachable && <><span className="java-ed-gc-link" aria-hidden="true">→</span><span className="java-ed-gc-object">User A</span><span className="java-ed-gc-link" aria-hidden="true">⇄</span><span className="java-ed-gc-object">User B</span></>}
      </div>
      {!reachable && <div className="java-ed-gc-island" aria-label="다른 GC root 경로가 없다면 도달 불가능한 객체 cycle">
        <span className="java-editorial-kicker">Cache → A 참조 제거</span>
        <div className="java-ed-gc-pair"><span className="java-ed-gc-object">User A</span><span aria-hidden="true">⇄</span><span className="java-ed-gc-object">User B</span></div>
        <small>다른 root 경로가 없다면 회수 대상</small>
      </div>}
    </div>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scene.note} />
    <p className="java-editorial-qualification">연결 해제 후 객체를 그림에서 즉시 없애지 않습니다. 도달 불가능한 순간과 실제 수거 시점은 다릅니다.</p>
  </section>
}

/** Shows selected key set, registered interest and observed readiness without a misleading animation. */
export function JavaSelectorEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes.selector
  const scene = scenes[index]
  return <section className="java-ed-semantic" aria-label="Java Selector의 단계별 상태 기록">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <dl className="java-ed-state-lines">
      {scene.lanes.map(([label, value]) => <div key={label}>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </div>)}
    </dl>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scene.note} />
    <p className="java-editorial-qualification">교육용 전통적 selectedKeys 처리 예제입니다. 준비 상태는 완전한 메시지 수신이나 성공적인 읽기 바이트 수를 보장하지 않습니다.</p>
  </section>
}
