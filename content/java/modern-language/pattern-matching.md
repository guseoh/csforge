---
kind: concept
contentKey: java.core.modern-language.pattern-matching
topicContentKey: java.core.modern-language
slug: pattern-matching
title: "Pattern matching"
summary: "타입 검사와 값 추출을 함께 표현하고 pattern variable의 사용 범위와 switch 분기 규칙을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html"
    title: "Java Language Specification 14장: Blocks, Statements, and Patterns"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: pattern switch의 scope·dominance·exhaustiveness 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: instanceof pattern의 조건 평가와 pattern variable 확인
---
# Pattern matching

객체가 특정 타입인지 확인한 뒤 바로 그 타입으로 사용하려면 예전에는 검사와 형변환을 따로 작성하는 코드가 흔했습니다.

```java
if (value instanceof String) {
    String text = (String) value;
    System.out.println(text.length());
}
```

두 줄은 사실 같은 사실을 확인합니다. "`value`가 `String`이라면 그 값을 `String`으로 사용하겠다"는 뜻입니다. Pattern matching은 **검사와 안전한 값 추출을 하나의 구조로 표현**해 이 중복을 줄입니다.

### `instanceof`가 성공한 경로에서 바로 사용할 수 있다

```java
if (value instanceof String text) {
    System.out.println(text.length());
}
```

`text`는 단순히 바깥에 새 변수를 선언한 것이 아닙니다. `value instanceof String` 검사가 성공했다는 사실이 보장되는 흐름에서만 사용할 수 있는 **pattern variable**입니다.

그래서 다음 코드도 자연스럽습니다.

```java
if (value instanceof String text && !text.isBlank()) {
    return text.length();
}
```

`&&`의 오른쪽은 왼쪽 조건이 true일 때만 평가됩니다. 따라서 오른쪽에 도달했다면 `value`가 `String`이라는 검사가 이미 성공했고 `text`를 안전하게 사용할 수 있습니다.

반대로 다음과 같은 구조에서는 같은 논리를 적용할 수 없습니다.

```java
// if (value instanceof String text || text.isBlank()) { ... }
```

`||`의 오른쪽은 왼쪽 조건이 false일 때 실행될 수 있습니다. 그 경로에서는 `text`가 만들어졌다고 보장할 수 없습니다.

이처럼 compiler가 실제 제어 흐름을 보고 pattern variable을 사용할 수 있는 범위를 정하는 것을 **flow scoping** 관점으로 이해하면 외우기 쉽습니다.

### switch에서는 타입별 처리를 더 직접 표현할 수 있다

pattern matching은 `switch`와 결합하면 타입별 분기를 읽기 쉽게 만들 수 있습니다.

```java
String describe(Object value) {
    return switch (value) {
        case String text -> "문자열 길이=" + text.length();
        case Integer number -> "정수=" + number;
        default -> "기타";
    };
}
```

각 case는 타입을 검사하고, 성공하면 해당 타입의 변수를 제공합니다. 여러 `if/else instanceof`를 이어 쓰는 코드보다 타입별 처리가 한곳에 모입니다.

### 넓은 pattern을 먼저 쓰면 뒤의 좁은 pattern이 의미 없어질 수 있다

case 순서도 아무렇게나 둘 수 있는 것은 아닙니다.

```java
// 잘못된 예의 의도
switch (value) {
    case Object object -> ...;
    case String text -> ...; // 앞의 Object가 이미 String까지 잡아 버린다
}
```

`String`은 `Object`이므로 첫 번째 case가 String 값까지 처리해 버립니다. 뒤의 `String` case는 도달할 수 없습니다. 이런 관계를 **dominance**라고 이해할 수 있습니다. 더 넓은 pattern이 더 구체적인 pattern을 앞에서 가리지 않는지 봐야 합니다.

### record pattern은 데이터 구조를 분해할 때 사용할 수 있다

record를 사용한다면 component 값을 pattern 안에서 꺼내는 표현도 가능합니다.

```java
record Point(int x, int y) { }

if (value instanceof Point(int x, int y)) {
    System.out.println(x + y);
}
```

이 코드는 타입 검사 후 다시 `point.x()`, `point.y()`를 호출하는 반복을 줄여 줍니다. 다만 pattern이 너무 깊게 중첩되면 오히려 읽기 어려워질 수 있으므로, "한 번에 많이 분해할 수 있다"와 "그렇게 해야 한다"는 구분해야 합니다.

### pattern matching이 다형성을 대체하는 것은 아니다

타입별 행동이 객체 자체의 핵심 책임이라면 다음처럼 계속 타입을 검사하는 코드보다 polymorphism이 더 자연스러울 수 있습니다.

```java
if (shape instanceof Circle circle) { ... }
else if (shape instanceof Rectangle rectangle) { ... }
```

`Shape`가 자신의 면적을 계산할 책임을 갖는다면 `shape.area()`가 더 좋은 설계일 수 있습니다. 반면 serialization, 화면 표현 변환처럼 **타입 계층 밖에서 여러 subtype을 한 번에 해석해야 하는 작업**에서는 pattern switch가 유용합니다.

### 문제를 풀 때 확인할 것

1. pattern이 성공해야만 사용할 수 있는 변수가 무엇인지 확인한다.
2. `&&`, `||`, 부정 조건에 따라 성공이 보장되는 경로가 어디인지 추적한다.
3. switch에서는 넓은 타입이 좁은 타입보다 앞에 있는지 본다.
4. sealed hierarchy라면 모든 subtype이 처리되는지도 확인한다.
5. record pattern에서는 어떤 component가 어떤 변수로 분해되는지 따라간다.

### 자주 헷갈리는 부분

- `instanceof` pattern은 객체 자체를 다른 타입으로 변환하는 기능이 아닙니다.
- pattern variable은 검사 성공이 보장되는 흐름에서만 사용할 수 있습니다.
- switch case는 순서를 바꿔도 항상 같은 의미가 되는 것이 아닙니다.
- pattern matching이 모든 타입 분기 코드를 좋은 객체지향 설계로 바꿔 주는 것은 아닙니다.

### 면접에서 설명한다면

Pattern matching은 타입 검사와 안전한 값 추출을 함께 표현해 반복적인 cast 코드를 줄이는 기능이라고 설명할 수 있습니다. 중요한 부분은 pattern variable의 scope가 단순한 블록 범위가 아니라 조건의 성공이 보장되는 제어 흐름과 연결된다는 점입니다. switch에서는 dominance와 exhaustiveness도 함께 고려해야 합니다.
