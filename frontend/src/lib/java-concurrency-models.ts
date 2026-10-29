import type { RelationNode, RelationEdge, RelationScene } from './java-pattern-models'

const node = (id: string, column: number, row: number, ...lines: string[]): RelationNode => ({ id, column, row, lines })
const edge = (from: string, to: string, label: string, dashed = false): RelationEdge => ({ from, to, label, dashed })
const scene = (title: string, nodes: RelationNode[], edges: RelationEdge[], note: string): RelationScene => ({ title, lanes: [], graph: { nodes, edges }, note })

// Fixed possible executions and contract relations, never a scheduler or CPU simulator.
export const javaConcurrencyExamples = ['concurrency-parallelism', 'thread-lifecycle', 'virtual-carrier', 'lost-update', 'monitor', 'happens-before', 'safe-publication', 'volatile-handoff', 'cas-retry', 'condition-await', 'executor-admission', 'bounded-queue', 'latch-gate', 'semaphore-permits', 'threadlocal-reuse', 'scoped-binding', 'future-completion', 'deadlock-progress'] as const
export const javaConcurrencyScenes: Record<typeof javaConcurrencyExamples[number], readonly RelationScene[]> = {
  'concurrency-parallelism': [scene('교대 실행과 동시 실행의 예시', [
    node('a1', 0, 0, '실행 자원 1', '작업 A의 일부'), node('b1', 1, 0, '같은 실행 자원 1', '작업 B의 일부'), node('a2', 2, 0, '같은 실행 자원 1', '작업 A 재개'),
    node('parallelA', 0, 1, '별도 실행 자원 1', '작업 A 진행'), node('parallelB', 1, 1, '별도 실행 자원 2', '같은 구간에 B 진행'),
  ], [edge('a1', 'b1', '교대'), edge('b1', 'a2', '교대')], '위 행은 하나의 실행 자원에서 교대하는 동시성, 아래 행은 두 실행 자원에서 진행하는 병렬성의 교육용 예시입니다. Thread 생성이 실제 CPU 배치를 보장하지 않습니다.')],
  'thread-lifecycle': [
    scene('start 이전', [node('caller', 0, 0, '호출자', 'Thread 객체 생성'), node('worker', 1, 0, 'worker', 'NEW')], [], '같은 Thread 객체의 start는 한 번만 허용됩니다. NEW는 Java 상태이며 OS 스케줄링 상태와 동일하지 않습니다.'),
    scene('start 이후 worker 실행 중', [node('caller', 0, 0, '호출자', 'join()에서 종료 대기'), node('worker', 1, 0, 'worker', '실행 또는 대기 중')], [edge('caller', 'worker', '종료 대기')], 'interrupt는 협력적 신호입니다. worker가 반드시 즉시 종료하거나 RUNNABLE 상태로 바뀌는 것이 아닙니다.'),
    scene('worker 종료를 확인한 join 반환', [node('worker', 0, 0, 'worker', 'TERMINATED'), node('caller', 1, 0, '호출자', 'join() 정상 반환')], [edge('worker', 'caller', '종료 감지 · HB')], '인자 없는 join이 정상 반환해 종료를 감지한 경로입니다. timed join의 timeout 반환에는 같은 종료 보장을 붙이지 않습니다. start를 다시 호출할 수 없습니다.'),
  ],
  'virtual-carrier': [
    scene('한 시점에 carrier 하나에 VT 하나', [node('carrier', 0, 0, '플랫폼 carrier C1'), node('vtA', 1, 0, '가상 스레드 A', 'mounted'), node('vtB', 1, 1, '가상 스레드 B', '실행 대기')], [edge('vtA', 'carrier', 'mount')], 'Java 25의 개념적 한 시점입니다. carrier 개수나 실제 스케줄러 큐 구조를 고정하지 않습니다.'),
    scene('지원되는 blocking I/O에서 A unmount', [node('carrier', 0, 0, 'carrier C1', 'B를 실행 가능'), node('vtA', 1, 1, '가상 스레드 A', 'I/O 대기 · unmounted'), node('vtB', 1, 0, '가상 스레드 B', 'mounted')], [edge('vtB', 'carrier', 'mount')], '지원되는 blocking 작업의 예시입니다. 모든 blocking 작업에서 unmount되는 것은 아니며 native/foreign 호출은 pinning 조건이 될 수 있습니다. Java 25의 synchronized를 과거의 일반 pinning 원인으로 표시하지 않습니다.'),
    scene('A의 I/O 완료 후 다시 mount', [node('carrier', 0, 0, '사용 가능한 carrier', 'C1 또는 다른 carrier'), node('vtA', 1, 0, '가상 스레드 A', '다시 실행'), node('vtB', 1, 1, '가상 스레드 B', '이 snapshot에서는 미실행')], [edge('vtA', 'carrier', 'remount')], '같은 carrier로 복귀한다는 보장은 없습니다. 한 carrier에서 A와 B를 동시에 실행하는 그림이 아닙니다.'),
  ],
  'lost-update': [
    scene('count = 0을 두 작업이 읽음', [node('count', 0, 1, '공유 count', '0'), node('a', 1, 0, 'A의 지역 계산', 'read 0 → 1'), node('b', 1, 2, 'B의 지역 계산', 'read 0 → 1')], [edge('count', 'a', '읽음'), edge('count', 'b', '읽음')], '동기화 없는 count++에서 가능한 실행 하나입니다. 실제 CPU 명령 개수나 유일한 결과를 뜻하지 않습니다.'),
    scene('A가 먼저 1을 씀', [node('a', 0, 0, 'A', '계산 결과 1 기록'), node('count', 1, 0, '공유 count', '1'), node('b', 1, 1, 'B의 지역 결과', '이미 계산한 1')], [edge('a', 'count', '쓰기')], 'A가 쓴 뒤에도 B가 이미 계산한 값은 1입니다. volatile만 붙여도 이 복합 연산이 원자화되지는 않습니다.'),
    scene('B도 1을 써 증가 하나가 사라짐', [node('b', 0, 0, 'B', '계산 결과 1 기록'), node('count', 1, 0, '공유 count', '최종 1')], [edge('b', 'count', '덮어씀')], '두 번의 증가 의도에도 결과가 1인 lost update 경로입니다. 같은 잠금 아래 전체 연산을 수행하거나 원자적 증가 API를 사용해야 합니다.'),
  ],
  monitor: [
    scene('같은 monitor M의 소유와 대기', [node('a', 0, 0, '스레드 A', 'M 소유 · 횟수 1'), node('m', 1, 0, 'monitor M', 'owner A'), node('b', 1, 1, '스레드 B', 'M 진입 대기')], [edge('a', 'm', '소유'), edge('b', 'm', '획득 대기', true)], '실선은 소유, 점선은 획득 대기입니다. 서로 다른 monitor를 잠그는 코드에는 이 상호 배제가 적용되지 않습니다.'),
    scene('A의 재진입과 내부 블록 종료', [node('a', 0, 0, 'A 재진입', '횟수 1 → 2 → 1'), node('m', 1, 0, 'monitor M', '아직 owner A'), node('b', 1, 1, 'B', '계속 진입 대기')], [edge('a', 'm', '소유 유지'), edge('b', 'm', '획득 대기', true)], '재진입한 내부 블록만 나와서는 M 전체를 해제하지 않습니다. 마지막 소유 수준을 벗어나야 다른 스레드가 획득할 수 있습니다.'),
    scene('A 해제 후 B가 획득한 가능한 경로', [node('a', 0, 0, 'A', 'M unlock 완료'), node('b', 1, 0, 'B', 'M lock 성공')], [edge('a', 'b', '같은 M · HB')], 'A의 unlock은 뒤따르는 같은 M의 lock과 동기화합니다. B가 다음 승자라는 공정성 보장은 없으며 예외로 블록을 나와도 해제될 뿐 상태 변경은 롤백되지 않습니다.'),
  ],
  'happens-before': [
    scene('스레드 안의 program order만 있는 상태', [node('write', 0, 0, 'writer', 'data = 42'), node('publish', 1, 0, 'writer', 'volatile ready = true'), node('observe', 1, 1, 'reader', 'ready 읽기 전'), node('read', 0, 1, 'reader', 'data 읽기 전')], [edge('write', 'publish', 'program order')], '스레드 안의 순서만으로 다른 스레드의 임의 읽기까지 연결하지 않습니다. HB는 물리 시간표나 CPU cache flush 그림이 아닙니다.'),
    scene('volatile true를 관찰한 reader의 HB 경로', [node('write', 0, 0, 'writer', 'data = 42'), node('publish', 1, 0, 'writer', 'volatile ready = true'), node('observe', 1, 1, 'reader', 'ready == true 관찰'), node('read', 0, 1, 'reader', 'data == 42')], [edge('write', 'publish', 'program order'), edge('publish', 'observe', 'synchronizes-with'), edge('observe', 'read', 'program order')], '이 handoff 이후 data에 다른 쓰기가 없다는 예제입니다. 전이적 HB가 data 쓰기에서 읽기까지 이어집니다. ready의 초기 false를 읽은 경로에는 이 연결을 적용하지 않습니다.'),
  ],
  'safe-publication': [
    scene('생성 중 this가 외부로 유출된 반례', [node('construct', 0, 0, '생성자 실행 중', 'this 외부 등록'), node('reader', 1, 0, '다른 스레드', '미완성 객체 접근 가능')], [edge('construct', 'reader', '조기 유출')], '생성 완료 전에 유출된 this에는 정상 생성된 객체의 final 필드 초기화 보장을 그대로 적용할 수 없습니다. 특정 잘못된 값이 항상 나온다는 뜻은 아닙니다.'),
    scene('정상 생성 후 volatile 참조 공개', [node('construct', 0, 0, '생성자 정상 완료', 'final 필드 설정 완료'), node('publish', 1, 0, 'volatile 참조 쓰기', '완성된 객체 전달'), node('reader', 1, 1, '같은 참조를 읽은 reader', '초기 상태 관찰')], [edge('construct', 'publish', '완료 후 공개'), edge('publish', 'reader', 'volatile handoff')], 'final 초기화 보장과 volatile 공개 경로를 함께 구분합니다. final 참조가 가리키는 가변 객체의 이후 변경까지 자동으로 동기화되는 것은 아닙니다.'),
  ],
  'volatile-handoff': [
    scene('data를 먼저 쓰고 ready로 공개', [node('data', 0, 0, 'writer', 'data = 42'), node('ready', 1, 0, 'writer', 'volatile ready = true')], [edge('data', 'ready', 'program order')], 'volatile은 해당 변수의 읽기·쓰기와 공개 순서에 의미가 있습니다. ready를 먼저 쓰고 data를 나중에 쓰는 반대 순서에는 같은 결론을 붙이지 않습니다.'),
    scene('ready 관찰 후 앞선 data 읽기', [node('ready', 0, 0, 'reader', 'ready == true 관찰'), node('data', 1, 0, 'reader', 'data == 42')], [edge('ready', 'data', '읽기 순서')], '해당 handoff와 다른 data 쓰기가 없는 전제입니다. volatile count++는 읽기·계산·쓰기 전체를 원자화하지 않으므로 lost update 반례는 여전히 가능합니다.'),
  ],
  'cas-retry': [
    scene('두 작업이 같은 expected = 0을 준비', [node('value', 0, 1, 'AtomicInteger', 'current = 0'), node('a', 1, 0, 'A', 'expected 0 · update 1'), node('b', 1, 2, 'B', 'expected 0 · update 1')], [edge('value', 'a', '읽기'), edge('value', 'b', '읽기')], '강한 compareAndSet의 예제입니다. CAS를 썼다는 사실만으로 알고리즘 전체의 lock-free 또는 wait-free 진행성을 선언하지 않습니다.'),
    scene('A 성공 뒤 B의 낡은 expected는 실패', [node('value', 0, 0, 'AtomicInteger', 'current = 1'), node('a', 1, 0, 'A CAS(0, 1)', 'true'), node('b', 1, 1, 'B CAS(0, 1)', 'false · 변경 없음')], [edge('b', 'value', '비교 불일치', true)], '현재 값 1과 expected 0이 달라 B는 갱신하지 않습니다. 실패를 성공으로 처리하면 증가가 빠질 수 있습니다.'),
    scene('B가 최신 값으로 다시 계산해 성공', [node('b', 0, 0, 'B CAS(1, 2)', 'true'), node('value', 1, 0, 'AtomicInteger', 'current = 2')], [edge('b', 'value', '성공 갱신')], '실패 뒤 다시 읽고 계산한 경로입니다. update 함수는 재적용될 수 있어 부수 효과를 넣지 않습니다. 값이 A→B→A로 돌아오는 ABA는 값 비교만으로 이력을 알아내지 못합니다.'),
  ],
  'condition-await': [
    scene('소비자가 lock 아래 조건을 검사', [node('consumer', 0, 0, 'consumer', 'while (queue.isEmpty())'), node('lock', 1, 0, 'ReentrantLock', 'owner consumer'), node('queue', 1, 1, 'queue', 'empty')], [edge('consumer', 'lock', '소유')], '조건 검사와 await를 같은 lock의 보호 범위에서 수행합니다. 아래는 소비자가 비어 있는 큐를 기다리는 예제입니다.'),
    scene('await가 lock을 놓고 대기', [node('consumer', 0, 1, 'consumer', 'Condition 대기'), node('producer', 0, 0, 'producer', 'lock 획득 · 원소 추가'), node('lock', 1, 0, 'ReentrantLock', 'owner producer')], [edge('producer', 'lock', '소유')], 'await는 연결된 lock을 해제합니다. producer는 같은 lock 아래 상태를 바꾸고 signal하며, signal 자체가 lock을 넘기거나 원소를 예약하지 않습니다.'),
    scene('signal 뒤 lock 재획득과 while 재검사', [node('consumer', 0, 0, 'consumer', 'lock 재획득 후 while'), node('queue', 1, 0, 'queue', '현재 조건 다시 확인')], [edge('consumer', 'queue', '재검사')], '다른 소비자가 먼저 꺼냈거나 spurious wakeup일 수 있어 조건을 다시 검사합니다. await는 정상 반환 전 lock을 재획득하며 signal 직후 즉시 실행을 보장하지 않습니다.'),
  ],
  'executor-admission': [
    scene('core 미만이면 worker 생성 시도', [node('task', 0, 0, '새 작업'), node('workers', 1, 0, 'worker 수 < core', '새 worker 생성')], [edge('task', 'workers', '첫 선택')], 'ThreadPoolExecutor의 일반 작업 수용 순서입니다. 각 단계는 worker 생성이나 종료 상태와 경합할 수 있어 성공 여부를 처리합니다.'),
    scene('core 이상이면 큐 수용 시도', [node('task', 0, 0, '새 작업'), node('queue', 1, 0, '작업 큐', 'offer 성공이면 대기')], [edge('task', 'queue', '큐 수용')], '무제한 큐가 계속 수용하면 보통 max까지 worker가 늘지 않습니다. 큐 수용은 업무 완료를 뜻하지 않으며 shutdown 경합도 검사됩니다.'),
    scene('큐가 가득 차면 max까지 확장 시도', [node('queue', 0, 0, 'bounded queue', '수용 실패 · full'), node('workers', 1, 0, 'worker 수 < max', '추가 worker 생성 시도')], [edge('queue', 'workers', '확장 조건')], '큐가 수용하지 못했을 때만 max 확장을 시도하는 경로입니다. max만 높여도 무제한 큐의 backlog를 해결하지 못합니다.'),
    scene('확장 불가 또는 종료 상태의 거부', [node('task', 0, 0, '수용되지 않은 작업'), node('reject', 1, 0, '거부 정책', 'Abort / CallerRuns 등')], [edge('task', 'reject', 'reject')], '포화나 종료 상태에서는 거부 정책이 적용됩니다. CallerRunsPolicy도 종료된 executor에서는 작업을 버리므로 submit으로 받은 Future가 미완료로 남을 수 있습니다.'),
  ],
  'bounded-queue': [
    scene('용량 1의 빈 큐에서 take 대기', [node('producer', 0, 0, 'producer', '전달 준비'), node('queue', 1, 0, 'capacity = 1', '[]'), node('consumer', 1, 1, 'consumer', 'take() 대기')], [edge('consumer', 'queue', '원소 대기', true)], 'timeout 인자 없는 BlockingQueue의 take 예제입니다. poll은 즉시 null을 반환할 수 있는 다른 계약입니다.'),
    scene('put(A) 수용 후 큐가 가득 참', [node('producer', 0, 0, 'producer', '다음 put(B)는 대기 가능'), node('queue', 1, 0, 'capacity = 1', '[A]'), node('consumer', 1, 1, 'consumer', 'take 진행 가능')], [edge('producer', 'queue', '공간 대기', true)], '큐 수용과 소비 완료는 다릅니다. A를 전달하기 전 작업은 A를 꺼내는 소비자의 후속 작업과 HB로 연결되지만, 전달 이후의 A 변경까지 자동 보호하지 않습니다.'),
    scene('consumer가 A를 꺼내 공간을 만듦', [node('producer', 0, 0, 'producer', 'put(B) 진행 가능'), node('queue', 1, 0, 'capacity = 1', '[]'), node('consumer', 1, 1, 'consumer', 'A 수신 · 업무 처리 전')], [edge('queue', 'consumer', 'take(A) 완료')], '꺼냈다는 사실은 외부 업무 성공이나 영속 저장을 보장하지 않습니다. 어떤 대기자가 다음에 진행하는지도 큐와 정책에 따라 달라집니다.'),
  ],
  'latch-gate': [
    scene('count = 3: await 대기', [node('workers', 0, 0, '완료 신호 3개 예정'), node('latch', 1, 0, 'CountDownLatch', 'count = 3'), node('waiter', 1, 1, 'waiter', 'await() 대기')], [edge('waiter', 'latch', '0을 기다림', true)], '완료 신호를 세는 일회용 gate입니다. 작업의 성공·실패나 실제 동시 실행 여부를 집계하는 값은 아닙니다.'),
    scene('countDown으로 3 → 2 → 1', [node('workers', 0, 0, '두 작업이 신호'), node('latch', 1, 0, 'CountDownLatch', 'count = 1'), node('waiter', 1, 1, 'waiter', '계속 대기')], [edge('workers', 'latch', 'countDown 2회')], '각 작업의 finally 신호로 실패 시에도 대기를 풀 수 있습니다. 제출 자체가 거부된 작업은 finally까지 도달하지 않으므로 별도 처리가 필요합니다.'),
    scene('마지막 신호로 count = 0', [node('workers', 0, 0, '마지막 countDown'), node('latch', 1, 0, 'CountDownLatch', 'count = 0'), node('waiter', 1, 1, 'waiter', 'await 정상 반환 가능')], [edge('workers', 'latch', '마지막 신호'), edge('latch', 'waiter', 'gate 열림')], 'countDown 전 작업은 성공적으로 await를 통과한 스레드의 후속 작업과 HB로 연결됩니다. 다시 await할 수 있지만 초기 count로 reset할 수는 없습니다.'),
  ],
  'semaphore-permits': [
    scene('permit = 3인 시작 상태', [node('semaphore', 0, 0, 'Semaphore(3)', 'available = 3'), node('tasks', 1, 0, '작업들', '성공한 acquire 필요')], [], 'permit은 동시 진입 예산이며 실제 DB 연결을 생성하지 않습니다. Semaphore는 monitor 같은 소유자 개념을 강제하지 않습니다.'),
    scene('세 acquire 성공 후 다음 작업 대기', [node('semaphore', 0, 0, 'Semaphore', 'available = 0'), node('active', 1, 0, '세 작업', '각각 진입 중'), node('waiter', 0, 1, '다음 작업', 'acquire() 대기')], [edge('waiter', 'semaphore', 'permit 대기', true)], 'timeout 없는 acquire 예제입니다. interrupt로 획득에 실패한 작업이 finally에서 무조건 release하면 permit을 부풀릴 수 있습니다.'),
    scene('완료한 작업이 release', [node('done', 0, 0, '작업 하나 종료', '성공한 acquire에 대응'), node('semaphore', 1, 0, 'Semaphore', '0 → 1'), node('waiter', 1, 1, '대기 작업', '획득 가능 → 다시 0')], [edge('done', 'semaphore', 'release'), edge('semaphore', 'waiter', '후속 acquire')], 'release에 대응하는 acquire의 메모리 일관성 효과와 permit 수를 구분합니다. 다른 스레드도 release할 수 있으므로 잘못된 추가 release를 API가 소유권 오류로 막아주지 않습니다.'),
  ],
  'threadlocal-reuse': [
    scene('요청 A가 재사용 worker에 문맥 설정', [node('worker', 0, 0, '풀의 worker W', '같은 스레드 재사용'), node('slot', 1, 0, 'W의 ThreadLocal 슬롯', 'context A')], [edge('worker', 'slot', '스레드별 값')], 'ThreadLocal은 스레드별 슬롯입니다. 서로 다른 스레드의 슬롯이 같은 가변 객체를 가리키면 그 객체까지 격리되는 것은 아닙니다.'),
    scene('remove 누락 경로의 다음 요청 B', [node('worker', 0, 0, '같은 worker W', '요청 B 시작'), node('slot', 1, 0, '남아 있는 슬롯', '이전 context A')], [edge('worker', 'slot', '오염된 문맥')], '요청 종료가 worker 종료는 아닙니다. 새 요청이 값을 덮어쓰기 전에는 이전 문맥을 읽거나 그 객체 그래프를 계속 보유할 수 있습니다.'),
    scene('대조: finally에서 remove한 경로', [node('worker', 0, 0, '같은 worker W', '요청 B 시작'), node('slot', 1, 0, 'A의 값 제거', 'B는 자체 문맥 설정')], [edge('worker', 'slot', '수명 정리')], '앞선 오염이 자동 복구된 것이 아니라 A가 finally에서 remove한 다른 경로입니다. 임의 executor 작업으로 문맥이 자동 전파된다는 뜻도 아닙니다.'),
  ],
  'scoped-binding': [
    scene('바깥 바인딩', [node('outer', 0, 0, 'ScopedValue 바인딩', 'REQUEST_ID = outer'), node('read', 1, 0, '동적 범위 안의 읽기', 'outer')], [edge('outer', 'read', '바인딩 조회')], 'ScopedValue는 Java 25 정식 API입니다. 바인딩은 동적 범위에 묶이고 값 참조를 재설정하는 set 메서드는 없습니다.'),
    scene('안쪽 재바인딩의 별도 범위', [node('outer', 0, 0, '바깥 범위', 'outer 보존'), node('inner', 1, 0, '안쪽 범위', 'REQUEST_ID = inner')], [edge('outer', 'inner', '중첩 바인딩')], '안쪽에서는 inner를 읽습니다. 기존 바깥 바인딩 객체를 변이한 것이 아니며 가리키는 값 객체의 깊은 불변성을 보장하지 않습니다.'),
    scene('안쪽 종료 뒤 바깥 값 복원', [node('outer', 0, 0, '바깥 범위에서 읽기', '다시 outer'), node('child', 1, 0, '구조적 child task', '캡처된 바인딩 사용')], [edge('outer', 'child', '구조적 상속')], '바인딩 안에서 연 StructuredTaskScope의 fork로 전달하는 예시입니다. StructuredTaskScope는 Java 25 preview이며 --enable-preview가 필요합니다. 임의 Executor 상속과 혼동하지 않습니다. 바깥 범위까지 끝나면 바인딩은 해제됩니다.'),
  ],
  'future-completion': [
    scene('아직 미완료인 CompletableFuture', [node('future', 0, 0, 'CompletableFuture<T>', '미완료'), node('next', 1, 0, '의존 단계', '아직 결과 없음')], [edge('future', 'next', '완료 의존')], 'Future는 결과의 완료 상태를 표현합니다. 의존 단계 등록만으로 특정 스레드나 pool에서 실행한다고 고정하지 않습니다.'),
    scene('정상 완료의 변환과 결합', [node('future', 0, 1, '정상 완료 T'), node('apply', 1, 0, 'thenApply', 'T → U'), node('compose', 1, 1, 'thenCompose', 'T → Stage<U> 펼침'), node('combine', 1, 2, 'thenCombine', '다른 결과와 결합')], [edge('future', 'apply', '값 변환'), edge('future', 'compose', '단계 연결'), edge('future', 'combine', '두 결과 의존')], '세 가지 후속 연산의 대조입니다. combine은 다른 정상 결과도 필요하며 thenApply가 반환한 Stage를 자동으로 펼치지는 않습니다.'),
    scene('예외 완료 또는 취소의 별도 경로', [node('future', 0, 0, '예외 완료 / 취소'), node('next', 1, 0, '정상 변환 함수', '실행되지 않음'), node('recovery', 0, 1, 'handle / exceptionally', '정한 정책으로 관찰·복구')], [edge('future', 'recovery', '실패 경로')], 'CompletableFuture.cancel(true)는 실행 스레드를 인터럽트하지 않습니다. 외부 업무 취소도 별도 계약입니다. allOf는 첫 실패 즉시 끝나는 것이 아니라 모든 입력 완료를 기다립니다.'),
  ],
  'deadlock-progress': [
    scene('같은 시점의 소유와 순환 대기', [node('a', 0, 0, '스레드 A', 'X 소유 · Y 대기'), node('y', 1, 0, '잠금 Y', 'owner B'), node('b', 1, 1, '스레드 B', 'Y 소유 · X 대기'), node('x', 0, 1, '잠금 X', 'owner A')], [edge('a', 'y', '대기', true), edge('y', 'b', '소유자'), edge('b', 'x', '대기', true), edge('x', 'a', '소유자')], '점선은 획득 대기, 실선은 자원에서 소유자로 향합니다. 두 스레드가 서로의 잠금 해제를 기다리는 고정 deadlock입니다. 단순한 느린 I/O와 구분합니다.'),
    scene('별도 현상: 기아', [node('others', 0, 0, '다른 작업들', '계속 진입 · 전체 진행'), node('victim', 1, 0, '특정 작업', '오래 진입하지 못함')], [], '순환 잠금 대기 없이 특정 작업이 자원을 얻지 못하는 starvation 예시입니다. 전체 시스템은 진행할 수 있어 deadlock과 다릅니다.'),
    scene('별도 현상: 반복 양보', [node('a', 0, 0, 'A가 B를 보고 양보', '다시 시도'), node('b', 1, 0, 'B도 A를 보고 양보', '다시 시도')], [edge('a', 'b', '양보'), edge('b', 'a', '양보')], '두 작업이 동작을 반복하지만 유효한 작업은 끝내지 못하는 livelock 예시입니다. 모든 재시도나 양보가 livelock이라는 뜻은 아닙니다.'),
  ],
}
