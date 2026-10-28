// Fixed teaching examples: neither arbitrary Java execution nor JDK memory layouts.
export const javaApiExamples = ['hash-contract', 'comparator', 'invariance', 'pecs', 'heap-pollution', 'map-views', 'list-layout', 'hash-lookup', 'deque', 'iterator', 'view-copy', 'buffer', 'selector'] as const
export type JavaApiExample = typeof javaApiExamples[number]
type Scene = { readonly title: string; readonly lanes: readonly (readonly [string, string])[]; readonly note: string; readonly cells?: readonly string[]; readonly position?: number; readonly limit?: number }
export const javaApiScenes: Record<JavaApiExample, readonly Scene[]> = {
  'hash-contract': [{ title: '후보와 동등성은 다른 판정입니다', lanes: [['같은 값', 'equals = true  ⇒  같은 hashCode'], ['충돌 가능', '같은 hashCode  ⇏  equals = true'], ['조회', '해시로 후보를 좁힌 뒤 키 동등성을 확인']], note: '해시는 유일 ID도 물리 주소도 아닙니다. equals 호출 횟수는 보장하지 않습니다.' }],
  comparator: [{ title: '금액 우선, 동률이면 ID', lanes: [['① amount 비교', '음수·양수이면 여기서 결과 확정'], ['② 금액 비교 결과 = 0', '이 경우에만 id 비교 결과 사용'], ['방향', '전체 reversed()는 id 순서도 뒤집음']], note: '두 기준 모두 같으면 결과는 0입니다. thenComparing이 고유성을 자동 보장하지 않습니다.' }],
  invariance: [{ title: '허용되지 않는 대입의 반례', lanes: [['실제 규칙', 'List<String> → List<Object> 대입 거부'], ['가정만', '같은 리스트를 List<Object>로 허용한다면'], ['모순', 'Integer 쓰기가 String 읽기 계약을 깨뜨림']], note: '아래 두 줄은 허용된 실행 경로가 아니라 대입을 막는 이유입니다.' }],
  pecs: [{ title: '원본에서 읽어 대상에 쓰기', lanes: [['SOURCE · ? extends T', '원소를 T로 읽음'], ['값의 이동 · T', 'destination.add(value)'], ['DESTINATION · ? super T', 'T를 추가, 읽기 결과는 Object']], note: 'extends는 불변 뷰라는 뜻이 아닙니다. null 추가·clear 등의 지원 여부는 별도 계약입니다.' }],
  'heap-pollution': [
    { title: 'List<String>... lists', lanes: [['배열 타입', '호출 시 생성된 배열의 실제 타입은 List[]'], ['원소 0', 'List<String> = [java]']], note: '이 예제는 unsafe(List.of("java")) 호출을 추적합니다.' },
    { title: 'Object[] array = lists', lanes: [['lists / array', '같은 List[] 배열을 가리키는 두 별칭'], ['원소 0', 'List<String> = [java]']], note: '새 배열을 만든 것이 아닙니다.' },
    { title: 'array[0] = List.of(42)', lanes: [['배열 저장 검사', 'List<Integer>도 List이므로 통과'], ['원소 0', '실제로는 List<Integer> = [42]']], note: '배열의 검사만으로 제네릭 타입 인자까지 검증하지 못합니다.' },
    { title: 'String value = lists[0].getFirst()', lanes: [['실제 반환', 'Integer 42'], ['String 변환', 'ClassCastException']], note: '저장 시점과 후속 읽기 변환의 실패 시점을 구분합니다. @SafeVarargs는 런타임 검사가 아닙니다.' },
  ],
  'map-views': [{ title: '세 뷰가 공유하는 매핑', lanes: [['Map', 'A ↦ 1, B ↦ 2'], ['keySet / values / entrySet', '별도 스냅샷이 아닌 같은 매핑의 관점'], ['keys.remove("A")', 'Map에서도 A ↦ 1 제거, B ↦ 2만 남음']], note: '뷰는 제거를 지원할 수 있지만 add/put 권한까지 같은 것은 아닙니다.' }],
  'list-layout': [{ title: '인덱스 접근과 위치 탐색의 차이', lanes: [['ArrayList · 참조 슬롯', '[0:A] [1:B] [2:C] [3:D]'], ['중간 삽입', 'X를 index 2에 넣으면 C·D 참조를 이동'], ['LinkedList · 연결', 'A ⇄ B ⇄ C : 먼저 위치 탐색, 그 뒤 연결 변경']], note: 'ArrayList 원소 객체의 연속 배치를 보장하지 않습니다. LinkedList.add(index, value) 전체가 O(1)은 아닙니다.' }],
  'hash-lookup': [
    { title: 'map.get("BB")', lanes: [['저장된 매핑', 'Aa ↦ 1, BB ↦ 2'], ['해시', '"Aa"와 "BB"의 hashCode는 모두 2112']], note: '후보 둘의 배치는 교육용입니다. 실제 bucket 번호·노드 순서는 API 계약이 아닙니다.' },
    { title: '해시로 후보를 좁힙니다', lanes: [['후보 Aa', '같은 해시지만 "BB"와 동등하지 않음'], ['후보 BB', '키 동등성 일치']], note: '충돌 자체가 매핑 교체를 뜻하지 않습니다. 실제 equals 호출 순서·횟수는 고정하지 않습니다.' },
    { title: '키가 아니라 값을 반환합니다', lanes: [['get("BB")', 'Integer 2 반환'], ['없는 키 get("CC")', '이 Map에서는 null 반환']], note: 'get은 교체하지 않습니다. null 값도 허용되므로 일반적으로 부재 구분에는 containsKey를 함께 봅니다.' },
  ],
  deque: [{ title: '양끝의 연산 이름을 구분합니다', lanes: [['앞 · FIRST', 'push = addFirst / pop = removeFirst'], ['논리적 순서', 'A   B   C'], ['뒤 · LAST', 'offerLast로 추가, pollFirst로 FIFO 제거']], note: 'Queue 전체가 FIFO인 것은 아닙니다. ArrayDeque는 null을 거부하며 스레드 안전하지 않습니다.' }],
  iterator: [{ title: 'remove를 지원하는 반복자의 유효 순서', lanes: [['next() 이전', 'remove() → IllegalStateException'], ['next() 한 번 후', '지원된다면 직전 반환 원소를 remove()'], ['remove() 직후', '다시 next() 없이 remove()할 수 없음']], note: 'remove는 optional 연산입니다. fail-fast 검출은 best-effort이며 동시성 제어를 대신하지 않습니다.' }],
  'view-copy': [{ title: '구조 연결과 원소 공유는 별개입니다', lanes: [['source', '가변 List: M'], ['unmodifiableList(source)', 'source.add(N)이 보임 / 뷰를 통한 add는 거부'], ['List.copyOf(source)', '이후 source.add(N)은 반영 안 됨 / M 자체는 공유']], note: 'copyOf는 깊은 복사가 아니며 항상 새 인스턴스를 할당하는 것도 아닙니다.' }],
  buffer: [
    { title: 'allocate(8)', lanes: [], cells: ['0','0','0','0','0','0','0','0'], position: 0, limit: 8, note: 'capacity는 계속 8입니다. 실제 바이트와 접근 범위를 분리합니다.' },
    { title: '5바이트 쓰기: ABCDE', lanes: [], cells: ['A','B','C','D','E','0','0','0'], position: 5, limit: 8, note: 'channel.read가 5를 반환한 경우를 가정합니다. 다음 쓰기 위치는 5입니다.' },
    { title: 'flip()', lanes: [], cells: ['A','B','C','D','E','0','0','0'], position: 0, limit: 5, note: '내용은 그대로, 기존 position 5가 새 limit이 됩니다.' },
    { title: '상대 읽기로 ABC 소비', lanes: [], cells: ['A','B','C','D','E','0','0','0'], position: 3, limit: 5, note: '미소비 데이터는 index 3·4의 D·E입니다.' },
    { title: 'compact()', lanes: [], cells: ['D','E','?','?','?','?','?','?'], position: 2, limit: 8, note: 'D·E를 앞에 옮깁니다. 뒤쪽 ?는 값이 정해지지 않은 영역입니다. 0으로 지우는 연산이 아니며 새 입력으로 덮어쓸 수 있습니다.' },
    { title: 'clear()', lanes: [], cells: ['D','E','?','?','?','?','?','?'], position: 0, limit: 8, note: '바이트를 지우지 않습니다. 미소비 데이터 보호 없이 전체 범위를 다시 쓰도록 허용합니다.' },
  ],
  selector: [
    { title: '논블로킹 채널 A 등록', lanes: [['등록 key / interestOps', 'A / READ'], ['selected-key set', '∅'], ['readyOps', '아직 관찰 전']], note: 'key 집합과 선택된 key 집합은 별개입니다.' },
    { title: 'select()가 A의 READ 준비 감지', lanes: [['등록 key / interestOps', 'A / READ'], ['selected-key set', '{A}'], ['A.readyOps()', 'READ']], note: '준비는 메시지 하나의 완성이나 다음 read의 성공량을 보장하지 않습니다.' },
    { title: '부분 read 후에도 key는 남습니다', lanes: [['등록 key / interestOps', 'A / READ'], ['selected-key set', '{A} · 자동 제거되지 않음'], ['A.readyOps()', '직전 선택에서 관찰한 READ']], note: 'read 결과는 양수·0·EOF(-1)·예외를 처리합니다. READ는 EOF나 오류 상황에도 보고될 수 있습니다.' },
    { title: '새 준비가 없는 selectNow()', lanes: [['등록 key / interestOps', 'A / READ'], ['selected-key set', '{A} · 여전히 남음'], ['갱신된 키 수', '0일 수 있음']], note: '기존 선택 키의 ready bits는 새 감지 비트와 합쳐집니다. 선택된 집합은 현재 readiness의 순수 목록이 아닙니다.' },
    { title: 'iterator.remove()', lanes: [['등록 key / interestOps', 'A / READ · 등록 유지'], ['selected-key set', '∅'], ['다음 선택', '이후 다시 준비되면 A가 추가될 수 있음']], note: '선택 집합에서 제거해도 등록을 취소하거나 readyOps를 즉시 0으로 만드는 것은 아닙니다.' },
    { title: 'cancel() 뒤 다음 선택', lanes: [['key validity', 'cancel 즉시 invalid'], ['다음 selection', '취소 키를 등록·선택 집합에서 제거'], ['처리 전 검사', 'isValid() 확인, 채널 오류와 취소 처리']], note: '단일 스레드의 전통적인 selectedKeys loop 예제입니다. Consumer overload의 전달 방식과 섞지 않습니다.' },
  ],
}
