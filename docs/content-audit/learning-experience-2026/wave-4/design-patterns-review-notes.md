# Java design-patterns — 1차 전수 의미 감사 (정식 checkpoint 전)

- 검토 기준: PR #223 `09ce78e2e2facdf1e17b371ba6c16b404f034a4a` / main `efe73a15da14c996bd08344181d4d6f87073803d`.
- 원본: `content/java/design-patterns/`의 **8 Concept / 40 Question**(MULTIPLE_CHOICE 36 / SCENARIO 3 / DESCRIPTIVE 1); 각 Concept의 전체 본문/코드/Reference와 각 Question의 prompt, 모든 choice·rationale, 정답, explanation, modelAnswer, difficulty, concept 연결을 읽었다.
- **이 문서는 독립 수기 검토 메모**다. 정식 `java--design-patterns.json` ledger, `sourceHashes`, relation sidecar, generator, `checkpoint-topic.py`, regression/CI 통과를 대신하지 않는다. 기존 누적 **121 Topic/612 Concept/1,884 Question**은 바꾸지 않는다.
- 판정 후보: Concept **KEEP 6 / TARGETED_ENHANCE 2**, Question **KEEP 40 / 보강 0**. 새 발견 **P0 1 / P1 1** (아래 상세); 교정 전에는 품질 최종 승인·Java Wave4 완료로 주장하지 않는다.

## Concept별 다섯 축 검토

| Concept | 품질 후보 | 학습 목적·깊이 / 내부 동작·코드 / 시각화 / Reference / Question 연결 |
| --- | --- | --- |
| strategy-pattern | TARGETED_ENHANCE (출처) | 정책 선택과 실행 분리, 생성자 주입·lambda·상속 대비가 유효. `PriceCalculator → DiscountPolicy` SVG는 개념 관계와 일치하며 source의 title/desc 확인(렌더 QA 미실시). JLS9는 interface의 언어 근거이고 패턴의 실무 trade-off를 보증하지는 않음. 외부 Tecoble 출처에 비컴파일 Command 코드 및 모델 일반화 발견(DPAT-002). q1~q8은 정답·오답 근거·Scenario 답안 적절. |
| template-method-pattern | KEEP | `final run`, abstract primitive steps, optional hook, 상위 순서·하위 상태 결합과 조합 폭증을 설명. TEXT 골격 충분, 신규 그림 불필요. JLS8.4.8은 override/상속 근거이고 패턴 채택 기준은 별도 설계 판단. q1~q4 정답·해설·HARD 변형 축 적절. |
| factory-pattern | TARGETED_ENHANCE | 역할/생성 정책/객체 수명/Builder 구분은 타당. **인스턴스 `create(PaymentType)` 선언 뒤 `PaymentProcessorFactory.create(type)`로 클래스 호출**하여 연결 예시 불일치(DPAT-001). TEXT 구조 충분. JLS15.9 객체 생성 규칙과 factory 패턴 책임을 구분. q1~q4 정답·선택지·수명 구분 적절. |
| adapter-pattern | KEEP | SDK cents 변환, Math.multiplyExact/toIntExact, exception translation 및 업무 정책 경계 명료. TEXT 변환 흐름 충분. Math API는 exact overflow/범위 검사를 실제 보장하지만 JLS9만으로 Adapter 설계 우위를 증명하지는 않음. q1~q5 포함 30M euros→3B cents int 초과, 정답 C 확인. |
| decorator-pattern | KEEP | 동일 계약의 중첩, 계측/재시도 순서, 공유 가변 상태와 실패 처리 정확. TEXT call wrapping 도식 충분. FilterInputStream은 유사 합성 API 예시이며 모든 Decorator의 동작 계약 보증 아님. q1~q5, counter 1/2 경로와 `FIXED` 계약 위반 적절. |
| proxy-pattern | KEEP | protection/virtual/remote 및 검사 전 지연 생성, 직접 대상 참조 우회, 내부 `this` 호출이 바깥 wrapper를 재통과하지 않는 경계 명료. TEXT 호출경로 충분. JDK Proxy는 interface/InvocationHandler라는 한 구현 방식. q1~q4 정답·실제 접근 순서 적절. |
| observer-pattern | KEEP | 동기 subscriber 순회/예외·지연/가변 payload/해제 수명, 메시지 브로커와 구별 정확. TEXT 전달 도식 충분. Flow는 reactive streams 표준 API 예시이지 단순 동기 Observer의 실행/보관 계약 보증은 아님. q1~q5 스냅샷 A,B→A,C 및 예외 뒤 외부 기록 보존 적절. |
| state-pattern | KEEP | 상태·전이표·거부·예외 뒤 상태 보존, enum 대안 및 orchestration 책임 구별 적절. TEXT 전이표가 실제 학습 목표 충족. JLS8은 class 근거로 한정. q1~q5, DRAFT→PUBLISHED→DRAFT→(archive 거부)→PUBLISHED→ARCHIVED 계산/해설 일치. |

