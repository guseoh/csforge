---
kind: concept
contentKey: java.core.modern-language.switch-expressions
topicContentKey: java.core.modern-language
slug: switch-expressions
title: "Switch expressions"
summary: "switch가 값을 만드는 expression으로 동작할 때의 exhaustiveness, arrow rule, yield를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html"
    title: "Java Language Specification 14장: Blocks, Statements, and Patterns"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: switch expression·yield·exhaustiveness 확인
---
# Switch expressions

여러 상태에 따라 하나의 값을 정해야 할 때 예전 방식의 `switch` statement는 임시 변수를 먼저 만들고 각 `case`에서 값을 대입하는 코드가 자주 필요했습니다. 이 구조에서는 `break`를 빠뜨리거나 특정 분기에서 값을 대입하지 않는 실수가 생기기 쉽습니다.

switch expression은 **switch 자체가 하나의 값을 계산하는 식(expression)** 이 되도록 해 줍니다. 그래서 "상태에 따라 값을 정한다"는 의도를 코드 구조로 직접 표현할 수 있습니다.

### switch 자체가 결과값을 만든다

```java
int days = switch (month) {
    case 1, 3, 5, 7, 8, 10, 12 -> 31;
    case 4, 6, 9, 11 -> 30;
    case 2 -> 28;
    default -> throw new IllegalArgumentException("invalid month");
};
```

오른쪽의 각 분기는 하나의 결과를 제공합니다. 마지막에 계산된 값이 `days`에 들어갑니다.

이렇게 보면 전통적인 statement와 차이가 분명합니다.

```java
int days;
switch (month) {
    case 1:
        days = 31;
        break;
    // ...
}
```

expression은 결과값을 만들어야 하므로 **가능한 입력에 대해 결과가 빠지지 않아야 합니다.** 이를 exhaustiveness, 즉 모든 경우를 처리해야 하는 성질로 이해할 수 있습니다.

### `->`를 사용하면 기본적인 fall-through가 없다

전통적인 `case:` 방식에서는 `break`가 없으면 다음 case로 실행이 이어질 수 있습니다. 이를 fall-through라고 합니다.

arrow rule은 이런 동작을 기본으로 하지 않습니다.

```java
String label = switch (status) {
    case READY -> "준비";
    case RUNNING -> "실행 중";
    case DONE -> "완료";
};
```

`READY`가 선택됐다고 해서 `RUNNING` 분기까지 이어서 실행되지 않습니다. 상태별 결과를 독립적으로 읽기 쉽습니다.

### 한 줄로 끝나지 않을 때는 `yield`로 값을 내보낸다

분기 안에서 여러 문장을 실행해야 할 수도 있습니다.

```java
int score = switch (grade) {
    case A -> 100;
    case B -> {
        log("B grade");
        yield 80;
    }
    default -> 0;
};
```

`yield 80`은 해당 switch expression의 분기 결과값을 제공합니다. 메서드 전체를 끝내는 `return`과 역할이 다릅니다.

```text
case 선택
   │
   ├─ 단일 표현식 -> 그 값이 결과
   │
   └─ block
        ├─ 여러 문장 실행
        └─ yield value -> switch의 결과
```

### enum과 sealed hierarchy에서는 누락을 찾는 데 도움이 된다

가능한 값이 닫혀 있는 enum이나 sealed type과 switch expression은 잘 맞습니다.

```java
int retryCount = switch (state) {
    case NEW -> 0;
    case RETRYING -> 3;
    case FAILED -> 0;
};
```

enum의 가능한 상수를 모두 처리했다면 불필요한 `default` 없이도 완전한 분기가 될 수 있습니다. 이후 enum 상수가 추가되면 기존 switch를 다시 검토해야 한다는 신호를 컴파일러가 줄 수 있습니다.

무조건 `default`를 넣는 것이 안전하다고 생각하면 오히려 새 상태가 생겼을 때 기존 코드가 조용히 default로 흘러가 버릴 수 있습니다. 닫힌 값 집합에서는 **새 값이 추가되면 기존 로직도 확인하게 만드는 것**이 더 안전할 때가 있습니다.

### 값 계산과 workflow는 구분한다

switch expression을 사용할 수 있다고 해서 긴 업무 흐름 전체를 각 case에 집어넣는 것이 좋은 것은 아닙니다.

```java
return switch (command) {
    case CREATE -> {
        // 수십 줄의 저장·외부 호출·검증...
        yield result;
    }
    // ...
};
```

분기마다 복잡한 작업이 들어간다면 별도 메서드나 객체로 책임을 분리하는 편이 읽기 쉽습니다. switch expression은 특히 **여러 선택지 중 값을 계산하는 상황**에서 장점이 선명합니다.

### 문제를 풀 때 확인할 것

1. 현재 switch가 statement인지 expression인지 확인한다.
2. `case:`와 `case ->` 중 어떤 형태인지 본다.
3. fall-through 가능성이 있는지 확인한다.
4. block case라면 어떤 `yield` 값이 나오는지 추적한다.
5. 모든 입력이 결과를 만들 수 있는지 확인한다.

### 자주 헷갈리는 부분

- `->` case는 자동으로 다음 case로 이어지지 않습니다.
- `yield`는 메서드의 `return`이 아닙니다.
- switch expression의 case가 반드시 한 줄이어야 하는 것은 아닙니다.
- `default`는 무조건 넣어야 하는 안전장치가 아닙니다. 닫힌 값 집합에서는 exhaustiveness 검사가 더 유용할 수 있습니다.

### 면접에서 설명한다면

switch expression은 switch를 단순 제어문뿐 아니라 값을 계산하는 식으로 사용할 수 있게 해 줍니다. arrow rule은 기본 fall-through를 없애고, 여러 문장이 필요한 분기에서는 `yield`로 값을 반환합니다. 특히 enum이나 sealed hierarchy처럼 가능한 값이 정해진 경우 모든 경우를 처리했는지 컴파일러가 확인하는 데 도움이 됩니다.
