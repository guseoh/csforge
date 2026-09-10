interface DiagramSpec {
  title: string
  lead: string
  steps?: string[]
  lanes?: { label: string; items: string[] }[]
  note?: string
}

const javaDiagrams: Record<string, DiagramSpec> = {
  'java.core.language-types.pass-by-value': {
    title: '참조형 인자도 참조 값이 복사된다',
    lead: '호출자 변수와 매개변수는 서로 다른 변수이고, 복사된 참조 값이 같은 객체를 가리킬 수 있습니다.',
    steps: ['호출자 변수\nmember', '참조 값 복사', '매개변수\nvalue', '같은 Member 객체'],
    note: 'value를 새 객체로 재대입해도 member의 참조 값은 바뀌지 않습니다.',
  },
  'java.core.object-model.composition-collaboration': {
    title: '상속 대신 협력으로 변경 축을 분리한다',
    lead: '안정된 객체가 교체 가능한 collaborator에게 행동을 위임하면 구현 상속보다 변경 영향을 좁힐 수 있습니다.',
    steps: ['Use case', '협력 계약', 'Strategy / Policy', '구체 구현'],
  },
  'java.core.object-model.immutability-defensive-copy': {
    title: '방어적 복사로 소유권 경계를 끊는다',
    lead: '외부의 mutable 객체를 그대로 보관하거나 반환하면 객체 내부 상태가 우회해서 바뀔 수 있습니다.',
    steps: ['외부 mutable 입력', '입력 시 copy', '객체 내부 상태', '출력 시 불변 view / copy'],
  },
  'java.core.design-patterns.strategy-pattern': {
    title: 'Strategy는 바뀌는 정책을 계약 뒤로 옮긴다',
    lead: 'Context의 흐름은 유지하고 정책 선택만 교체할 수 있도록 variation point를 분리합니다.',
    lanes: [
      { label: 'Context', items: ['공통 흐름', 'Strategy 호출'] },
      { label: 'Strategy', items: ['정책 계약', 'A / B / C 구현'] },
    ],
  },
  'java.core.design-patterns.adapter-pattern': {
    title: 'Adapter는 외부 계약을 애플리케이션 계약으로 변환한다',
    lead: '외부 라이브러리의 인터페이스가 핵심 코드 안으로 퍼지지 않도록 한 방향 경계를 둡니다.',
    steps: ['Application contract', 'Adapter', '외부 library API', '외부 구현'],
  },
  'java.core.design-patterns.decorator-pattern': {
    title: 'Decorator는 같은 계약을 유지한 채 책임을 감싼다',
    lead: '호출 흐름은 동일한 인터페이스를 통과하면서 로깅·검증·캐시 같은 책임을 조합할 수 있습니다.',
    steps: ['Caller', 'Decorator A', 'Decorator B', 'Target'],
  },
  'java.core.design-patterns.proxy-pattern': {
    title: 'Proxy는 target 앞에서 접근을 중개한다',
    lead: '호출자는 같은 계약을 보지만 실제 target 호출 전에 접근 제어·lazy loading·원격 호출 같은 책임이 개입합니다.',
    steps: ['Caller', 'Proxy', '중개 책임', 'Target'],
  },
  'java.core.design-patterns.observer-pattern': {
    title: 'Publisher의 변화가 여러 Subscriber로 전달된다',
    lead: '발행자는 구독자의 구체 동작을 직접 호출하는 대신 등록된 관찰자에게 이벤트를 전달합니다.',
    lanes: [
      { label: 'Publisher', items: ['상태 변화', 'event 발행'] },
      { label: 'Subscribers', items: ['Subscriber A', 'Subscriber B', 'Subscriber C'] },
    ],
    note: '구독 해제와 subscriber lifecycle을 놓치면 불필요한 결합이나 메모리 유지 문제가 생길 수 있습니다.',
  },
  'java.core.design-patterns.state-pattern': {
    title: '현재 State가 행동을 담당하고 다음 State로 전환한다',
    lead: '상태별 분기가 커질 때 Context가 현재 State 객체에 행동을 위임하도록 만들 수 있습니다.',
    steps: ['Context', '현재 State', '상태별 behavior', 'transition', '다음 State'],
  },
  'java.core.collections.arraylist-linkedlist-tradeoffs': {
    title: 'ArrayList와 LinkedList는 접근 경로가 다르다',
    lead: 'Big-O 표만 보지 말고 실제 접근·순회·삽입 경로와 allocation 특성을 함께 비교합니다.',
    lanes: [
      { label: 'ArrayList', items: ['index 기반 접근', '배열 요소 이동', '순회 locality가 유리한 편'] },
      { label: 'LinkedList', items: ['node link 추적', 'node allocation', '중간 node를 이미 알 때 연결 변경'] },
    ],
  },
  'java.core.collections.hashmap-hashing-collision': {
    title: 'HashMap 조회는 hash만 보고 끝나지 않는다',
    lead: 'hash로 bucket 후보를 좁힌 뒤 collision이 있으면 key equality까지 확인해 실제 entry를 찾습니다.',
    steps: ['key.hashCode()', 'hash 보정 / index', 'bucket 후보', 'collision 후보 비교', 'equals 확인', 'value'],
    note: 'key가 Map에 들어간 뒤 hashCode/equals 결과가 바뀌면 다시 찾지 못하는 문제가 생길 수 있습니다.',
  },
  'java.core.collections.priorityqueue': {
    title: 'PriorityQueue는 head의 우선순위를 보장한다',
    lead: 'heap property는 가장 우선순위가 높은 원소를 head에서 꺼내기 위한 구조이지 전체 iteration 정렬을 의미하지 않습니다.',
    steps: ['offer', 'heap property 복구', 'head = 최소/최대 우선순위', 'peek / poll'],
    note: 'iterator로 순회한 결과가 Comparator 순서 전체를 보장하지 않습니다.',
  },
  'java.core.streams.stream-pipeline-laziness': {
    title: 'Stream은 terminal operation에서 실제 순회를 시작한다',
    lead: 'intermediate operation을 연결하는 시점과 source가 실제로 소비되는 시점을 구분해야 합니다.',
    steps: ['Source', 'filter (lazy)', 'map (lazy)', 'limit / short-circuit', 'terminal operation', '실제 traversal'],
  },
  'java.core.time-numeric.instant-local-zoned-time': {
    title: '하나의 Instant도 ZoneId에 따라 다른 현지 시각으로 보인다',
    lead: 'Instant는 timeline의 한 지점이고 LocalDateTime은 zone 정보가 없으며 ZonedDateTime은 zone rule과 함께 해석됩니다.',
    lanes: [
      { label: 'Timeline', items: ['Instant 2026-09-10T03:00Z'] },
      { label: '표현', items: ['Asia/Seoul → 12:00', 'Europe/London → 현지 offset 적용'] },
    ],
  },
  'java.core.time-numeric.zoneid-dst': {
    title: 'DST 전환에서는 local time이 없거나 두 번 나타날 수 있다',
    lead: 'ZoneId는 단순 고정 offset이 아니라 날짜에 따라 적용되는 zone rule을 가집니다.',
    lanes: [
      { label: 'Gap', items: ['01:59', 'clock jump', '03:00', '02시대가 존재하지 않음'] },
      { label: 'Overlap', items: ['01:59', 'clock back', '01시대 반복', '같은 local time이 두 Instant 후보'] },
    ],
  },
  'java.core.io-nio.nio-channel-buffer': {
    title: 'Buffer는 position·limit·capacity 상태로 읽기와 쓰기를 전환한다',
    lead: 'flip은 데이터를 뒤집는 동작이 아니라 write 후 read를 위해 position과 limit을 바꾸는 상태 전환입니다.',
    steps: ['write\nposition 증가', 'flip()', 'limit = 기존 position\nposition = 0', 'read\nposition 증가', 'clear / compact'],
  },
  'java.core.io-nio.blocking-nonblocking-selector': {
    title: 'Selector는 여러 Channel의 readiness를 한 thread에서 관찰한다',
    lead: 'non-blocking channel을 등록한 뒤 준비된 I/O 이벤트만 골라 처리하는 multiplexing 흐름입니다.',
    lanes: [
      { label: 'Channels', items: ['Channel A', 'Channel B', 'Channel C'] },
      { label: 'Selector loop', items: ['register', 'select', 'ready keys', 'handler'] },
    ],
  },
  'java.core.concurrency.atomic-variables-cas': {
    title: 'CAS는 expected와 current가 같을 때만 갱신한다',
    lead: '경쟁 중 다른 thread가 값을 먼저 바꾸면 CAS는 실패하고 새 current를 읽어 retry할 수 있습니다.',
    steps: ['current 읽기', 'expected와 비교', '같음 → update 성공', '다름 → 실패', '새 값 읽고 retry'],
    note: '단일 atomic variable의 원자성만으로 여러 필드에 걸친 복합 invariant가 자동 보호되지는 않습니다.',
  },
  'java.core.concurrency.executor-task-thread-pools': {
    title: 'Executor는 task 제출과 worker lifecycle을 분리한다',
    lead: 'task는 queue에 들어가고 pool의 worker가 소비합니다. queue와 worker 수가 함께 resource limit를 만듭니다.',
    steps: ['submit(task)', 'work queue', 'worker 선택', 'task 실행', 'Future / completion'],
  },
  'java.core.concurrency.blockingqueue-producer-consumer': {
    title: 'Bounded BlockingQueue가 생산자와 소비자의 속도 차이를 흡수한다',
    lead: 'queue가 가득 차면 producer가, 비어 있으면 consumer가 기다리면서 handoff와 backpressure 경계를 만듭니다.',
    steps: ['Producer', 'put()', 'bounded queue', 'take()', 'Consumer'],
    note: 'capacity를 무한대로 생각하면 처리 속도 차이가 메모리 증가로 전환될 수 있습니다.',
  },
  'java.core.concurrency.threadlocal-context': {
    title: 'ThreadLocal 값은 thread lifecycle과 함께 생각해야 한다',
    lead: 'pool worker는 여러 요청에서 재사용되므로 이전 요청의 context를 remove하지 않으면 다음 작업에 남을 수 있습니다.',
    steps: ['요청 A', 'pooled worker', 'ThreadLocal set', '작업', 'remove()', '같은 worker의 요청 B'],
  },
  'java.core.concurrency.future-completablefuture': {
    title: 'CompletableFuture는 완료 결과와 다음 stage를 연결한다',
    lead: '정상 completion과 exceptional completion이 서로 다른 후속 경로로 전파되는 흐름을 따라가야 합니다.',
    lanes: [
      { label: '정상 경로', items: ['source 완료', 'thenApply', 'thenCompose', 'result'] },
      { label: '실패 경로', items: ['exceptional completion', 'handle / exceptionally', '복구 또는 실패 전파'] },
    ],
  },
  'java.core.concurrency.deadlock-starvation-livelock': {
    title: '세 가지 liveness 문제는 “진전하지 못하는 이유”가 다르다',
    lead: '모두 작업이 끝나지 않을 수 있지만 원인과 관찰해야 할 상태가 다릅니다.',
    lanes: [
      { label: 'Deadlock', items: ['T1: L1 보유 → L2 대기', 'T2: L2 보유 → L1 대기', '순환 wait'] },
      { label: 'Starvation', items: ['실행 기회가 지속적으로 부족', '다른 작업이 resource 선점'] },
      { label: 'Livelock', items: ['서로 반응하며 상태는 변함', '실제 목표에는 진전 없음'] },
    ],
  },
  'java.core.jvm-runtime.jdk-jvm-classfile': {
    title: '소스 코드가 JVM에서 실행되기까지의 경계',
    lead: 'javac이 만든 class file의 bytecode와 CPU가 실행하는 native instruction을 같은 것으로 보면 안 됩니다.',
    steps: ['.java source', 'javac (JDK)', '.class / bytecode', 'JVM load·verify', 'Interpreter / JIT', 'CPU 실행'],
  },
  'java.core.jvm-runtime.class-loading-linking-initialization': {
    title: 'Class lifecycle은 loading과 initialization 하나로 뭉개지지 않는다',
    lead: 'JVMS의 loading·linking·initialization 경계를 따라가면 static field가 언제 어떤 값을 가지는지 더 정확히 설명할 수 있습니다.',
    steps: ['Loading', 'Verification', 'Preparation', 'Resolution', 'Initialization'],
    note: 'Preparation의 기본값 설정과 Java 코드의 static initializer 실행을 구분합니다.',
  },
  'java.core.jvm-runtime.classloader-delegation-type-identity': {
    title: 'runtime type identity에는 defining ClassLoader도 포함된다',
    lead: 'binary name이 같아도 서로 다른 ClassLoader가 정의한 class는 JVM에서 같은 runtime type이 아닐 수 있습니다.',
    lanes: [
      { label: 'Loader A', items: ['com.example.Foo', 'runtime type A'] },
      { label: 'Loader B', items: ['com.example.Foo', 'runtime type B'] },
    ],
  },
  'java.core.jvm-runtime.jvm-runtime-data-areas-frames': {
    title: 'JVM의 abstract runtime data area와 method frame',
    lead: 'JVMS가 정의하는 논리적 영역과 HotSpot의 구체적인 물리 메모리 배치를 동일시하지 않습니다.',
    lanes: [
      { label: '공유', items: ['Heap', 'Method Area', 'Runtime Constant Pool'] },
      { label: 'Thread별', items: ['PC register', 'JVM Stack', 'Frame → local variables + operand stack'] },
    ],
  },
  'java.core.jvm-runtime.gc-reachability-roots': {
    title: 'GC 대상 여부는 scope가 아니라 reachability로 판단한다',
    lead: 'GC root에서 참조 그래프를 따라 도달할 수 있는 객체는 아직 reachable합니다.',
    steps: ['GC Roots', 'reachable object A', 'reachable object B', '참조 끊김', 'unreachable graph', 'GC 후보'],
  },
  'java.core.jvm-runtime.java-memory-leaks': {
    title: 'GC가 있어도 필요 없는 객체가 reachable하면 leak이 된다',
    lead: 'cache·listener·ThreadLocal 같은 장수명 참조가 더 이상 필요 없는 object graph를 붙잡을 수 있습니다.',
    steps: ['GC Root', '장수명 cache / listener / thread', 'stale reference', '불필요한 object graph', '계속 reachable'],
  },
  'java.core.jvm-runtime.heap-metaspace-native-thread-memory': {
    title: 'Java process memory는 heap 하나가 아니다',
    lead: 'RSS 증가나 OOM을 볼 때 heap만 확인하면 metaspace·thread stack·native allocation 같은 원인을 놓칠 수 있습니다.',
    lanes: [
      { label: 'JVM / process', items: ['Java Heap', 'Metaspace', 'Code Cache'] },
      { label: 'Native / thread', items: ['Thread stacks', 'Direct / native allocation', 'JVM native structures'] },
    ],
  },
  'java.core.metadata-compatibility.dynamic-proxy-invocationhandler': {
    title: 'JDK Dynamic Proxy의 호출 중계 흐름',
    lead: 'interface 호출은 생성된 proxy를 거쳐 InvocationHandler로 전달되고, handler가 실제 target 호출 여부와 전후 처리를 결정합니다.',
    steps: ['Caller', 'Interface method', 'Proxy instance', 'InvocationHandler.invoke', 'Target / cross-cutting behavior'],
  },
}

