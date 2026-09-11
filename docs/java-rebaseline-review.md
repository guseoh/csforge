# Java 학습 노트 rebaseline 전수 판정

PR #50의 Java 18개 Topic / 145개 Concept을 현재 branch 기준으로 전수 검토한 ledger이다. `KEEP`은 불필요한 재작성을 하지 않은 판정이며, 나머지는 이번 변경에서 제목·구조·설명·자료·문제 연결을 실제로 확인한 범위를 기록한다.

| 판정 | 개수 | 이번 기준 |
| --- | ---: | --- |
| KEEP | 60 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| RESTRUCTURE | 35 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| ENRICH | 47 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| REWRITE | 3 | PR 기준선에서 전면 재작성하고, 변수→값 복사→상태 변화 흐름을 Java 언어 보장으로 다시 고정했다. |

| Topic | Concept | 판정 | Question | 검토 결과 |
| --- | --- | --- | ---: | --- |
| language-types | final과 불변 객체는 같은 말이 아니다 | KEEP | 5 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| language-types | Arrays, covariance와 runtime store check | KEEP | 5 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| language-types | 숫자 변환과 overflow | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| language-types | Java는 항상 값을 전달한다 | REWRITE | 6 | PR 기준선에서 전면 재작성하고, 변수→값 복사→상태 변화 흐름을 Java 언어 보장으로 다시 고정했다. |
| language-types | 원시 값과 참조 값 | REWRITE | 6 | PR 기준선에서 전면 재작성하고, 변수→값 복사→상태 변화 흐름을 Java 언어 보장으로 다시 고정했다. |
| language-types | String의 불변성과 문자열 비교 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| language-types | String pool과 intern | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| language-types | StringBuilder와 반복 문자열 조립 | KEEP | 5 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| language-types | 변수, 범위와 확정 할당 | REWRITE | 6 | PR 기준선에서 전면 재작성하고, 변수→값 복사→상태 변화 흐름을 Java 언어 보장으로 다시 고정했다. |
| language-types | Boxing, unboxing과 wrapper 타입 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| object-model | 다형성과 런타임 메서드 선택 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| object-model | 오버로딩과 오버라이딩 | ENRICH | 5 | 패턴/상속 선택의 실제 변경 축과 호출 흐름을 보강했다. |
| object-model | 인터페이스와 추상 클래스 선택 | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| object-model | 초기화 순서와 생성자 연결 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| object-model | 상속과 is-a 관계 | ENRICH | 4 | 패턴/상속 선택의 실제 변경 축과 호출 흐름을 보강했다. |
| object-model | 추상화와 객체의 책임 | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| object-model | 캡슐화와 객체의 불변 조건 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| object-model | 합성과 객체 협력 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| object-model | 클래스, 객체와 생성자 | KEEP | 5 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| object-model | 참조 타입 변환과 instanceof | KEEP | 5 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| object-model | 불변 객체와 방어적 복사 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| object-model | static 멤버와 인스턴스 멤버 | KEEP | 5 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| api-design | Builder로 복잡한 생성 인자 다루기 | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| api-design | 의존성을 밖에서 전달하는 설계 | KEEP | 5 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| api-design | 메서드 계약과 매개변수 검증 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| api-design | 필요한 범위만 공개하기 | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| api-design | 정적 팩터리 메서드 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| object-contracts | equals 계약과 논리적 동등성 | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| object-contracts | hashCode와 equals의 계약 | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| object-contracts | toString과 진단용 표현 | ENRICH | 4 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| object-contracts | Comparator로 정렬 기준 조합하기 | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| object-contracts | Comparable과 자연 순서 | ENRICH | 5 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| enum-modeling | EnumSet으로 enum 집합 표현하기 | ENRICH | 4 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| enum-modeling | EnumMap으로 enum key 매핑하기 | ENRICH | 4 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| enum-modeling | enum ordinal과 외부 저장값 | ENRICH | 4 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| enum-modeling | enum으로 닫힌 값 집합 모델링하기 | ENRICH | 5 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| design-patterns | State 패턴과 상태별 행동 | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| design-patterns | Template Method 패턴과 공통 실행 흐름 | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| design-patterns | Strategy 패턴과 정책 교체 | ENRICH | 7 | 패턴/상속 선택의 실제 변경 축과 호출 흐름을 보강했다. |
| design-patterns | Observer와 상태 변화 알림 | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| design-patterns | Proxy와 호출 중개 | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| design-patterns | Factory와 객체 생성 책임 | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| design-patterns | Adapter로 외부 인터페이스와 경계 분리하기 | KEEP | 5 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| design-patterns | Decorator로 책임을 겹쳐 붙이기 | KEEP | 5 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| collections | ArrayList와 LinkedList의 실제 선택 기준 | ENRICH | 7 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| collections | HashMap 조회와 hash 충돌 | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| collections | HashSet과 중복 판단 | ENRICH | 4 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| collections | 변경 불가 컬렉션과 unmodifiable view | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| collections | Iterable, Iterator와 순회 중 수정 | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| collections | List, Set, Map을 요구사항으로 선택하기 | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| collections | PriorityQueue와 우선순위 처리 | ENRICH | 5 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| collections | Queue, Deque와 ArrayDeque | ENRICH | 5 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| collections | TreeSet과 TreeMap의 정렬 기준 | ENRICH | 4 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| generics | 제네릭 타입과 제네릭 메서드 | ENRICH | 5 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| generics | Wildcard와 PECS | ENRICH | 7 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| generics | 타입 소거와 런타임에 남는 타입 정보 | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| generics | Raw type과 unchecked 경고 | ENRICH | 4 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| generics | 제네릭 varargs와 heap pollution | ENRICH | 5 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| generics | 제네릭 불공변성과 잘못된 쓰기 방지 | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| exceptions-resources | 표준 예외로 메서드 계약 표현하기 | ENRICH | 4 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| exceptions-resources | Throwable, checked exception, unchecked exception과 Error | ENRICH | 5 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| exceptions-resources | 실패 후 객체 상태와 failure atomicity | ENRICH | 5 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| exceptions-resources | 예외 변환과 원인 보존 | ENRICH | 5 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| exceptions-resources | 예외 전파와 catch 경계 | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| exceptions-resources | 예외와 정상적인 분기 흐름 구분하기 | ENRICH | 4 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| exceptions-resources | AutoCloseable과 자원 소유권 | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| exceptions-resources | try-with-resources와 suppressed exception | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| functional | 행동을 매개변수로 전달하기 | ENRICH | 7 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| functional | 함수형 인터페이스 | ENRICH | 5 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| functional | Lambda의 지역 변수 캡처와 effectively final | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| functional | Lambda의 target type | ENRICH | 7 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| functional | 메서드 참조와 함수 조합 | ENRICH | 4 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| streams | Parallel Stream의 선택 기준 | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| streams | Collector로 grouping·partitioning 하기 | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| streams | reduce로 여러 값을 하나로 합치기 | ENRICH | 4 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| streams | Stream의 부수효과와 non-interference | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| streams | filter·map·flatMap으로 데이터 변환하기 | ENRICH | 6 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| streams | toMap의 중복 Key 처리 | ENRICH | 4 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| streams | Stream Pipeline과 지연 실행 | ENRICH | 7 | 핵심 모델은 유지하면서 상태 변화·실패 경계·비교 기준을 보강하고 관련 Question coverage를 확인했다. |
| modern-language | Record로 데이터 모델링하기 | RESTRUCTURE | 7 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| modern-language | Pattern Matching으로 타입 분기하기 | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| modern-language | 반환 경계에서 Optional 사용하기 | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| modern-language | var와 지역 변수 타입 추론 | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| modern-language | Interface의 default·static 메서드 | RESTRUCTURE | 4 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| modern-language | Text Block으로 여러 줄 문자열 쓰기 | RESTRUCTURE | 4 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| modern-language | Sealed Type과 닫힌 계층 | RESTRUCTURE | 4 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| modern-language | Switch Expression으로 값 계산하기 | RESTRUCTURE | 4 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| time-numeric | Clock으로 테스트 가능한 시간 만들기 | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| time-numeric | DateTimeFormatter로 시간 파싱·표시하기 | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| time-numeric | Duration과 Period의 시간 의미 | RESTRUCTURE | 4 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| time-numeric | 부동소수점 정밀도와 오차 | RESTRUCTURE | 4 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| time-numeric | BigDecimal로 금액과 반올림 다루기 | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| time-numeric | ZoneId와 서머타임 전환 | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| time-numeric | Instant·LocalDateTime·ZonedDateTime | RESTRUCTURE | 7 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| io-nio | Buffered I/O와 버퍼링 | RESTRUCTURE | 4 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| io-nio | Path와 Files API | RESTRUCTURE | 7 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| io-nio | NIO Channel과 Buffer | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| io-nio | Blocking·Non-blocking I/O와 Selector | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| io-nio | 바이트·문자 스트림과 Charset | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| io-nio | 입출력과 Reader·Writer | RESTRUCTURE | 4 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| coding-tests | ArrayDeque로 스택과 큐 사용하기 | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| coding-tests | Buffered 출력과 StringBuilder | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| coding-tests | 코딩 테스트용 Comparator | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| coding-tests | BufferedReader 입력과 토큰화 | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| coding-tests | HashMap·HashSet으로 개수 세기 | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| coding-tests | 코딩 테스트의 PriorityQueue | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| coding-tests | 배열과 컬렉션 정렬하기 | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| concurrency | 안전한 공개와 final 필드 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | Platform Thread와 Virtual Thread | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | Lock, ReentrantLock과 Condition | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | Deadlock·Starvation·Livelock 구분하기 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | Future와 CompletableFuture | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | Executor와 Thread Pool | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | ScopedValue로 실행 문맥 전달하기 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | CountDownLatch로 작업 조율하기 | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | 동시성 컬렉션 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | 동시성과 병렬성 | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | BlockingQueue와 생산자·소비자 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | Atomic 변수와 CAS | KEEP | 7 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | JMM의 happens-before와 가시성 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | Semaphore와 동시 실행 허가 수 | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | ThreadLocal과 실행 문맥 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | synchronized와 Monitor | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | Thread 생명주기와 중단 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | volatile과 가시성 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| concurrency | 공유 가변 상태와 Race Condition | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| jvm-runtime | JVM Runtime Data Area와 Frame | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| jvm-runtime | JIT·HotSpot과 Warm-up | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| jvm-runtime | JDK·JVM·Class File의 경계 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| jvm-runtime | Java 메모리 누수의 원인 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| jvm-runtime | Heap·Metaspace·Native·Thread 메모리 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| jvm-runtime | Strong·Soft·Weak·Phantom Reference | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| jvm-runtime | GC Reachability와 Root | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| jvm-runtime | GC 기본 원리와 Collector | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| jvm-runtime | ClassLoader 위임과 타입 동일성 | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| jvm-runtime | Class Loading·Linking·Initialization | KEEP | 6 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| jvm-runtime | Bytecode와 javap로 실행 흔적 읽기 | KEEP | 4 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| jvm-runtime | jcmd·jstack·JFR로 JVM 진단하기 | KEEP | 7 | 구조와 학습 목표가 맞고, 현재 설명·문제·자료 연결을 유지한다. |
| metadata-compatibility | Reflection과 Class API | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| metadata-compatibility | Dynamic Proxy와 InvocationHandler | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| metadata-compatibility | Binary Compatibility와 API 진화 | RESTRUCTURE | 5 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| metadata-compatibility | Annotation의 Retention과 Target | RESTRUCTURE | 6 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| metadata-compatibility | Annotation Processing과 Reflection | RESTRUCTURE | 4 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| metadata-compatibility | Serialization이 만드는 장기 계약 | RESTRUCTURE | 4 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
| metadata-compatibility | JPMS·Classpath·Module Path | RESTRUCTURE | 4 | 영문 중심 제목과 메모형 섹션을 한국어 학습 노트 hierarchy로 재배열하고 코드·선택 기준을 유지·보강했다. |
