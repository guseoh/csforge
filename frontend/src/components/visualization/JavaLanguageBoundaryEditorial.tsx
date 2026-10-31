import { javaApiScenes } from '../../lib/java-api-models'
import './java-editorial.css'

/** Checked exception rules apply to Throwable subclasses beyond Exception as well. */
export function JavaThrowableClassificationEditorial() {
  const scene=javaApiScenes['throwable-tree'][0]
  return <section className="java-ed-boundary" aria-label="Throwable의 checked 및 unchecked 타입 계층">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-boundary-root"><strong><code>Throwable</code></strong><small>컴파일러가 처리 또는 선언을 검사하는 기준</small></div>
    <div className="java-ed-boundary-tree">
      <div><strong><code>Error</code></strong><span>unchecked · 그 하위 타입도 동일</span></div>
      <div><strong><code>Exception</code></strong><span>RuntimeException과 그 밖의 Exception 구분</span>
        <div className="java-ed-boundary-tree-child"><code>RuntimeException</code><small>unchecked</small></div>
        <div className="java-ed-boundary-tree-child"><code>IOException 등</code><small>checked</small></div>
      </div>
    </div>
    <p className="java-ed-boundary-feedback"><code>Throwable</code>을 직접 상속한 타입도 RuntimeException·Error 계열이 아니면 checked일 수 있습니다.</p>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">checked/unchecked은 심각도나 복구 가능성의 순위가 아닙니다. 실제 검사 규칙은 타입의 상속 관계로 결정됩니다.</p>
  </section>
}

/** Exception propagation follows responsibility, not mandatory catch blocks in every layer. */
export function JavaExceptionBoundaryEditorial() {
  const scene=javaApiScenes['exception-boundary'][0]
  return <section className="java-ed-boundary" aria-label="Repository Service API 경계 사이 예외 전파">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <ol className="java-ed-boundary-steps">
      <li><strong>Repository</strong><span>낮은 수준의 I/O·영속성 실패 발생</span></li>
      <li><strong>Application Service</strong><span>실제 복구 또는 의미 변환이 없다면 예외를 전파</span></li>
      <li><strong>API Boundary</strong><span>HTTP status · error body로 실패 표현</span></li>
      <li><strong>Client</strong><span>외부 실패 응답 관찰</span></li>
    </ol>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">모든 계층에서 예외를 catch하거나 중복 로깅해야 하는 것은 아닙니다. 의미 있는 책임이 있는 경계에서만 변환·기록·복구합니다.</p>
  </section>
}

/** Borrowers use an already-open resource without becoming its lifecycle owner. */
export function JavaResourceOwnershipEditorial() {
  const scene=javaApiScenes['resource-ownership'][0]
  return <section className="java-ed-boundary" aria-label="OutputStream 소유자의 수명 책임과 borrower의 사용">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-boundary-ownership">
      <div><span className="java-editorial-kicker">소유자</span><strong>Owner</strong><span><code>open()</code> · <code>close()</code> 수명 책임</span></div>
      <div><span className="java-editorial-kicker">공유하는 자원</span><strong><code>OutputStream</code></strong><span>소유자가 종료 시점을 결정</span></div>
      <div><span className="java-editorial-kicker">빌린 사용자</span><strong>Borrower</strong><span><code>write(out)</code> 사용 · 임의 close 금지</span></div>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">이 그림은 소유권 이전이 없는 API 계약의 예시입니다. 반환값으로 소유권을 넘기거나 프레임워크가 자원을 관리한다면 해당 계약이 우선합니다.</p>
  </section>
}