추가 검토 후보(현재 발견 확정 아님): `RateDiscountPolicy.discount`의 `price * percent / 100`은 `long` overflow가 가능한 예시다. 사용자에게 모든 `long` 금액을 안전하게 처리하는 코드로 오인되지 않도록 입력 범위 또는 산술 정책을 알려 줄지는 #201에서 결정할 수 있다. 이번 학습 목표는 Strategy 경계로, 개별 정답·코어 패턴 판정과 섞지 않는다.

## Question 40개 개별 판정 근거

전 문항에 대해 choice key별 rationale, 단일 정답, explanation 및 난도·연결을 읽었다. 아래 key는 모두 `java.core.design-patterns.`가 앞에 붙는다. 모두 **KEEP 후보**이며 아래는 핵심 판단 근거다.

| key (suffix) | 정답 / 검토 메모 |
| --- | --- |
| strategy-pattern.q1 | C — 문맥이 Strategy를 합성, 나머지는 상속/내장 분기/Template Method 구분. EASY 적절 |
| strategy-pattern.q2 | D — Comparator는 비교 정책, List 구현/equals 교체가 아님 |
| strategy-pattern.q3 | A(5) — `apply(10)`에서 람다 정수 `10/2` 실행 |
| strategy-pattern.q4 | B — 정책 합성 vs 부모 고정 순서, 런타임 setter 필수 아님 |
| strategy-pattern.q5 | C — 변화 없는 단순 메서드에는 추상화 비용 |
| strategy-pattern.q6 | A(100 오류) — B가 95를 반환하면 Checkout +5로 100, 올바른 결과 95. HARD 계약 진단 |
| strategy-pattern.q7 | SCENARIO — 변하는 수수료 계산 책임/단순 if의 trade-off를 답안에 반영 |
| strategy-pattern.q8 | SCENARIO — 계산 전략에 Order 상태변경·저장을 섞는 부작용/공통 단계 소유권 구분 |
| template-method-pattern.q1 | D — 상위 알고리즘의 순서/공통 단계 |
| template-method-pattern.q2 | D — final은 template override 금지, hook 자동 금지는 아님 |
| template-method-pattern.q3 | A — 독립 압축×암호화 정책을 합성하고 run 골격 유지, HARD 타당 |
| template-method-pattern.q4 | A — 추상 메서드 존재가 아니라 상위의 실제 실행 순서 통제 |
| factory-pattern.q1 | C — 생성 선택/조립 책임만 분리, 모든 상태전이·singleton 강제 아님 |
| factory-pattern.q2 | D — 추상 역할 반환과 구현 결합 분리 |
| factory-pattern.q3 | A — immutable Parser 공유, document-buffer Writer 별도 생성. synchronized와 상태 소유권 구별 |
| factory-pattern.q4 | A — 실질적 생성 정책 없는 wrapper는 간접 비용만 발생 |
| adapter-pattern.q1 | B — 서로 다른 계약 맞춤, Decorator/Proxy와 의도 구별 |
| adapter-pattern.q2 | D — Money↔cents·vendor 예외 변환, 도메인 값 강제변경 금지 |
| adapter-pattern.q3 | C — 30M×100=3B, Math.toIntExact(int) 범위 초과 검출 |
| adapter-pattern.q4 | A — 다른 인터페이스 호환 vs 동일 계약 기능 합성 |
| adapter-pattern.q5 | B — 벤더 예외를 내부 catch에 직접 노출하는 결합 |
| decorator-pattern.q1 | C — 같은 계약으로 delegate를 감싸 재조합 |
| decorator-pattern.q2 | D — 재시도 범위/계측 범위가 wrapper 순서에 종속 |
| decorator-pattern.q3 | C(1/2) — Metrics(Retry) 1, Retry(Metrics) 2 |
| decorator-pattern.q4 | A — 기능 조합 vs 접근 중개, 구현 형태로만 결정 안 함 |
| decorator-pattern.q5 | D — 원본 문자열 대문자화 약속에 `FIXED`는 명시 계약 위반 |
| proxy-pattern.q1 | B — 권한·캐시·lazy 접근 중개 |
| proxy-pattern.q2 | A — JDK interface InvocationHandler; 임의 concrete class subclassing 아님 |
| proxy-pattern.q3 | C — 먼저 거부 0회 생성, 허가 2호출에 대상 1회 생성/재사용 |
| proxy-pattern.q4 | A — 역할 같은 인터페이스, 객체 동일성 보장은 아님 |
| observer-pattern.q1 | C — subject가 구독/알림 경계 관리 |
| observer-pattern.q2 | C — 동기 느린 observer의 지연·실패 전파 |
| observer-pattern.q3 | D — 스냅샷 첫 [A,B], 변경된 원본 기준 둘째 [A,C], 현재 snapshot 소급 취소 아님 |
| observer-pattern.q4 | C — 필요한 immutable event 사실만 전달, final 참조가 깊은 불변성 보장 아님 |
| observer-pattern.q5 | SCENARIO — 두 번째 예외 전파, 세 번째 미실행, 첫 외부 부수효과 미롤백 |
| state-pattern.q1 | B — 상태별 행동·전이 응집 |
| state-pattern.q2 | A — 작은 state machine에서는 enum intention method 가능 |
| state-pattern.q3 | A — 세 번째 archive 거부 이후 계속, 마지막 상태 ARCHIVED |
| state-pattern.q4 | C — 허용/금지/다음 상태를 테스트 가능한 계약으로 작성 |
| state-pattern.q5 | DESCRIPTIVE — 두 boolean의 유효하지 않은 조합 vs 단일 명시 상태, enum 대안 |

