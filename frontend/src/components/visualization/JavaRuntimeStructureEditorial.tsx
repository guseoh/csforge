import { javaApiScenes } from '../../lib/java-api-models'
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
