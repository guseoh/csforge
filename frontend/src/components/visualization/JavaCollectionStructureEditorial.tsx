import { javaApiScenes } from '../../lib/java-api-models'
import './java-editorial.css'

/** A read-only view tracks source structure; copyOf preserves a separate element snapshot. */
export function JavaViewCopyEditorial() {
  const scene = javaApiScenes['view-copy'][0]
  return <section className="java-ed-collection java-ed-view-copy" aria-label="원본 변경 후 수정 불가 뷰와 copyOf의 차이">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-view-before">
      <span className="java-editorial-kicker">원본과 두 결과를 만든 시점</span>
      <strong><code>source = [M]</code></strong>
      <small>두 방식 모두 원소 M을 참조합니다.</small>
    </div>
    <div className="java-ed-view-change">
      <span className="java-editorial-kicker">이후 원본에만 변경 발생</span>
      <code>source.add(N)</code><strong>source = [M, N]</strong>
    </div>
    <div className="java-ed-view-results" role="list">
      <div role="listitem">
        <strong><code>unmodifiableList(source)</code></strong>
        <span>원본을 감싼 수정 불가 뷰</span>
        <p><code>[M, N]</code> <small>원본의 구조 변경이 보임</small></p>
      </div>
      <div role="listitem">
        <strong><code>List.copyOf(source)</code></strong>
        <span>변경 전에 얻어 둔 결과</span>
        <p><code>[M]</code> <small>이후 원본 구조 변경과 분리</small></p>
      </div>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">copyOf가 반드시 새 인스턴스를 만든다는 뜻은 아닙니다. 두 방식 모두 가변 원소 M의 상태까지 깊게 복사하지 않습니다. 뷰·복사본 자체를 통한 수정은 허용되지 않습니다.</p>
  </section>
}

/** Three Map views share the backing mappings; a supported removal writes through. */
export function JavaMapViewsEditorial() {
  const scene = javaApiScenes['map-views'][0]
  const projections = [
    { name: 'keySet()', kind: '키', before: 'A, B', after: 'B' },
    { name: 'values()', kind: '값', before: '1, 2', after: '2' },
    { name: 'entrySet()', kind: '엔트리', before: 'A=1, B=2', after: 'B=2' },
  ] as const
  return <section className="java-ed-collection java-ed-map-views" aria-label="하나의 Map을 바라보는 세 가지 연결된 뷰">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-map-source">
      <span className="java-editorial-kicker">기반 Map · 변경 전</span>
      <strong><code>A ↦ 1</code><code>B ↦ 2</code></strong>
    </div>
    <div className="java-ed-map-mutation">
      <span className="java-editorial-kicker">뷰를 통한 지원되는 제거 연산</span>
      <code>keys.remove("A")</code>
      <strong>기반 Map → B ↦ 2</strong>
    </div>
    <span className="java-ed-map-shared-label">같은 기반 Map을 바라보는 세 뷰 · 변경 전과 후</span>
    <div className="java-ed-map-projections" role="list">
      {projections.map((view) => <div role="listitem" key={view.name}>
        <strong><code>{view.name}</code></strong>
        <small>{view.kind}</small>
        <div className="java-ed-map-before-after">
          <span><small>제거 전</small><code>{view.before}</code></span>
          <span><small>제거 후</small><code>{view.after}</code></span>
        </div>
      </div>)}
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">세 뷰는 독립된 스냅샷이 아니며 기반 Map의 변경을 반영합니다. 제거 지원이 add나 put을 허용한다는 뜻은 아닙니다. 행의 값은 순서 없는 집합·매핑의 예시이며 Map의 반복 순서를 고정하지 않습니다.</p>
  </section>
}
