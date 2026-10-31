import { useState } from 'react'
import { javaApiScenes } from '../../lib/java-api-models'
import { EditorialNote, EditorialSteps } from './JavaSemanticDiagrams'
import './java-editorial.css'

/** Wrapper order determines whether Metrics sees an entire retry or each attempt. */
export function JavaDecoratorEditorial() {
  const scene = javaApiScenes.decorator[0]
  const variants = [
    { label: 'Metrics 바깥 · 전체 재시도 측정', stages: ['Metrics', 'Retry', 'Target'], scope: 'Metrics 한 번이 여러 Target 재시도 전체를 감쌈' },
    { label: 'Retry 바깥 · 시도별 측정', stages: ['Retry', 'Metrics', 'Target'], scope: '재시도할 때마다 Metrics를 새로 호출하므로 각 시도를 측정' },
  ] as const
  return <section className="java-ed-pattern" aria-label="Decorator 순서별 Retry Metrics 측정 범위">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    {variants.map((variant) => <div className="java-ed-pattern-variant" key={variant.label}>
      <span className="java-editorial-kicker">{variant.label}</span>
      <div className="java-ed-pattern-route" role="group" aria-label={variant.label}>
        {variant.stages.map((stage, index) => <span key={stage}>
          {index > 0 && <span className="java-ed-pattern-arrow" aria-hidden="true">→</span>}
          <strong>{stage}</strong>
        </span>)}
      </div>
      <p>{variant.scope}</p>
    </div>)}
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">바깥 → 안쪽은 호출·위임 방향이고 반환은 반대입니다. 재시도 정책·측정 범위는 래퍼 순서의 결과이지 모든 Decorator의 필수 동작이 아닙니다.</p>
  </section>
}

/** Only calls that enter the separate proxy pass through its intercepting boundary. */
export function JavaProxyBoundaryEditorial() {
  const scene = javaApiScenes.proxy[0]
  return <section className="java-ed-pattern" aria-label="독립된 Proxy로 들어오는 호출과 Target 내부 this 호출 비교">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <span className="java-editorial-kicker">외부 호출 · Proxy 경유</span>
    <div className="java-ed-pattern-route" role="group" aria-label="외부 호출자에서 Proxy를 거쳐 Target으로">
      <span><strong>Caller</strong></span><span className="java-ed-pattern-arrow" aria-hidden="true">→</span>
      <span><strong>Proxy</strong><small>검사·지연 생성·위임</small></span><span className="java-ed-pattern-arrow" aria-hidden="true">→</span>
      <span><strong>Target</strong><small>실제 업무 동작</small></span>
    </div>
    <div className="java-ed-pattern-self">
      <span className="java-editorial-kicker">Target 내부 호출 · 다른 경로</span>
      <p><code>this.otherMethod()</code>는 같은 Target 내부에서 호출되며, 위에 표시한 별도 Proxy를 다시 통과하지 않습니다.</p>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">이 그림은 분리된 위임 Proxy를 가정합니다. 모든 형태의 Proxy·바이트코드 변환·Spring AOP 동작을 하나의 보편적 규칙으로 일반화하지 않습니다.</p>
  </section>
}

/** The failing synchronous observer does not undo earlier effects or unsubscribe itself. */
export function JavaObserverEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes.observer
  const statuses = [
    { a: '등록 · 대기', b: '등록 · 대기', c: '등록 · 대기', summary: 'Publisher의 동기 리스너 목록: A → B → C' },
    { a: '호출 완료 · 효과 발생', b: '다음 호출', c: '아직 호출 전', summary: 'A의 처리 뒤에야 B를 호출하는 순차 실행' },
    { a: '기존 효과 유지', b: '호출 중 예외 발생', c: '호출되지 않음', summary: 'B 예외를 잡지 않아 순회 중단 · A 효과는 롤백되지 않음' },
    { a: '등록 유지', b: '명시적 remove(B)로 제외', c: '등록 유지', summary: '다음 발행 전 별도로 B를 등록 해제한 상태' },
  ] as const
  const current = statuses[index]
  return <section className="java-ed-pattern" aria-label="동기 Observer의 호출 실패와 명시적 등록 해제">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <span className="java-editorial-kicker">{index === 3 ? '별도의 구독 해제 상태 · 예외 발생의 자동 결과 아님' : '예제의 동기 순회 · A → B → C'}</span>
    <div className="java-ed-pattern-listeners" role="list">
      {([['A',current.a],['B',current.b],['C',current.c]] as const).map(([name,status])=>
        <div role="listitem" key={name}><strong>Listener {name}</strong><span>{status}</span></div>
      )}
    </div>
    <p className="java-ed-pattern-observation" role="status" aria-live="polite">{current.summary}</p>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification">이 예제는 A/B/C를 순서대로 호출하며 리스너 예외를 처리하지 않는 동기 구현입니다. 실제 구독 변경 시점·재진입·병렬화 정책은 발행자 구현에 따라 달라집니다.</p>
  </section>
}

/** Current State is a pointer, not a claim that every transition has occurred. */
export function JavaStatePatternEditorial() {
  const scene = javaApiScenes.state[0]
  const transitions = [
    { from:'Draft', action:'publish()', to:'Published' },
    { from:'Published', action:'revise()', to:'Draft' },
    { from:'Published', action:'archive()', to:'Archived' },
  ] as const
  return <section className="java-ed-pattern" aria-label="State 패턴의 현재 상태와 허용된 세 전이">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-pattern-current">
      <span className="java-editorial-kicker">Document가 현재 참조하는 State</span>
      <strong>Published</strong><small>현재 상태는 허용된 전이 규칙 자체가 아님</small>
    </div>
    <span className="java-editorial-kicker">별도로 허용된 전이</span>
    <div className="java-ed-pattern-transitions" role="list">
      {transitions.map((t) => <div role="listitem" key={t.action}>
        <strong>{t.from}</strong><code>{t.action}</code><span aria-hidden="true">→</span><strong>{t.to}</strong>
      </div>)}
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">현재 Published에서 publish()를 다시 호출할 수 있다는 뜻이 아닙니다. 작은 전이 집합에서는 enum과 명시적 분기만으로도 충분할 수 있습니다.</p>
  </section>
}
