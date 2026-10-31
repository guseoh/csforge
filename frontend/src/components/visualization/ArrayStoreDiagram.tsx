import { useState } from 'react'
import { arrayStoreFrames } from '../../lib/language-type-models'
import { EditorialNote, EditorialSteps } from './JavaSemanticDiagrams'

/** A covariant alias cannot alter the array object's runtime element type. */
export function ArrayStoreDiagram() {
  const [index, setIndex] = useState(0)
  const frames = arrayStoreFrames()
  const frame = frames[index]
  const attempted = frame.phase === 'checking' || frame.phase === 'rejected'
  return <section className="java-ed-legacy java-ed-array" aria-label="String 배열의 별칭과 실행 시점 저장 검사">
    <div className="java-ed-legacy-current"><span className="java-editorial-kicker">현재 실행 · {index + 1} / {frames.length}</span><code>{frame.code}</code></div>
    <div className="java-ed-legacy-array-relations">
      <div className="java-ed-legacy-array-names" aria-label="변수의 선언 타입">
        <span className="java-editorial-kicker">변수 · 선언 타입</span>
        <div><code>String[] names</code><span>→ 배열 A</span></div>
        {frame.alias && <div><code>Object[] values</code><span>→ 같은 배열 A</span></div>}
      </div>
      <div className="java-ed-legacy-array-instance" aria-label="실제 String 배열 객체">
        <span className="java-editorial-kicker">실제 객체 · A</span>
        <strong><code>String[2]</code></strong><span>원소 타입 String · 길이 2</span>
        <div className="java-ed-legacy-array-cells" role="group" aria-label="배열 원소">
          {frame.elements.map((value, position) =>
            <div key={position} className={position === 1 && attempted ? 'is-attempted' : undefined}>
              <span>[{position}]</span><code>{value === null ? 'null' : '"' + value + '"'}</code>
            </div>)}
        </div>
      </div>
    </div>
    <div className="java-ed-legacy-check" role="status" aria-live="polite">
      <span className="java-editorial-kicker">{attempted ? '실행 시점의 배열 저장 검사' : '현재 배열 상태'}</span>
      <strong>{frame.phase === 'checking' ? 'Integer → String[] · 저장 검사 중'
        : frame.phase === 'rejected' ? 'ArrayStoreException · 저장 거절'
        : frame.phase === 'accepted' ? 'String 저장 성공'
        : '실제 배열의 원소 타입은 계속 String'}</strong>
      <span>{frame.phase === 'checking' ? '[1]에는 아직 아무 값도 저장되지 않았습니다.'
        : frame.phase === 'rejected' ? '[1]은 null, 앞서 저장한 [0]의 "kim"은 유지됩니다.'
        : '별칭을 만들어도 실제 배열 객체는 바뀌지 않습니다.'}</span>
    </div>
    <EditorialSteps index={index} count={frames.length} setIndex={setIndex} />
    <EditorialNote description={frame.explanation} />
    <p className="java-editorial-qualification"><code>Object[]</code>를 통한 Integer 저장은 컴파일되지만 실제 <code>String[]</code>에 대한 실행 시점 검사에서 거절됩니다. 실패한 저장은 앞서 성공한 저장을 되돌리지 않습니다.</p>
  </section>
}
