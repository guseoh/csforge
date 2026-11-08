import { useId } from 'react'
import './study-visual-pilots.css'

function ReferenceSnapshot({ reassigned }: { reassigned: boolean }) {
  const id = useId()
  const arrow = `ref-arrow-${id}`
  const label = reassigned ? '매개변수 재할당 직후' : '메서드 진입 직후'

  return <svg className="study-visual__java-canvas" viewBox="0 0 430 256" role="img" aria-labelledby={`state-title-${id} state-desc-${id}`}>
    <title id={`state-title-${id}`}>{label}</title>
    <desc id={`state-desc-${id}`}>{reassigned
      ? '호출자 member는 객체 A를 계속 참조하고 메서드 매개변수 param은 새 객체 B를 참조합니다.'
      : '호출자 member와 매개변수 param이 같은 객체 A를 참조합니다. 객체 자체가 복사된 것은 아닙니다.'
    }</desc>
    <defs>
      <marker id={arrow} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0 0 L10 5 L0 10 Z" className="study-visual__arrowhead" />
      </marker>
    </defs>
    <text x="20" y="30" className="study-visual__svg-muted">호출자 변수</text>
    <text x="20" y="153" className="study-visual__svg-muted">메서드 매개변수</text>
    <g>
      <rect x="20" y="47" width="116" height="48" className="study-visual__svg-box" />
      <text x="78" y="76" textAnchor="middle" className="study-visual__svg-identifier">member</text>
      <rect x="20" y="171" width="116" height="48" className="study-visual__svg-box" />
      <text x="78" y="200" textAnchor="middle" className="study-visual__svg-identifier">param</text>
    </g>
    {reassigned ? <>
      <rect x="278" y="43" width="132" height="72" className="study-visual__svg-object" />
      <text x="344" y="72" textAnchor="middle" className="study-visual__svg-label">객체 A</text>
      <text x="344" y="97" textAnchor="middle" className="study-visual__svg-muted">name = "kim"</text>
      <rect x="278" y="159" width="132" height="72" className="study-visual__svg-object study-visual__svg-object--related" />
      <text x="344" y="188" textAnchor="middle" className="study-visual__svg-label">객체 B</text>
      <text x="344" y="213" textAnchor="middle" className="study-visual__svg-muted">name = "park"</text>
      <path d="M136 71 H276" className="study-visual__svg-arrow" markerEnd={`url(#${arrow})`} />
      <path d="M136 195 H276" className="study-visual__svg-arrow" markerEnd={`url(#${arrow})`} />
    </> : <>
      <rect x="278" y="96" width="132" height="72" className="study-visual__svg-object" />
      <text x="344" y="125" textAnchor="middle" className="study-visual__svg-label">객체 A</text>
      <text x="344" y="150" textAnchor="middle" className="study-visual__svg-muted">name = "kim"</text>
      <path d="M136 71 L276 117" className="study-visual__svg-arrow" markerEnd={`url(#${arrow})`} />
      <path d="M136 195 L276 147" className="study-visual__svg-arrow" markerEnd={`url(#${arrow})`} />
    </>}
  </svg>
}

/** Illustrates copied reference values, not a physical JVM stack/heap layout. */
export function JavaPassByValueStudyVisual() {
  return <details className="study-visual" open data-study-visual="java-pass-by-value">
    <summary className="study-visual__summary"><span>데모</span><span className="study-visual__chevron" aria-hidden="true" /></summary>
    <div className="study-visual__content">
      <p className="study-visual__instruction">두 시점을 비교하면 참조값의 복사와 매개변수 재할당을 구분할 수 있습니다.</p>
      <p className="study-visual__snippet"><code>Member member = new Member("kim");</code> <code>replace(member);</code></p>
      <div className="study-visual__two-panels">
        <section className="study-visual__panel">
          <h3>① 메서드 진입 직후</h3>
          <ReferenceSnapshot reassigned={false} />
          <p className="study-visual__panel-caption">참조값이 복사되어 두 변수가 동일한 객체 A를 가리킵니다.</p>
        </section>
        <section className="study-visual__panel">
          <h3>② param = new Member("park")</h3>
          <ReferenceSnapshot reassigned />
          <p className="study-visual__panel-caption">매개변수만 새 객체 B를 가리킵니다. 호출자 변수는 그대로입니다.</p>
        </section>
      </div>
      <div className="study-visual__explanation" data-java-explanation>
        <p className="study-visual__key">복사되는 것은 객체가 아니라 참조값입니다.</p>
        <p>호출자 <code>member → 객체 A</code>는 두 시점에서 동일합니다.</p>
        <p>매개변수 <code>param → 객체 A</code>에서 <code>param → 객체 B</code>로 바뀝니다.</p>
        <p className="study-visual__note">메서드 실행 중의 논리적 참조 관계입니다. JVM 내부의 물리적인 메모리 배치를 의미하지 않습니다.</p>
      </div>
    </div>
  </details>
}
