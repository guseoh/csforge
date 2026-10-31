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

/** Java-only editorial illustration. Keeps all five canonical teaching frames and their explanations. */
export function JavaPassByValueEditorial({ data }: { data: VisualizationOf<'java-pass-by-value'> }) {
  const [index, setIndex] = useState(0)
  const frames = passByValueFrames(data)
  const frame = frames[index]
  const parameterExists = frame.parameter !== null
  const hasB = frame.b !== null
  return <div className="java-editorial-pass">
    <div className="java-editorial-pass-figure" role="group" aria-label={`참조 값 복사 ${index + 1}단계. 호출자 member는 A 유지. 매개변수 value는 ${frame.parameter ?? '존재하지 않음'}. ${frame.explanation}`}>
      <div className="java-editorial-pass-labels">
        <span className="java-editorial-kicker">호출자 변수</span>
        <div className="java-editorial-variable"><code>member</code><span>→ 객체 A</span></div>
        <span className="java-editorial-kicker">메서드 매개변수</span>
        <div className={`java-editorial-variable${parameterExists ? ' is-live' : ''}`}>
          <code>value</code><span>{parameterExists ? `→ 객체 ${frame.parameter}` : index === 0 ? '호출 전' : '범위 종료'}</span>
        </div>
      </div>
      <div className="java-editorial-pass-arrows" aria-hidden="true">
        <svg viewBox="0 0 135 182" focusable="false">
          <path d="M2 52 H126 l-7 -5 m7 5 -7 5" />
          {frame.parameter === 'A' && <path d="M2 148 L126 69 l-8 0 m8 0 -4 8" />}
          {frame.parameter === 'B' && <path d="M2 148 H126 l-7 -5 m7 5 -7 5" />}
        </svg>
      </div>
      <div className="java-editorial-pass-objects">
        <span className="java-editorial-kicker">참조 대상</span>
        <div className="java-editorial-object"><strong>객체 A</strong><code>name = "{frame.a}"</code></div>
        <div className={`java-editorial-object${!hasB ? ' is-absent' : ''}${index === frames.length - 1 ? ' is-unreferenced' : ''}`}>
          {hasB ? <><strong>객체 B</strong><code>name = {frame.b.name === null ? 'null' : `"${frame.b.name}"`}</code></> : <span>객체 B는 아직 없음</span>}
        </div>
      </div>
    </div>
    <div className="java-editorial-pass-controls" role="group" aria-label="참조 값 복사 단계 조작">
      <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}>← 이전</button>
      <span aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(frames.length).padStart(2, '0')}</span>
      <button type="button" disabled={index === frames.length - 1} onClick={() => setIndex(index + 1)}>다음 →</button>
      <button type="button" className="java-editorial-reset" disabled={index === 0} onClick={() => setIndex(0)}>초기화</button>
    </div>
    <p className="diagram-code"><code>{frame.code}</code></p>
    <p className="java-editorial-pass-note" role="status" aria-live="polite">{frame.explanation}</p>
    <p className="java-editorial-qualification">화살표는 논리적 참조 관계입니다. 객체의 실제 메모리 주소·배치나 B의 즉시 가비지 수집을 의미하지 않습니다.</p>
  </div>
}
