# Wave 4 누적 발견

Topic별 직접 검토의 새 발견과 기존 계승을 분리한다. 검토 완료는 교정 완료가 아니다.

## 새 발견

### W4-JAPI-001 — P0

대상: `java.core.api-design.static-factory-method`

원문: [content/java/api-design/static-factory-method.md:18](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/api-design/static-factory-method.md#L18)

> https://tecoble.techcourse.co.kr/post/2020-05-26-static-factory-method/

문제: 연결 Tecoble 글의 캐시된 LottoNumber 정적 팩터리 예시는 public LottoNumber of(int number)로 static 없이 선언된다. 이 선언은 instance method이며 LottoNumber.of(1) 형태의 class 호출이 컴파일되지 않는다. 생성자를 private으로 막고 static 생성 진입점을 설명하는 핵심 예시가 계약과 모순된다. canonical 본문과7문항은 정확하며 외부 학습자료의 사실 오류만 기록한다.

최소 보강: 정확한 본문/문항은 유지한다. 잘못된 method 선언을 명시한 relationNote로 한정하거나 올바른 정적 팩터리 예시 출처로 교체하는1관계 최소 보강을 #201/#222에서 조정한다.

공식 근거: [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.3.2), [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.3)

실행/추론 대조: 제한 재구성의 LottoNumber.of(1)이 non-static method compile error. 외부 전문 코드 전체 실행이 아니라 해당 선언/호출 모순만 대조.

후속: #201, #222

### W4-JAPI-002 — P2

대상: `java.core.api-design.builder-pattern-construction`

원문: [content/java/api-design/builder-pattern-construction.md:45](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/api-design/builder-pattern-construction.md#L45)

> .includeClosed(true)

원문: [content/java/api-design/builder-pattern-construction.md:85](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/api-design/builder-pattern-construction.md#L85)

> private int size = 20;

문제: 첫 SearchOption.builder 호출은 includeClosed(true)를 쓰지만 뒤의 같은 이름 SearchOption 전체 예시는 keyword/page/size만 선언하고 includeClosed 메서드는 없다. 축약한 구현이라는 명시가 없어 두 예시를 연결해 따라 실행하면 method-not-found가 난다. Builder의 상태·검증·복사 개념 자체는 충분하고 정확하다.

최소 보강: 첫 호출에서 includeClosed 한 줄을 제거하거나 후속 예시는 keyword/page/size에 집중한 축약 구현이라고 명시한다. 기능/필드 전체 추가나 본문 재작성 없이 예시 연결1C만 보강한다. P2는 과거 전체 PASS를 취소하지 않는다.

공식 근거: [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.2.1)

실행/추론 대조: 본문의 full SearchOption+첫 호출을 발췌해 Objects import만 보충: includeClosed compile error. 그 한 호출만 제거한 제한 대조는 compile success.

후속: #201

### W4-JCOL-001 — P0

대상: `java.core.collections.hashmap-hashing-collision`

원문: [frontend/public/learning/java/hashmap-buckets.svg:10](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/frontend/public/learning/java/hashmap-buckets.svg#L10)

> 같은 key면 교체, 아니면 다음 entry

문제: HashMap조회도식의title/desc/헤더는lookup/get인데equals뒤라벨은같은key면교체라고설명해put갱신과혼동한다. get은기존값을반환하며매핑을교체하지않는다. 본문/Q의해시모델은맞으며SVG의조회행동오류만확정한다.

최소 보강: 해당라벨을같은key면value반환,아니면다음entry로교정하고조회/삽입흐름을구별. 기존SVG1개라벨만#201후속,새그림/본문rewrite불필요.

공식 근거: [관련 계약](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html#get(java.lang.Object))

실행/추론 대조: 제한probe get1후mapping1유지. 규범근거는JDKget계약.

후속: #201

### W4-JCOL-002 — P2

대상: `java.core.collections.arraylist-linkedlist-tradeoff`

원문: [frontend/public/learning/java/array-list-linked-list.svg:8](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/frontend/public/learning/java/array-list-linked-list.svg#L8)

> <rect x="382" y="96" width="116" height="52"

원문: [frontend/public/learning/java/array-list-linked-list.svg:15](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/frontend/public/learning/java/array-list-linked-list.svg#L15)

> <rect x="450" y="96" width="92" height="52"

문제: 좌측ArrayList끝칸382..498과우측LinkedList첫노드450..542가같은y96..148에서48px중첩한다. 비교할두구조를별도공간으로읽기어려운sourcegeometry후보이며새pixelrender완료주장은아니다.

최소 보강: 두열의간격/폭을조정해칸/노드가겹치지않도록기존SVG좌표만보강. 의미모델/정답유지,Readerrender후속확인.

후속: #201

### W4-JCOL-003 — P2

대상: `java.core.collections.hashmap-hashing-collision`, `java.core.collections.priorityqueue`

원문: [content/java/collections/hashmap-hashing-collision.md:82](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/collections/hashmap-hashing-collision.md#L82)

> Key key = new Key("kim");

원문: [content/java/collections/hashmap-hashing-collision.md:75](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/collections/hashmap-hashing-collision.md#L75)

> class Key {

원문: [content/java/collections/priorityqueue.md:81](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/collections/priorityqueue.md#L81)

> queue.offer(job);

원문: [content/java/collections/priorityqueue.md:28](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/collections/priorityqueue.md#L28)

> PriorityQueue<Integer> queue = new PriorityQueue<>();

문제: HashMap Key전체class모양에는String생성자가없는데뒤에서new Key(String)을쓴다. PriorityQueue는앞Integer queue와뒤Job예시에서같은queue이름을쓰고이미선언된Job큐는jobs라연결실행시타입이맞지않는다. 독립발췌/생략표시가없어따라쓰기문맥이불명확하며자료구조모델은정확하다.

최소 보강: Key생성자생략을명시/짧게제시하고Job예시는typed Job큐선언또는jobs사용으로연결. 두예시문맥만보강,모든본문코드standalone化/rewrite불필요.

후속: #201

### W4-JCOL-004 — P1

대상: `java.core.collections.immutable-unmodifiable-collections.q6`

원문: [content/java/collections/questions.json:49](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/collections/questions.json#L49)

> 문자열 목록을 전달 시점의 구성으로 고정해 반환하려 한다. 소스는 나중에 add/remove될 수 있다. 맞는 선택은?

문제: 정답D의copyOf스냅샷은nonnull원소를전제로하는데문자열목록의null허용여부가제시되지않는다. null을포함한유효한ArrayList<String>이면copyOf가NPE를던져요구한결과를반환하지않고보기중일반해법이없어진다. 실질입력전제공백이며nonnull입력에서는정답D가맞다.

최소 보강: prompt에source와원소는null아님한절을추가하고D해설에copyOf의null거절을한정. 정답/난도/뷰vs스냅샷학습목표유지.

공식 근거: [관련 계약](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#copyOf(java.util.Collection))

실행/추론 대조: 제한probe ArrayList(Arrays.asList(A,null))의copyOf가NPE. 명세의null요소거절대조.

후속: #201

### W4-JDPAT-001 — P0

대상: `java.core.design-patterns.factory-pattern`

원문: [content/java/design-patterns/factory-pattern.md:105](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/design-patterns/factory-pattern.md#L105)

> PaymentProcessorFactory.create(type)

원문: [content/java/design-patterns/factory-pattern.md:45](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/design-patterns/factory-pattern.md#L45)

> PaymentProcessor create(PaymentType type)

문제: 본문위의create는config를보유한Factory인스턴스메서드인데뒤에서클래스이름으로호출한다. 해당선언에static이없어같은모델로는컴파일불가다. 기존1차후보를독립대조해확정했으며Factory모델과4Q는맞다.

최소 보강: config로Factory인스턴스를생성한뒤factory.create(type)를보이는최소호출수정. 생성정책/수명설명및Question유지.

공식 근거: [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.3)

실행/추론 대조: Temurin javac25.0.4.1 최소호출재구성에서non-static compile error. 전체본문compile주장아님.

후속: #201

### W4-JDPAT-002 — P1

대상: `java.core.design-patterns.strategy-pattern`

원문: [content/java/design-patterns/strategy-pattern.md:18](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/design-patterns/strategy-pattern.md#L18)

> https://tecoble.techcourse.co.kr/post/2021-10-04-strategy-command-pattern/

문제: 관련글Strategy부분의정책위임은유용하나Command예시에account타입/Account변수뒤바뀜과scratchAllLotery철자불일치가있다. 서로다른인자가필요하면Strategy는overload밖에없다는설명은입력객체/전략자체상태대안이가능함을누락한다. 외부자료의관련부분과한계를구분해야한다.

최소 보강: 관련Strategy부분과Command코드미완성/일반화한계를relationNote로한정하거나더정확한한국어자료로교체. 정확한canonicalStrategy본문/8Q유지. #201/#222 출처1관계조정.

후속: #201, #222

### W4-JDPAT-003 — P2

대상: `java.core.design-patterns.template-method-pattern`

원문: [content/java/design-patterns/template-method-pattern.md:73](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/design-patterns/template-method-pattern.md#L73)

> class CsvImportJob extends ImportJob {

원문: [content/java/design-patterns/template-method-pattern.md:38](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/design-patterns/template-method-pattern.md#L38)

> protected abstract void validate();

문제: 구체CsvImportJob의후속예시는transform/afterSave만보이고필수validate구현은생략한다. 생략표시없이완전class형태여서앞ImportJob과연결해실행하면validate미구현컴파일오류. 핵심순서/hook모델은맞고명시적설명예시의작은문맥공백이다.

최소 보강: validate등다른필수구현을생략한발췌라고한문장표시하거나짧은validate구현추가. 전체재작성/4Q변경불필요하며P2로이전PASS를취소하지않음.

공식 근거: [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.3.1)

실행/추론 대조: 본문ImportJob/CsvImportJob발췌에ParsedData/parseCsv/audit미정의협력자만보충했으며validate미구현compile error. 전수코드실행아님.

후속: #201

### W4-JDPAT-004 — P2

대상: `java.core.design-patterns.decorator-pattern.q3`

원문: [content/java/design-patterns/questions.json:23](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/design-patterns/questions.json#L23)

> Metrics가 바깥이면 delegate로 한 번 진입하고 내부 Retry가 대상을 재호출하므로 counter는 한 번 증가한다.

문제: A보기는두조합모두1이라틀리지만rationale는첫조합이1이라는맞는부분만설명한다. 뒤Retry(Metrics)의counter2를반박근거로말해야한다. 정답C/전체해설은정확하다.

최소 보강: A의rationale에두번째조합은각재시도마다Metrics를거쳐2가된다는한문장추가. 정답/난도/본문유지.

후속: #201

### W4-JENUM-001 — P0

대상: `java.core.enum-modeling.enumset`

원문: [content/java/enum-modeling/enumset.md:25](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/enum-modeling/enumset.md#L25)

> OrderStatus.COMPLETED

원문: [content/java/enum-modeling/enum-closed-values-behavior.md:36](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/enum-modeling/enum-closed-values-behavior.md#L36)

> enum OrderStatus {
>     READY,
>     PAID,
>     CANCELLED

문제: EnumSet 예제의 OrderStatus.COMPLETED는 선행 Concept의 OrderStatus(READY/PAID/CANCELLED)에 없는 상수다. 동일 타입으로 학습 예제를 연결하면 컴파일 오류가 발생한다.

최소 보강: PAID 등 실제 선언 상수로 바꾸거나 COMPLETED가 선언된 독립 enum을 예제에 명시한다. EnumSet 개념과 기존 Question 정답은 유지한다.

공식 근거: [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.9)

실행/추론 대조: 선행 enum 정의를 기준으로 한 제한 javac 21 컴파일에서 cannot find symbol: COMPLETED 재현. Java25 전체 실행 아님.

후속: #201

### W4-JENUM-002 — P1

대상: `java.core.enum-modeling.enumset.q2`, `java.core.enum-modeling.enummap.q2`

원문: [content/java/enum-modeling/questions.json:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/enum-modeling/questions.json#L12)

> EnumSet<Permission> set = EnumSet.of(READ);

원문: [content/java/enum-modeling/questions.json:16](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/enum-modeling/questions.json#L16)

> EnumMap<Day, Integer> hours = new EnumMap<>(Day.class);

문제: 두 코드 결과 문항에 Permission/Day enum 선언과 READ의 수식 또는 static import 전제가 없다. 결과 해석 의도는 맞지만 독립 실행할 코드로는 컴파일할 수 없어 학습자가 실행 결과와 미정의 식별자를 혼동할 수 있다.

최소 보강: q2 EnumSet에 Permission enum 정의/Permission.READ, q2 EnumMap에 Day 정의(MONDAY,SUNDAY) 또는 명확한 기존 타입 전제를 넣는다. 정답 B/C 및 해설 유지.

공식 근거: [관련 계약](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/EnumSet.html), [관련 계약](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/EnumMap.html)

실행/추론 대조: 제한 javac21 재구성에서 Permission/READ unresolved 증명; 타입 선언을 추가한 경우 원래 예상 결과에 부합.

후속: #201

### W4-JEX-001 — P1

대상: `java.core.exceptions-resources.failure-atomicity`

원문: [content/java/exceptions-resources/failure-atomicity.md:73](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/exceptions-resources/failure-atomicity.md#L73)

> List<Item> updated = new ArrayList<>(items);

문제: 임시결과에서기존상태를지키는예시는List구조만복사하고Item참조는공유한다. validateAndModify가가변Item필드를바꾼뒤실패하면items재대입이없어도원본관찰상태가바뀐다. 구조만수정하거나불변Item이라는전제가없어실패원자성보장범위를확대해읽게된다.

최소 보강: 구조변경만/불변Item전제를명시하거나변경할원소의독립복사범위를설명. 공유원소변경→실패반례한줄만추가해rollback보장범위를한정;기존잔액/DB경계모델은유지.

공식 근거: [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html), [관련 계약](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html#%3Cinit%3E(java.util.Collection))

실행/추론 대조: 미정의validateAndModify에가변Item필드변경후throw를넣은명시반례probe: 원본value1→2. 원문에없는helper실제동작을확정하는것이아니라누락된복사범위전제를보이는반례.

후속: #201

### W4-JEX-002 — P2

대상: `java.core.exceptions-resources.exception-as-control-flow`

원문: [content/java/exceptions-resources/exception-as-control-flow.md:51](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/exceptions-resources/exception-as-control-flow.md#L51)

> if (value == null) {

원문: [content/java/exceptions-resources/exception-as-control-flow.md:52](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/exceptions-resources/exception-as-control-flow.md#L52)

> // 부재 처리

문제: 일반Map의get==null을부재처리로사용하지만null매핑을허용하면키가존재해도null이반환된다. 이snippet에는nonnull값전제/정상적으로null을부재와같이취급하는정책이없다. 정상분기와실패구별전체설명은맞으며이코드의전제한정만필요하다.

최소 보강: 예시Map은null값을저장하지않는다는전제를추가하거나실제키부재구별시containsKey를쓴다고짧게보강. 정상흐름설계본문/4Q유지.

공식 근거: [관련 계약](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html#get(java.lang.Object))

실행/추론 대조: 제한HashMapprobe present→null에서get=null/containsKey=true.

후속: #201

### W4-JFUN-001 — P2

대상: `java.core.functional.behavior-parameterization.q3`, `java.core.functional.method-reference-functional-composition.q1`

원문: [content/java/functional/questions.json:9](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/functional/questions.json#L9)

> Function은 입력과 결과 타입이 명시된 동작이다. 인자 없는 부수 효과 계약은 Runnable/Consumer와 구별된다.

원문: [content/java/functional/questions.json:27](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/functional/questions.json#L27)

> `String`은 타입 이름이지 람다 매개변수가 아니며, `trim(String)`이라는 정적 API도 없습니다. 인스턴스 수신 객체와 호출 형태를 혼동했습니다.

문제: behavior.q3 D rationale은인자없는부수효과를Runnable/Consumer라고묶지만Consumer는T입력하나를받는다. method-reference.q1 D rationale은String이type이름이어서lambda매개변수가될수없다고하지만String이라는대문자식별자는유효parameter이름이다. trim(String)helper미제시/표준String.trim은instance메서드라는이유로반박해야한다. 두정답C와본문표준타입/참조설명은맞다.

최소 보강: 두오답feedback만Runnable무인자/Consumer입력T와유효식별자vs미제시helper·instance호출로교정. 정답/난도/본문유지.

공식 근거: [관련 계약](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/Consumer.html), [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27.1)

실행/추론 대조: 명시trimhelper를추가한probe에서Function<String,String> f=String -> trim(String)컴파일/실행java. 이helper가원문에존재하거나D를정답으로인정한다는주장은아님. Consumer.accept(input)호출확인.

후속: #201

### W4-JGEN-001 — P1

대상: `java.core.generics.type-erasure-reifiable-types`

원문: [content/java/generics/type-erasure-reifiable-types.md:105](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/generics/type-erasure-reifiable-types.md#L105)

> T[] result = (T[]) Array.newInstance(type, length);

문제: newArray의Class<T>는int.class도Class<Integer>로받는다. 이때reflection이int[]를만들지만T[]의erasure는Object[]여서helper내cast가CCE를던진다. 안전한uncheckedcast라고보이게하는예시에참조타입토큰전제가빠져있다. reflection으로소거를복원하지않는설명과String.class경로는맞다.

최소 보강: 참조타입Class토큰만지원한다고명시하고primitive/void토큰거절전제를짧게보강. int.class와Integer.class차이한줄반례,기존erasure본문/정답유지.

공식 근거: [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.8.2), [관련 계약](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/Array.html#newInstance(java.lang.Class,int))

실행/추론 대조: 제한probe Class<Integer> token=int.class는컴파일,reflection int[],newArray(token,1)는helper내CCE. String.class는String[]반환.

후속: #201

### W4-JGEN-002 — P2

대상: `java.core.generics.generic-invariance.q4`, `java.core.generics.wildcards-pecs.q3`

원문: [content/java/generics/questions.json:10](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/generics/questions.json#L10)

> 컴파일러는 실제 와일드카드 타입이 List<Double>일 가능성을 배제할 수 없다. Double 목록에 Integer를 넣는 것은 안전하지 않다.

원문: [content/java/generics/questions.json:15](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/generics/questions.json#L15)

> 실제 원소 타입이 Double일 수 있어 모든 항목을 Double로 읽을 수 없다. 상위 타입으로 읽어야 한다.

문제: invariance.q4 B는Double추가인데rationale은Double목록에Integer추가반례로뒤바뀌어있다. PECS.q3 B는Double로읽기인데실제Double일수있어못읽는다는반대이유를든다. 정답A/C와전체해설은정확하며이두오답feedback만부정확하다.

최소 보강: 첫B는실제Integer목록에Double쓸수없음,둘째B는실제Integer등다른Number목록일수있어Double로좁힐수없음으로두문장만교정. 정답/난도/본문유지.

공식 근거: [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5.1), [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.10)

실행/추론 대조: 공식 계약과 수기 코드/상태 추론; 실행 완료 주장이 아님.

후속: #201

### W4-JA-001 — P0

대상: `java.core.language-types.numeric-conversion-overflow`, `java.core.language-types.numeric-conversion-overflow.q1`, `java.core.language-types.numeric-conversion-overflow.q4`

원문: [content/java/language-types/questions.json:291](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/language-types/questions.json#L291)

> `a`와 `b`가 `final`인지 여부가 원인이 아니다. 덧셈에서 적용되는 승격 규칙 때문이다.

원문: [content/java/language-types/questions.json:237](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/language-types/questions.json#L237)

> `int`에서 `byte`로는 더 작은 범위로 줄어드는 축소 변환이므로 대입에 명시적 형변환이 필요하다.

원문: [content/java/language-types/numeric-conversion-overflow.md:67](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/language-types/numeric-conversion-overflow.md#L67)

> 반면 변수 연산은 같은 방식으로 처리되지 않습니다.

문제: q1은 비상수 int 변수라는 전제 없이 int→byte 대입을 묻고 A 해설에서 cast 필수를 단정한다. byte x=42는 암시 축소가 허용된다. q4에서 final byte a=1,b=2로 바꾸면 a+b는 여전히 int이지만 값3인 상수 표현식이므로 byte c=a+b가 허용된다. final 여부가 무관하다는 해설과 본문의 모든 변수 연산 제외는 constant variable 경계를 놓친다. 핵심 승격/overflow 모델 전체는 타당하다.

최소 보강: q1을 비상수 int 변수의 일반 대입으로 한정하고 상수 식의 범위 내 예외를 설명한다. q4 정답 A는 유지하되 D rationale와 본문의 변수 연산 한 문장을 비상수 변수/상수 변수로 구분한다. final만 붙인 모든 변수가 상수인 것으로 일반화하지 않는다.

공식 근거: [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.2), [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.4)

실행/추론 대조: probes/LanguageTypesProbe.java: implicitNarrowing=42:3; Temurin25.0.4.1에서 컴파일/실행, 보장의 근거는 JLS.

후속: #201

### W4-JA-002 — P1

대상: `java.core.language-types.boxing-unboxing-wrapper.q6`

원문: [content/java/language-types/questions.json:384](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/language-types/questions.json#L384)

> for (Integer n : values) {
>     total += n;
> }

문제: prompt는 total의 선언 타입을 제시하지 않고 B rationale에서만 int total을 가정한다. String total=""인 동일 반복문이면 +=는 문자열 연결이며 null 원소도 문자열 null로 들어가 NPE가 발생하지 않는다. D의 unboxing 결론은 수치 합계 전제에 의존한다.

최소 보강: 코드에 int total=0과 values의 Integer 컬렉션 타입/입력 전제를 명시한다. 기존 정답 D·null 산술 언박싱 설명·정확한 Concept 본문은 유지한다.

공식 근거: [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.26.2), [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.18.1), [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.1.8)

실행/추론 대조: probe의 String total + null은 null 문자열, int total + null은 NPE로 실제 재현.

후속: #201

### W4-JA-003 — P0

대상: `java.core.language-types.string-immutability-equality`

원문: [content/java/language-types/string-immutability-equality.md:49](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/language-types/string-immutability-equality.md#L49)

> name = name.toUpperCase();
> System.out.println(name); // KIM

문제: 이름 kim에 대한 인자 없는 toUpperCase는 기본 Locale을 사용한다. tr-TR에서는 i가 U+0130으로 대문자화되어 KİM이므로 Locale 전제 없는 KIM 고정 출력 주석은 일반 JDK API 보장이 아니다. 불변성/재대입 모델과 q6의 ab→AB는 맞다.

최소 보강: 이 예시에 Locale.ROOT를 명시하거나 Locale에 영향을 받지 않는 예시 문자열을 사용한다. 불변성 본문·모든 문항을 재작성하거나 locale Topic을 확장하지 않는다.

공식 근거: [관련 계약](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html#toUpperCase())

실행/추론 대조: default tr-TR probe 결과 code points [75,304,77], Locale.ROOT는 KIM.

후속: #201

### W4-JA-004 — P1

대상: `java.core.language-types.string-pool-interning`, `java.core.language-types.string-pool-interning.q4`

원문: [content/java/language-types/questions.json:838](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/language-types/questions.json#L838)

> 같은 문자열 풀 참조를 사용한다고 보장되지 않아 `b == "java"`는 `false`입니다.

원문: [content/java/language-types/string-pool-interning.md:94](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/language-types/string-pool-interning.md#L94)

> 결과의 문자열 내용은 `"java"`와 같지만 같은 객체라는 보장은 없습니다.

문제: q4 C의 true/false는 맞지만 비보장이라는 말만으로 false를 확정할 수 없다. JLS15.18.1은 비상수 문자열 + 결과가 newly created String이라고 규정하며 JLS3.10.5 공식 예시도 runtime concat은 distinct라 설명한다. 최적화·JVM 구현에 따른 우연한 결과가 아닌 이유를 누락한다.

최소 보강: 본문의 해당 단락과 q4 explanation에 비상수 +는 새 String 객체를 만든다는 계약을 명시한다. part가 final 상수 변수라면 상수 식이 될 수 있다는 경계를 짧게 밝힌다. 정답 C와 intern/equals 모델 유지.

공식 근거: [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.18.1), [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html#jls-3.10.5)

실행/추론 대조: probe nonfinal part 연결 false / final constantPart 연결 true. 실행은 보조이며 동일성 보장의 근거는 JLS.

후속: #201

### W4-JMOD-001 — P2

대상: `java.core.modern-language.default-static-interface-methods.q3`, `java.core.modern-language.local-variable-type-inference-var.q5`, `java.core.modern-language.switch-expressions.q4`

원문: [content/java/modern-language/questions.json:32](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/modern-language/questions.json#L32)

> 각 case에서 enclosing 메서드를 바로 return할 수도 있지만 이는 기존 문맥에 따라 의미를 바꾼다. switch expression 자체는 분기값을 산출해 기존 호출 구조를 보존할 수 있다.

원문: [content/java/modern-language/questions.json:26](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/modern-language/questions.json#L26)

> diamond가 명시된 생성자식의 제네릭 인수는 String으로 추론된다. var는 로 타입으로 지우지 않으므로 다른 타입 원소를 넣을 수 없다.

원문: [content/java/modern-language/questions.json:48](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/modern-language/questions.json#L48)

> 인터페이스를 static으로 바꾸면 인스턴스 계약과 사용 방식이 달라진다. 충돌 해결을 위해 무관한 모든 선언을 바꿀 필요는 없다.

문제: switch.q4 C는switch식block에서outerreturn가능하다고하지만JLS14.17상그식밖return은compile오류다. var.q5 A는new ArrayList<String>()의명시적타입인자를diamond추론이라고부른다. default-static.q3 D는interface타입static이instance계약을바꾸는것처럼설명하지만nestedinterface는이미implicitstatic이고top-levelstatic은허용문맥아니다. 세정답D/C/A와본문모델은맞으며오답feedback만부정확하다.

최소 보강: 세feedback만switch식block은yield/outerreturn금지,명시<String>인자유지,var지우지않음,nested타입static과default/static메서드별도계약으로교정. 정답/난도/본문유지.

공식 근거: [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.17), [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.4.1), [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.1.1.3)

실행/추론 대조: 제한javac25: switchexpr블록returncompile오류/yieldONE성공. nestedinterface의implicit/explicitstatic선언모두instance defaultlabel호출가능.

후속: #201

### W4-JOBJ-001 — P0

대상: `java.core.object-contracts.hashcode-contract`

원문: [content/java/object-contracts/hashcode-contract.md:110](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/object-contracts/hashcode-contract.md#L110)

> Key key = new Key("A");

원문: [content/java/object-contracts/hashcode-contract.md:91](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/object-contracts/hashcode-contract.md#L91)

> class Key {

문제: Key 클래스에는 인자 생성자가 없으나 new Key("A")를 호출하여 예제가 컴파일되지 않는다. hashCode/가변 키 의미 자체는 정확하다.

최소 보강: Key(String value) 생성자와 non-null 필드 초기화만 추가하고 핵심 해시 동작 설명·연결 문항을 보존한다.

공식 근거: [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.8.9)

실행/추론 대조: javac21 한정 컴파일에서 required no arguments / found String 확인. Java25 전체 본문 실행 주장이 아니다.

후속: #201

### W4-JOBJ-002 — P0

대상: `java.core.object-contracts.equals-contract`, `java.core.object-contracts.hashcode-contract`

원문: [content/java/object-contracts/equals-contract.md:18](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/object-contracts/equals-contract.md#L18)

> https://tecoble.techcourse.co.kr/post/2020-06-11-value-object/

원문: [content/java/object-contracts/hashcode-contract.md:18](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/object-contracts/hashcode-contract.md#L18)

> https://tecoble.techcourse.co.kr/post/2020-07-29-equals-and-hashCode/

문제: 두 Tecoble 참고 글에서 Object 기본 hashCode를 객체 실제 메모리 주소/고유 hash로 일반화하지만 Java SE25 Object API는 주소와 유일성을 보장하지 않는다. canonical 본문은 정확하여 외부 Reference 관계 오류로 분리한다.

최소 보강: 두 Concept의 한국어 Reference를 명세와 함께 한정하거나 정확한 자료로 교체한다. 해당 Concept 본문과 Q는 유지한다.

공식 근거: [관련 계약](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#hashCode())

실행/추론 대조: 관련 공식 Javadoc과 한국어 출처 원문을 비교. JVM 구현이 API 보장이라는 주장은 하지 않음.

후속: #201, #222

### W4-JOBJ-003 — P1

대상: `java.core.object-contracts.comparator-custom-order.q4`

원문: [content/java/object-contracts/questions.json:26](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/object-contracts/questions.json#L26)

> null인 title을 마지막으로 보내는 Comparator 조합으로 적절한 것은?

문제: 정답 B는 nullable String 자체를 비교하면 맞지만 Task의 title 필드를 정렬하는 해석이라면 Comparator.comparing(Task::title, Comparator.nullsLast(...))가 필요하다. 인접한 Task 문항과 비교 대상 타입 전제가 혼동될 수 있다.

최소 보강: String title 값 자체를 비교한다고 프롬프트에 명시하고 정답은 유지하거나 Task 비교자라면 키 추출 조합으로 정답/선택지 수정.

공식 근거: [관련 계약](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html)

실행/추론 대조: Comparator<T> 제네릭 비교 대상과 key extractor 필요성을 공식 API와 대조. 전체 질문 실행 주장 아님.

후속: #201

### W4-JOM-001 — P1

대상: `java.core.object-model.initialization-order-constructor-chaining`

원문: [content/java/object-model/initialization-order-constructor-chaining.md:129](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/object-model/initialization-order-constructor-chaining.md#L129)

> System.out.println(name); // 생성 중에는 기대와 다른 상태일 수 있음

문제: Parent생성자에서Child.print가실행되는핵심예시가어떤값을보는지기대와다를수있다는말에머문다. default값null과Child의nameinitializer kim의실행시점을설명하지않아학습자가실행결과/실패경계를자기힘으로설명하기어렵다. 현재객체field/block의소스순서및Java25prologue가직접fieldwrite를허용하는단계도본문의실행흐름에연결할필요가있다. 잘못된기술모델이나전체rewrite대상은아니다.

최소 보강: 기존예시에new Child와관찰결과null→kim의작은상태표를추가한다. defaultvalues→prologue(있는경우)→this/super경로→현재class field/block textualorder→epilogue를명시하고일반initializer와prologue직접할당을구별한다. q2/q4의올바른Java25설명과정답은유지한다.

공식 근거: [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html#jls-12.5), [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.8.7.1)

실행/추론 대조: ObjectModelProbe의ordinary=null뒤ordinary=kim,early=ready. 한Temurin25실행관찰이며규범근거는JLS.

후속: #201

### W4-JOM-002 — P2

대상: `java.core.object-model.initialization-order-constructor-chaining.q3`, `java.core.object-model.inheritance-is-a.q2`, `java.core.object-model.polymorphism-dynamic-dispatch.q6`

원문: [content/java/object-model/questions.json:121](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/object-model/questions.json#L121)

> `Parent` 생성자의 `P`는 하위 클래스 초기화 블록의 `I`보다 먼저 실행된다. 상위 클래스 생성이 완료된 뒤 하위 클래스 초기화가 진행된다.

원문: [content/java/object-model/questions.json:259](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/object-model/questions.json#L259)

> `protected`는 같은 패키지와 하위 클래스 경로에 노출되므로 `private`보다 접근 범위가 넓다.

원문: [content/java/object-model/questions.json:382](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/object-model/questions.json#L382)

> 필드 조회는 메서드 오버라이딩처럼 동적으로 선택되지 않는다. `x.value`는 참조 타입 `A`에 선언된 필드를 읽는다.

문제: 세문항의정답/전체explanation은맞지만특정오답feedback이틀린부분을반박하지않는다. initq3 A PCI도P가I앞이라실제틀린C/I순서를짚어야한다. inheritanceq2 D는public과비교하는데해설은private와비교한다. polyq6 A AA도첫문자A가맞고틀린부분은label()의둘째문자다.

최소 보강: 세rationale만각각I가C보다먼저,접근범위좁힘과invariant보호는다름,B.label이둘째B를반환함으로맞춘다. 정답/난도/전체해설/Concept는유지하며P2로전체PASS를취소하지않는다.

공식 근거: [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html#jls-12.5), [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.6), [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12)

실행/추론 대조: 공식 계약과 수기 코드/상태 추론; 실행 완료 주장이 아님.

후속: #201

### W4-JOM-003 — P0

대상: `java.core.object-model.class-object-constructor`

원문: [content/java/object-model/class-object-constructor.md:18](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/object-model/class-object-constructor.md#L18)

> https://tecoble.techcourse.co.kr/post/2021-05-17-constructor/

문제: 연결된학습자료는private int score를선언하고score를대입하지않는첫constructor에서null이들어가NPE가생길수있다고설명한다. int instancefield의기본값은0이며이것은틀린기술적근거다. canonical본문과5개문항은맞지만학습자를잘못된초기화모델로유도하는Reference이다.

최소 보강: Reference를교체하거나관계설명에int기본값0과글의null/NPE설명오류를명확히한정한다. namedfactory/constructoroverload본래학습목표와정확한canonical본문/문항은유지한다. primary JLS4.12.5를직접근거로연결하는최소범위만후속검토한다.

공식 근거: [관련 계약](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.5)

실행/추론 대조: ObjectModelProbe의omittedIntScore=0. 공식JLS와기사코드를대조한결과이며upstream문서수정/전체article코드실행은하지않음.

후속: #201, #222

### W4-JSTR-001 — P2

대상: `java.core.streams.tomap-duplicate-keys`

원문: [content/java/streams/tomap-duplicate-keys.md:41](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/streams/tomap-duplicate-keys.md#L41)

> 최신 값을 유지하려면 `second`를 선택할 수도 있습니다.

원문: [content/java/streams/tomap-duplicate-keys.md:79](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/streams/tomap-duplicate-keys.md#L79)

> Map<String, Order> latestByUser = orders.stream()

문제: second/newOrder선택은입력에서나중에만난값일뿐시간상최신Order라는보장은없다. latestByUser이름과최신값표현에시간정렬입력전제가빠져있다. 마지막문단은최신시각비교필요를이미설명하므로그구분을예시와연결하는최소보강이다.

최소 보강: 입력이시간순정렬되었다는전제또는lastEncountered명칭을짧게추가. 최신시각비교가목표면명시시각기준merge를후속#201에서한정. 5Q의올바른new/last정답은유지.

공식 근거: [관련 계약](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collectors.html#toMap(java.util.function.Function,java.util.function.Function,java.util.function.BinaryOperator))

실행/추론 대조: 명시Order(time20),Order(time10)입력의new승자time10. 시각최댓값자동선택아님을보이는제한반례.

후속: #201

### W4-JSTR-002 — P2

대상: `java.core.streams.stream-map-filter-flatmap.q3`, `java.core.streams.stream-pipeline-laziness.q6`

원문: [content/java/streams/questions.json:7](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/streams/questions.json#L7)

> `filter`는 소스를 영구 수정하거나 삭제하지 않는다. 스트림 파이프라인에서 통과 여부를 판단한다.

원문: [content/java/streams/questions.json:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/streams/questions.json#L12)

> 비어 있는 리스트를 걸러도 비어 있지 않은 내부 리스트를 평탄화하지 않는다. 결과 구조가 그대로 중첩된다.

문제: pipeline.q6 A는map소스삭제인데feedback은filter를반박한다. map-filter.q3 C의filter(List::isEmpty)는빈list만남기는데해설은빈list를제거하고비어있지않은list가남는것처럼설명한다. 정답B/A와전체해설은정확하며두오답feedback만엇갈린다.

최소 보강: 첫A는map도소스를영구삭제하는연산아님을설명. 둘째C는빈list만선택해도중첩구조유지/평탄화목적실패라고두문장만교정. 정답·본문·난도유지.

공식 근거: [관련 계약](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#filter(java.util.function.Predicate))

실행/추론 대조: 제한probe isEmptyFilter=[[]]로빈list선택확인.

후속: #201

## 기존 계승

### LEX-002 — P2

대상: `java.core.language-types.pass-by-value`

원문: [frontend/public/learning/java/pass-by-value.svg:1](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/frontend/public/learning/java/pass-by-value.svg#L1)

> M253 448 H650

문제: 기존 발견 재확인: 3단계 caller→A 경로 y448이 parameter value box x342~547/y418~478와 라벨 y454를 통과한다. 호출자의 A와 parameter의 B 구분이 흐려질 수 있다. 과거 배포 screenshot 근거를 보존하되 이번 검토는 SVG 소스 의미/좌표이며 새 render QA는 아님.

최소 보강: 기존 SVG caller 경로만 parameter box 밖으로 우회하거나 행을 분리한다. 본문/문항 모델은 유지하고 새 그림을 만들지 않는다.

후속: #201
