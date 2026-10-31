import { useState } from 'react'
import { javaApiScenes } from '../../lib/java-api-models'
import { EditorialNote, EditorialSteps } from './JavaSemanticDiagrams'
import './java-editorial.css'

/** The ThreadPoolExecutor checks describe conditional branches, not a mandatory four-stage pipeline. */
export function JavaExecutorAdmissionEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['executor-admission']
  const state = [
    ['worker < core', '새 worker 생성 시도', '작업 직접 전달'],
    ['core 이상 · queue.offer 성공', '큐에 대기', '수용과 완료는 다름'],
    ['queue.offer 실패 · worker < max', '추가 worker 생성 시도', '무제한 큐가 수용하면 이 분기에 보통 도달하지 않음'],
    ['확장 불가 또는 shutdown', '거부 정책', 'CallerRunsPolicy도 shutdown에서는 작업을 실행하지 않을 수 있음'],
  ] as const
  return <section className="java-ed-coordination" aria-label="ThreadPoolExecutor의 조건별 작업 수용">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <span className="java-editorial-kicker">조건부 선택지 · 네 단계를 차례로 모두 실행하는 과정은 아님</span>
    <div className="java-ed-advanced-rows">
      <div><strong>조건</strong><span>{state[index][0]}</span></div>
      <div><strong>수용 시도</strong><span>{state[index][1]}</span></div>
      <div><strong>결과의 경계</strong><span>{state[index][2]}</span></div>
    </div>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification">일반적인 ThreadPoolExecutor 정책입니다. 실제 수용은 작업자 생성·종료와 경합할 수 있으며 거부 정책은 구성에 따라 달라집니다.</p>
  </section>
}

/** A thread-local belongs to the worker; the cleanup example is a distinct alternative. */
export function JavaThreadLocalReuseEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['threadlocal-reuse']
  const data = [
    ['요청 A', 'context A', '값 설정'],
    ['요청 B', '이전 context A 유지', '요청 A의 remove 누락'],
    ['요청 B', 'A 값 제거 후 B 문맥 설정', '별도의 안전 경로 · A에서 finally remove'],
  ] as const
  return <section className="java-ed-coordination" aria-label="재사용 worker의 ThreadLocal 문맥 수명">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <span className="java-editorial-kicker">같은 풀 worker W · {index === 2 ? '정리된 대안' : '미정리 경로'}</span>
    <div className="java-ed-advanced-rows">
      <div><strong>현재 작업</strong><span>{data[index][0]}</span></div>
      <div><strong>W의 ThreadLocal 값</strong><span>{data[index][1]}</span></div>
      <div><strong>동작</strong><span>{data[index][2]}</span></div>
    </div>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification">세 번째 장면은 두 번째 장면의 자동 복구가 아닙니다. 다른 실행 경로에서 요청 A가 완료될 때 값을 정리한 경우입니다. 임의 executor 작업으로의 자동 문맥 전파도 보장하지 않습니다.</p>
  </section>
}

/** Alternative examples must not imply a transaction rollback or a success after the failed path. */
export function JavaFailureAtomicityEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['failure-atomicity']
  const state = [
    ['사례 A · 이체 전', 'source = 100', 'target = 50'],
    ['사례 A · 부분 실패', 'source = 70', 'target = 50 · 입금 실패'],
    ['사례 B · 불변값 임시 계산', 'current = Money(100)', 'next = Money(130)'],
    ['사례 B · 검증 실패', 'current = Money(100) 유지', 'next 반영 안 함'],
    ['사례 B · 별도 성공 분기', 'current = Money(130) 반영', '검증 성공'],
  ] as const
  return <section className="java-ed-coordination" aria-label="실패 원자성의 별도 사례와 성공 실패 분기">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <span className="java-editorial-kicker">{state[index][0]}</span>
    <div className="java-ed-advanced-rows">
      <div><strong>{index < 2 ? '출금 측' : '기존 값'}</strong><span><code>{state[index][1]}</code></span></div>
      <div><strong>{index < 2 ? '입금 측' : '임시 값'}</strong><span><code>{state[index][2]}</code></span></div>
    </div>
    {index >= 2 && <p className="java-ed-advanced-remark">사례 B는 사례 A의 자동 복구가 아닙니다. 검증 성공과 실패는 서로 다른 실행 분기입니다.</p>}
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification">Java 예외는 이전 객체 변경을 자동으로 롤백하지 않습니다. 불변값을 계산하고 검증한 뒤 반영해도 외부 부수효과까지 되돌아가지는 않습니다.</p>
  </section>
}

/** Paris gap and overlap are two different dates, not one continuing clock timeline. */
export function JavaZoneDstEditorial() {
  const [index, setIndex] = useState(0)
  const scenes = javaApiScenes['zone-dst']
  const gap = index < 2
  const outcome = [
    'getValidOffsets() → [] · ofStrict는 거부',
    'atZone() → 2026-03-29 03:30+02:00 · 1시간 gap 보정',
    '+02:00 → Instant 00:30Z · +01:00 → Instant 01:30Z',
    'atZone() 앞선 +02:00 · withLaterOffsetAtOverlap() 나중 +01:00',
  ] as const
  return <section className="java-ed-coordination" aria-label="파리의 봄 gap과 가을 overlap 별도 날짜 비교">
    <h4 className="java-ed-scene-title">{scenes[index].title}</h4>
    <span className="java-editorial-kicker">Europe/Paris · {gap ? '2026-03-29 봄 gap' : '2026-10-25 가을 overlap'} · 별도 예제</span>
    <div className="java-ed-advanced-rows">
      <div><strong>LocalDateTime</strong><span><code>{gap ? '2026-03-29 02:30' : '2026-10-25 02:30'}</code></span></div>
      <div><strong>유효 offset</strong><span>{gap ? '0개 · 존재하지 않는 시각' : '2개 · 두 번 발생하는 시각'}</span></div>
      <div><strong>정책 / 결과</strong><span>{outcome[index]}</span></div>
    </div>
    <EditorialSteps index={index} count={scenes.length} setIndex={setIndex} />
    <EditorialNote description={scenes[index].note} />
    <p className="java-editorial-qualification">atZone은 gap 길이만큼 시간을 앞으로 이동합니다. overlap의 이전·이후는 offset 숫자의 크기와 달리 시간축에서 발생한 순서입니다. Java 25의 2026년 시간대 예제입니다.</p>
  </section>
}