## 신규 발견 후보 및 최소 후속 조치

### W4-JDPAT-001 · P0 · canonical 예제의 비정적 호출 오류

- Concept: `java.core.design-patterns.factory-pattern`
- 원문: `PaymentProcessorFactory.create(type)`
- 동일 본문 위의 선언: `PaymentProcessor create(PaymentType type)` (인스턴스 메서드). 이 선언만 존재하면 클래스 이름을 수신자로 직접 호출할 수 없다.
- 확인: JLS 15.12 메서드 호출/static 규칙 및 **javac 21 제한 재현: `non-static method create(String) cannot be referenced from a static context`**. 이는 해당 호출 유형을 재구성한 probe이며 원본 Concept 전체 컴파일 PASS/FAIL이라는 주장은 아니다.
- 최소 교정: `PaymentProcessorFactory factory = new PaymentProcessorFactory(config);` 이후 `factory.create(type)`를 보여 주거나 의도적으로 static API로 설계 변경하고 앞의 선언을 함께 수정. Factory 개념/기존 4Q 유지, #201에 후보 매핑.
- 공식 대조: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12

### W4-JDPAT-002 · P1 · 전략 학습용 외부 Reference의 코드·설명 한계

- Concept: `java.core.design-patterns.strategy-pattern`; 연결된 https://tecoble.techcourse.co.kr/post/2021-10-04-strategy-command-pattern/
- 원문 Command 부분에 `private account Account;`처럼 타입 식별자가 뒤바뀐 코드, `this.account = Account;`처럼 매개변수명과 타입명이 뒤섞인 코드, `scratchAllLotery()`/선언 `scratchAllLottery()` 불일치가 확인된다. Java 코드 조각이 이어지는 완성 예제로는 컴파일 불가하다.
- 글의 Strategy 사용 사례는 별도 확인했으며 **전체 글을 부정하지 않는다**. 다만 다른 인자가 필요하면 Strategy는 메서드 오버로드밖에 선택할 수 없다는 취지의 일반화는 인터페이스 설계/전략 객체가 자체 상태를 보유하는 대안까지 고려하지 않은 설명으로 한정한다.
- 최소 교정: 연결 Reference를 더 정확한 한국어 자료로 대체하거나 relationNote/후속 설명에서 Strategy에 유용한 부분과 Command 예시의 미완성 부분을 구별. canonical 전략 설명과 8Q는 그대로 유지. #201/#222 후속 후보.
- 외부 전체 코드 실행/수정은 하지 않음.

## 범위·검증 한계와 다음 단계

- 새 SVG 생성 필요성: 없음. `strategy-pattern.svg`의 기존 source에서 관계·title/desc 확인, **실제 브라우저/모바일/다크 모드의 렌더 QA는 미실시**.
- Reference: 원문에 기재된 canonical 관계를 읽고 특히 JLS/Math/JDK Proxy/한국어 자료의 해당 내용과 대조했다. **모든 URL의 독립 접근·문서 전문 검증/각 관계 sidecar 확정은 아직 하지 않았다.**
- 외부 참조/원본 관련 파일은 변경하지 않았으며 이번 메모만 추가. **이 시점은 선행 수기 감사이며 6 Topic 완료 아님**.
- 다음 조치: `java--design-patterns.json` 8C/40Q 원본 hash와 C5축/Q2축 근거, 10개 Reference relation sidecar, SVG source hash 및 findings 연결 → `wave_review.py` Topic count 누적 → `audit.py` generate/--check → checkpoint/regression/CI → 6번째 Topic checkpoint. 병합 금지.
