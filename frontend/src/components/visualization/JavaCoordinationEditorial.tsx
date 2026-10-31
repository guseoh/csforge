import { useState } from 'react'
import { javaApiScenes } from '../../lib/java-api-models'
import { EditorialNote, EditorialSteps } from './JavaSemanticDiagrams'
import './java-editorial.css'

/** Await releases the associated lock; signal is not ownership transfer. */
export function JavaConditionAwaitEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['condition-await']
  const states = [
    { owner: 'consumer', consumer: 'lock 소유 · while (queue.isEmpty())', producer: '아직 변경 전', queue: 'empty', boundary: '소비자가 lock을 소유한 상태에서 조건 검사' },
    { owner: 'producer', consumer: 'await() · 조건 대기 · lock 해제', producer: 'lock 소유 · put · signal', queue: '원소 추가 중', boundary: 'signal은 lock을 즉시 넘기지 않음' },
    { owner: 'consumer', consumer: 'lock 재획득 · while 조건 재검사', producer: '변경 완료 · lock 반납', queue: '현재 큐 상태 다시 확인', boundary: '조건이 거짓이면 대기·재검사를 반복' },
  ] as const
  const state = states[index]
  return <section className="java-ed-coordination" aria-label="Condition await가 lock을 해제하고 재획득하는 단계">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <div className="java-ed-coordination-owner"><span className="java-editorial-kicker">현재 lock 소유자 · 예시</span><strong>{state.owner}</strong></div>
    <div className="java-ed-coordination-actors" role="list">
      <div role="listitem"><strong>consumer</strong><span>{state.consumer}</span></div>
      <div role="listitem"><strong>producer</strong><span>{state.producer}</span></div>
      <div role="listitem"><strong>공유 queue</strong><span>{state.queue}</span></div>
    </div>
    <p className="java-ed-coordination-boundary" role="status" aria-live="polite">{state.boundary}</p>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification"><code>await()</code>는 lock을 해제하고 대기하며 정상 반환 전에 다시 획득합니다. <code>signal()</code> 자체는 lock을 이전하지 않으며 spurious wakeup 때문에 반드시 while로 조건을 재검사합니다.</p>
  </section>
}

/** A bounded queue exposes its occupancy independently of producer/consumer completion. */
export function JavaBoundedQueueEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['bounded-queue']
  const state = [
    { entry: '[]', producer: 'put(A) 준비', consumer: 'take() 대기', status: '빈 큐 · take가 원소를 기다림' },
    { entry: '[A]', producer: '다음 put(B) 대기 가능', consumer: 'take(A) 진행 가능', status: '가득 찬 큐 · put은 빈 공간을 기다릴 수 있음' },
    { entry: '[]', producer: 'put(B) 진행 가능', consumer: 'A 꺼냄 · 업무 처리 전', status: '빈 공간 확보 · 소비 작업 완료는 아직 아님' },
  ] as const
  const current = state[index]
  return <section className="java-ed-coordination" aria-label="용량 하나인 BlockingQueue의 생산자 소비자 상태">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <div className="java-ed-coordination-queue"><span className="java-editorial-kicker">BlockingQueue · capacity = 1</span><strong><code>{current.entry}</code></strong></div>
    <div className="java-ed-coordination-actors" role="list">
      <div role="listitem"><strong>producer</strong><span>{current.producer}</span></div>
      <div role="listitem"><strong>consumer</strong><span>{current.consumer}</span></div>
    </div>
    <p className="java-ed-coordination-boundary" role="status" aria-live="polite">{current.status}</p>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification"><code>take()</code>로 큐에서 꺼내는 것과 메시지 처리 성공은 별개입니다. 실제 스레드 스케줄 순서를 고정하지 않는 한 가지 실행 예시입니다.</p>
  </section>
}

/** Thread lifecycle is not the operating system scheduler state machine. */
export function JavaThreadLifecycleEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['thread-lifecycle']
  const states = [
    { worker: 'NEW', caller: 'Thread 인스턴스 생성', join: '시작 전', boundary: 'start()는 같은 Thread 객체에서 한 번만 호출 가능' },
    { worker: '실행 또는 대기 중', caller: 'join()으로 종료 대기', join: '종료 아직 확인 전', boundary: 'interrupt는 협력적 중단 신호 · 즉시 종료 보장 없음' },
    { worker: 'TERMINATED', caller: 'join() 정상 반환', join: 'worker 종료 감지', boundary: '정상적으로 종료를 감지한 join에는 happens-before 연결' },
  ] as const
  const current = states[index]
  return <section className="java-ed-coordination" aria-label="Thread 시작 join 종료의 세 장면">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <div className="java-ed-coordination-actors" role="list">
      <div role="listitem"><strong>worker Thread</strong><span>{current.worker}</span></div>
      <div role="listitem"><strong>호출자 Thread</strong><span>{current.caller}</span></div>
      <div role="listitem"><strong>join 경계</strong><span>{current.join}</span></div>
    </div>
    <p className="java-ed-coordination-boundary" role="status" aria-live="polite">{current.boundary}</p>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification">표시된 worker의 실행·대기 표현은 엄격한 Java Thread.State 전이도나 OS 스케줄링 그림이 아닙니다. timed join이 timeout으로 반환한 경우 종료 보장을 적용하지 않습니다.</p>
  </section>
}

/** Stable primary/suppressed exceptions distinguish close attempt from close success. */
export function JavaSuppressedExceptionsEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['resource-suppressed']
  const primary = index >= 1
  return <section className="java-ed-coordination" aria-label="try-with-resources의 역순 close와 suppressed 예외">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <div className="java-ed-resources">
      <span className="java-editorial-kicker">자원 획득 · 선언 순서</span>
      <div><code>first</code><span aria-hidden="true">→</span><code>second</code></div>
      <span className="java-editorial-kicker">정리 시도 · 역순</span>
      <div><code>second.close()</code><span aria-hidden="true">→</span><code>first.close()</code></div>
    </div>
    <div className="java-ed-exception-tree" role="group" aria-label="주 예외와 억제 예외 관계">
      <div><strong>{primary ? 'WorkException · primary' : '아직 주 예외 없음'}</strong><span>{primary ? '본문에서 발생 · 최종 전파' : '본문 실행 전 · 자원 획득 완료'}</span></div>
      {index >= 2 && <div className="java-ed-exception-child"><strong>suppressed[0] · second.close 실패</strong><span>기존 primary를 대체하지 않음</span></div>}
      {index >= 3 && <div className="java-ed-exception-child"><strong>suppressed[1] · first.close 실패</strong><span>close는 계속 시도 · 성공적으로 닫혔다는 뜻 아님</span></div>}
    </div>
    <p className="java-ed-coordination-boundary" role="status" aria-live="polite">
      {index === 0 ? 'first와 second 모두 열림' : index === 1 ? '본문 실패 → second부터 close 시도' : index === 2 ? 'second.close 실패를 suppressed[0]에 보존' : 'first.close 실패까지 suppressed[1]에 보존하고 주 예외 전파'}
    </p>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification">두 close가 모두 실패하는 고정 예시입니다. suppressed 예외는 주 예외의 <code>getSuppressed()</code>에서 확인하며 close 시도가 실제 외부 자원 정리 성공을 보장하지 않습니다. 본문이 정상 완료한 다른 경로에서는 close 실패가 주 예외가 될 수 있습니다.</p>
  </section>
}
