# Issue #201 Java canonical 교정 checkpoint

기준 main: `90f7c5bddcf074a08e523b8b54130ebfce96a28d` (감사 PR #223 병합). 브랜치 `content/issue-201-java-corrections`. 실행일 2026-10-16 (Asia/Seoul).

Java18Topic/145Concept/841Question의 기존 개별 감사 결과를 기준으로 연결·학습 목표·순서·identity 회귀를 검토했다. 변경된 모든 문항의 전제·정답·모든 선택지/rationale·해설/모범 답안은 직접 대조했다. 변경하지 않은 항목은 #223의 원본 근거와 동일한 source/metadata/Question identity를 보존한 범위로 확인했으며, 새 의미 감사나 일괄 KEEP 판정을 생성하지 않았다. 원본 감사 ledger/해시/발견은 역사적 근거로 보존한다.

## 결과

- Concept 본문 **19개**, Question **37개**, 기존 SVG **5개** 교정. contentKey·Question 유형·난도·연결·정답 key·순서 변경0. 새 Concept/Question/이미지0. Reference metadata/relation 변경0, Curriculum/OS/CA/제품 코드 변경0.
- Wave4 canonical 소유 **P0 7/P1 13 전부 교정**, P2 **22개 채택/1개 보류**. 계승 LEX-002 P2도 별도 교정해 적용43그룹. 원본49그룹 중 외부 Reference만의 **6그룹(P0 3/P1 1/P2 2)**은 #222 소유로 보존한다.
- Stream3Q는 직접 교정·재채점했다. q2 terminal forEachOrdered의 보장으로 B |12; q3 명시 반복문으로 C -6; q5 순차·병렬 공통 reduce 계약과 항등원/결합법칙 반례 및 fence 복구. 원본 audit의 NEEDS_REVIEW3 기록은 덮어쓰지 않는다. 이번 수정본은 CORRECTED이며 ChatGPT Full Content Review/Human Usage Check 승인은 별도다.
- 보류 P2: W4-JCON-004의 ThreadLocal 집합→설정 오기. 기술적 의미·정답에 영향이 없는 문체 변경이므로 이번 교육 효과 중심 범위에서 제외했다.
- 미확정 Reference16관계 및 외부 자료 오류는 #222에 남는다. 이 PR이 Java Reference 전체를 검증/교정했다고 주장하지 않는다.

## 검증 및 재현

- `python docs/content-corrections/issue-201-java/verify.py --write` / `verify.py`: 145C/841Q key·Question 정답/선택지 identity·Concept metadata/Reference·Curriculum parity·수정 source hash·인용 위치·범위 PASS. 후자는 생성기 일치 검사이며 수기 판정 도구가 아니다.
- `python docs/content-corrections/issue-201-java/probe.py`: Java25 실제 canonical 발췌 **21개** 컴파일/실행·거절 반례 PASS. Factory의 생략된 도메인 협력 객체/표준 import만 scaffold로 제공한다. 전 코드를 모든 JVM에서 실행한 주장이 아니다.
- 기존 `wave-4/probes/check-decoder-boundary.py`: 미완성 UTF8 2byte가 input에 잔류, 보존 시 한글 복원, 버리면 MALFORMED 확인. `ExceptionsBoundaryProbe.java`: 얕은 복사 뒤 실패에도 원본 Item=2, null 매핑 get=null/containsKey=true 확인. 코드 실행 관찰과 명세의 일반 보장을 구분한다.
- Backend targeted Gradle: ContentImportParserTest5 + CanonicalBootstrapBatchPlannerTest2 + CanonicalBootstrapIdempotencyIntegrationTest1 = **8개 PASS**. 전체 canonical availability/navigation 및 Preview/Apply/exact reimport/history 검사 포함. 기존 Gradle/Lombok deprecation warning은 있으나 테스트 실패0.
- Reader MarkdownContent Vitest **15개 PASS**.
- 실제 HTTP Import: task-owned PostgreSQL16.4 `csforge_issue201_test`/localhost:15433 및 앱18081, Vite15173. merged main의 교정 전 Java pack을 적재 → 37문항의 Attempt/WrongNote/ReviewSchedule/ReviewHistory와 145Concept의 Note/Progress 생성 → 교정 pack Preview ERROR0/Apply **56 UPDATED,948 UNCHANGED,CREATE0** → exact reimport **1004 UNCHANGED**. 개인 데이터/모든 Question·Concept ID/Reference 및 관계의 before/after 전체 snapshot 동일. [기계 검증 결과](import-validation.json). 운영 DB/Production Import 미수행.
- 변경 SVG5개의 실제 Concept Reader를 **375×812 / 1280×900, light/dark**에서 직접 확인. 겹침·경로·title/desc/ALT·텍스트 잘림·두 테마 대비를 확인했다. 모바일에서 작던 가로 배치는 같은 SVG 내부의 세로 행/패널로 바꾸고 라벨 크기를 높였다. [QA 기록](reader-qa.md). SVG-only 변경은 DB import 대상이 아니다.
- Python 구문·`git diff --check`, 변경파일 최종 검토 및 GitHub Repository Validation 결과는 PR에 명시한다. 배포/merge는 하지 않는다.

## Finding별 실제 교정/보류

`resolutions.json`은 수기 변경 이유와 공식 근거, `source-checkpoint.json`은 파일별 첫 변경 line 및 Concept/Question의 before/after source hash를 제공한다. 아래 표와 실제 diff를 함께 검토한다. 원본 인용은 병합된 #223의 findings.json을 따른다.

| Finding | 심각도 | 결정 | 실제 변경/보류 이유 | 파일 |
| --- | --- | --- | --- | --- |
| W4-JAPI-001 | P0 | REFERENCE_222 | 외부 Reference만의 결함으로 #222에 남기며 metadata/URL/relationNote는 변경하지 않는다. | #222 |
| W4-JAPI-002 | P2 | CORRECTED | 구현에 없는 includeClosed 호출을 제거했다. | `content/java/api-design/builder-pattern-construction.md` |
| W4-JCOD-001 | P2 | CORRECTED | State 비교자와 states 큐를 선언해 삽입/조회 타입을 맞췄다. | `content/java/coding-tests/priorityqueue-coding-tests.md` |
| W4-JCOD-002 | P1 | CORRECTED | 원소가 있는 자연 순서 큐로 한정하고 빈 큐 null 반환을 구분했다. | `content/java/coding-tests/questions.json` |
| W4-JCOL-001 | P0 | CORRECTED | get의 같은 key 동작을 value 반환으로 교정하고 매핑 교체는 하지 않음을 명시했다. 기존 자산을 세로 배치해 375px 라벨 가독성을 높였다. | `content/java/collections/hashmap-hashing-collision.md`<br>`frontend/public/learning/java/hashmap-buckets.svg` |
| W4-JCOL-002 | P2 | CORRECTED | ArrayList와 LinkedList를 별도 행으로 배치해 겹침을 없애고 동일 자산의 라벨 크기를 키워 375px에서 비교하도록 했다. | `frontend/public/learning/java/array-list-linked-list.svg` |
| W4-JCOL-003 | P2 | CORRECTED | Key(String) 생성자와 jobs 큐 연결을 제시했다. | `content/java/collections/hashmap-hashing-collision.md`<br>`content/java/collections/priorityqueue.md` |
| W4-JCOL-004 | P1 | CORRECTED | 목록/원소 non-null 및 copyOf의 null 거절을 명시했다. | `content/java/collections/questions.json` |
| W4-JCON-001 | P1 | CORRECTED | empty 동안 대기하고 non-empty이면 진행하도록 교정했다. | `content/java/concurrency/locks-reentrantlock-condition.md` |
| W4-JCON-002 | P2 | CORRECTED | 일반 non-final 가시성과 proper final 특수 보장을 구분했다. | `content/java/concurrency/questions.json` |
| W4-JCON-003 | P2 | CORRECTED | thenApply만 예외를 처리한다는 오답을 반박했다. | `content/java/concurrency/questions.json` |
| W4-JCON-004 | P2 | NOT_SELECTED_P2 | 집합→설정 오기는 기술적 의미/정답에 영향이 없는 문체 수정이라 이번 교육 효과 중심 교정에서는 보류한다. | 변경 없음 |
| W4-JDPAT-001 | P0 | CORRECTED | Factory 인스턴스를 생성한 뒤 create(type)를 호출한다. | `content/java/design-patterns/factory-pattern.md` |
| W4-JDPAT-002 | P1 | REFERENCE_222 | 외부 Reference만의 결함으로 #222에 남기며 metadata/URL/relationNote는 변경하지 않는다. | #222 |
| W4-JDPAT-003 | P2 | CORRECTED | validate와 helper를 생략한 발췌임을 명시했다. | `content/java/design-patterns/template-method-pattern.md` |
| W4-JDPAT-004 | P2 | CORRECTED | 두 번째 조합의 counter=2를 A 반박에 추가했다. | `content/java/design-patterns/questions.json` |
| W4-JENUM-001 | P0 | CORRECTED | COMPLETED를 포함하는 독립 enum 선언을 제시했다. | `content/java/enum-modeling/enumset.md` |
| W4-JENUM-002 | P1 | CORRECTED | Permission/Day 선언과 Permission.READ 수식을 제시했다. | `content/java/enum-modeling/questions.json` |
| W4-JEX-001 | P1 | CORRECTED | 불변 Item/non-null/구조 변경만이라는 전제와 공유 가변 원소 실패 반례를 추가했다. | `content/java/exceptions-resources/failure-atomicity.md` |
| W4-JEX-002 | P2 | CORRECTED | null 매핑 금지 전제와 containsKey 경계를 추가했다. | `content/java/exceptions-resources/exception-as-control-flow.md` |
| W4-JFUN-001 | P2 | CORRECTED | Runnable/Consumer 인자 수와 String 식별자/미제시 helper를 구분했다. | `content/java/functional/questions.json` |
| W4-JGEN-001 | P1 | CORRECTED | 참조 타입 토큰만 지원하고 primitive/void를 거절하며 Integer.class와 int.class를 구분했다. | `content/java/generics/type-erasure-reifiable-types.md` |
| W4-JGEN-002 | P2 | CORRECTED | Double 추가 및 Double로 좁혀 읽기의 실제 오답 근거를 교정했다. | `content/java/generics/questions.json` |
| W4-JIO-001 | P1 | CORRECTED | 미소비 byte의 호출자 compact/carry 책임, OVERFLOW, decode(true)/flush를 명시했다. | `content/java/io-nio/questions.json` |
| W4-JIO-002 | P2 | CORRECTED | flip의 두 대입을 swap과 구분했다. | `content/java/io-nio/questions.json` |
| W4-JIO-003 | P2 | CORRECTED | 동일 네 슬롯/ABC_ 배치와 세 칸의 읽기 범위를 보존하고 수직 배치했다. | `frontend/public/learning/java/nio-buffer-flip.svg` |
| W4-JJVM-001 | P2 | CORRECTED | 도달 불가/실제 회수, JIT 참조 생존성 및 old 세대 용어를 교정했다. | `content/java/jvm-runtime/questions.json` |
| W4-JJVM-002 | P1 | CORRECTED | 참조값/래퍼/기반 byte를 구분해 B만 결론낼 수 없게 했다. | `content/java/jvm-runtime/questions.json` |
| W4-JJVM-003 | P2 | CORRECTED | JVMS 자동관리 모델과 구현이 선택하는 기법을 구분했다. | `content/java/jvm-runtime/gc-fundamentals-collectors.md` |
| W4-JJVM-004 | P2 | REFERENCE_222 | 외부 Reference만의 결함으로 #222에 남기며 metadata/URL/relationNote는 변경하지 않는다. | #222 |
| W4-JJVM-005 | P2 | CORRECTED | 독립 스택을 세로로 배치하고 A/B 실제 frame→Heap 경로를 각각 왼쪽/오른쪽 바깥 lane으로 분리했다. 폰트/대비를 보강했다. | `frontend/public/learning/java/jvm-runtime-data-areas.svg` |
| W4-JA-001 | P0 | CORRECTED | 비상수 대입과 상수 식 예외를 구분하고 final만으로 항상 허용된다는 오답을 교정했다. | `content/java/language-types/numeric-conversion-overflow.md`<br>`content/java/language-types/questions.json` |
| W4-JA-002 | P1 | CORRECTED | List<Integer> values/int total 및 null 입력을 제시했다. | `content/java/language-types/questions.json` |
| W4-JA-003 | P0 | CORRECTED | Locale.ROOT로 기본 locale 의존성을 제거했다. | `content/java/language-types/string-immutability-equality.md` |
| W4-JA-004 | P1 | CORRECTED | 비상수 연결의 새 String 계약 및 상수 변수 예외를 명시했다. | `content/java/language-types/questions.json`<br>`content/java/language-types/string-pool-interning.md` |
| W4-JMETA-001 | P2 | CORRECTED | 주석/Retention, UID/class-file 버전, descriptor 존재/해석 경로를 구분했다. | `content/java/metadata-compatibility/questions.json` |
| W4-JMETA-002 | P2 | REFERENCE_222 | 외부 Reference만의 결함으로 #222에 남기며 metadata/URL/relationNote는 변경하지 않는다. | #222 |
| W4-JMOD-001 | P2 | CORRECTED | switch 식 밖 return 금지, 명시 String 타입 인자, nested interface static과 default 충돌을 구분했다. | `content/java/modern-language/questions.json` |
| W4-JOBJ-001 | P0 | CORRECTED | non-null value를 초기화하는 Key(String) 생성자를 추가했다. | `content/java/object-contracts/hashcode-contract.md` |
| W4-JOBJ-002 | P0 | REFERENCE_222 | 외부 Reference만의 결함으로 #222에 남기며 metadata/URL/relationNote는 변경하지 않는다. | #222 |
| W4-JOBJ-003 | P1 | CORRECTED | nullable String title 자체의 비교자로 범위를 한정했다. | `content/java/object-contracts/questions.json` |
| W4-JOM-001 | P1 | CORRECTED | Java25 prologue/위임/initializer/epilogue 순서와 null→kim 상태표를 추가했다. | `content/java/object-model/initialization-order-constructor-chaining.md` |
| W4-JOM-002 | P2 | CORRECTED | I/C 순서, protected 범위와 불변 조건, 두 번째 B 반환을 오답 근거에 맞췄다. | `content/java/object-model/questions.json` |
| W4-JOM-003 | P0 | REFERENCE_222 | 외부 Reference만의 결함으로 #222에 남기며 metadata/URL/relationNote는 변경하지 않는다. | #222 |
| W4-JSTR-001 | P2 | CORRECTED | 최신과 나중에 만난 값을 구분하고 lastEncounteredByUser로 명명했다. | `content/java/streams/tomap-duplicate-keys.md` |
| W4-JSTR-002 | P2 | CORRECTED | map 삭제와 빈 목록 선택 filter의 실제 오답을 반박했다. | `content/java/streams/questions.json` |
| W4-JSTR-003 | P0 | CORRECTED | forEachOrdered 출력으로 B \|12를 보장하고 모든 rationale/해설을 교정했다. | `content/java/streams/questions.json` |
| W4-JSTR-004 | P1 | CORRECTED | q3은 반복문 C -6으로, q5는 공통 reduce 계약과 정상 fence/모범 답안으로 교정했다. | `content/java/streams/questions.json`<br>`content/java/streams/stream-reduce.md` |
| W4-JTIME-001 | P2 | CORRECTED | BigDecimal.equals의 재정의를 명시했다. | `content/java/time-numeric/questions.json` |
| LEX-002 | P2 | CORRECTED | 기존 계승 발견. 세 단계 및 member→A/value→B 행을 분리해 parameter 박스 관통을 제거하고 375px 라벨 가독성을 보강했다. | `frontend/public/learning/java/pass-by-value.svg` |

## 영역 전체 회귀 범위와 남은 승인

18Topic의 Curriculum/Topic 순서와 모든145Concept 메타데이터/Reference, 841Question의 key/type/difficulty/status/conceptKeys/정답 key/선택지 key·order가 main과 동일하다. 수정 전후 해시가 다른19본문/37문항만 최소 교정했다. KEEP 항목을 문체 통일로 다시 쓰거나 기존 감사 해시를 새 본문에 맞춰 덮어쓰지 않았다. Source 비교와 schema 검증을 실제 의미 재검토 또는 사용자 학습 만족도 검사로 과장하지 않는다.

남은 단계는 ChatGPT Java Full Content Review → Human Usage Check → 별도 사용자 merge 승인이다. #222 Reference6그룹/미확정16관계는 별도 브랜치에서 처리한다. 운영 데이터/배포는 건드리지 않는다.
