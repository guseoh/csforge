import { useState } from 'react'
import { javaApiScenes } from '../../lib/java-api-models'
import { EditorialNote, EditorialSteps } from './JavaSemanticDiagrams'
import './java-editorial.css'

/** Static, conceptual execution traces; neither lane claims a real CPU scheduling guarantee. */
export function JavaConcurrencyParallelismEditorial() {
  const scene = javaApiScenes['concurrency-parallelism'][0]
  return <section className="java-ed-concurrency-contrast" aria-label="동시성과 병렬성의 서로 다른 실행 자원 예시">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-schedule">
      <div className="java-ed-schedule-head"><strong>동시성 · 한 실행 자원</strong><small>작업의 실행 구간 교대</small></div>
      <div className="java-ed-schedule-line" role="group" aria-label="한 실행 자원에서 A B A 순서로 교대하는 예시">
        <span>자원 1</span><strong>A</strong><strong>B</strong><strong>A</strong>
      </div>
      <div className="java-ed-schedule-head"><strong>병렬성 · 별도 두 실행 자원</strong><small>같은 구간에 실제 실행이 겹침</small></div>
      <div className="java-ed-schedule-line" role="group" aria-label="같은 구간에 두 실행 자원에서 A와 B가 진행되는 예시">
        <span>자원 1</span><strong>A</strong><strong>A</strong><strong>A</strong>
      </div>
      <div className="java-ed-schedule-line" role="group" aria-label="다른 실행 자원에서 B가 같은 시간 구간에 진행되는 예시">
        <span>자원 2</span><strong>B</strong><strong>B</strong><strong>B</strong>
      </div>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">칸은 논리적인 작업 구간의 예시이며 실제 CPU 시간·코어 배치·스레드 스케줄 순서가 아닙니다. 병렬 실행은 동시성의 한 가능한 실행 방식이고, Java Thread 객체를 여러 개 생성한다고 물리적 병렬성이 보장되지는 않습니다.</p>
  </section>
}

/** Stable monitor identity separates ownership, reentrancy depth and later HB acquisition. */
export function JavaMonitorOwnershipEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes.monitor
  const state = [
    { owner: 'A', depth: '1', a: 'monitor M 진입 · 소유', b: 'M 획득을 기다림', link: '상호 배제 · 소유자는 하나' },
    { owner: 'A', depth: '1 → 2 → 1', a: '같은 M에 재진입 후 내부 블록 종료', b: '여전히 기다림', link: '중첩 블록만 나와도 M 전체가 해제되지는 않음' },
    { owner: 'B', depth: '1', a: '마지막 lock 해제 완료', b: '뒤따르는 M lock 성공 · 예시', link: 'A의 unlock → B의 같은 M lock: synchronizes-with · HB' },
  ] as const
  const snapshot = state[index]
  return <section className="java-ed-monitor" aria-label="synchronized 모니터의 소유권과 재진입 단계">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <div className="java-ed-monitor-owner">
      <span className="java-editorial-kicker">같은 객체의 monitor M</span>
      <strong>owner: {snapshot.owner}</strong>
      <small>재진입 보유 횟수: {snapshot.depth}</small>
    </div>
    <div className="java-ed-monitor-threads" role="list">
      <div role="listitem"><strong>Thread A</strong><span>{snapshot.a}</span></div>
      <div role="listitem"><strong>Thread B</strong><span>{snapshot.b}</span></div>
    </div>
    <p className="java-ed-monitor-hb" role="status" aria-live="polite">{snapshot.link}</p>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification">마지막 장면의 B 획득은 가능한 실행 중 하나이며 공정한 다음 획득자를 보장하지 않습니다. 다른 객체의 monitor와는 별개의 잠금입니다. 예외로 블록을 벗어나도 lock은 해제되지만 변경된 데이터가 자동 롤백되지는 않습니다.</p>
  </section>
}
