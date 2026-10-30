# PR #223 최종 리뷰 반영 checkpoint

대상 리뷰: [ChatGPT 최종 리뷰](https://github.com/guseoh/csforge/pull/223#pullrequestreview-5519203970), 직전 checkpoint `cb14d65412c3829052c6940a8d890e0b2216905f`. 최신 origin/main `efe73a15da14c996bd08344181d4d6f87073803d` 확인. 전수 Java 감사를 반복하지 않고 Stream 3문항의 모든 원문 필드와 Condition 관련 문장/코드만 재대조했다. 기존 ledger 행·source hash·probe·Reference sidecar·SVG·Wave1~3·snapshot은 보존한다.

## 공식 계약 재확인과 최소 판정 Delta

- **W4-JSTR-003 P0** — `java.core.streams.stream-pipeline-laziness.q2`. [Java25 Stream 총론/peek/forEach](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html)과 [package Side-effects](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html)에서 중간 action 생략 가능성을 확인했다. terminal `forEach` action의 보장으로 `peek` 출력까지 필수라고 결론낼 수 없다. 기존 B `|12` 관찰만으로 C `|만 출력`을 규범적으로 불가능하다고 설명한 채점 결함이다. C를 새 단일 정답으로 고치는 것도 부적절하다. #201에서 출력을 terminal `forEachOrdered`로 옮겨 지연 평가 질문을 보존하거나 호출 보장 여부 질문으로 한정하고 모든 rationale/해설을 맞춘다.
- **W4-JSTR-004 P1** — `java.core.streams.stream-reduce.q3/q5`. [Java25 reduce(T,BinaryOperator)](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#reduce(T,java.util.function.BinaryOperator))의 항등원/결합법칙 요구는 순차에도 적용된다. `-6`은 명시 left-fold 및 기존 JDK 관찰값이며, 이를 일반 결과 보장으로 확대하지 않는다. q3은 명시 반복문 계산 또는 계약 위반 식별로 최소 한정; q5는 무조건적인 순차 순서 표현과 한 줄 코드 fence를 교정한다. 모델 답안의 올바른 반례는 유지한다. invalid reduce가 반드시 컴파일 실패/예외/다른 결과를 낸다고 주장하지 않는다.
- **W4-JCON-001 P2→P1** — `java.core.concurrency.locks-reentrantlock-condition`. [Java25 Condition bounded-buffer take](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/locks/Condition.html)는 empty 동안 기다리고 원소가 생기면 진행한다. 본문은 진행 조건을 반대로 설명해 핵심 misconception을 만든다. 코드와 Question은 정확하므로 해당 한 문장만 #201에서 교정하며 P1 핵심 상태 설명 결함으로 추적한다. 신규 finding을 중복 생성하지 않는다.

최종 리뷰가 요청한 대로 **원문 품질 NEEDS_REVIEW 3Q는 유지**한다. 결함의 공식 근거/심각도는 확정됐지만 원문은 아직 미교정이며 최종 교정 방식·유일 정답·재채점 검증은 #201에 남는다. 기존 미확정 reason/recommendation을 삭제하지 않고 `contractReview`/`confirmedFindingIds`에 최신 판단을 병기했다. CURRENT_VERIFIED 읽기 근거와 품질 판정을 혼동하지 않는다.

## 누적 및 검증

- Java18Topic/145C/841Q, 전체15Area/134Topic/721C/2525Q 읽기 근거100% 유지.
- Java C KEEP116/보강29; Q KEEP804/보강34/NEEDS_REVIEW3. 전체 C KEEP592/보강129; Q KEEP2394/보강128/NEEDS_REVIEW3. REWRITE_REQUIRED0.
- Wave4 새 발견 **49그룹: P0 10/P1 14/P2 25**. 이번 신규2그룹(P0 1/P1 1)과 기존1그룹의 P2→P1 조정을 분리. 계승 LEX-002 P2 1은 별도.
- Reference272관계: 의미 검토256/미확정16, 상태 변경0. 같은 URL의 다른 관계를 승격하지 않는다.
- `check-accumulation.py` 20개 PASS: 기존16Topic 바이트 불변, 변경2Topic은 허용된 finding/심각도/추가 근거 외 원본 JSON 불변, 272 Reference 관계 보존, NEEDS_REVIEW의 확정 finding 연결 누락/잘못된 ID/근거 거부 및 KEEP 자동 승격 거부.
- streams7C41Q 및 concurrency19C113Q `checkpoint-topic.py`: key-set/hash/인용 PASS. generate/`--check` errors/drift0, 변경 Python3개 AST, generated diff 및 `git diff --check` PASS. CI/HEAD는 push 후 PR 최신 기록으로 연결한다. Reader 렌더/교정본 재채점/전수 코드 재실행은 이번 범위가 아니다.

## #201 — 기존 발견의 key별 최소 후속 범위

아래는 기존 수기 ledger의 확정 action을 기계적으로 모은 실행 범위이며 새 의미 판정이 아니다. 기존 발견을 재발견으로 세지 않는다. P2 선택적 개선은 우선순위별로 선택한다. canonical 교정은 #201 별도 Content Pack에서 수행한다. 공식 근거·정확한 원문 인용은 [findings](findings.md) 및 [Topic ledger](topics/)를 따른다.

| 발견 | 심각도 | 정확한 contentKey | 최소 action |
| --- | --- | --- | --- |
| W4-JAPI-001 | P0 | `java.core.api-design.static-factory-method` | 정확한 본문/문항은 유지한다. 잘못된 method 선언을 명시한 relationNote로 한정하거나 올바른 정적 팩터리 예시 출처로 교체하는1관계 최소 보강을 #201/#222에서 조정한다. |
| W4-JAPI-002 | P2 | `java.core.api-design.builder-pattern-construction` | 첫 호출에서 includeClosed 한 줄을 제거하거나 후속 예시는 keyword/page/size에 집중한 축약 구현이라고 명시한다. 기능/필드 전체 추가나 본문 재작성 없이 예시 연결1C만 보강한다. P2는 과거 전체 PASS를 취소하지 않는다. |
| W4-JCOD-001 | P2 | `java.core.coding-tests.priorityqueue-coding-tests` | State예시앞에PriorityQueue<State> states와distance/node비교기전제를짧게명시하고해당두호출이름만통일. 본문heap/immutable/stale개념은유지. |
| W4-JCOD-002 | P1 | `java.core.coding-tests.priorityqueue-coding-tests.q1` | prompt에원소가있는/defaultnaturalorder전제한문장추가하고Dfeedback에empty면조회null/저장null금지를구분. 정답A·난도·다른문항유지. |
| W4-JCOL-001 | P0 | `java.core.collections.hashmap-hashing-collision` | 해당라벨을같은key면value반환,아니면다음entry로교정하고조회/삽입흐름을구별. 기존SVG1개라벨만#201후속,새그림/본문rewrite불필요. |
| W4-JCOL-002 | P2 | `java.core.collections.arraylist-linkedlist-tradeoff` | 두열의간격/폭을조정해칸/노드가겹치지않도록기존SVG좌표만보강. 의미모델/정답유지,Readerrender후속확인. |
| W4-JCOL-003 | P2 | `java.core.collections.hashmap-hashing-collision`<br>`java.core.collections.priorityqueue` | Key생성자생략을명시/짧게제시하고Job예시는typed Job큐선언또는jobs사용으로연결. 두예시문맥만보강,모든본문코드standalone化/rewrite불필요. |
| W4-JCOL-004 | P1 | `java.core.collections.immutable-unmodifiable-collections.q6` | prompt에source와원소는null아님한절을추가하고D해설에copyOf의null거절을한정. 정답/난도/뷰vs스냅샷학습목표유지. |
| W4-JCON-001 | P1 | `java.core.concurrency.locks-reentrantlock-condition` | 비어 있지 않을 때까지/원소가 생길 때까지로 문장만 교정. 나머지 코드·질문 유지. |
| W4-JCON-002 | P2 | `java.core.concurrency.safe-publication-final-fields.q1` | 일반 non-final 상태 또는 final 특수 규칙 적용 밖이라는 한정과 본문 예외 연결만 추가. 정답/난도 유지. |
| W4-JCON-003 | P2 | `java.core.concurrency.future-completablefuture.q2` | 둘 다 callback 실패로 exceptional completion 가능하며 apply/compose 차이는 일반 값 vsstage 연결이라고 A보기 자체를 반박. |
| W4-JCON-004 | P2 | `java.core.concurrency.threadlocal-context` | 누가 설정하는가로 한 구절 교정. 본문 재작성 불필요. |
| W4-JDPAT-001 | P0 | `java.core.design-patterns.factory-pattern` | config로Factory인스턴스를생성한뒤factory.create(type)를보이는최소호출수정. 생성정책/수명설명및Question유지. |
| W4-JDPAT-002 | P1 | `java.core.design-patterns.strategy-pattern` | 관련Strategy부분과Command코드미완성/일반화한계를relationNote로한정하거나더정확한한국어자료로교체. 정확한canonicalStrategy본문/8Q유지. #201/#222 출처1관계조정. |
| W4-JDPAT-003 | P2 | `java.core.design-patterns.template-method-pattern` | validate등다른필수구현을생략한발췌라고한문장표시하거나짧은validate구현추가. 전체재작성/4Q변경불필요하며P2로이전PASS를취소하지않음. |
| W4-JDPAT-004 | P2 | `java.core.design-patterns.decorator-pattern.q3` | A의rationale에두번째조합은각재시도마다Metrics를거쳐2가된다는한문장추가. 정답/난도/본문유지. |
| W4-JENUM-001 | P0 | `java.core.enum-modeling.enumset` | PAID 등 실제 선언 상수로 바꾸거나 COMPLETED가 선언된 독립 enum을 예제에 명시한다. EnumSet 개념과 기존 Question 정답은 유지한다. |
| W4-JENUM-002 | P1 | `java.core.enum-modeling.enumset.q2`<br>`java.core.enum-modeling.enummap.q2` | q2 EnumSet에 Permission enum 정의/Permission.READ, q2 EnumMap에 Day 정의(MONDAY,SUNDAY) 또는 명확한 기존 타입 전제를 넣는다. 정답 B/C 및 해설 유지. |
| W4-JEX-001 | P1 | `java.core.exceptions-resources.failure-atomicity` | 구조변경만/불변Item전제를명시하거나변경할원소의독립복사범위를설명. 공유원소변경→실패반례한줄만추가해rollback보장범위를한정;기존잔액/DB경계모델은유지. |
| W4-JEX-002 | P2 | `java.core.exceptions-resources.exception-as-control-flow` | 예시Map은null값을저장하지않는다는전제를추가하거나실제키부재구별시containsKey를쓴다고짧게보강. 정상흐름설계본문/4Q유지. |
| W4-JFUN-001 | P2 | `java.core.functional.behavior-parameterization.q3`<br>`java.core.functional.method-reference-functional-composition.q1` | 두오답feedback만Runnable무인자/Consumer입력T와유효식별자vs미제시helper·instance호출로교정. 정답/난도/본문유지. |
| W4-JGEN-001 | P1 | `java.core.generics.type-erasure-reifiable-types` | 참조타입Class토큰만지원한다고명시하고primitive/void토큰거절전제를짧게보강. int.class와Integer.class차이한줄반례,기존erasure본문/정답유지. |
| W4-JGEN-002 | P2 | `java.core.generics.generic-invariance.q4`<br>`java.core.generics.wildcards-pecs.q3` | 첫B는실제Integer목록에Double쓸수없음,둘째B는실제Integer등다른Number목록일수있어Double로좁힐수없음으로두문장만교정. 정답/난도/본문유지. |
| W4-JIO-001 | P1 | `java.core.io-nio.byte-character-stream-charset.q7` | model/해설에ByteBuffer position..limit의미소비byte를compact/carry하고새byte후flip하여같은decoder에제공함·endOfInput/flush를짧게명시. 청크독립newString의문제/난도유지. |
| W4-JIO-002 | P2 | `java.core.io-nio.nio-channel-buffer.q4` | Cfeedback한곳의교환표현만두대입으로교정;정답/난도/본문유지. |
| W4-JIO-003 | P2 | `java.core.io-nio.nio-channel-buffer` | 후속에서양쪽동일4슬롯/ABC_배치유지하고읽기가능3셀과limit3커서만강조. 새image제작없이기존SVG상태시각encoding최소교정권고. |
| W4-JJVM-001 | P2 | `java.core.jvm-runtime.gc-reachability-roots.q4`<br>`java.core.jvm-runtime.gc-reachability-roots.q5`<br>`java.core.jvm-runtime.java-memory-leaks.q6` | q4를 도달 불가 상태와 실제 회수로 자연스럽게 정리; q5A를 참조 생존성/JIT 최적화에 따른 가능성으로, leaks.q6를 old 세대 사용량으로 문항 표현만교정. |
| W4-JJVM-002 | P1 | `java.core.jvm-runtime.heap-metaspace-native-thread-memory.q4` | prompt와D를 참조 대상인 Java 래퍼 객체/참조값/실제 backing bytes로명확히분리하고 D는 래퍼 객체의논리적 heap 모델로 표현. B는 backing 전부heap보장없음으로유지. |
| W4-JJVM-003 | P2 | `java.core.jvm-runtime.gc-fundamentals-collectors` | 자동관리시스템을정의하되 특정 기법/수집기는구현에맡긴다로 첫문장만정밀화. 모든객체즉시회수/특정수집기강제를추가하지않음. |
| W4-JJVM-004 | P2 | `java.core.jvm-runtime.jit-hotspot-warmup` | Reference title을실제현재제목으로맞추고 relationNote에7-1warmup/workload사례위치를안내. 공식HotSpot근거와현재본문은유지. |
| W4-JJVM-005 | P2 | `java.core.jvm-runtime.jvm-runtime-data-areas-frames` | ThreadA reference를ThreadB stack밖 별도상단/하단lane으로라우팅하고각thread→heap edge를출발frame에연결. 추상영역/본문은재작성하지않음. |
| W4-JA-001 | P0 | `java.core.language-types.numeric-conversion-overflow`<br>`java.core.language-types.numeric-conversion-overflow.q1`<br>`java.core.language-types.numeric-conversion-overflow.q4` | q1을 비상수 int 변수의 일반 대입으로 한정하고 상수 식의 범위 내 예외를 설명한다. q4 정답 A는 유지하되 D rationale와 본문의 변수 연산 한 문장을 비상수 변수/상수 변수로 구분한다. final만 붙인 모든 변수가 상수인 것으로 일반화하지 않는다. |
| W4-JA-002 | P1 | `java.core.language-types.boxing-unboxing-wrapper.q6` | 코드에 int total=0과 values의 Integer 컬렉션 타입/입력 전제를 명시한다. 기존 정답 D·null 산술 언박싱 설명·정확한 Concept 본문은 유지한다. |
| W4-JA-003 | P0 | `java.core.language-types.string-immutability-equality` | 이 예시에 Locale.ROOT를 명시하거나 Locale에 영향을 받지 않는 예시 문자열을 사용한다. 불변성 본문·모든 문항을 재작성하거나 locale Topic을 확장하지 않는다. |
| W4-JA-004 | P1 | `java.core.language-types.string-pool-interning`<br>`java.core.language-types.string-pool-interning.q4` | 본문의 해당 단락과 q4 explanation에 비상수 +는 새 String 객체를 만든다는 계약을 명시한다. part가 final 상수 변수라면 상수 식이 될 수 있다는 경계를 짧게 밝힌다. 정답 C와 intern/equals 모델 유지. |
| W4-JMETA-001 | P2 | `java.core.metadata-compatibility.annotation-processing-vs-reflection.q2`<br>`java.core.metadata-compatibility.serialization-contract-risk.q2`<br>`java.core.metadata-compatibility.jpms-classpath-modulepath.q3` | 해당feedback만일반주석은lexicaltoken단계제거/UID는streamclassdescriptor의serializationversion/module-info존재와해석경로별도라명시. 정답·난도·본문구조유지. |
| W4-JMETA-002 | P2 | `java.core.metadata-compatibility.serialization-contract-risk` | Reference relationNote를입문과사용처로좁히거나위험/버전진화를실제로다루는검증된자료로교체. 후속#222와#201에서이1관계만조정;다른직렬화본문재작성없음. |
| W4-JMOD-001 | P2 | `java.core.modern-language.default-static-interface-methods.q3`<br>`java.core.modern-language.local-variable-type-inference-var.q5`<br>`java.core.modern-language.switch-expressions.q4` | 세feedback만switch식block은yield/outerreturn금지,명시<String>인자유지,var지우지않음,nested타입static과default/static메서드별도계약으로교정. 정답/난도/본문유지. |
| W4-JOBJ-001 | P0 | `java.core.object-contracts.hashcode-contract` | Key(String value) 생성자와 non-null 필드 초기화만 추가하고 핵심 해시 동작 설명·연결 문항을 보존한다. |
| W4-JOBJ-002 | P0 | `java.core.object-contracts.equals-contract`<br>`java.core.object-contracts.hashcode-contract` | 두 Concept의 한국어 Reference를 명세와 함께 한정하거나 정확한 자료로 교체한다. 해당 Concept 본문과 Q는 유지한다. |
| W4-JOBJ-003 | P1 | `java.core.object-contracts.comparator-custom-order.q4` | String title 값 자체를 비교한다고 프롬프트에 명시하고 정답은 유지하거나 Task 비교자라면 키 추출 조합으로 정답/선택지 수정. |
| W4-JOM-001 | P1 | `java.core.object-model.initialization-order-constructor-chaining` | 기존예시에new Child와관찰결과null→kim의작은상태표를추가한다. defaultvalues→prologue(있는경우)→this/super경로→현재class field/block textualorder→epilogue를명시하고일반initializer와prologue직접할당을구별한다. q2/q4의올바른Java25설명과정답은유지한다. |
| W4-JOM-002 | P2 | `java.core.object-model.initialization-order-constructor-chaining.q3`<br>`java.core.object-model.inheritance-is-a.q2`<br>`java.core.object-model.polymorphism-dynamic-dispatch.q6` | 세rationale만각각I가C보다먼저,접근범위좁힘과invariant보호는다름,B.label이둘째B를반환함으로맞춘다. 정답/난도/전체해설/Concept는유지하며P2로전체PASS를취소하지않는다. |
| W4-JOM-003 | P0 | `java.core.object-model.class-object-constructor` | Reference를교체하거나관계설명에int기본값0과글의null/NPE설명오류를명확히한정한다. namedfactory/constructoroverload본래학습목표와정확한canonical본문/문항은유지한다. primary JLS4.12.5를직접근거로연결하는최소범위만후속검토한다. |
| W4-JSTR-001 | P2 | `java.core.streams.tomap-duplicate-keys` | 입력이시간순정렬되었다는전제또는lastEncountered명칭을짧게추가. 최신시각비교가목표면명시시각기준merge를후속#201에서한정. 5Q의올바른new/last정답은유지. |
| W4-JSTR-002 | P2 | `java.core.streams.stream-map-filter-flatmap.q3`<br>`java.core.streams.stream-pipeline-laziness.q6` | 첫A는map도소스를영구삭제하는연산아님을설명. 둘째C는빈list만선택해도중첩구조유지/평탄화목적실패라고두문장만교정. 정답·본문·난도유지. |
| W4-JSTR-003 | P0 | `java.core.streams.stream-pipeline-laziness.q2` | 후속 #201에서 지연 평가 목표를 유지하면서 출력을 forEachOrdered(System.out::print)의 terminal action으로 이동해 \|12를 보장하도록 prompt와 전 선택지/rationale/해설을 함께 최소 수정하거나, peek 호출 보장 여부를 묻는 단일 정답 문제로 바꾼다. 원문은 NEEDS_REVIEW 유지, 수정본의 유일 정답 재검증 전 KEEP 금지. |
| W4-JSTR-004 | P1 | `java.core.streams.stream-reduce.q3`<br>`java.core.streams.stream-reduce.q5` | 후속 #201에서 q3은 명시 for-loop/left-fold 계산 질문으로 코드와 rationale/해설을 맞추거나 위반 계약 식별 질문으로 한정한다. q5는 순차·병렬 모두 API 요구를 만족해야 한다는 전제를 넣고 항상 같은 순서 표현을 삭제/한정한다. 올바른 항등원/결합 반례와 HARD 학습 목표는 유지하며 코드 fence를 독립 줄로 복구하고 실제 Reader 표시를 검증한다. 원문 두 문항 NEEDS_REVIEW 유지. |
| W4-JTIME-001 | P2 | `java.core.time-numeric.bigdecimal-money-rounding.q2` | D rationale의상속을재정의로최소교정하고정답·난도·본문은유지. |

## #222 — 확인된 Reference 결함과 미확정 관계

아래 확인된 발견은 해당 관계의 제목/관련 절 안내 또는 자료 교체/오류 한정만 수행한다. 정확한 canonical 본문/Question을 전면 재작성하지 않는다.

| 발견 | 정확한 contentKey | 최소 action |
| --- | --- | --- |
| W4-JAPI-001 | `java.core.api-design.static-factory-method` | 정확한 본문/문항은 유지한다. 잘못된 method 선언을 명시한 relationNote로 한정하거나 올바른 정적 팩터리 예시 출처로 교체하는1관계 최소 보강을 #201/#222에서 조정한다. |
| W4-JDPAT-002 | `java.core.design-patterns.strategy-pattern` | 관련Strategy부분과Command코드미완성/일반화한계를relationNote로한정하거나더정확한한국어자료로교체. 정확한canonicalStrategy본문/8Q유지. #201/#222 출처1관계조정. |
| W4-JJVM-004 | `java.core.jvm-runtime.jit-hotspot-warmup` | Reference title을실제현재제목으로맞추고 relationNote에7-1warmup/workload사례위치를안내. 공식HotSpot근거와현재본문은유지. |
| W4-JMETA-002 | `java.core.metadata-compatibility.serialization-contract-risk` | Reference relationNote를입문과사용처로좁히거나위험/버전진화를실제로다루는검증된자료로교체. 후속#222와#201에서이1관계만조정;다른직렬화본문재작성없음. |
| W4-JOBJ-002 | `java.core.object-contracts.equals-contract`<br>`java.core.object-contracts.hashcode-contract` | 두 Concept의 한국어 Reference를 명세와 함께 한정하거나 정확한 자료로 교체한다. 해당 Concept 본문과 Q는 유지한다. |
| W4-JOM-003 | `java.core.object-model.class-object-constructor` | Reference를교체하거나관계설명에int기본값0과글의null/NPE설명오류를명확히한정한다. namedfactory/constructoroverload본래학습목표와정확한canonical본문/문항은유지한다. primary JLS4.12.5를직접근거로연결하는최소범위만후속검토한다. |

미확정16관계는 오류/깨진 링크 확정 목록이 아니다. 각 (contentKey, URL)의 실제 본문·제목·버전·relationNote/학습 목적을 다시 확인하고, 접근 실패를 기록하거나 검증된 자료로 최소 교체한다. 공유 URL도 각각 검증한다. [원본 관계별 근거](reference-relations.json)는 이번 Delta에서 불변이다.

| 정확한 contentKey | 미확정 URL | 확인 필요 이유 |
| --- | --- | --- |
| `java.core.language-types.primitive-reference-values` | https://d2.naver.com/helloworld/329631 | D2 응답에서 본문이 노출되지 않아 참조와 GC 도달 가능성의 관계를 학습 자료로 확인할 수 없다. 접근 shell을 의미 검증으로 승격하지 않는다. |
| `java.core.collections.hashmap-hashing-collision` | https://d2.naver.com/helloworld/831311 | D2응답은21행shell만노출되어HashMap관련본문/도식의실제학습가치를이번에확정하지못함. brokenURL이라고확정하지않는다. |
| `java.core.exceptions-resources.try-with-resources-suppressed` | https://d2.naver.com/helloworld/1219 | D2응답21행shell에서NIO.2/try-with-resources기사본문을읽지못해관련한국어학습가치미확정. HTTP응답만으로의미검증하지않음. |
| `java.core.functional.behavior-parameterization` | https://d2.naver.com/helloworld/4911107 | D2응답21행shell이라람다/invokedynamic보조기사본문과학습가치미확정. invokedynamic를언어일반보장으로승격하지않음. |
| `java.core.streams.stream-pipeline-laziness` | https://d2.naver.com/helloworld/4911107 | 같은D2응답은shell21행이고lambda/Stream적용기사본문은확인못함. 이Concept의보조학습역할도NEEDS_REVIEW로별도기록. |
| `java.core.time-numeric.instant-local-zoned-time` | https://d2.naver.com/helloworld/645609 | D2직접open은메뉴/search shell21행만노출. local/aware배경글 본문·예시 의미 확인불가;broken으로확정하지않음. |
| `java.core.io-nio.byte-character-stream-charset` | https://d2.naver.com/helloworld/76650 | D2인코딩76650 직접open shell21행. Unicode/Java본문의현행가치미확인;canonical의JDK18전기본charset한정은보존. |
| `java.core.io-nio.path-files-api` | https://d2.naver.com/helloworld/1219 | D2NIO2의1219는다른Topic예외자원과URL같아도별도직접open shell이라이Path관계도미확정. |
| `java.core.concurrency.thread-lifecycle-interruption` | https://d2.naver.com/helloworld/10963 | D2 접근은 공통 shell만 반환. 실제 thread dump 사례·제목/추천을 확인하지 못함. |
| `java.core.concurrency.platform-virtual-thread` | https://openjdk.org/jeps/491 | JEP491 직접 open internal error. URL 자체의 본문 검토는 미확정; Oracle24 변화/25 guide는 별도 보조 근거. |
| `java.core.concurrency.platform-virtual-thread` | https://d2.naver.com/news/1203723 | D2 news URL 공통 shell뿐. virtual thread 본문·운영 관점 학습가치 미확정. |
| `java.core.jvm-runtime.jvm-runtime-data-areas-frames` | https://d2.naver.com/helloworld/329631 | D2 URL329631은 article shell만 반환. 메모리 모델 보충 relation의 실제본문 미확정; 다른 Concept 관계와독립. |
| `java.core.jvm-runtime.gc-reachability-roots` | https://d2.naver.com/helloworld/329631 | D2 URL329631 shell만으로 reachability 복습본문/추천 확인 못함. |
| `java.core.jvm-runtime.reference-strengths` | https://d2.naver.com/helloworld/329631 | D2 URL329631 shell만; 강한/소프트/약한/팬텀 학습흐름의 실제원문 미확정. |
| `java.core.jvm-runtime.gc-fundamentals-collectors` | https://d2.naver.com/helloworld/1329 | D2 GC1329 shell만. 역사적 세대별 flow/STW 학습가치 및 현재25 적합성 미확정. |
| `java.core.jvm-runtime.runtime-diagnostics-jcmd-jstack-jfr` | https://d2.naver.com/helloworld/6043 | D2 GC모니터링6043 shell만. 실제지표/도구선택 기사본문 미확정. |

Draft PR #223 유지. Issue200 최종 승인/콘텐츠 교정 완료/병합 승인을 선언하지 않는다. Canonical/Curriculum/SVG/DB/제품 변경0.
