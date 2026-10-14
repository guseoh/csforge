# Wave 4 language-types 발견

10 Concept·55 Question 직접 검토의 새 발견과 기존 계승을 분리한다. 검토 완료는 교정 완료가 아니다.

## 새 발견

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

실행 대조: probes/LanguageTypesProbe.java: implicitNarrowing=42:3; Temurin25.0.4.1에서 컴파일/실행, 보장의 근거는 JLS.

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

실행 대조: probe의 String total + null은 null 문자열, int total + null은 NPE로 실제 재현.

후속: #201

### W4-JA-003 — P0

대상: `java.core.language-types.string-immutability-equality`

원문: [content/java/language-types/string-immutability-equality.md:49](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/java/language-types/string-immutability-equality.md#L49)

> name = name.toUpperCase();
> System.out.println(name); // KIM

문제: 이름 kim에 대한 인자 없는 toUpperCase는 기본 Locale을 사용한다. tr-TR에서는 i가 U+0130으로 대문자화되어 KİM이므로 Locale 전제 없는 KIM 고정 출력 주석은 일반 JDK API 보장이 아니다. 불변성/재대입 모델과 q6의 ab→AB는 맞다.

최소 보강: 이 예시에 Locale.ROOT를 명시하거나 Locale에 영향을 받지 않는 예시 문자열을 사용한다. 불변성 본문·모든 문항을 재작성하거나 locale Topic을 확장하지 않는다.

공식 근거: [관련 계약](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html#toUpperCase())

실행 대조: default tr-TR probe 결과 code points [75,304,77], Locale.ROOT는 KIM.

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

실행 대조: probe nonfinal part 연결 false / final constantPart 연결 true. 실행은 보조이며 동일성 보장의 근거는 JLS.

후속: #201

## 기존 계승

### LEX-002 — P2

대상: `java.core.language-types.pass-by-value`

원문: [frontend/public/learning/java/pass-by-value.svg:1](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/frontend/public/learning/java/pass-by-value.svg#L1)

> M253 448 H650

문제: 기존 발견 재확인: 3단계 caller→A 경로 y448이 parameter value box x342~547/y418~478와 라벨 y454를 통과한다. 호출자의 A와 parameter의 B 구분이 흐려질 수 있다. 과거 배포 screenshot 근거를 보존하되 이번 검토는 SVG 소스 의미/좌표이며 새 render QA는 아님.

최소 보강: 기존 SVG caller 경로만 parameter box 밖으로 우회하거나 행을 분리한다. 본문/문항 모델은 유지하고 새 그림을 만들지 않는다.

후속: #201