export function LearningDiagram({ contentKey }: { contentKey: string }) {
  const diagram = javaDiagrams[contentKey]
  if (!diagram) return null

  return (
    <section className="concept-diagram" aria-label={`${diagram.title} 도식`}>
      <div className="diagram-heading">
        <span>도식으로 보기</span>
        <strong>{diagram.title}</strong>
        <p>{diagram.lead}</p>
      </div>

      {diagram.steps && (
        <div className="diagram-flow" role="img" aria-label={diagram.steps.join('에서 ')}>
          {diagram.steps.map((step, index) => (
            <div className="diagram-flow-part" key={`${step}-${index}`}>
              <div className="diagram-node">{step.split('\n').map((line) => <span key={line}>{line}</span>)}</div>
              {index < diagram.steps!.length - 1 && <span className="diagram-arrow" aria-hidden="true">→</span>}
            </div>
          ))}
        </div>
      )}

      {diagram.lanes && (
        <div className="diagram-lanes">
          {diagram.lanes.map((lane) => (
            <div className="diagram-lane" key={lane.label}>
              <strong>{lane.label}</strong>
              <div>
                {lane.items.map((item, index) => (
                  <div className="diagram-flow-part" key={`${item}-${index}`}>
                    <span className="diagram-node">{item}</span>
                    {index < lane.items.length - 1 && <span className="diagram-arrow" aria-hidden="true">→</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {diagram.note && <p className="diagram-note">{diagram.note}</p>}
    </section>
  )
}
