import { useState } from 'react'
import { javaApiScenes } from '../../lib/java-api-models'
import { EditorialSteps, EditorialNote } from './JavaSemanticDiagrams'
import './java-editorial.css'

/** JVM-spec logical storage separates each thread's frames from shared runtime areas. */
export function JavaRuntimeAreasEditorial() {
  const scene = javaApiScenes['runtime-areas'][0]
  const nodes = scene.graph?.nodes ?? []
  const find = (id: string) => nodes.find((node) => node.id === id)
  const threads = [find('a'), find('b')].filter((node): node is NonNullable<typeof node> => node !== undefined)
  const shared = [find('heap'), find('method')].filter((node): node is NonNullable<typeof node> => node !== undefined)

  return <section className="java-ed-runtime java-ed-areas" aria-label="스레드별 JVM 프레임과 공유 런타임 영역">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <span className="java-editorial-kicker">스레드마다 독립적으로 생성되는 JVM 스택</span>
    <div className="java-ed-areas-threads" role="list">
      {threads.map((node) => <div role="listitem" key={node.id} className="java-ed-areas-thread">
        <strong>{node.lines[0]}</strong>
        <span className="java-ed-areas-frame-label">현재 메서드의 프레임</span>
        <dl>
          <div><dt>지역 변수 배열</dt><dd>{node.lines[1]}</dd></div>
          <div><dt>피연산자 스택</dt><dd>{node.lines[2]}</dd></div>
        </dl>
      </div>)}
    </div>
    <p className="java-ed-areas-relation">각 스레드의 참조 값은 공유 heap의 같은 객체를 가리킬 수 있습니다.</p>
    <span className="java-editorial-kicker">JVM 전체에서 공유되는 추상 영역</span>
    <div className="java-ed-areas-shared" role="list">
      {shared.map((node) => <div role="listitem" key={node.id}>
        <strong>{node.lines[0]}</strong>
        <span>{node.lines.slice(1).join(' · ')}</span>
      </div>)}
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">스레드마다 별도의 JVM 스택이 있으며 메서드 호출마다 프레임이 생깁니다. 공유 영역은 물리적 연속 메모리 블록이 아니며 JVM 명세의 method area를 HotSpot Metaspace와 동일시하지 않습니다. 전체 런타임 영역을 빠짐없이 그린 목록은 아닙니다.</p>
  </section>
}

/** HotSpot speculation can deoptimize; this is conditional, not a mandatory bytecode path. */
export function JavaJitProfileEditorial() {
  const scene = javaApiScenes['jit-profile'][0]
  const nodes = scene.graph?.nodes ?? []
  const details = (id: string) => nodes.find((node) => node.id === id)?.lines ?? []
  const observed = details('profile')
  const compiled = details('compiled')
  const invalidated = details('invalidate')
  const deoptimized = details('deopt')
  return <section className="java-ed-runtime java-ed-jit" aria-label="HotSpot 프로파일과 조건부 최적화 해제">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <span className="java-editorial-kicker">가능한 최적화 경로 · 항상 일어나는 단계는 아님</span>
    <div className="java-ed-jit-main" role="list">
      {[observed, compiled].map((lines, index) => <div role="listitem" key={index}>
        <small>{String(index + 1).padStart(2, '0')}</small>
        <strong>{lines[0]}</strong>
        <span>{lines.slice(1).join(' · ')}</span>
      </div>)}
    </div>
    <div className="java-ed-jit-condition">
      <strong>가정이 여전히 유효</strong>
      <span>최적화된 코드로 실행할 수 있음</span>
    </div>
    <section className="java-ed-jit-exception" aria-label="가정이 무효화되는 경우의 별도 경로">
      <span className="java-editorial-kicker">조건부 경로 · 가정이 깨진 경우</span>
      <div><strong>{invalidated[0]}</strong><span>{invalidated.slice(1).join(' · ')}</span></div>
      <div><strong>{deoptimized[0]}</strong><span>{deoptimized.slice(1).join(' · ')}</span></div>
    </section>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">이 그림은 HotSpot의 구현 전략을 단순화합니다. JIT 횟수·워밍업 완료 시점·항상 최적화가 발생한다는 보장은 없으며, JVMS의 고정 실행 순서가 아닙니다.</p>
  </section>
}

