# Java object-contracts — 직접 의미 검토 노트 (checkpoint 전)

- 검토일: 2026-10-14
- PR: #223, 감사 기준 HEAD: \`b9caa4f63d7a9d4da70a846da2436ceaa835cbac\`
- canonical 기준: \`main efe73a15da14c996bd08344181d4d6f87073803d\`
- 대상: \`java.core.object-contracts\` **5 Concept / 31 Question** (MC 27, DESCRIPTIVE 1, SCENARIO 3)
- 작업 상태: **직접 읽기 및 후보 판정 완료, 정식 Wave 4 checkpoint/참조 관계 sidecar/source hash/누적 generate·--check/CI 검증 미실시**. 이 노트만으로 \`summary.json\` 또는 완료 수량을 올리지 않는다.
- 방법: 다섯 canonical Markdown 전문, JSON의 전체31문항 및 모든 선택지/rationale/정답/모범답안/해설, 관련 공식 API와 두 한국어 링크를 직접 대조. previous PASS를 자동으로 인계하지 않았다. Java 21 javac로 한정 컴파일; Java 25 전수 실행 아님.

## Concept별 판단 후보

| Concept | 품질 후보 | 학습 목적·깊이 | 기술/코드/실패 경계 | 도식 | Reference/문항 연결 |
| --- | --- | --- | --- | --- | --- |
| \`equals-contract\` | TARGETED_ENHANCE (출처만) | L2: 동일성과 동등성, 반사·대칭·추이·일관성·null, 비교 상태/엔티티 경계까지 적절 | \`getClass\` vs \`instanceof\` 혼합과 generated id 변화의 위험을 명료히 설명. \`Money\`의 생성/equals는 설명용 도입임 | NONE: \`money.equals(voucher)\` ASCII와 필드·동등성 관계 충분 | 공식 Object.equals 적합. Tecoble VO 글의 기본 hashCode=주소 단정은 잘못되어 JOBJ-002로 별도 분리. q1~q7 검토 |
| \`hashcode-contract\` | TARGETED_ENHANCE | L2: 동등성→같은 해시, 충돌/분포, 가변 키, 실행 사이 식별 금지까지 충실 | \`Key\` 클래스의 생성자는 없으나 \`new Key("A")\`를 호출해 예제가 컴파일되지 않음(JOBJ-001). \`null\` 금지도 생성 경계에 명시 필요 | TEXT: hash→후보→equals 도식이 핵심 경로 표현. HashMap 버킷 상세는 collections Topic으로 유지 | Object.hashCode 공식 계약은 정확. 연결 Tecoble 글의 고유 주소/항상 다른 해시 단정은 오류(JOBJ-002). q1~q7 검토 |
| \`tostring-diagnostics\` | KEEP | L1: 진단 목적, 구조화 계약과 구분, PII/secret·재귀·lazy loading 위험 연결 | Order 예시의 값 표현과 비용/순환 제약이 질문에 직접 연결됨. \`toString\`에 정형 포맷 자동 보장은 없음 | NONE: 별도 도식 효용 낮음 | Object.toString 공식 문서 적합. q1~q5(시나리오 포함) 검토 |
| \`comparable-natural-order\` | KEEP | L2: 자연 순서와 compareTo 부호·추이성·상태 안정성·equals 비일관성의 의미 설명 | Integer.compare 대 뺄셈 오버플로, BigDecimal scale, HashSet/TreeSet 경계 정확 | TEXT: 순서/부호의 짧은 설명으로 충분 | Comparable JDK25 공식 문서 적합. q1~q5 검토 |
| \`comparator-custom-order\` | KEEP | L2: 타입 밖의 정렬, \`thenComparing\`/전체 \`reversed\`/TreeSet 0 문제 충분 | nullsLast와 key 추출을 원문이 간단히 소개하지만 Task 필드와 문자열 자체의 구분을 질문에서 명확히 해야 함 | TEXT: amount→id ASCII가 순서 설명에 충분 | Comparator JDK25 공식 문서 적합. q1~q7 중 q4 전제 수정 필요(JOBJ-003) |

## Question 31개 직접 판정 후보

\`KEEP\`은 정답 하나의 성립, 나머지 선택지의 오답 이유, 설명·난이도·Concept 연결까지 개별 확인한 결론이며 향후 ledger에 별도 수기 근거·source hash를 고정해야 한다.

| contentKey 접미사 | 종류/난이도 | 후보 | 문항별 근거 |
| --- | --- | --- | --- |
| equals-contract.q1 | MC EASY | KEEP | D의 서로 다른 객체 해시 유일성 요구는 거짓. A 반사성/B 비null-vs-null/C 대칭·추이의 오답 이유 일치 |
| equals-contract.q2 | MC HARD | KEEP | A Money가 Voucher를 허용하지만 역방향 추가 code 필드가 거절할 수 있음. instanceof 하위타입 판정과 super.equals 처리 설명 정확 |
| equals-contract.q3 | MC MEDIUM | KEEP | D 동일 참조 true 빠른 경로만 수행. A 모든 필드 강제/B 타 참조 값 비교/C null 동일 취급 모두 아님 |
| equals-contract.q4 | MC MEDIUM | KEEP | C 논리적 동등성 상태 선택. 캐시·toString·참조 동일성은 값 의미 대신 못함 |
| equals-contract.q5 | MC EASY | KEEP | B getClass의 동일 런타임 타입 검사. 자체로 전체 계약 보장하지 않는다는 C 반례 적절 |
| equals-contract.q6 | MC MEDIUM | KEEP | C 불변 x,y만 값 동등성 결정. lazy distanceCache는 파생 계산 상태. A/B/D 오답 근거 일치 |
| equals-contract.q7 | DESCRIPTIVE HARD | KEEP | transient id=null 간 잘못된 동등성과 영속화 뒤 기준 변화, 업무 키·proxy·생명주기 확인을 포함. 자동 채점 선택지 없음 |
| hashcode-contract.q1 | MC EASY | KEEP | D equals true→hash 같음만 필수. 고유성/주소/API/역함의 오답 이유 정확 |
| hashcode-contract.q2 | MC MEDIUM | KEEP | A 실행 간 안정적 영구 ID 불보장과 충돌 가능성. 문자형 변환/큰 int/equals 계약의 실행 간 보장 오답 |
| hashcode-contract.q3 | MC HARD | KEEP | C \`toLowerCase(Locale.ROOT)\` 기반 equals와 원문 hash 충돌. final은 규칙 정합 보장 아님. 정규화 규칙을 문제에서 지정 |
| hashcode-contract.q4 | MC MEDIUM | KEEP | B id 동등성에 label을 더한 해시는 서로 다른 값을 허용해 계약 위반 가능. Objects.hash/toString이 자동으로 해결 못함 |
| hashcode-contract.q5 | MC EASY | KEEP | A 매번 다른 hash의 위치 탐색 실패. equals 대칭성과 List 인덱스 탐색은 별도 |
| hashcode-contract.q6 | MC MEDIUM | KEEP | D x만 해시여도 같은 x,y면 같은 x. 같은 x/다른 y 충돌은 허용, 분포상 불리 |
| hashcode-contract.q7 | SCENARIO HARD | KEEP | mutable email 변경 후 bucket mismatch와 불변 키/제거-수정-삽입 순서 설명. 구조/실무 연결 적합 |
| tostring-diagnostics.q1 | MC EASY | KEEP | B 사람이 읽는 로그/디버깅 용도. 영구 포맷/동등성/비밀 자동 보호 모두 보장 없음 |
| tostring-diagnostics.q2 | MC MEDIUM | KEEP | A password/token은 로그 확산 위험. 공개 label/status/enum은 정책 검토 후 진단 후보 |
| tostring-diagnostics.q3 | MC HARD | KEEP | A 객체 그래프 요약·secret 배제·기존 배치 파서를 별도 versioned format으로 이전. 순환/민감/계약 세 문제 분리 |
| tostring-diagnostics.q4 | MC MEDIUM | KEEP | D 양방향 toString 호출은 재귀 stack overflow 가능. 자동 순환 감지나 접근 제한이라는 오답 기각 |
| tostring-diagnostics.q5 | SCENARIO MEDIUM | KEEP | JPA lazy association 호출 SQL/N+1·순환·민감정보 문제 및 안전한 scalar summary/구조화 로그 분리 모두 modelAnswer 포함 |
| comparable-natural-order.q1 | MC EASY | KEEP | A 타입 기본 자연 순서, Comparator·equals·참조 판정과 구별 |
| comparable-natural-order.q2 | MC MEDIUM | KEEP | D TreeSet compareTo==0 중복 취급. equals/hashCode가 우선하지 않는다는 오답 이유 정확 |
| comparable-natural-order.q3 | MC HARD | KEEP | D MAX_INT-(-1)와 -1-MAX_INT 모두 MIN_INT overflow로 음수. Integer.compare 대안/부호 대칭 검토 |
| comparable-natural-order.q4 | MC EASY | KEEP | A 대표 자연 순서가 없으면 화면별 Comparator. 전역 설정/합산/항상 +1은 비교 계약 위반 |
| comparable-natural-order.q5 | MC MEDIUM | KEEP | C BigDecimal형 비일관 순서 시 HashSet·TreeSet 집합 중복 결과 차이. 컴파일러 강제 없음 |
| comparator-custom-order.q1 | MC EASY | KEEP | A 문맥별 순서라는 요구. 비교 중 mutation/무조건 0과 구별 |
| comparator-custom-order.q2 | MC MEDIUM | KEEP | B priority 먼저, 0일 때 title. 같은 title의 tie-break 필요를 rationale이 이미 언급 |
| comparator-custom-order.q3 | MC MEDIUM | KEEP | B int subtraction overflow 부호 손상. 비교 결과가 -1/1만 요구되지 않음 |
| comparator-custom-order.q4 | MC MEDIUM | TARGETED_ENHANCE | B는 nullable String 직접 비교에 정답. 그러나 Task.title 키를 기준으로 Task를 정렬한다면 \`Comparator.comparing(Task::title, Comparator.nullsLast(...))\`가 필요. 비교 대상 타입 전제 불명(JOBJ-003) |
| comparator-custom-order.q5 | MC HARD | KEEP | C 전체 reversed는 id까지 역순. priority만 reversed 후 id 오름차순 추가가 정답. TreeSet id 구별 설명 적합 |
| comparator-custom-order.q6 | MC EASY | KEEP | A 명시 Comparator가 해당 정렬의 기준이 됨. 자연 순서와 일치 의무/동률만 보조 아님 |
| comparator-custom-order.q7 | SCENARIO HARD | KEEP | Comparator가 안정적이어도 값 변경 시 트리 배치 안 바뀜. 제거 전 수정이 아니라 제거→수정→재삽입을 설명 |

요약 후보: **Concept KEEP3/보강2, Question KEEP30/보강1**. 새로운 문제 **P0 2그룹 / P1 1그룹 / P2 0그룹** (한 P0의 Reference 영향 Concept은 2개). 이 후보 수치는 ledger/checkpoint/CI 통과 전까지 PR 공식 누적 집계에 포함하지 않는다.

## 새로운 발견 후보 (기존 발견과 별개)

### W4-JOBJ-001 — P0 — \`hashcode-contract\` 예제 생성자 부재

- 경로: \`content/java/object-contracts/hashcode-contract.md\`
- 인용: \`class Key {\` 및 \`Key key = new Key("A");\`
- 원인: 필드/equals/hashCode만 가진 \`Key\`는 사용자 선언 생성자가 없어 기본 무인자 생성자만 존재. String 인자로 생성 불가.
- 재현: Java 21.0.12 \`javac\`에서 \`required: no arguments; found: String\` 컴파일 오류. Java 25 전체 probe 수행 주장이 아니라 JLS 생성자 규칙의 제한 확인.
- 최소 수정: \`Key(String value) { this.value = Objects.requireNonNull(value); }\` 또는 동등한 유효 생성 API를 예제에 보충. 나머지 hash/map 의미는 유지.
- 후속: #201 (정확한 Java Concept 예제).

### W4-JOBJ-002 — P0 — Java API 보장과 충돌하는 Reference 두 관계

- 경로: \`content/java/object-contracts/equals-contract.md\`의 VO 한국어 Reference 및 \`hashcode-contract.md\`의 hash 한국어 Reference.
- VO 글: https://tecoble.techcourse.co.kr/post/2020-06-11-value-object/ 에서 Object 기본 해시를 메모리 주소 기반 값으로 설명.
- hash 글: https://tecoble.techcourse.co.kr/post/2020-07-29-equals-and-hashCode/ 에서 Object 기본 해시가 고유한 주소를 int 변환하여 객체마다 다른 값을 반환한다고 일반화.
- 공식 대조: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#hashCode() — 같은 객체/동등 객체 계약은 있지만 실제 주소를 반환하거나 모든 다른 객체의 해시가 다른 것을 보장하지 않는다.
- 판단: **원문 외부 학습자료의 거짓 일반화**이며 두 canonical Concept의 현재 설명은 정확. 콘텐츠 본문을 삭제하거나 전체 rewrite하지 않는다.
- 최소 수정: 각 관계의 \`relationNote\`에 해당 주장 오해를 정확히 한정하거나 검증된 다른 Reference로 교체. 동일 URL의 전역 title/type 충돌과 relation 단위 provenance에 주의.
- 후속: #201/#222 조정.

### W4-JOBJ-003 — P1 — \`comparator-custom-order.q4\` 비교 타입 전제 불명

- 경로: \`content/java/object-contracts/questions.json\`, contentKey \`java.core.object-contracts.comparator-custom-order.q4\`
- 인용: \`null인 title을 마지막으로 보내는 Comparator 조합으로 적절한 것은?\`와 정답 \`Comparator.nullsLast(Comparator.naturalOrder())\`
- 공식 대조: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html 의 \`comparing(keyExtractor, keyComparator)\`와 \`nullsLast\`.
- 문제: 문자열 title 값 자체를 정렬할 때 정답 B는 유효. Task 객체의 nullable title 속성 기준 정렬에는 B만으로 부족. 전후 문항은 Task를 정렬하므로 비교 대상이 빠져 해석상 갈림.
- 최소 수정: 질문에 **\`String\` title 값들 자체를 비교**한다고 명시하거나, Task 리스트를 비교하는 문제로 확정할 경우 올바른 key extractor 조합을 정답/선택지·해설에 반영.
- 후속: #201 범위에서 최소 문항 보강.

## Reference·검증 한계

- canonical Reference **7관계 / 7URL**: 공식 Object.equals, Object.hashCode, Object.toString, Comparable, Comparator 5관계와 Tecoble 2관계. 공식 API 관련 절 및 두 블로그 본문 대조. 공식 출처 검토는 문서 전체를 검증했다는 뜻이 아님.
- 도식: Markdown 기존 ASCII만 사용. 기존 SVG/신규 SVG 연결 0. 새 그래픽 추가는 불필요; 실제 Reader/mobile/두 테마 화면 QA는 미수행.
- Java 21 제한 컴파일로 \`Key(String)\` 누락, nullable title의 직접 Comparator<Task> 대입 오류를 재현. 환경/전체 31 Q 실행/성능/제품 빌드/Java 25 CI PASS를 주장하지 않는다.
- 추가 도메인 오류·복수 정답을 발견하지 못했으나 31문항 전체에 대해 실제 사용자 풀이 테스트를 한 것은 아니다.
- 보존: 기존 Wave1~3 및 Java 선행3Topic ledger·source hash·summary·Reference sidecar를 **수정하지 않는다**.

## 정식 checkpoint 전 남은 작업

1. 각 항목의 개별 source hash, Curriculum/Topic catalog hash 고정 및 Topic ledger 5축/2축 귀속.
2. 위 Reference7관계의 \`(contentKey, URL)\` 상태·원문 객체·source hash를 기존 sidecar에 누락/중복 없이 편입. 잘못된 출처를 \`CURRENT_VERIFIED\`(내용 직접 확인)로 적더라도 quality issue를 따로 보존.
3. 발견의 정확한 \`sourceLine\`, \`sourceFileSha256\`, 후속 Issue 매핑을 고정하고 기존 findings/summary/README 누적.
4. \`wave_review.py\`의 기대 Topic에 4번째 Topic 추가 후 \`audit.py\` generate/\`--check\`, 파서 회귀, \`git diff --check\`, CI 재확인. **그전까지 이 파일은 완료 수량을 바꾸지 않는 검토 근거 노트**다.
