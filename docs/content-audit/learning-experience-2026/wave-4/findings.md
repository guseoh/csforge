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

## 기존 계승

### LEX-002 — P2

대상: `java.core.language-types.pass-by-value`

원문: [frontend/public/learning/java/pass-by-value.svg:1](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/frontend/public/learning/java/pass-by-value.svg#L1)

> M253 448 H650

문제: 기존 발견 재확인: 3단계 caller→A 경로 y448이 parameter value box x342~547/y418~478와 라벨 y454를 통과한다. 호출자의 A와 parameter의 B 구분이 흐려질 수 있다. 과거 배포 screenshot 근거를 보존하되 이번 검토는 SVG 소스 의미/좌표이며 새 render QA는 아님.

최소 보강: 기존 SVG caller 경로만 parameter box 밖으로 우회하거나 행을 분리한다. 본문/문항 모델은 유지하고 새 그림을 만들지 않는다.

후속: #201
