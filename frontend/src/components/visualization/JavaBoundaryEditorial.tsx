import { javaApiScenes } from '../../lib/java-api-models'
import './java-editorial.css'

/** Parallel speed depends on split, independent work and reduction costs. */
export function JavaParallelCostsEditorial() {
  const scene = javaApiScenes['parallel-costs'][0]
  return <section className="java-ed-contract" aria-label="병렬 Stream의 분할 실행 결합 비용">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <ol className="java-ed-contract-order">
      <li><strong>01 · 분할</strong><span>원본을 나누는 비용과 분할 가능성</span></li>
      <li><strong>02 · 독립 계산</strong><span>공유 가변 상태 없이 부분 결과 계산</span></li>
      <li><strong>03 · 결합</strong><span>결합법칙과 결과 병합 비용</span></li>
    </ol>
    <div className="java-ed-contract-emphasis">병렬화 이익 &gt; 분할 · 조정 · 결합 비용일 때 성능상 의미가 있습니다.</div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">이 세 단계는 비용을 분류한 논리 모델입니다. 작업자 수·실행 시간·실제 스케줄러 순서를 의미하지 않으며 정확성을 먼저 검증한 뒤 측정해야 합니다.</p>
  </section>
}

/** Compile-time classfile generation and implementation-dependent JVM execution are separate. */
export function JavaClassfileBoundaryEditorial() {
  const scene = javaApiScenes['jdk-classfile'][0]
  return <section className="java-ed-contract" aria-label="Java 소스 컴파일과 클래스 파일 실행의 경계">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-build-path">
      <div><small>소스</small><strong><code>.java</code></strong></div><span><code>javac</code> →</span>
      <div><small>산출물</small><strong><code>.class</code></strong></div><span>JVM 로드·실행 →</span>
      <div><small>런타임</small><strong>현재 OS·CPU</strong></div>
    </div>
    <div className="java-ed-contract-contrast">
      <div><strong>클래스 파일</strong><span>바이트코드 + 메타데이터 · 특정 CPU 기계어 아님</span></div>
      <div><strong>JVM 구현</strong><span>인터프리터·JIT 등 가능한 실행 전략 · 구현에 의존</span></div>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">JDK 개발 도구와 JVM 실행 모델을 구분합니다. Java 명세가 모든 JVM에 동일한 JIT 정책을 강제하는 것은 아닙니다.</p>
  </section>
}

/** A stop-the-world pause and concurrent collector work are different kinds of intervals. */
export function JavaCollectorIntervalsEditorial() {
  const scene = javaApiScenes['collector-tradeoffs'][0]
  return <section className="java-ed-contract" aria-label="애플리케이션 중단 구간과 동시 GC 작업 예시">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-gc-intervals">
      <span className="java-editorial-kicker">애플리케이션의 예시 구간 · 비례한 시간 표시가 아님</span>
      <div className="java-ed-gc-interval-row">
        <span>앱 실행</span><strong>STW pause</strong><span>앱 재개</span>
      </div>
      <span className="java-editorial-kicker">다른 GC 작업 방식 · 일부 구간은 앱 실행과 겹칠 수 있음</span>
      <div className="java-ed-gc-concurrent">
        <span>애플리케이션 실행 구간</span>
        <strong>동시 GC 작업 예시 · 일부 겹침</strong>
      </div>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">동시 수집기에도 pause는 존재할 수 있습니다. 표시 길이·비율·횟수는 실측값이 아니며 G1·ZGC 등 수집기의 성능 순위를 뜻하지 않습니다.</p>
  </section>
}

/** One Instant has distinct local clock expressions depending on its zone. */
export function JavaInstantZonesEditorial() {
  const scene = javaApiScenes['instant-zones'][0]
  return <section className="java-ed-contract" aria-label="하나의 Instant를 서울 뉴욕 시간대로 표현">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-utc-anchor"><span className="java-editorial-kicker">같은 시간축의 한 순간</span><strong><code>2026-08-31T05:00:00Z</code></strong></div>
    <div className="java-ed-contract-contrast">
      <div><strong>Asia/Seoul</strong><code>2026-08-31 14:00</code><small>UTC+09:00</small></div>
      <div><strong>America/New_York</strong><code>2026-08-31 01:00</code><small>UTC-04:00</small></div>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">동일한 Instant의 지역별 표현이며 별개의 두 사건이 아닙니다. LocalDateTime만으로는 시간대와 offset을 확정할 수 없습니다. 이 예시는 2026-08-31의 zone 규칙을 사용합니다.</p>
  </section>
}

/** Crossing a DST gap: elapsed 24h and calendar day yield different wall clock times. */
export function JavaDurationPeriodEditorial() {
  const scene = javaApiScenes['duration-period'][0]
  return <section className="java-ed-contract" aria-label="파리 DST 전환에서 Duration 24시간과 Period 하루 비교">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-utc-anchor"><span className="java-editorial-kicker">공통 시작 · Europe/Paris</span><strong><code>2026-03-28 09:00+01:00</code></strong></div>
    <div className="java-ed-contract-contrast">
      <div><strong><code>Duration.ofHours(24)</code></strong><code>03-29 10:00+02:00</code><small>경과 24시간</small></div>
      <div><strong><code>Period.ofDays(1)</code></strong><code>03-29 09:00+02:00</code><small>경과 23시간 · 달력 하루</small></div>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">Europe/Paris의 2026년 봄 DST gap을 가로지르는 고정 예시입니다. 모든 날짜·지역에서 달력 하루가 23시간이라는 뜻은 아닙니다.</p>
  </section>
}

/** Exception cause points to the underlying failure, not execution control flow. */
export function JavaExceptionCauseEditorial() {
  const scene = javaApiScenes['exception-cause'][0]
  return <section className="java-ed-contract" aria-label="ImportException에서 IOException cause로의 참조">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-cause-route">
      <div><span className="java-editorial-kicker">상위 의미</span><strong><code>ImportException</code></strong><small>가져오기 실패</small></div>
      <span><code>getCause()</code> →</span>
      <div><span className="java-editorial-kicker">원래 실패</span><strong><code>IOException</code></strong><small>I/O 실패의 원인과 stack trace 보존</small></div>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification"><code>new ImportException(message, e)</code>로 명시적으로 원인을 보존합니다. 연결은 호출 순서나 예외 처리 단계가 아니라 Throwable의 cause 참조입니다.</p>
  </section>
}
