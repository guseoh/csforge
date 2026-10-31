import { useState } from 'react'
import type { VisualizationOf } from '../../lib/learning-visualization'
import { passByValueFrames } from '../../lib/visualization-models'
import './java-editorial.css'

/** Concept-specific HashMap lookup illustration: bucket ordering is deliberately not asserted. */
export function JavaHashLookupDiagram() {
  return <div className="java-editorial-hash" role="group" aria-label="같은 해시값을 갖는 서로 다른 Aa와 BB 중 동등한 BB의 값 2를 조회">
    <div className="java-editorial-hash-query">
      <span className="java-editorial-kicker">조회 요청</span>
      <code>values.get("BB")</code>
      <small>hashCode = 2112</small>
    </div>
    <span className="java-editorial-hash-direction" aria-hidden="true">→</span>
    <div className="java-editorial-hash-candidates">
      <span className="java-editorial-kicker">동일 해시의 후보</span>
      <div className="java-editorial-hash-bracket">
        <div className="java-editorial-hash-row">
          <code>"Aa"</code><span>동등하지 않음</span><strong>1</strong>
        </div>
        <div className="java-editorial-hash-row is-match">
          <code>"BB"</code><span>동등한 키</span><strong>2</strong>
        </div>
      </div>
    </div>
    <span className="java-editorial-hash-direction" aria-hidden="true">→</span>
    <div className="java-editorial-hash-result">
      <span className="java-editorial-kicker">반환 값</span>
      <strong>2</strong>
    </div>
    <p className="java-editorial-qualification">후보의 배치와 검사 순서는 개념 설명용이며 실제 버킷 인덱스나 <code>equals</code> 호출 순서를 보장하지 않습니다.</p>
  </div>
}

/** Java-only pass-by-value: quiet reference notation, fixed positions, and a readable current statement. */
export function JavaPassByValueEditorial({ data }: { data: VisualizationOf<'java-pass-by-value'> }) {
  const [index, setIndex] = useState(0)
  const frames = passByValueFrames(data)
  const frame = frames[index]
  const parameterTarget = frame.parameter
  const objectB = frame.b
  const isReturned = index === frames.length - 1

  return <div className="java-editorial-pass">
    <div className="java-ed-pass-current" aria-live="polite" aria-atomic="true">
      <span className="java-editorial-kicker">현재 실행 · {index + 1}단계</span>
      <pre className="java-ed-pass-statement"><code>{frame.code}</code></pre>
    </div>

    <div className="java-ed-pass-diagram" role="group"
      aria-label={`참조 상태 ${index + 1}단계. member는 객체 A, value는 ${parameterTarget === null ? '없음' : `객체 ${parameterTarget}`}. ${frame.explanation}`}>
      <section className="java-ed-pass-relations" aria-label="변수의 참조 관계">
        <h4>변수와 참조 값</h4>
        <div className="java-ed-pass-relation">
          <span className="java-editorial-kicker">호출자 변수</span>
          <div className="java-ed-pass-link">
            <code>member</code><span aria-hidden="true">⟶</span><strong>A</strong>
          </div>
        </div>
        <div className={`java-ed-pass-relation${parameterTarget === null ? ' is-inactive' : ''}`}>
          <span className="java-editorial-kicker">메서드 매개변수</span>
          <div className="java-ed-pass-link">
            <code>value</code><span aria-hidden="true">⟶</span>
            <strong>{parameterTarget ?? '—'}</strong>
          </div>
          <small>{parameterTarget === null ? (isReturned ? '호출 종료 · 범위 밖' : '호출 전 · 아직 없음') : `객체 ${parameterTarget} 참조`}</small>
        </div>
      </section>

      <section className="java-ed-pass-objects" aria-label="객체 필드 상태">
        <h4>객체 상태</h4>
        <div className="java-ed-pass-object" aria-label={`객체 A의 name은 ${frame.a}`}>
          <strong>객체 A</strong>
          <div className="java-ed-pass-field"><span>name</span><code>"{frame.a}"</code></div>
        </div>
        {objectB
          ? <div className={`java-ed-pass-object${isReturned ? ' is-unreferenced' : ''}`}
              aria-label={`객체 B의 name은 ${objectB.name ?? 'null'}.${isReturned ? ' 도식에 표시된 참조 없음.' : ''}`}>
              <strong>객체 B</strong>
              <div className="java-ed-pass-field"><span>name</span><code>{objectB.name === null ? 'null' : `"${objectB.name}"`}</code></div>
              {isReturned && <small>표시된 참조 없음</small>}
            </div>
          : <div className="java-ed-pass-object is-placeholder" aria-label="객체 B 생성 전">
              <span>객체 B</span><small>아직 생성 전</small>
            </div>}
      </section>
    </div>

    <div className="java-editorial-pass-controls" role="group" aria-label="참조 값 복사 단계 조작">
      <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}>← 이전</button>
      <span aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(frames.length).padStart(2, '0')}</span>
      <button type="button" disabled={index === frames.length - 1} onClick={() => setIndex(index + 1)}>다음 →</button>
      <button type="button" className="java-editorial-reset" disabled={index === 0} onClick={() => setIndex(0)}>초기화</button>
    </div>

    <p className="java-editorial-pass-note" role="status" aria-live="polite">{frame.explanation}</p>
    <p className="java-editorial-qualification">화살표는 참조 값의 논리적 관계입니다. 실제 메모리 배치나 객체 B의 즉시 수거를 의미하지 않습니다.</p>
  </div>
}