/** Compile-time processors and runtime reflection have different inputs and outputs. */
export function JavaProcessingReflectionEditorial() {
  const scene=javaApiScenes['processing-reflection'][0]
  return <section className="java-ed-boundary" aria-label="Annotation Processing과 Reflection의 시간과 산출물 비교">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-boundary-compare">
      <div><span className="java-editorial-kicker">빌드 시점</span><strong>Annotation Processor</strong>
        <code>Java source / type model → javac processor</code><span>메타데이터 확인 · 소스/리소스 생성 가능</span></div>
      <div><span className="java-editorial-kicker">실행 시점</span><strong>Reflection</strong>
        <code>로드된 Class → Method / Field / Annotation</code><span>런타임 메타데이터 관찰 · 동적 타입 조사</span></div>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">모든 annotation이 런타임에 남는 것은 아닙니다. SOURCE·CLASS·RUNTIME 보존 범위를 구분해야 하며, 두 방법은 서로 배타적인 선택지가 아닙니다.</p>
  </section>
}

/** Reads/exports and deep reflection opens are different module boundaries. */
export function JavaModuleBoundaryEditorial() {
  const scene=javaApiScenes['module-boundary'][0]
  return <section className="java-ed-boundary" aria-label="JPMS requires exports opens 경계 비교">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-boundary-compare">
      <div><span className="java-editorial-kicker">일반 코드 접근</span><strong><code>requires</code> + <code>exports</code></strong>
        <code>app → library.api</code><span>가독성·패키지 export와 Java 접근 제어를 함께 확인</span></div>
      <div><span className="java-editorial-kicker">깊은 Reflection</span><strong><code>opens</code> 조건</strong>
        <code>reflector → library.internal</code><span>비공개 멤버 접근은 별도의 열림 정책 필요</span></div>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification"><code>public</code>만으로 명명 모듈의 패키지를 외부에 공개하지 않습니다. <code>exports</code>만으로 비공개 멤버의 깊은 reflection을 허용하지도 않습니다.</p>
  </section>
}

/** Binary linkage of old class files is not identical to recompiling source. */
export function JavaBinaryEvolutionEditorial() {
  const scene=javaApiScenes['binary-evolution'][0]
  return <section className="java-ed-boundary" aria-label="소스 호환과 기존 class 파일의 바이너리 호환 비교">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-boundary-compare">
      <div><span className="java-editorial-kicker">소스 호환성</span><strong>새 라이브러리와 재컴파일</strong>
        <code>client.java → javac + library v2</code><span>새 소스의 컴파일 성공 여부</span></div>
      <div><span className="java-editorial-kicker">바이너리 호환성</span><strong>기존 class를 재컴파일 없이 링크</strong>
        <code>client.class(v1) → library v2</code><span>기존 메서드 참조의 descriptor를 만족하는지 확인</span></div>
    </div>
    <p className="java-ed-boundary-feedback"><code>NoSuchMethodError</code>는 기존 class의 연결 실패 예시이며, 링크가 성공해도 의미적 호환성을 보장하지 않습니다.</p>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">메서드 이름이 같아도 매개변수나 반환 타입 변경은 기존 바이너리 참조를 깨뜨릴 수 있습니다. 소스·바이너리·행동 호환성을 각각 평가해야 합니다.</p>
  </section>
}

/** Deserializing untrusted bytes crosses a code-execution and object-graph boundary. */
export function JavaSerializationBoundaryEditorial() {
  const scene=javaApiScenes['serialization-boundary'][0]
  return <section className="java-ed-boundary" aria-label="신뢰할 수 없는 Java 직렬화 데이터 복원 경계">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-boundary-steps" role="list">
      <div role="listitem"><strong>외부 byte stream</strong><span>신뢰할 수 없는 입력 · 크기와 타입 미확인</span></div>
      <div role="listitem"><strong><code>ObjectInputStream</code></strong><span>역직렬화 과정과 필터 등 입력 경계</span></div>
      <div role="listitem"><strong>객체 그래프 복원</strong><span>참조·타입·배열 크기 · 복원 중 readObject 등 동작 가능</span></div>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">serialVersionUID 일치는 데이터 안전성이나 전체 호환성을 보장하지 않습니다. ObjectInputFilter는 완화 수단이지만 신뢰할 수 없는 데이터를 무분별하게 역직렬화해도 된다는 허가는 아닙니다.</p>
  </section>
}
