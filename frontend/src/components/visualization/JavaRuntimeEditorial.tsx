import { useState } from 'react'
import { javaApiScenes } from '../../lib/java-api-models'
import { EditorialNote, EditorialSteps } from './JavaSemanticDiagrams'
import './java-editorial.css'

/** Separate initialization prerequisites from the independently deferred resolution and error paths. */
export function JavaClassInitializationEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['class-initialization']
  const scene = scenes[index]
  const nodes = scene.graph?.nodes ?? []
  return <section className="java-ed-runtime" aria-label="Java 클래스 로딩과 초기화 단계">
    <div className="java-ed-class-track" role="list" aria-label="정상 초기화의 주요 순서">
      {['로딩', '검증·준비', '초기화'].map((label, step) =>
        <div role="listitem" key={label} className={index === step ? 'is-current' : ''}>
          <span>{String(step + 1).padStart(2, '0')}</span><strong>{label}</strong>
        </div>)}
    </div>
    <p className="java-ed-runtime-branch" aria-live="polite">
      {index === 3 ? '별도 관계 · 심볼릭 참조 해석은 필요할 때까지 지연될 수 있음'
        : index === 4 ? '실패 경로 · 초기화 중 오류와 이후 사용은 정상 단계가 아님'
          : '정상 경로의 학습 장면'}
    </p>
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <dl className="java-ed-runtime-facts">
      {nodes.map((node) => <div key={node.id}>
        <dt>{node.lines[0]}</dt>
        <dd>{node.lines.slice(1).join(' · ') || '—'}</dd>
      </div>)}
    </dl>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scene.note} />
    <p className="java-editorial-qualification">이 화면은 교육용 스냅샷입니다. 해석 전체가 초기화 전에 완료되거나, 오류 상태가 정상 실행의 마지막 단계인 것은 아닙니다.</p>
  </section>
}

/** Named memory consumers are not physical partitions of measured or proportional size. */
export function JavaProcessMemoryEditorial() {
  const scene = javaApiScenes['process-memory'][0]
  const nodes = scene.graph?.nodes ?? []
  const categories = nodes.filter((node) => node.id !== 'measure')
  const measure = nodes.find((node) => node.id === 'measure')
  return <section className="java-ed-runtime" aria-label="JVM 프로세스 메모리 소비처와 측정 관점">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <span className="java-editorial-kicker">메모리 소비처 · 서로 겹칠 수 있는 분류이며 비율·크기를 표시하지 않음</span>
    <div className="java-ed-memory-compare" role="list" aria-label="HotSpot 프로세스 메모리의 서로 다른 소비처">
      {categories.map(node=><div key={node.id} role="listitem">
        <strong>{node.lines[0]}</strong>
        <span>{node.lines.slice(1).join(' · ')}</span>
      </div>)}
    </div>
    {measure && <aside className="java-ed-memory-measure" aria-label="서로 다른 측정 지표">
      <span className="java-editorial-kicker">측정 및 한도 · 별도 관점</span>
      <strong>{measure.lines[0]}</strong>
      <p>{measure.lines.slice(1).join(' · ')}</p>
    </aside>}
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">표는 크기 비율·물리적인 연속 배치를 나타내지 않습니다. -Xmx는 전체 프로세스 메모리 상한이 아닙니다.</p>
  </section>
}

/** A JVM abstract frame: local slots stay put while the operand stack changes at each instruction. */
export function JavaBytecodeStackEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['bytecode-stack']
  const scene = scenes[index]
  const opcodes = ['호출 시작', 'iload_1', 'iload_2', 'iadd', 'ireturn'] as const
  const stackStates: readonly (readonly number[])[] = [[], [3], [3, 4], [7], []]
  const activeFrame = index < 4
  const stack = stackStates[index]

  return <section className="java-ed-runtime java-ed-bytecode" aria-label="JVM 프레임과 피연산자 스택 5단계">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-bytecode-operation" aria-live="polite">
      <span className="java-editorial-kicker">명령 · {index + 1} / 5</span>
      <code>{opcodes[index]}</code>
    </div>
    <div className="java-ed-bytecode-layout">
      <div className="java-ed-bytecode-locals">
        <span className="java-editorial-kicker">지역 변수 배열</span>
        {activeFrame ? <ol aria-label="인스턴스 메서드의 지역 변수 슬롯">
          <li><small>slot 0</small><strong>this</strong></li>
          <li><small>slot 1</small><strong>a = 3</strong></li>
          <li><small>slot 2</small><strong>b = 4</strong></li>
        </ol> : <p className="java-ed-bytecode-done">호출 프레임 종료</p>}
      </div>
      <div className="java-ed-bytecode-stack">
        <span className="java-editorial-kicker">피연산자 스택</span>
        {activeFrame && stack.length > 0 ? <ol aria-label="맨 위부터 피연산자 값">
          {[...stack].reverse().map((value, position) =>
            <li key={position} className={position === 0 ? 'is-top' : ''}>
              <small>{position === 0 ? 'TOP' : ' '}</small><strong>{value}</strong>
            </li>)}
        </ol> : <p className="java-ed-bytecode-done">{activeFrame ? '비어 있음' : '프레임과 함께 종료'}</p>}
      </div>
    </div>
    <div className="java-ed-bytecode-result" aria-live="polite">
      {index === 3 ? <span><code>iadd</code> · 3과 4를 pop한 뒤 7을 push</span>
        : index === 4 ? <span><code>ireturn</code> · 호출자에 <strong>7</strong> 반환</span>
          : <span>{index === 0 ? '피연산자 없음' : `현재 TOP: ${stack.at(-1)}`}</span>}
    </div>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scene.note} />
    <p className="java-editorial-qualification">JVM 명세의 추상 프레임입니다. 실제 CPU 레지스터나 물리 메모리 배치를 나타내지 않습니다.</p>
  </section>
}

/** One snapshot never mounts two virtual threads simultaneously onto one carrier. */
export function JavaVirtualCarrierEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['virtual-carrier']
  const scene = scenes[index]
  const nodes = scene.graph?.nodes ?? []
  const node = (id: string) => nodes.find((item) => item.id === id)
  const mounted = scene.graph?.edges.find((edge) => edge.label === 'mount' || edge.label === 'remount')?.from
  return <section className="java-ed-runtime" aria-label="Java 가상 스레드와 carrier 실행 상태">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-carrier-head">
      <span className="java-editorial-kicker">Carrier (플랫폼 스레드)</span>
      <strong>{node('carrier')?.lines.join(' · ')}</strong>
    </div>
    <div className="java-ed-carrier-threads" role="list" aria-label="가상 스레드 상태">
      {(['vtA', 'vtB'] as const).map((id) => {
        const selected = mounted === id
        const actor = node(id)
        return <div role="listitem" key={id} className={selected ? 'is-mounted' : ''}>
          <div><strong>{actor?.lines[0]}</strong><span>{selected ? '현재 mount' : '미실행 또는 대기'}</span></div>
          <p>{actor?.lines.slice(1).join(' · ')}</p>
        </div>
      })}
    </div>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scene.note} />
    <p className="java-editorial-qualification">한 시점의 개념적 예시입니다. 스케줄러 큐·carrier 수·복귀 carrier를 고정하지 않습니다. Java 25에서 모든 blocking 동작이 unmount를 보장하지도 않습니다.</p>
  </section>
}
