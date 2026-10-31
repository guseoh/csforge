/** Show why a read is allowed on every path, not which branch executes. */
export function DefiniteAssignmentDiagram() {
  return <section className="java-ed-legacy java-ed-definite" aria-label="두 분기에서 result를 확정 할당">
    <div className="java-ed-legacy-initial">
      <span className="java-editorial-kicker">분기 이전 · 지역 변수</span><code>int result;</code><span>아직 대입되지 않음</span>
    </div>
    <div className="java-ed-legacy-condition">
      <strong><code>score &gt;= 60</code></strong><span>참·거짓 두 경로로 분기</span>
    </div>
    <div className="java-ed-legacy-branches" role="group" aria-label="두 분기의 대입">
      <div><span className="java-editorial-kicker">참 · if</span><code>result = 1;</code><strong>대입 완료</strong></div>
      <div><span className="java-editorial-kicker">거짓 · else</span><code>result = 0;</code><strong>대입 완료</strong></div>
    </div>
    <div className="java-ed-legacy-outcome" role="note">
      <span className="java-editorial-kicker">합류 · 도달하는 모든 경로에서 대입됨</span>
      <strong>확정 할당 성립</strong><code>System.out.println(result);</code><span>컴파일 가능</span>
    </div>
    <p className="java-editorial-qualification">두 분기를 모두 실행한다는 뜻이 아닙니다. Java 컴파일러는 실행 결과를 예측하는 대신 읽기 전에 모든 도달 경로에서 대입됐는지 판단합니다.</p>
  </section>
}
