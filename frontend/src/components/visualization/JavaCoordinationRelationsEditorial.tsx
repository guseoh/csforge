import { useState } from 'react'
import { javaApiScenes } from '../../lib/java-api-models'
import { EditorialNote, EditorialSteps } from './JavaSemanticDiagrams'
import './java-editorial.css'

/** CountDownLatch signals a one-shot completion count, not successful task results. */
export function JavaLatchGateEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['latch-gate']
  const states = [
    { count:3, awaiting:'await() 대기 중', sent:'아직 countDown 없음' },
    { count:1, awaiting:'계속 대기 중', sent:'countDown 2회' },
    { count:0, awaiting:'await() 정상 반환 가능', sent:'마지막 countDown' },
  ] as const
  return <section className="java-ed-coordination" aria-label="CountDownLatch count 3에서 0까지 일회성 게이트">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <div className="java-ed-g3-value"><span className="java-editorial-kicker">남은 latch count</span><strong>{states[index].count}</strong><span>처음 3회 신호 중 {3-states[index].count}회 도착</span></div>
    <div className="java-ed-g3-status-rows">
      <div><strong>작업자 신호</strong><span>{states[index].sent}</span></div>
      <div><strong>기다리는 스레드</strong><span>{states[index].awaiting}</span></div>
    </div>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification">countDown() 횟수는 작업 성공 건수가 아닙니다. CountDownLatch는 count가 0이 된 뒤 초기값으로 재설정되지 않는 일회성 동기화 도구입니다. 제출 실패 등으로 신호가 누락될 수도 있습니다.</p>
  </section>
}

/** Successful acquire must be paired with release; a permit is not thread ownership. */
export function JavaSemaphoreEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['semaphore-permits']
  const states = [
    { free:'3', active:'0개 진입', waiting:'새 작업은 acquire() 시도 가능' },
    { free:'0', active:'3개 진입 중', waiting:'네 번째 작업은 acquire() 대기' },
    { free:'0 → 1 → 0', active:'기존 1개 종료 · 대기 작업 진입 가능', waiting:'release 뒤 대기 작업 acquire 가능 · 순서는 미보장' },
  ] as const
  return <section className="java-ed-coordination" aria-label="Semaphore 세 permit의 획득과 반환">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <div className="java-ed-g3-value"><span className="java-editorial-kicker">Semaphore(3) · 사용 가능한 permits</span><strong>{states[index].free}</strong></div>
    <div className="java-ed-g3-status-rows">
      <div><strong>실행 구간</strong><span>{states[index].active}</span></div>
      <div><strong>대기</strong><span>{states[index].waiting}</span></div>
    </div>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification">Semaphore는 lock처럼 특정 소유 스레드만 release()하도록 강제하지 않습니다. acquire() 실패 뒤 release()를 수행하면 permit 수를 잘못 증가시킬 수 있습니다. 숫자는 한 가지 실행 예시입니다.</p>
  </section>
}

/** Completion stages are alternatives; neither thenApply nor thenCompose runs on exceptional input. */
export function JavaFutureCompletionEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['future-completion']
  return <section className="java-ed-coordination" aria-label="CompletableFuture 미완료 정상 완료 실패 경로 비교">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <span className="java-editorial-kicker">{index===0?'아직 결과 없음':index===1?'정상 완료 · 서로 다른 후속 연산의 비교':'예외 완료 또는 취소 · 정상 완료와 다른 경로'}</span>
    {index===0?<div className="java-ed-g3-status-rows"><div><strong>CompletableFuture&lt;T&gt;</strong><span>미완료 · 후속 단계는 결과를 기다림</span></div></div>:
      index===1?<div className="java-ed-g3-status-rows">
        <div><strong><code>thenApply</code></strong><span>T → U · 결과 값 변환</span></div>
        <div><strong><code>thenCompose</code></strong><span>T → CompletionStage&lt;U&gt; 를 평탄화</span></div>
        <div><strong><code>thenCombine</code></strong><span>다른 정상 결과도 필요 · 두 결과 결합</span></div>
      </div>:<div className="java-ed-g3-status-rows">
        <div><strong>정상 변환 단계</strong><span>이 입력의 실패 경로에서는 실행되지 않음</span></div>
        <div><strong><code>handle / exceptionally</code></strong><span>정책에 따라 실패를 관찰·복구</span></div>
      </div>}
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification">thenApply/thenCompose/thenCombine을 순차적으로 모두 실행하는 그림이 아닙니다. cancel(true)는 CompletableFuture 자체의 실행 스레드 인터럽트를 보장하지 않으며 allOf는 모든 입력 완료를 기다립니다.</p>
  </section>
}

/** Deadlock, starvation and livelock are separate phenomena, not consecutive states. */
export function JavaDeadlockProgressEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['deadlock-progress']
  const facts = [
    [['Thread A','lock X 소유 · Y 기다림'],['Thread B','lock Y 소유 · X 기다림']],
    [['다른 작업들','계속 진행'],['특정 작업','오래 진입하지 못함']],
    [['Thread A','B를 보고 양보 후 다시 시도'],['Thread B','A를 보고 양보 후 다시 시도']],
  ] as const
  return <section className="java-ed-coordination" aria-label="Deadlock Starvation Livelock 세 독립 현상">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <span className="java-editorial-kicker">서로 다른 현상 비교 · 연속적인 장애 단계 아님</span>
    <div className="java-ed-g3-status-rows">
      {facts[index].map(([actor,status])=><div key={actor}><strong>{actor}</strong><span>{status}</span></div>)}
    </div>
    <p className="java-ed-g3-distinction" role="status" aria-live="polite">{index===0?'순환 대기로 두 작업 모두 잠금 획득을 기다림':index===1?'전체는 진행하지만 한 작업만 계속 기회를 얻지 못함':'작업이 반응·양보를 반복하지만 유효한 작업이 완료되지 않음'}</p>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification">느린 I/O가 곧 교착상태는 아니며, 모든 재시도가 livelock도 아닙니다. 각 장면은 동일한 실행의 다음 상태가 아닌 독립 사례입니다.</p>
  </section>
}
