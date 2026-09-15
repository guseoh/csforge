---
kind: concept
contentKey: java.core.modern-language.pattern-matching
topicContentKey: java.core.modern-language
slug: pattern-matching
title: "Pattern Matching으로 타입 분기하기"
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
# Pattern Matching으로 타입 분기하기

객체가 특정 타입인지 검사한 뒤 다시 cast하는 코드는 같은 사실을 두 번 표현합니다.

```java
if (value instanceof String) {
    String text = (String) value;
    System.out.println(text.length());
}
```

Pattern matching은 **타입 검사와 안전한 값 추출을 한 구조로 표현**합니다.

```java
if (value instanceof String text) {
    System.out.println(text.length());
}
```

`text`는 검사 성공이 보장되는 흐름에서만 사용할 수 있는 pattern variable입니다.

### pattern variable의 scope는 제어 흐름과 연결된다

```java
if (value instanceof String text && !text.isBlank()) {
    return text.length();
}
```

`&&`의 오른쪽은 왼쪽이 `true`일 때만 평가되므로 그 지점에서는 `value`가 `String`이라는 검사가 성공했다는 사실이 보장됩니다.

반대로 다음 구조에서는 오른쪽이 왼쪽 실패 경로에서도 실행될 수 있습니다.

```java
// if (value instanceof String text || text.isBlank()) { ... }
```

따라서 `text`를 사용할 수 없습니다. 이런 규칙을 **flow scoping**으로 이해하면 단순한 블록 범위보다 정확합니다.

### pattern switch는 타입별 처리를 한곳에 모은다

```java
String describe(Object value) {
    return switch (value) {
        case String text -> "문자열 길이=" + text.length();
        case Integer number -> "정수=" + number;
        default -> "기타";
    };
}
```

각 case가 타입 검사와 값 추출을 함께 수행하므로 여러 `if/else instanceof`보다 분기 구조가 선명해질 수 있습니다.

### 넓은 pattern이 좁은 pattern을 가리면 안 된다

```java
// 허용되지 않는 순서
switch (value) {
    case Object object -> ...;
    case String text -> ...;
}
```

`Object` pattern이 이미 `String`까지 처리하므로 뒤의 `String` case는 도달할 수 없습니다. Java는 이런 **dominance** 관계를 검사합니다.

따라서 pattern switch에서는 단순히 case 목록만 보는 것이 아니라, 앞선 pattern이 뒤의 더 구체적인 pattern을 이미 포함하지 않는지 확인해야 합니다.

### record pattern은 구조를 한 단계 분해할 수 있다

```java
record Point(int x, int y) { }

if (value instanceof Point(int x, int y)) {
    System.out.println(x + y);
}
```

record component를 바로 binding할 수 있어 타입 검사 후 `point.x()`, `point.y()`를 다시 꺼내는 코드를 줄일 수 있습니다. 다만 중첩 pattern이 깊어질수록 오히려 읽기 어려워질 수 있으므로 분해 깊이는 가독성을 기준으로 선택합니다.

### pattern matching은 다형성을 대체하지 않는다

구체 타입마다 객체 자신의 핵심 행동이 다르다면 계속 `instanceof`로 분기하기보다 공통 계약의 메서드를 각 subtype이 구현하는 편이 자연스러울 수 있습니다.

반대로 serialization이나 외부 표현 변환처럼 **타입 계층 밖에서 여러 variant를 한 번에 해석하는 작업**에서는 pattern switch가 유용합니다. sealed hierarchy와 결합하면 가능한 subtype 집합을 알고 exhaustive 처리 여부를 검사하는 데도 도움이 됩니다.

Pattern matching의 핵심은 cast를 짧게 만드는 것이 아닙니다. **검사 성공 사실과 그 사실이 유효한 제어 흐름을 컴파일러가 타입 정보로 활용한다**는 점, 그리고 switch에서는 dominance와 exhaustive 처리까지 함께 고려한다는 점입니다.