/** A class is identified by its binary name and defining loader, not its filename alone. */
export function JavaLoaderIdentityEditorial() {
  const scene = javaApiScenes['loader-identity'][0]
  const nodes = scene.graph?.nodes ?? []
  const api = nodes.find((node) => node.id === 'api')
  const impls = nodes.filter((node) => node.id === 'l1' || node.id === 'l2')
  return <section className="java-ed-runtime java-ed-loader" aria-label="바이너리 이름과 defining loader의 조합으로 구별되는 두 클래스">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-loader-parent">
      <span className="java-editorial-kicker">공통 계약 · 부모 로더에서 정의한 타입</span>
      <strong>{api?.lines[0]}</strong>
      <span>{api?.lines.slice(1).join(' · ')}</span>
    </div>
    <p className="java-ed-loader-common">두 구현은 공통 API를 사용하지만, 그 구현 타입을 정의한 로더는 다릅니다.</p>
    <div className="java-ed-loader-pairs" role="list">
      {impls.map((node) => <div role="listitem" key={node.id}>
        <span className="java-editorial-kicker">defining loader {node.id === 'l1' ? 'L1' : 'L2'}</span>
        <strong><code>impl.Plugin</code></strong>
        <span>{node.lines.slice(1).join(' · ')}</span>
      </div>)}
    </div>
    <div className="java-ed-loader-identity" role="note">
      <span className="java-editorial-kicker">런타임 타입 동일성의 판단 기준</span>
      <strong>binary name + defining loader</strong>
      <p>이름이 <code>impl.Plugin</code>으로 같더라도 L1과 L2가 각각 정의한 클래스는 서로 다른 타입입니다.</p>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">위임을 시작한 initiating loader와 실제로 클래스를 정의한 defining loader는 다를 수 있습니다. 모든 사용자 정의 로더가 부모 우선으로 동작하는 것도 아닙니다.</p>
  </section>
}


/** Preserve object positions across the two snapshots; unlinking does not immediately collect them. */
export function JavaRetainedPathEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['retained-path']
  const linked = index === 0
  return <section className="java-ed-runtime java-ed-retained" aria-label="장수 owner의 객체 유지 경로와 등록 해제">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <div className="java-ed-retained-graph" role="group" aria-label={linked ? 'root에서 owner를 거쳐 Session과 Payload까지 도달 가능' : 'owner와 Session 간 연결 해제, 다른 root가 없다면 Session과 Payload는 도달 불가'}>
      <div className="java-ed-retained-root"><span className="java-editorial-kicker">도달 가능</span><strong>GC root</strong></div>
      <span className="java-ed-retained-arrow" aria-hidden="true">→</span>
      <div className="java-ed-retained-owner"><strong>장수 owner / registry</strong><small>애플리케이션에서 계속 사용</small></div>
      <div className="java-ed-retained-path" aria-label={linked ? 'owner가 Session을 강하게 참조' : 'owner에서 Session으로 이어지는 강한 참조 제거'}>
        <span aria-hidden="true">{linked ? '→' : '×'}</span>
        <small>{linked ? '강한 참조 유지' : '등록 해제 · 경로 끊김'}</small>
      </div>
      <div className={'java-ed-retained-island' + (linked ? '' : ' is-unreachable')} role="group" aria-label="Session에서 Payload로의 객체 내부 강한 참조는 유지">
        <div><strong>종료된 Session</strong><small>{linked ? '업무 종료 후에도 보유 중' : '다른 root 경로가 없다고 가정'}</small></div>
        <span className="java-ed-retained-arrow" aria-hidden="true">→</span>
        <div><strong>Payload byte[]</strong><small>{linked ? '도달 가능' : '회수 가능 후보 · 아직 수거 전'}</small></div>
      </div>
    </div>
    <p className="java-ed-state-event" role="status" aria-live="polite">
      {linked ? '불필요한 객체를 root에서 계속 도달할 수 있으므로 GC가 유지합니다.'
        : 'owner의 등록을 해제해도 객체를 즉시 제거하지 않습니다. 다른 root 경로가 없다면 회수 가능해집니다.'}
    </p>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification">객체의 참조 관계를 그린 논리적 도식이며 GC 수집 시각이나 메모리 사용량을 표현하지 않습니다. 다른 root의 강한 참조가 있다면 여전히 도달 가능합니다.</p>
  </section>
}
